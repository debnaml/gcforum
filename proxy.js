import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { hasSupabaseClient, supabaseAnonKey, supabaseUrl } from "./lib/env";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/join", "/reset"];

function isPublicPath(pathname) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

const ASSET_PATHS = ["/_next", "/favicon", "/public", "/images", "/api/auth"];

function isAsset(pathname) {
  if (ASSET_PATHS.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  // Allow direct requests for static files such as /gcforum.svg
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname) || isAsset(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  const supabase = hasSupabaseClient
    ? createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value;
          },
          set(name, value, options) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name, options) {
            response.cookies.set({ name, value: "", ...options, maxAge: 0 });
          },
        },
      })
    : null;

  const {
    data: { session },
  } = supabase ? await supabase.auth.getSession() : { data: { session: null } };

  if (!session) {
    const redirectUrl = new URL("/login", request.url);
    if (pathname !== "/login") {
      redirectUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|images|public|api/webhooks).*)"],
};
