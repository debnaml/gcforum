"use client";

import { createBrowserClient } from "@supabase/ssr";
import { hasSupabaseClient, supabaseAnonKey, supabaseUrl } from "../env";

let browserClient;

export function getBrowserClient() {
  if (!hasSupabaseClient) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  return browserClient;
}
