import Link from "next/link";
import { getCurrentProfile } from "../../../../lib/auth/getProfile";
import RoleGate from "../../../../components/auth/RoleGate";
import { ROLES } from "../../../../lib/auth/roles";
import { getMemberApplications } from "../../../../lib/data/memberApplications";
import { reviewMemberApplication } from "../../actions/memberActions";

export const metadata = {
  title: "Applications Admin | GC Forum",
};

const TEAM_SIZE_LABELS = {
  "sole-gc": "Sole GC",
  "team-1-5": "Leads a team of 1-5",
  "team-6-10": "Leads a team of 6-10",
  "team-11-20": "Leads a team of 11-20",
  "team-20-plus": "Leads a team of 20+",
};

function formatDisplayDate(value) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
  } catch (_error) {
    return value;
  }
}

function applicantName(application) {
  if (!application) {
    return "";
  }
  return `${application.first_name ?? ""} ${application.last_name ?? ""}`.trim();
}

function statusMeta(status) {
  switch (status) {
    case "approved":
      return { label: "Approved", classes: "bg-emerald-100 text-emerald-700" };
    case "rejected":
      return { label: "Rejected", classes: "bg-red-100 text-red-700" };
    default:
      return { label: "Awaiting review", classes: "bg-amber-100 text-amber-800" };
  }
}

function safeTopics(application) {
  if (!application || !Array.isArray(application.topics)) {
    return [];
  }
  return application.topics.filter(Boolean);
}

