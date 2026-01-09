import Link from "next/link";
import {
  deleteArticle,
  deleteResource,
  updateHomepageHero,
  upsertArticle,
  upsertResource,
} from "../actions/contentActions";
import {
  reviewMemberApplication,
  updateMemberStatus,
} from "../actions/memberActions";
import { getArticles, getEvents, getHomepageContent, getMembers, getResources } from "../../../lib/content";
import { getCurrentProfile } from "../../../lib/auth/getProfile";
import RoleGate from "../../../components/auth/RoleGate";
import { ROLES } from "../../../lib/auth/roles";
import { getMemberApplications } from "../../../lib/data/memberApplications";

export const metadata = {
  title: "Admin | GC Forum",
};

const TEAM_SIZE_LABELS = {
  "sole-gc": "Sole GC",
  "team-1-5": "Leads a team of 1–5",
  "team-6-10": "Leads a team of 6–10",
  "team-11-20": "Leads a team of 11–20",
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

export default async function AdminPage() {
  const [profile, homepage, resourcesPayload, events, articles, members, memberApplications] = await Promise.all([
    getCurrentProfile(),
    getHomepageContent(),
    getResources(),
    getEvents(),
    getArticles(),
    getMembers({}, { includeAllStatuses: true, includeHidden: true }),
    getMemberApplications(),
  ]);

  const recentResources = Array.isArray(resourcesPayload?.items) ? resourcesPayload.items.slice(0, 5) : [];
  const upcomingEvents = Array.isArray(events?.upcoming) ? events.upcoming.slice(0, 5) : [];
  const pastEventsList = Array.isArray(events?.past) ? events.past : [];
  const featuredArticles = Array.isArray(articles) ? articles.slice(0, 5) : [];
  const memberList = Array.isArray(members) ? members : [];
  const pendingMembers = memberList.filter((member) => (member.status ?? "pending") === "pending");
  const activeMembers = memberList.filter((member) => (member.status ?? "pending") === "approved");
  const suspendedMembers = memberList.filter((member) => member.status === "suspended");
  const applicationList = Array.isArray(memberApplications) ? memberApplications : [];
  const pendingApplications = applicationList.filter((application) => (application.status ?? "pending") === "pending");
  const processedApplications = applicationList
    .filter((application) => (application.status ?? "pending") !== "pending")
    .slice(0, 6);

  return (
    <RoleGate role={ROLES.admin} initialRole={profile?.role}>
      <div className="space-y-12">
        <section id="applications" className="scroll-mt-32 rounded-3xl border border-neutral-200 bg-white p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-primary/60">Applications</p>
          <h2 className="mt-2 heading-2 text-primary-ink">Member applications</h2>
          <p className="mt-2 text-sm text-neutral-600">
            {pendingApplications.length === 0
              ? "Every submission has been reviewed."
              : `${pendingApplications.length} applicant${pendingApplications.length === 1 ? "" : "s"} waiting for a decision.`}
          </p>
          <div className="mt-6 space-y-4">
            {pendingApplications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-600">
                New applicants will appear here for review.
              </div>
            ) : (
              pendingApplications.map((application) => {
                const applicantName = `${application.first_name ?? ""} ${application.last_name ?? ""}`.trim();
                const submittedOn = formatDisplayDate(application.created_at);
                const teamSizeLabel = TEAM_SIZE_LABELS[application.team_size] ?? application.team_size;
                return (
                  <article key={application.id} className="rounded-3xl border border-neutral-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-primary-ink">{applicantName || application.email}</p>
                        <p className="text-sm text-neutral-600">{application.organisation}</p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Applied {submittedOn}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl bg-soft p-4">
                        <p className="text-sm font-semibold text-primary-ink">Personal details</p>
                        <dl className="mt-3 space-y-2 text-sm text-neutral-600">
                          <div>
                            <dt className="font-semibold text-primary-ink">Email</dt>
                            <dd>{application.email}</dd>
                          </div>
                          {application.phone && (
                            <div>
                              <dt className="font-semibold text-primary-ink">Phone</dt>
                              <dd>{application.phone}</dd>
                            </div>
                          )}
                          <div>
                            <dt className="font-semibold text-primary-ink">LinkedIn</dt>
                            <dd>{application.linkedin_url || "—"}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-primary-ink">Location</dt>
                            <dd>{application.location}</dd>
                          </div>
                        </dl>
                      </div>
                      <div className="rounded-2xl bg-soft p-4">
                        <p className="text-sm font-semibold text-primary-ink">Eligibility & focus</p>
                        <dl className="mt-3 space-y-2 text-sm text-neutral-600">
                          <div>
                            <dt className="font-semibold text-primary-ink">Current role</dt>
                            <dd>{application.current_role}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-primary-ink">Sector</dt>
                            <dd>{application.sector}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-primary-ink">Team size</dt>
                            <dd>{teamSizeLabel}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-primary-ink">Directory consent</dt>
                            <dd>{application.consent_show_directory ? "Consented" : "Opted out"}</dd>
                          </div>
                        </dl>
                        {Array.isArray(application.topics) && application.topics.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {application.topics.map((topic) => (
                              <span key={topic} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary-ink">
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 rounded-2xl border border-neutral-100 bg-white p-4">
                      <p className="text-sm font-semibold text-primary-ink">Responsibilities</p>
                      <p className="mt-2 text-sm text-neutral-700">{application.responsibility}</p>
                    </div>
                    <form action={reviewMemberApplication} className="mt-4 space-y-3 rounded-2xl border border-dashed border-neutral-200 p-4">
                      <input type="hidden" name="application_id" value={application.id} />
                      <input type="hidden" name="reviewer_id" value={profile?.id ?? ""} />
                      <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Internal notes (optional)
                        <textarea
                          name="notes"
                          rows={3}
                          className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2"
                          placeholder="Share context for the welcome email or rejection"
                        />
                      </label>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="submit"
                          name="decision"
                          value="approved"
                          className="rounded-none bg-primary px-4 py-2 font-semibold text-white"
                        >
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
                  </article>
                );
              })
            )}
          </div>
          {processedApplications.length > 0 && (
            <div className="mt-8 border-t border-neutral-100 pt-6">
              <p className="text-sm font-semibold text-primary-ink">Recent decisions</p>
              <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                {processedApplications.map((application) => {
                  const applicantName = `${application.first_name ?? ""} ${application.last_name ?? ""}`.trim();
                  const statusLabel = application.status === "approved" ? "Approved" : "Rejected";
                  const statusClasses =
                    application.status === "approved"
                      ? "text-emerald-700"
                      : "text-red-600";
                  return (
                    <li key={`${application.id}-decision`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-soft px-4 py-2">
                      <span>{applicantName || application.email} · {application.organisation}</span>
                      <span className={`text-xs font-semibold uppercase tracking-wide ${statusClasses}`}>
                        {statusLabel}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
        <section id="members" className="scroll-mt-32 rounded-3xl border border-neutral-200 bg-white p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-primary/60">Members</p>
          <h2 className="mt-2 heading-2 text-primary-ink">Review and manage accounts</h2>
          <div className="mt-6 space-y-4">
            {pendingMembers.length === 0 ? (
              <p className="text-sm text-neutral-600">All membership requests have been reviewed.</p>
            ) : (
              pendingMembers.map((member) => (
                <article key={member.id} className="rounded-2xl border border-neutral-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-primary-ink">{member.name}</p>
                      <p className="text-sm text-neutral-600">{member.organisation}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
                      Pending
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-neutral-600">{member.email}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <form action={updateMemberStatus}>
                      <input type="hidden" name="member_id" value={member.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button className="rounded-none bg-primary px-4 py-2 font-semibold text-white">Approve</button>
                    </form>
                    <form action={updateMemberStatus}>
                      <input type="hidden" name="member_id" value={member.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <button className="rounded-none border border-neutral-300 px-4 py-2 font-semibold text-neutral-700">Reject</button>
                    </form>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-neutral-200 bg-soft p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Approved</p>
              <p className="mt-2 text-3xl font-semibold text-primary-ink">{activeMembers.length}</p>
              <p className="text-sm text-neutral-600">Visible inside the members workspace.</p>
            </article>
            <article className="rounded-2xl border border-neutral-200 bg-soft p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Suspended / Closed</p>
              <p className="mt-2 text-3xl font-semibold text-primary-ink">{suspendedMembers.length}</p>
              <p className="text-sm text-neutral-600">Use the workspace filters to reinstate or close accounts.</p>
            </article>
            <article className="flex flex-col justify-between rounded-2xl border border-primary/30 bg-white p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary/70">Need the full list?</p>
                <p className="mt-2 text-sm text-neutral-600">View every member with pagination, search, and advanced filters.</p>
              </div>
              <Link
                href="/admin/members"
                className="mt-4 inline-flex items-center justify-center rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary"
              >
                Open members workspace
              </Link>
            </article>
          </div>
        </section>

        <section id="events" className="scroll-mt-32 rounded-3xl border border-neutral-200 bg-white p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-primary/60">Events</p>
          <h2 className="mt-2 heading-2 text-primary-ink">Programme summary</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Use the dedicated workspace to schedule sessions, upload resources, and manage CTAs.
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-neutral-200 p-4">
              <p className="text-sm font-semibold text-primary-ink">Upcoming events</p>
              {upcomingEvents.length === 0 ? (
                <p className="mt-2 text-sm text-neutral-600">Nothing scheduled — add the next session.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                  {upcomingEvents.slice(0, 4).map((event) => (
                    <li key={event.id}>{event.title}</li>
                  ))}
                </ul>
              )}
            </article>
            <article className="rounded-2xl border border-neutral-200 p-4">
              <p className="text-sm font-semibold text-primary-ink">Past sessions</p>
              {pastEventsList.length === 0 ? (
                <p className="mt-2 text-sm text-neutral-600">Add recaps and resources after each event.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                  {pastEventsList.slice(0, 4).map((event) => (
                    <li key={event.id}>{event.title}</li>
                  ))}
                </ul>
              )}
            </article>
          </div>
          <Link
            href="/admin/events"
            className="mt-6 inline-flex items-center rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary"
          >
            Open events workspace
          </Link>
        </section>

        <section id="resources" className="scroll-mt-32 rounded-3xl border border-neutral-200 bg-white p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-primary/60">Resources</p>
          <h2 className="mt-2 heading-2 text-primary-ink">Add, edit, or remove resources</h2>
          <form action={upsertResource} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-primary-ink">
              Resource ID (for edits)
              <input name="id" className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3" placeholder="resource-horizon-ip" />
            </label>
            <label className="text-sm font-semibold text-primary-ink">
              Title
              <input name="title" className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3" placeholder="Resource title" />
            </label>
            <label className="text-sm font-semibold text-primary-ink">
              Subject
              <input name="subject" className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3" placeholder="Subject" />
            </label>
            <label className="text-sm font-semibold text-primary-ink">
              Type
              <input name="type" className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3" placeholder="Article / Training" />
            </label>
            <label className="text-sm font-semibold text-primary-ink">
              Author
              <input name="author" className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3" placeholder="Author" />
            </label>
            <label className="text-sm font-semibold text-primary-ink">
              Published on
              <input type="date" name="published_on" className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3" />
            </label>
            <button type="submit" className="md:col-span-2 rounded-none bg-primary px-6 py-3 text-white">Save resource</button>
          </form>
          <div className="mt-8 space-y-4">
            {recentResources.map((resource) => (
              <article key={resource.id} className="rounded-2xl border border-neutral-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-primary-ink">{resource.title}</p>
                    <p className="text-sm text-neutral-600">
                      {resource.subject ?? resource.category} · {resource.type}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-neutral-500">{resource.id}</span>
                </div>
                <form action={upsertResource} className="mt-4 grid gap-3 md:grid-cols-2">
                  <input type="hidden" name="id" defaultValue={resource.id} />
                  <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Title
                    <input name="title" defaultValue={resource.title} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2" />
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Subject
                    <input
                      name="subject"
                      defaultValue={resource.subject ?? resource.category ?? ""}
                      className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2"
                    />
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Type
                    <input name="type" defaultValue={resource.type ?? ""} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2" />
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Author
                    <input name="author" defaultValue={resource.author ?? ""} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2" />
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Published on
                    <input
                      type="date"
                      name="published_on"
                      defaultValue={(resource.published_on ?? resource.publishedOn ?? "").slice(0, 10)}
                      className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2"
                    />
                  </label>
                  <button type="submit" className="md:col-span-2 rounded-none border border-primary px-4 py-2 text-sm font-semibold text-primary">
                    Update resource
                  </button>
                </form>
                <form action={deleteResource} className="mt-3">
                  <input type="hidden" name="id" value={resource.id} />
                  <button className="text-sm font-semibold text-red-600">Delete resource</button>
                </form>
              </article>
            ))}
          </div>
        </section>

        <section id="cms" className="scroll-mt-32 rounded-3xl border border-neutral-200 bg-white p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary/60">CMS</p>
            <h2 className="mt-2 heading-2 text-primary-ink">Homepage hero</h2>
            <form action={updateHomepageHero} className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-primary-ink">
                Eyebrow
                <input name="eyebrow" defaultValue={homepage.hero.eyebrow} className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3" />
              </label>
              <label className="text-sm font-semibold text-primary-ink md:col-span-2">
                Title
                <input name="title" defaultValue={homepage.hero.title} className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3" />
              </label>
              <label className="text-sm font-semibold text-primary-ink md:col-span-2">
                Copy
                <textarea name="copy" defaultValue={homepage.hero.copy} rows={4} className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3" />
              </label>
              <label className="text-sm font-semibold text-primary-ink">
                Primary CTA Label
                <input
                  name="cta_primary_label"
                  defaultValue={homepage.hero.ctaPrimary.label}
                  className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                />
              </label>
              <label className="text-sm font-semibold text-primary-ink">
                Primary CTA Link
                <input
                  name="cta_primary_href"
                  defaultValue={homepage.hero.ctaPrimary.href}
                  className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                />
              </label>
              <label className="text-sm font-semibold text-primary-ink">
                Secondary CTA Label
                <input
                  name="cta_secondary_label"
                  defaultValue={homepage.hero.ctaSecondary.label}
                  className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                />
              </label>
              <label className="text-sm font-semibold text-primary-ink">
                Secondary CTA Link
                <input
                  name="cta_secondary_href"
                  defaultValue={homepage.hero.ctaSecondary.href}
                  className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                />
              </label>
              <button type="submit" className="md:col-span-2 rounded-none bg-primary px-6 py-3 text-white">Save hero</button>
            </form>
          </div>

          <div className="mt-12 border-t border-neutral-100 pt-10">
            <h3 className="text-xl font-serif text-primary-ink">Featured articles</h3>
            <form action={upsertArticle} className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-primary-ink">
                Article ID (for edits)
                <input name="id" className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3" placeholder="horizon-intellectual-property" />
              </label>
              <label className="text-sm font-semibold text-primary-ink">
                Title
                <input name="title" className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3" />
              </label>
              <label className="text-sm font-semibold text-primary-ink">
                Category
                <input name="category" className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3" />
              </label>
              <label className="text-sm font-semibold text-primary-ink">
                Author
                <input name="author" className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3" />
              </label>
              <label className="text-sm font-semibold text-primary-ink">
                Date
                <input type="date" name="date" className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3" />
              </label>
              <label className="text-sm font-semibold text-primary-ink md:col-span-2">
                Excerpt
                <textarea name="excerpt" rows={3} className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3" />
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-600">
                <input type="checkbox" name="featured" /> Feature on homepage
              </label>
              <button type="submit" className="md:col-span-2 rounded-none bg-primary px-6 py-3 text-white">Save article</button>
            </form>
            <div className="mt-8 space-y-4">
              {featuredArticles.map((article) => (
                <article key={article.id} className="rounded-2xl border border-neutral-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-primary-ink">{article.title}</p>
                      <p className="text-sm text-neutral-600">{article.author}</p>
                    </div>
                    <span className="text-xs uppercase tracking-wide text-neutral-500">{article.id}</span>
                  </div>
                  <form action={deleteArticle} className="mt-3">
                    <input type="hidden" name="id" value={article.id} />
                    <button className="text-sm font-semibold text-red-600">Remove article</button>
                  </form>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </RoleGate>
  );
}
