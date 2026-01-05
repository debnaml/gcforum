import { getEvents, getHomepageContent, getResources } from "../../lib/content";

export const metadata = {
  title: "Dashboard | GC Forum",
};

export default async function DashboardHome() {
  const [homepage, events, resourcesPayload] = await Promise.all([
    getHomepageContent(),
    getEvents(),
    getResources(),
  ]);
  const resources = resourcesPayload.items ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-primary/60">Highlights</p>
        <h3 className="mt-2 text-2xl font-serif text-primary-ink">Homepage</h3>
        <p className="mt-3 text-sm text-neutral-600">{homepage.hero.title}</p>
      </div>
      <div className="rounded-3xl border border-neutral-200 bg-white p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-primary/60">Upcoming events</p>
        <ul className="mt-4 space-y-2 text-sm text-neutral-600">
          {events.upcoming.slice(0, 3).map((event) => (
            <li key={event.id}>{event.title}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-3xl border border-neutral-200 bg-white p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-primary/60">New resources</p>
        <ul className="mt-4 space-y-2 text-sm text-neutral-600">
          {resources.slice(0, 3).map((resource) => (
            <li key={resource.id}>{resource.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
