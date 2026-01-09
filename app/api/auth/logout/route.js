import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { hasSupabaseClient, supabaseAnonKey, supabaseUrl } from "../../../../lib/env";

export const dynamic = "force-dynamic";

export async function POST() {
  console.log("[api/logout] Received logout request");
  if (!hasSupabaseClient) {
    console.warn("[api/logout] hasSupabaseClient is false; returning early");
    return NextResponse.json({ success: true });
  }

  const cookieStore = await cookies();

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
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name, options) {
        response.cookies.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });

  try {
    console.log("[api/logout] Calling supabase.auth.signOut() on server");
    await supabase.auth.signOut();
    console.log("[api/logout] Server-side sign-out completed");
  } catch (error) {
    console.error("[api/logout] Server-side sign-out failed", error);
  }

  console.log("[api/logout] Returning logout response");
  return response;
}
