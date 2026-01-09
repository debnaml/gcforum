import Link from "next/link";
import { getCurrentProfile } from "../../../../lib/auth/getProfile";
import RoleGate from "../../../../components/auth/RoleGate";
import { ROLES } from "../../../../lib/auth/roles";
import PanelScrollAnchor from "../../../../components/admin/PanelScrollAnchor";
import ResourceRichTextEditor from "../../../../components/admin/ResourceRichTextEditor";
import EventResourcesEditor from "../../../../components/admin/EventResourcesEditor";
import { deleteEvent, upsertEvent } from "../../actions/contentActions";
import { hasServiceRoleAccess } from "../../../../lib/env";
import { getServiceRoleClient } from "../../../../lib/supabase/serverClient";
import { normalizeEvent } from "../../../../lib/content";

export const metadata = {
  title: "Events Admin | GC Forum",
};

function formatDateTimeLocal(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 16);
}

function formatDisplayDate(value) {
  if (!value) {
    return "TBC";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

async function getEventsAdminData() {
  if (!hasServiceRoleAccess) {
    return [];
  }
  const client = getServiceRoleClient();
  const { data, error } = await client
    .from("events_admin_view")
    .select("*")
    .order("starts_at", { ascending: true });
  if (error) {
    console.error("Failed to load admin events", error.message);
    return [];
  }
  return (data ?? []).map((row) => normalizeEvent(row)).filter(Boolean);
}

function feedbackMessageFromQuery(feedback) {
  if (feedback === "event-created") {
    return "Event published successfully.";
  }
  if (feedback === "event-updated") {
    return "Event updated.";
  }
  if (feedback === "event-deleted") {
    return "Event deleted.";
  }
  return null;
}

export default async function AdminEventsPage({ searchParams }) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const [profile, events] = await Promise.all([getCurrentProfile(), getEventsAdminData()]);
  const serviceRoleReady = hasServiceRoleAccess;
  const mode = typeof resolvedSearchParams?.mode === "string" ? resolvedSearchParams.mode : null;
  const selectedEventId = typeof resolvedSearchParams?.event === "string" ? resolvedSearchParams.event : null;
  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? null;
  const isCreateMode = mode === "create";
  const hasPanel = isCreateMode || Boolean(selectedEvent);
  const feedbackKey = typeof resolvedSearchParams?.feedback === "string" ? resolvedSearchParams.feedback : null;
  const feedbackMessage = feedbackMessageFromQuery(feedbackKey);
  const feedbackVariant = feedbackKey === "event-deleted" ? "danger" : "success";

  const upcomingEvents = events.filter((event) => !event.isPast);
  const pastEvents = events.filter((event) => event.isPast);
  const draftEvents = events.filter((event) => event.status === "draft");
  const formatOptions = Array.from(new Set(events.map((event) => event.format).filter(Boolean))).sort((a, b) => a.localeCompare(b));

  const startsAtValue = formatDateTimeLocal(selectedEvent?.startsAt);
  const endsAtValue = formatDateTimeLocal(selectedEvent?.endsAt);
  return (
    <RoleGate role={ROLES.admin} initialRole={profile?.role}>
      <div className="space-y-8">
        <header className="rounded-3xl border border-neutral-200 bg-white p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-primary/60">Events</p>
              <h1 className="text-3xl font-serif text-primary-ink">Curate GC Forum programmes</h1>
              <p className="text-sm text-neutral-600">
                Publish roundtables, breakfasts, and summit sessions with hero copy, downloadable takeaways, and scheduling details for members.
              </p>
            </div>
            <Link
              href="/admin/events?mode=create"
              className="inline-flex items-center rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary"
            >
              + Add event
            </Link>
          </div>
        </header>

        {feedbackMessage && (
          <div
            className={`flex items-center justify-between gap-4 rounded-3xl border px-6 py-4 text-sm ${
              feedbackVariant === "danger"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            <span>{feedbackMessage}</span>
            <Link href="/admin/events" className="text-xs font-semibold uppercase tracking-[0.2em] text-current">
              Dismiss
            </Link>
          </div>
        )}

        {!serviceRoleReady && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            <p className="font-semibold">Supabase service role key missing</p>
            <p className="mt-1">
              Add <code className="rounded bg-white px-1">SUPABASE_SERVICE_ROLE_KEY</code> to your environment to enable event editing, uploads, and storage cleanup.
            </p>
          </div>
        )}

        {hasPanel && (
          <section className="rounded-3xl border border-neutral-200 bg-white p-8">
            <PanelScrollAnchor activeKey={isCreateMode ? "create-event" : selectedEvent?.id ?? null} />
            <p className="text-sm uppercase tracking-[0.3em] text-primary/60">
              {isCreateMode ? "Add event" : "Edit event"}
            </p>
            <h2 className="mt-1 heading-2 text-primary-ink">
              {isCreateMode ? "Create a new event" : selectedEvent?.title ?? "Select an event"}
            </h2>
            {!serviceRoleReady ? (
              <p className="mt-4 rounded-2xl border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-600">
                Configure Supabase credentials to unlock editing capabilities.
              </p>
            ) : isCreateMode || selectedEvent ? (
              <form action={upsertEvent} className="mt-6 space-y-6">
                {!isCreateMode && <input type="hidden" name="id" defaultValue={selectedEvent?.id} />}
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-semibold text-primary-ink">
                    Title
                    <input
                      name="title"
                      defaultValue={selectedEvent?.title ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      placeholder="GC Forum roundtable"
                      required
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    Slug
                    <input
                      name="slug"
                      defaultValue={selectedEvent?.slug ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      placeholder="events-technology-roundtable"
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    Status
                    <select
                      name="status"
                      defaultValue={selectedEvent?.status ?? "draft"}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-3 text-sm font-semibold text-primary-ink">
                    <input
                      type="checkbox"
                      name="featured"
                      defaultChecked={selectedEvent?.featured ?? false}
                      className="h-5 w-5 rounded border border-neutral-300"
                    />
                    Feature this event
                  </label>
                </div>

                <label className="text-sm font-semibold text-primary-ink">
                  Format / type
                  <input
                    name="format"
                    defaultValue={selectedEvent?.format ?? formatOptions[0] ?? "Roundtable"}
                    list="event-format-options"
                    className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                  />
                  {formatOptions.length > 0 && (
                    <datalist id="event-format-options">
                      {formatOptions.map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                  )}
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-semibold text-primary-ink">
                    Start date & time
                    <input
                      type="datetime-local"
                      name="starts_at"
                      defaultValue={startsAtValue}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      required
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    End date & time
                    <input
                      type="datetime-local"
                      name="ends_at"
                      defaultValue={endsAtValue}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                    />
                  </label>
                  <label className="md:col-span-2 flex items-center gap-3 text-sm font-semibold text-primary-ink">
                    <input
                      type="checkbox"
                      name="is_virtual"
                      defaultChecked={selectedEvent?.isVirtual ?? false}
                      className="h-5 w-5 rounded border border-neutral-300"
                    />
                    Virtual session
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-semibold text-primary-ink">
                    Location label
                    <input
                      name="location_label"
                      defaultValue={selectedEvent?.locationLabel ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      placeholder="Birketts London, member office…"
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    City
                    <input
                      name="location_city"
                      defaultValue={selectedEvent?.locationCity ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    Region / state
                    <input
                      name="location_region"
                      defaultValue={selectedEvent?.locationRegion ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                    />
                  </label>
                  <label className="md:col-span-2 text-sm font-semibold text-primary-ink">
                    Venue name (optional)
                    <input
                      name="venue_name"
                      defaultValue={selectedEvent?.venueName ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      placeholder="Member HQ, private dining room…"
                    />
                  </label>
                </div>

                <label className="text-sm font-semibold text-primary-ink">
                  Summary
                  <textarea
                    name="summary"
                    rows={3}
                    defaultValue={selectedEvent?.summary ?? ""}
                    className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                    placeholder="Two-sentence hook for cards and listings"
                  />
                </label>

                <label className="text-sm font-semibold text-primary-ink">
                  Hero copy
                  <ResourceRichTextEditor name="description_html" initialContent={selectedEvent?.descriptionHtml ?? ""} />
                </label>

                <div>
                  <p className="text-sm font-semibold text-primary-ink">Downloads & attachments</p>
                  <p className="mt-1 text-xs text-neutral-500">Members see these after the event. Limit 10 MB per file.</p>
                  <div className="mt-3">
                    <EventResourcesEditor initialResources={selectedEvent?.resources ?? []} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-semibold text-primary-ink">
                    Hero image URL
                    <input
                      type="url"
                      name="hero_image_url"
                      defaultValue={selectedEvent?.heroImageUrl ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    Hero image alt
                    <input
                      name="hero_image_alt"
                      defaultValue={selectedEvent?.heroImageAlt ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      placeholder="Members seated at a GC Forum breakfast"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-semibold text-primary-ink">
                    Registration URL
                    <input
                      type="url"
                      name="registration_url"
                      defaultValue={selectedEvent?.registrationUrl ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      placeholder="https://gcforum.typeform.com/..."
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    Registration label
                    <input
                      name="registration_label"
                      defaultValue={selectedEvent?.registrationLabel ?? "Register"}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      placeholder="Register now"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-semibold text-primary-ink">
                    SEO title
                    <input
                      name="seo_title"
                      defaultValue={selectedEvent?.seoTitle ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    SEO description
                    <textarea
                      name="seo_description"
                      rows={2}
                      defaultValue={selectedEvent?.seoDescription ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    SEO image URL
                    <input
                      type="url"
                      name="seo_image_url"
                      defaultValue={selectedEvent?.seoImageUrl ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="rounded-none bg-primary px-6 py-3 text-white">
                    {isCreateMode ? "Save event" : "Update event"}
                  </button>
                  <Link
                    href="/admin/events"
                    className="rounded-none border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-600"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-600">
                Select an event from the list to edit its details.
              </p>
            )}

            {!isCreateMode && selectedEvent && serviceRoleReady && (
              <form action={deleteEvent} className="mt-6">
                <input type="hidden" name="id" value={selectedEvent.id} />
                <button className="rounded-none border border-red-200 px-4 py-2 text-sm font-semibold text-red-600">
                  Delete this event
                </button>
              </form>
            )}
          </section>
        )}

        <section className="rounded-3xl border border-neutral-200 bg-white p-8">
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-neutral-200 bg-soft p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Upcoming</p>
              <p className="mt-2 text-3xl font-semibold text-primary-ink">{upcomingEvents.length}</p>
              <p className="text-sm text-neutral-600">Scheduled and visible on the public site.</p>
            </article>
            <article className="rounded-2xl border border-neutral-200 bg-soft p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Past</p>
              <p className="mt-2 text-3xl font-semibold text-primary-ink">{pastEvents.length}</p>
              <p className="text-sm text-neutral-600">Archived sessions with resources.</p>
            </article>
            <article className="rounded-2xl border border-neutral-200 bg-soft p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Drafts</p>
              <p className="mt-2 text-3xl font-semibold text-primary-ink">{draftEvents.length}</p>
              <p className="text-sm text-neutral-600">Hidden until you publish.</p>
            </article>
          </div>

          <div className="mt-8 space-y-6">
            <h3 className="text-xl font-serif text-primary-ink">All events</h3>
            {events.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-600">
                No events yet. Click “Add event” to create your first programme.
              </p>
            ) : (
              <ul className="space-y-3">
                {events.map((event) => (
                  <li key={event.id} className="rounded-2xl border border-neutral-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-primary-ink">{event.title}</p>
                        <p className="text-sm text-neutral-600">
                          {formatDisplayDate(event.startsAt)} · {event.locationLabel || event.locationCity || "Location TBC"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                        <span className={`rounded-full px-3 py-1 ${event.status === "draft" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                          {event.status}
                        </span>
                        {event.isPast && (
                          <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-600">Past</span>
                        )}
                        {!event.isPast && (
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Upcoming</span>
                        )}
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-600">
                          {event.resourceCount} download{event.resourceCount === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                      <span>{event.format}</span>
                      {event.capacity ? <span>{event.attendeeCount ?? 0} / {event.capacity} seats</span> : null}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href={`/admin/events?event=${event.id}`}
                        className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary"
                      >
                        Edit event
                      </Link>
                      <Link
                        href={`/events/${event.slug}`}
                        className="text-sm font-semibold text-neutral-600"
                        target="_blank"
                        rel="noreferrer"
                      >
                        View live
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </RoleGate>
  );
}
