import Link from "next/link";
import ProfileDetailsForm from "../../../components/forms/ProfileDetailsForm";
import { getCurrentProfile } from "../../../lib/auth/getProfile";

export const metadata = {
  title: "Profile | GC Forum",
};

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  const directoryStatus = profile?.show_in_directory === false ? "Hidden from directory" : "Visible in directory";
  const membershipStatus = profile?.status ?? "pending";

  return (
    <div className="space-y-8 rounded-3xl border border-neutral-200 bg-white p-8">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-primary/60">Profile</p>
        <h1 className="text-3xl font-serif text-primary-ink">Manage your member profile</h1>
        <p className="text-sm text-neutral-600">
          Update your portrait and directory information so other General Counsel can connect with you. Changes are saved instantly.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <section className="rounded-2xl border border-neutral-100 bg-soft p-6">
          <h2 className="text-xl font-semibold text-primary-ink">Profile details</h2>
          <p className="mt-2 text-sm text-neutral-600">Provide the information you want listed inside the members area.</p>
          <div className="mt-6">
            <ProfileDetailsForm profile={profile} />
          </div>
        </section>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 text-sm text-neutral-700">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Directory status</p>
            <p className="mt-2 text-lg font-semibold text-primary-ink">{directoryStatus}</p>
            <p className="mt-2">You can toggle whether other members can find you.</p>
            <Link
              href="/settings"
              className="mt-4 inline-block rounded-full border border-primary px-4 py-2 text-xs font-semibold text-primary"
            >
              Open visibility settings
            </Link>
          </div>
          <div className="rounded-2xl border border-dashed border-primary/30 bg-white/70 p-6 text-sm text-neutral-700">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">Membership</p>
            <p className={`mt-2 text-lg font-semibold ${membershipStatus === "approved" ? "text-emerald-700" : "text-amber-700"}`}>
              {membershipStatus}
            </p>
            <p className="mt-2">
              If anything looks incorrect, contact the Birketts GC Forum team and we&apos;ll help you out.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
