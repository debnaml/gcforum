import Link from "next/link";
import DirectoryVisibilityForm from "../../../components/forms/DirectoryVisibilityForm";
import { getCurrentProfile } from "../../../lib/auth/getProfile";

export const metadata = {
  title: "Settings | GC Forum",
};

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  const canEditVisibility = Boolean(profile);
  const defaultVisible = profile?.show_in_directory !== false;
  const directoryStatus = profile?.status ?? "pending";

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-8">
      <p className="text-sm uppercase tracking-[0.3em] text-primary/60">Settings</p>
      <h1 className="mt-2 text-3xl font-serif text-primary-ink">My profile preferences</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Control how your information appears inside the GC Forum member directory. Changes are instant and can be updated at any time.
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="rounded-2xl border border-neutral-100 bg-soft p-6">
          <h2 className="text-xl font-semibold text-primary-ink">Directory visibility</h2>
          <p className="mt-2 text-sm text-neutral-600">Choose whether your profile is discoverable by other members.</p>
          <div className="mt-6">
            <DirectoryVisibilityForm defaultVisible={defaultVisible} disabled={!canEditVisibility} />
          </div>
        </div>
        <div className="rounded-2xl border border-dashed border-primary/30 bg-white/80 p-6 text-sm text-neutral-600">
          <p className="font-semibold text-primary-ink">Need to update more details?</p>
          <p className="mt-2">
            Visit the My Profile page to refresh your portrait, organisation details, or contact information. If something still looks off, let the Birketts team know so we can help.
          </p>
          <Link
            href="/profile"
            className="mt-4 inline-flex items-center rounded-full border border-primary px-4 py-2 text-xs font-semibold text-primary"
          >
            Edit my profile
          </Link>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-primary/70">Directory status</p>
          <p className="text-sm text-primary-ink">{directoryStatus}</p>
        </div>
      </div>
      {!canEditVisibility && (
        <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-600">
          We can&apos;t find your member directory profile yet. Once your application has been approved, you&apos;ll be able to manage these settings.
        </div>
      )}
    </div>
  );
}
