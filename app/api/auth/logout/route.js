import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { hasSupabaseClient, supabaseAnonKey, supabaseUrl } from "../../../../lib/env";

export const dynamic = "force-dynamic";

function parseCookieHeader(header = "") {
  return new Map(
    header
      .split(/;\s*/)
      .filter(Boolean)
      .map((cookiePair) => {
        const [rawName, ...rawValue] = cookiePair.split("=");
        const name = decodeURIComponent(rawName.trim());
        const value = decodeURIComponent(rawValue.join("=")?.trim() ?? "");
        return [name, value];
      }),
  );
}

export async function POST(request) {
  console.log("[api/logout] Received logout request");
  if (!hasSupabaseClient) {
    console.warn("[api/logout] hasSupabaseClient is false; returning early");
    return NextResponse.json({ success: true });
  }
  const incomingCookies = parseCookieHeader(request.headers.get("cookie") ?? "");

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
        return incomingCookies.get(name);
      },
      set(name, value, options) {
        response.cookies.set({ name, value, ...options });
        incomingCookies.set(name, value);
      },
      remove(name, options) {
        response.cookies.set({ name, value: "", ...options, maxAge: 0 });
        incomingCookies.delete(name);
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
