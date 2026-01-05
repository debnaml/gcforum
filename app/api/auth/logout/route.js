import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { hasSupabaseClient, supabaseAnonKey, supabaseUrl } from "../../../../lib/env";

export const dynamic = "force-dynamic";

export async function POST(request) {
  if (!hasSupabaseClient) {
    return NextResponse.json({ success: true });
  }

  const requestCookies = cookies();

  const response = NextResponse.json(
    { success: true },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return requestCookies.get(name)?.value;
      },
      set(name, value, options) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name, options) {
        response.cookies.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });

  await supabase.auth.signOut();

  return response;
}
