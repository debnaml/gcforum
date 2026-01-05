import { getServerClient } from "../supabase/serverClient";

export async function getSession() {
  const supabase = await getServerClient();
  if (!supabase) {
    return { session: null, user: null };
  }

  const [sessionResult, userResult] = await Promise.all([
    supabase.auth.getSession(),
    supabase.auth.getUser(),
  ]);

  const session = sessionResult?.data?.session ?? null;
  const user = userResult?.data?.user ?? null;

  return { session, user };
}
