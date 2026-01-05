import EventCard from "../../components/cards/EventCard";
import PageBanner from "../../components/ui/PageBanner";
import SectionHeading from "../../components/ui/SectionHeading";
import { getEvents } from "../../lib/content";

export const metadata = {
  title: "Events | GC Forum",
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="bg-white">
      <PageBanner
        title="Events"
        description="View and book roundtables, briefings, and on-demand sessions tailored for general counsel leaders."
        centerContent
      />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading
          eyebrow="Programming"
          title="Upcoming GC Forum events"
          description="Browse the calendar of upcoming and past sessions to plan your next touchpoint."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-10">
            <div>
              <h3 className="text-2xl font-serif text-primary-ink">Upcoming Events</h3>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {events.upcoming.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-serif text-primary-ink">Past Events</h3>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {events.past.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </div>
          <aside className="rounded-2xl border border-neutral-200 bg-soft p-6">
            <h4 className="text-lg font-semibold text-primary-ink">Event filter</h4>
            <div className="mt-4 space-y-4 text-sm">
              {["Event Title", "Event Type", "Event Location", "Dates", "Order By"].map((label) => (
                <label key={label} className="flex flex-col gap-2">
                  <span className="text-neutral-600">{label}</span>
                  <select className="rounded-xl border border-neutral-200 bg-white px-3 py-2">
                    <option>All</option>
                  </select>
                </label>
              ))}
              <button className="mt-4 w-full rounded-none bg-primary px-4 py-2 text-white">Apply filter</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
