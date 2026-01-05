import Link from "next/link";
import { deletePartner, upsertPartner } from "../../actions/contentActions";
import { getPartners } from "../../../../lib/content";
import { getCurrentProfile } from "../../../../lib/auth/getProfile";
import RoleGate from "../../../../components/auth/RoleGate";
import { ROLES } from "../../../../lib/auth/roles";
import PanelScrollAnchor from "../../../../components/admin/PanelScrollAnchor";
import PortraitUploadField from "../../../../components/admin/PortraitUploadField";
import TeamRosterList from "../../../../components/admin/TeamRosterList";

export const metadata = {
  title: "Team Admin | GC Forum",
};

export default async function AdminTeamPage({ searchParams }) {
  const [profile, partners, resolvedSearchParams] = await Promise.all([
    getCurrentProfile(),
    getPartners(),
    Promise.resolve(searchParams),
  ]);
  const orderedPartners = Array.isArray(partners)
    ? [...partners].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    : [];
  const mode = typeof resolvedSearchParams?.mode === "string" ? resolvedSearchParams.mode : null;
  const selectedPartnerId =
    typeof resolvedSearchParams?.partner === "string" ? resolvedSearchParams.partner : null;
  const selectedPartner = orderedPartners.find((partner) => partner.id === selectedPartnerId) ?? null;
  const isCreateMode = mode === "create";
  const hasPanel = isCreateMode || Boolean(selectedPartner);
  const feedback = typeof resolvedSearchParams?.feedback === "string" ? resolvedSearchParams.feedback : null;
  const feedbackMessage =
    feedback === "partner-created"
      ? "Team member added successfully."
      : feedback === "partner-updated"
        ? "Team member updated successfully."
        : feedback === "partner-deleted"
          ? "Team member removed."
          : null;
  const feedbackColorClasses = feedback === "partner-deleted"
    ? "border-red-200 bg-red-50 text-red-700"
    : "border-emerald-200 bg-emerald-50 text-emerald-800";

  return (
    <RoleGate role={ROLES.admin} initialRole={profile?.role}>
      <div className="space-y-8">
        <header className="rounded-3xl border border-neutral-200 bg-white p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-primary/60">Team</p>
              <h1 className="mt-3 text-3xl font-serif text-primary-ink">Manage the Birketts GC Forum team</h1>
              <p className="mt-3 text-sm text-neutral-600">
                Every profile shown below is pulled directly from Supabase. Select one to edit or delete it, or add a new partner to update the
                homepage carousel instantly.
              </p>
            </div>
            <Link
              href="/admin/team?mode=create"
              className="inline-flex items-center rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary"
            >
              + Add team member
            </Link>
          </div>
        </header>

        {feedbackMessage && (
          <div className={`flex items-center justify-between gap-4 rounded-3xl border px-6 py-4 text-sm ${feedbackColorClasses}`}>
            <span>{feedbackMessage}</span>
            <Link href="/admin/team" className="text-xs font-semibold uppercase tracking-[0.2em] text-current">
              Dismiss
            </Link>
          </div>
        )}

        {hasPanel && (
          <section className="rounded-3xl border border-neutral-200 bg-white p-8">
            <PanelScrollAnchor activeKey={isCreateMode ? "create" : selectedPartner?.id ?? null} />
            <p className="text-sm uppercase tracking-[0.3em] text-primary/60">
              {isCreateMode ? "Add teammate" : "Edit teammate"}
            </p>
            <h2 className="mt-1 heading-2 text-primary-ink">
              {isCreateMode ? "Create a new team profile" : selectedPartner?.name ?? "Select a team member"}
            </h2>
            {isCreateMode && (
              <p className="mt-2 text-xs text-neutral-500">IDs are generated automatically from the name you enter.</p>
            )}
            <div className="mt-6">
              {isCreateMode || selectedPartner ? (
                <form action={upsertPartner} className="grid gap-4 md:grid-cols-2">
                  {!isCreateMode && <input type="hidden" name="id" defaultValue={selectedPartner?.id} />}
                  <label className="text-sm font-semibold text-primary-ink">
                    Display name
                    <input
                      name="name"
                      defaultValue={selectedPartner?.name ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      required
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    Practice area / Title
                    <input
                      name="title"
                      defaultValue={selectedPartner?.title ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      required
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    Email
                    <input
                      type="email"
                      name="email"
                      defaultValue={selectedPartner?.email ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      placeholder="name@birketts.co.uk"
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    Phone number
                    <input
                      name="phone"
                      defaultValue={selectedPartner?.phone ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      placeholder="+44 20 7123 0000"
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    LinkedIn URL
                    <input
                      name="linkedin"
                      defaultValue={selectedPartner?.linkedin ?? selectedPartner?.linkedin_url ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      placeholder="https://www.linkedin.com/in/..."
                    />
                  </label>
                  <PortraitUploadField initialValue={selectedPartner?.avatar ?? ""} />
                  <label className="text-sm font-semibold text-primary-ink md:col-span-2">
                    Bio
                    <textarea
                      name="bio"
                      rows={4}
                      defaultValue={selectedPartner?.bio ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    Display order
                    <input
                      type="number"
                      name="order_index"
                      defaultValue={selectedPartner?.order_index ?? orderedPartners.length}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                    />
                  </label>
                  <fieldset className="space-y-3 text-sm font-semibold text-primary-ink md:col-span-2">
                    <legend className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Visibility</legend>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="show_on_team"
                        defaultChecked={selectedPartner?.show_on_team ?? true}
                        className="h-5 w-5 rounded border border-neutral-300"
                      />
                      Show on public team page
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="is_author"
                        defaultChecked={selectedPartner?.is_author ?? false}
                        className="h-5 w-5 rounded border border-neutral-300"
                      />
                      Make available as resource author
                    </label>
                    <p className="text-xs font-normal uppercase tracking-wide text-neutral-500">
                      Use the author toggle to populate the article editor dropdown.
                    </p>
                  </fieldset>
                  <div className="flex flex-wrap gap-3 md:col-span-2">
                    <button type="submit" className="rounded-none bg-primary px-6 py-3 text-white">
                      {isCreateMode ? "Save team member" : "Update profile"}
                    </button>
                    <Link
                      href="/admin/team"
                      className="rounded-none border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-600"
                    >
                      Cancel
                    </Link>
                  </div>
                </form>
              ) : (
                <p className="rounded-2xl border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-600">
                  Select a team member from the list to edit their details.
                </p>
              )}
            </div>

            {!isCreateMode && selectedPartner && (
              <form action={deletePartner} className="mt-6">
                <input type="hidden" name="id" value={selectedPartner.id} />
                <button className="rounded-none border border-red-200 px-4 py-2 text-sm font-semibold text-red-600">
                  Delete this profile
                </button>
              </form>
            )}
          </section>
        )}

        <section className="rounded-3xl border border-neutral-200 bg-white p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary/60">Current team</p>
              <h2 className="mt-1 heading-2 text-primary-ink">{orderedPartners.length || "No"} team members</h2>
            </div>
          </div>
          {orderedPartners.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-600">
              No team members found. Click “Add team member” to create the first profile.
            </p>
          ) : (
            <TeamRosterList partners={orderedPartners} />
          )}
        </section>

      </div>
    </RoleGate>
  );
}
