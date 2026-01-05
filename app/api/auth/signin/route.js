import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { hasSupabaseClient, supabaseAnonKey, supabaseUrl } from "../../../../lib/env";

export const dynamic = "force-dynamic";

export async function POST(request) {
  if (!hasSupabaseClient) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch (_error) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[auth] signin request", {
      email: maskEmail(email),
      hasSupabaseClient,
      supabaseUrlConfigured: Boolean(supabaseUrl),
      anonKeyConfigured: Boolean(supabaseAnonKey),
    });
  }

  const requestCookies = await cookies();

  if (process.env.NODE_ENV !== "production") {
    console.info("[auth] cookie store", {
      hasGet: typeof requestCookies?.get === "function",
      prototype: requestCookies?.constructor?.name ?? "unknown",
    });
  }

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

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[auth] signin failed", {
      email: maskEmail(email),
      message: error.message,
      status: error.status,
    });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[auth] signin success", { email: maskEmail(email) });
  }

  return response;
}

function maskEmail(value) {
  if (!value || typeof value !== "string") {
    return "";
  }
  const [localPart, domain = ""] = value.split("@");
  if (!domain) {
    return `${localPart.slice(0, 2)}***`;
  }
  const maskedLocal = localPart.length <= 2 ? `${localPart[0] ?? "*"}*` : `${localPart.slice(0, 2)}***`;
  return `${maskedLocal}@${domain}`;
}