export default async function AdminApplicationsPage({ searchParams }) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const [profile, applications] = await Promise.all([getCurrentProfile(), getMemberApplications()]);
  const applicationsList = Array.isArray(applications) ? applications : [];
  const pendingApplications = applicationsList.filter((app) => (app.status ?? "pending") === "pending");
  const processedApplications = applicationsList.filter((app) => (app.status ?? "pending") !== "pending");
  const requestedApplicationId = typeof resolvedSearchParams?.application === "string" ? resolvedSearchParams.application : null;
  const pendingLookup = new Set(pendingApplications.map((application) => application.id));
  const fallbackSelectionId = pendingApplications[0]?.id ?? null;
  const selectedApplicationId = requestedApplicationId && pendingLookup.has(requestedApplicationId)
    ? requestedApplicationId
    : fallbackSelectionId;
  const selectedApplication = pendingApplications.find((app) => app.id === selectedApplicationId) ?? null;
  const selectedTeamSize = selectedApplication ? TEAM_SIZE_LABELS[selectedApplication.team_size] ?? selectedApplication.team_size : null;
  const selectedStatus = statusMeta(selectedApplication?.status ?? "pending");
  const selectedTopics = safeTopics(selectedApplication);
  const decisionDate = (selectedApplication?.status ?? "pending") === "pending" ? null : formatDisplayDate(selectedApplication?.reviewed_at);

  return (
    <RoleGate role={ROLES.admin} initialRole={profile?.role}>
      <div className="space-y-8">
        <header className="rounded-3xl border border-neutral-200 bg-white p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-primary/60">Applications</p>
              <h1 className="text-3xl font-serif text-primary-ink">Review new member applications</h1>
              <p className="text-sm text-neutral-600">
                Every submission below was created via the /join form. Select an applicant to view their answers, add internal notes,
                and approve or reject the request.
              </p>
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Awaiting decision</p>
                <p className="text-2xl font-semibold text-primary-ink">{pendingApplications.length}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Processed</p>
                <p className="text-2xl font-semibold text-primary-ink">{processedApplications.length}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-neutral-200 bg-white p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(240px,320px)_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Pending ({pendingApplications.length})</p>
              {pendingApplications.length === 0 ? (
                <p className="mt-3 rounded-2xl border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-600">
                  No applications are waiting for review.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {pendingApplications.map((application) => {
                    const linkIsActive = application.id === selectedApplicationId;
                    const applicantDisplay = applicantName(application) || application.email;
                    const submittedOn = formatDisplayDate(application.created_at);
                    return (
                      <li key={application.id}>
                        <Link
                          href={`/admin/applications?application=${application.id}`}
                          scroll={false}
                          className={`block rounded-2xl border px-4 py-3 transition ${linkIsActive ? "border-primary bg-primary/5" : "border-neutral-200 hover:border-primary"}`}
                        >
                          <p className="font-semibold text-primary-ink">{applicantDisplay}</p>
                          <p className="text-xs text-neutral-500">{application.organisation || "Organisation pending"}</p>
                          <p className="text-xs text-neutral-400">Applied {submittedOn}</p>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="rounded-3xl border border-neutral-100 bg-soft p-6">
              {selectedApplication ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-2xl font-semibold text-primary-ink">{applicantName(selectedApplication) || selectedApplication.email}</p>
                      <p className="text-sm text-neutral-600">{selectedApplication.organisation || "Organisation pending"}</p>
                      <p className="text-xs text-neutral-500">Applied {formatDisplayDate(selectedApplication.created_at)}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${selectedStatus.classes}`}>
                      {selectedStatus.label}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <article className="rounded-2xl border border-white/80 bg-white p-4">
                      <p className="text-sm font-semibold text-primary-ink">Contact</p>
                      <dl className="mt-3 space-y-2 text-sm text-neutral-600">
                        <div>
                          <dt className="font-semibold text-primary-ink">Email</dt>
                          <dd>{selectedApplication.email}</dd>
                        </div>
                        {selectedApplication.phone && (
                          <div>
                            <dt className="font-semibold text-primary-ink">Phone</dt>
                            <dd>{selectedApplication.phone}</dd>
                          </div>
                        )}
                        <div>
                          <dt className="font-semibold text-primary-ink">LinkedIn</dt>
                          <dd>{selectedApplication.linkedin_url || "Not provided"}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-primary-ink">Location</dt>
                          <dd>{selectedApplication.location || "Not provided"}</dd>
                        </div>
                      </dl>
                    </article>
                    <article className="rounded-2xl border border-white/80 bg-white p-4">
                      <p className="text-sm font-semibold text-primary-ink">Eligibility</p>
                      <dl className="mt-3 space-y-2 text-sm text-neutral-600">
                        <div>
                          <dt className="font-semibold text-primary-ink">Current role</dt>
                          <dd>{selectedApplication.current_role || "Not provided"}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-primary-ink">Sector</dt>
                          <dd>{selectedApplication.sector || "Not provided"}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-primary-ink">Team size</dt>
                          <dd>{selectedTeamSize || "Not provided"}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-primary-ink">Directory consent</dt>
                          <dd>{selectedApplication.consent_show_directory ? "Consented" : "Opted out"}</dd>
                        </div>
                      </dl>
                      {selectedTopics.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedTopics.map((topic) => (
                            <span key={topic} className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-primary-ink">
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </article>
                  </div>

                  <article className="mt-4 rounded-2xl border border-white/80 bg-white p-4">
                    <p className="text-sm font-semibold text-primary-ink">Responsibilities</p>
                    <p className="mt-2 text-sm text-neutral-700">{selectedApplication.responsibility || "No description provided."}</p>
                  </article>

                  {(selectedApplication.status ?? "pending") === "pending" ? (
                    <form action={reviewMemberApplication} className="mt-6 space-y-3 rounded-2xl border border-dashed border-neutral-300 bg-white/80 p-4">
                      <input type="hidden" name="application_id" value={selectedApplication.id} />
                      <input type="hidden" name="reviewer_id" value={profile?.id ?? ""} />
                      <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Internal notes (optional)
                        <textarea
                          name="notes"
                          rows={3}
                          className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2"
                          placeholder="Share onboarding context or rejection reasoning"
                          defaultValue={selectedApplication.reviewer_notes ?? ""}
                        />
                      </label>
                      <div className="flex flex-wrap gap-3">
                        <button type="submit" name="decision" value="approved" className="rounded-none bg-primary px-4 py-2 font-semibold text-white">
                          Approve & invite
                        </button>
                        <button
                          type="submit"
                          name="decision"
                          value="rejected"
                          className="rounded-none border border-neutral-300 px-4 py-2 font-semibold text-neutral-700"
                        >
                          Reject
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="mt-6 rounded-2xl border border-emerald-100 bg-white/80 p-4 text-sm text-neutral-700">
                      <p className="font-semibold text-primary-ink">Decision recorded</p>
                      <p className="mt-1">
                        {selectedStatus.label}
                        {decisionDate ? ` on ${decisionDate}` : ""}
                      </p>
                      {selectedApplication.reviewer_notes && (
                        <p className="mt-2 text-xs text-neutral-500">Notes: {selectedApplication.reviewer_notes}</p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-600">
                  Select an application to view its details.
                </div>
              )}
            </div>
          </div>
        </section>

        {processedApplications.length > 0 && pendingApplications.length === 0 && (
          <section className="rounded-3xl border border-dashed border-neutral-200 bg-white/70 p-8 text-center text-sm text-neutral-600">
            <p>All {processedApplications.length} recent decisions are complete. New submissions will appear here automatically.</p>
          </section>
        )}
      </div>
    </RoleGate>
  );
}
