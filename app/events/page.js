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
        centerContent
      />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading
          eyebrow="Programming"
          title="Upcoming GC Forum events"
          description="Browse the calendar of upcoming and past sessions to plan your next touchpoint."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
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
          <aside className="lg:col-span-1 border border-[#CCCCCC] bg-[#F5F4F6] p-6">
            <form>
              <h4 className="font-hero-serif text-xl text-[#333333]">Filter events</h4>
              <p className="mt-1 text-sm text-neutral-600">Focus the programme by keyword, format, city, or timeframe.</p>
              {["Event title", "Event type", "Location", "Date range", "Order by"].map((label) => (
                <label key={label} className="mt-4 flex flex-col gap-2 text-sm text-neutral-600">
                  {label}
                  <select className="rounded-none border border-[#CCCCCC] bg-white px-3 py-2 text-base focus:border-primary focus:outline-none">
                    <option>All</option>
                  </select>
                </label>
              ))}
              <button
                type="submit"
                className="mt-6 w-full rounded-none bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white"
              >
                Apply filters
              </button>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}
