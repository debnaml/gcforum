export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
export const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET ?? "";
export const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
export const eventResourcesBucket = process.env.NEXT_PUBLIC_SUPABASE_EVENT_RESOURCES_BUCKET ?? "event-resources";

export const hasSupabaseClient = Boolean(supabaseUrl && supabaseAnonKey);
export const hasServiceRoleAccess = Boolean(
  supabaseUrl && supabaseServiceRoleKey,
);
