import Link from "next/link";
import ProfileDetailsForm from "../../../components/forms/ProfileDetailsForm";
import SectionHeading from "../../../components/ui/SectionHeading";
import PageBanner from "../../../components/ui/PageBanner";
import { getCurrentProfile } from "../../../lib/auth/getProfile";

export const metadata = {
  title: "Profile | GC Forum",
};

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  const directoryStatus = profile?.show_in_directory === false ? "Hidden from directory" : "Visible in directory";
  const membershipStatus = profile?.status ?? "pending";
  const welcomeTitle = profile?.full_name ? `Welcome, ${profile.full_name}` : "Welcome";

  return (
    <div className="bg-white">
      <PageBanner title={welcomeTitle} centerContent />
      <div className="mx-auto max-w-6xl px-6 pb-16">
        <section className="mt-16 space-y-10">
          <SectionHeading
            title="Manage your member profile"
            description="Update your portrait and directory information so other General Counsel can connect with you. Changes are saved instantly."
          />
          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <section className="border border-neutral-100 bg-[#F9F7FB] p-6">
                <h2 className="text-xl font-semibold text-primary-ink">Profile details</h2>
                <p className="mt-2 text-sm text-neutral-600">Provide the information you want listed inside the members area.</p>
                <div className="mt-6">
                  <ProfileDetailsForm profile={profile} />
                </div>
              </section>
            </div>
            <aside className="space-y-6">
              <div className="border border-neutral-100 bg-white p-6 text-sm text-neutral-700">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Directory status</p>
                <p className="mt-2 text-lg font-semibold text-primary-ink">{directoryStatus}</p>
                <p className="mt-2">You can toggle whether other members can find you.</p>
                <Link
                  href="/settings"
                  className="mt-4 inline-flex items-center justify-center rounded-none bg-primary px-[50px] py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-primary/90"
                >
                  Edit My Settings
                </Link>
              </div>
              <div className="border border-dashed border-primary/30 bg-white/70 p-6 text-sm text-neutral-700">
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
        </section>
      </div>
    </div>
  );
}
