import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import {
  hasServiceRoleAccess,
  hasSupabaseClient,
  supabaseAnonKey,
  supabaseServiceRoleKey,
  supabaseUrl,
} from "../env";

export async function getServerClient({ allowCookieMutations = false } = {}) {
  if (!hasSupabaseClient) {
    return null;
  }

  const cookieStore = await cookies();

  const cookieAdapter = {
    get(name) {
      if (typeof cookieStore?.get !== "function") {
        return undefined;
      }
      return cookieStore.get(name)?.value;
    },
    set(name, value, options) {
      if (!allowCookieMutations) {
        return;
      }
      try {
        if (typeof cookieStore?.set === "function") {
          cookieStore.set({ name, value, ...options });
        }
      } catch (_error) {
        // Suppress mutation attempts in Server Components where Next.js disallows cookie writes.
      }
    },
    remove(name, options) {
      if (!allowCookieMutations) {
        return;
      }
      try {
        if (typeof cookieStore?.delete === "function") {
          cookieStore.delete({ name, ...options });
        }
      } catch (_error) {
        // Suppress mutation attempts in Server Components where Next.js disallows cookie writes.
      }
    },
  };

  return createServerClient(supabaseUrl, supabaseAnonKey, { cookies: cookieAdapter });
}

export function getServiceRoleClient() {
  if (!hasServiceRoleAccess) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
