import { redirect } from "next/navigation";
import { hasSupabaseClient } from "../../lib/env";
import { getCurrentProfile } from "../../lib/auth/getProfile";
import { getSession } from "../../lib/auth/getSession";
import { ROLES } from "../../lib/auth/roles";

export default async function DashboardLayout({ children }) {
  let profile = null;
  let session = null;

  if (hasSupabaseClient) {
    const { session: activeSession } = await getSession();
    session = activeSession;
    if (session?.user) {
      profile = await getCurrentProfile(session.user.id);
    }
  } else {
    profile = { full_name: "Preview Admin", role: ROLES.admin };
  }

  if (!session && hasSupabaseClient) {
    redirect("/login");
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl bg-soft px-8 py-10 text-primary-ink">
          <p className="text-sm uppercase tracking-[0.3em] text-primary/70">GC Forum CMS</p>
          <h1 className="mt-4 text-3xl font-serif">Welcome back{profile ? `, ${profile.full_name}` : ""}.</h1>
          <p className="mt-2 text-neutral-600">Manage homepage content, resources, events, and articles from one place.</p>
          {!hasSupabaseClient && (
            <p className="mt-4 rounded-xl border border-dashed border-primary/40 bg-white/70 px-4 py-3 text-sm text-primary">
              Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to `.env.local` to enable live CMS updates.
            </p>
          )}
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}
