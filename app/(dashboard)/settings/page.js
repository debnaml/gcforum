import Link from "next/link";
import DirectoryVisibilityForm from "../../../components/forms/DirectoryVisibilityForm";
import SectionHeading from "../../../components/ui/SectionHeading";
import PageBanner from "../../../components/ui/PageBanner";
import { getCurrentProfile } from "../../../lib/auth/getProfile";

export const metadata = {
  title: "Settings | GC Forum",
};

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  const canEditVisibility = Boolean(profile);
  const defaultVisible = profile?.show_in_directory !== false;
  const directoryStatus = profile?.status ?? "pending";
  const bannerTitle = "My settings";

  return (
    <div className="bg-white">
      <div className="relative left-1/2 right-1/2 -mt-16 w-screen -translate-x-1/2">
        <PageBanner title={bannerTitle} centerContent />
      </div>
      <section className="mt-16 space-y-10">
        <SectionHeading
          title="My profile preferences"
          description="Control how your information appears inside the GC Forum member directory. Changes are instant and can be updated at any time."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <section className="border border-neutral-100 bg-[#F9F7FB] p-6">
              <h2 className="text-xl font-semibold text-primary-ink">Directory visibility</h2>
              <p className="mt-2 text-sm text-neutral-600">Choose whether your profile is discoverable by other members.</p>
              <div className="mt-6">
                <DirectoryVisibilityForm defaultVisible={defaultVisible} disabled={!canEditVisibility} />
              </div>
            </section>
            {!canEditVisibility && (
              <div className="border border-dashed border-neutral-300 bg-white p-4 text-sm text-neutral-600">
                We can&apos;t find your member directory profile yet. Once your application has been approved, you&apos;ll be able to manage these settings.
              </div>
            )}
          </div>
          <aside className="space-y-6">
            <div className="border border-dashed border-primary/30 bg-white/80 p-6 text-sm text-neutral-600">
              <p className="font-semibold text-primary-ink">Need to update more details?</p>
              <p className="mt-2">
                Visit the My Profile page to refresh your portrait, organisation details, or contact information. If something still looks off, let the Birketts team know so we can help.
              </p>
              <Link
                href="/profile"
                className="mt-4 inline-flex items-center justify-center rounded-none border border-primary px-[50px] py-2 text-sm font-semibold uppercase tracking-wide text-primary transition hover:bg-primary/10"
              >
                Edit my profile
              </Link>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-primary/70">Directory status</p>
              <p className="text-sm text-primary-ink">{directoryStatus}</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
