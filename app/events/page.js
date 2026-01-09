import Link from "next/link";
import EventCard from "../../components/cards/EventCard";
import PageBanner from "../../components/ui/PageBanner";
import { getEvents } from "../../lib/content";

export const metadata = {
  title: "Events | GC Forum",
};

const DEFAULT_FILTERS = {
  search: "",
  format: "all",
  location: "all",
  time: "all",
};

function resolveFilters(searchParams = {}) {
  return {
    search: typeof searchParams.search === "string" ? searchParams.search.trim() : DEFAULT_FILTERS.search,
    format: typeof searchParams.format === "string" ? searchParams.format : DEFAULT_FILTERS.format,
    location: typeof searchParams.location === "string" ? searchParams.location : DEFAULT_FILTERS.location,
    time: typeof searchParams.time === "string" ? searchParams.time : DEFAULT_FILTERS.time,
  };
}

function applyFilters(list, filters, phase) {
  return list.filter((event) => {
    if (filters.time === "upcoming" && phase === "past") {
      return false;
    }
    if (filters.time === "past" && phase === "upcoming") {
      return false;
    }
    if (filters.format !== "all" && event.format?.toLowerCase() !== filters.format.toLowerCase()) {
      return false;
    }
    if (filters.location !== "all") {
      const haystack = `${event.locationLabel ?? ""} ${event.locationCity ?? ""}`.toLowerCase();
      if (!haystack.includes(filters.location.toLowerCase())) {
        return false;
      }
    }
    if (filters.search) {
      const haystack = `${event.title ?? ""} ${event.summary ?? ""} ${event.focusArea ?? ""}`.toLowerCase();
      if (!haystack.includes(filters.search.toLowerCase())) {
        return false;
      }
    }
    return true;
  });
}

function buildOptions(events) {
  const formats = new Set();
  const locations = new Set();
  events.forEach((event) => {
    if (event.format) {
      formats.add(event.format);
    }
    const location = event.locationLabel || event.locationCity;
    if (location) {
      locations.add(location);
    }
  });
  return {
    formats: Array.from(formats).sort((a, b) => a.localeCompare(b)),
    locations: Array.from(locations).sort((a, b) => a.localeCompare(b)),
  };
}

export default async function EventsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const filters = resolveFilters(resolvedSearchParams);
  const events = await getEvents();
  const upcomingEvents = Array.isArray(events.upcoming) ? events.upcoming : [];
  const pastEvents = Array.isArray(events.past) ? events.past : [];
  const { formats, locations } = buildOptions([...upcomingEvents, ...pastEvents]);

  const filteredUpcoming = applyFilters(upcomingEvents, filters, "upcoming");
  const filteredPast = applyFilters(pastEvents, filters, "past");
  const showUpcoming = filters.time !== "past";
  const showPast = filters.time !== "upcoming";
  const hasResults = (showUpcoming && filteredUpcoming.length > 0) || (showPast && filteredPast.length > 0);

  return (
    <div className="bg-white">
      <PageBanner
        title="Events"
        centerContent
      />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-3xl space-y-4">
          <h2 className="heading-2 text-[#333333]">GC Forum programme</h2>
          <p className="text-base leading-relaxed text-neutral-600">
            Use the filters to find events in your area.
          </p>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="space-y-12 lg:col-span-2">
            {!hasResults ? (
              <div className="border border-dashed border-[#CCCCCC] bg-[#F5F4F6] p-8 text-center">
                <p className="text-lg font-semibold text-primary-ink">No events match those filters yet.</p>
                <p className="mt-2 text-sm text-neutral-500">Try another keyword or broaden your timeframe.</p>
              </div>
            ) : (
              <div className="space-y-12">
                {showUpcoming && (
                  <section>
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-2xl font-serif text-primary-ink">Upcoming events</h3>
                      <p className="text-sm text-neutral-500">{filteredUpcoming.length} session{filteredUpcoming.length === 1 ? "" : "s"}</p>
                    </div>
                    {filteredUpcoming.length === 0 ? (
                      <p className="mt-4 text-sm text-neutral-600">No upcoming events fit that filter yet.</p>
                    ) : (
                      <div className="mt-6 grid gap-6 md:grid-cols-2">
                        {filteredUpcoming.map((event) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    )}
                  </section>
                )}
                {showPast && (
                  <section>
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-2xl font-serif text-primary-ink">Past sessions</h3>
                      <p className="text-sm text-neutral-500">{filteredPast.length} archive{filteredPast.length === 1 ? "" : "s"}</p>
                    </div>
                    {filteredPast.length === 0 ? (
                      <p className="mt-4 text-sm text-neutral-600">No past sessions match that search.</p>
                    ) : (
                      <div className="mt-6 grid gap-6 md:grid-cols-2">
                        {filteredPast.map((event) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </div>
            )}
          </div>
          <aside className="border border-[#CCCCCC] bg-[#F5F4F6] p-6 lg:col-span-1">
            <form method="get">
              <div>
                <h4 className="font-hero-serif text-xl text-[#333333]">Filter events</h4>
                <p className="mt-1 text-sm text-neutral-600">Search by theme, format, city, or timeframe.</p>
              </div>
              <label className="mt-6 flex flex-col gap-2 text-sm text-neutral-600">
                Keyword
                <input
                  type="search"
                  name="search"
                  defaultValue={filters.search}
                  className="rounded-none border border-[#CCCCCC] bg-white px-3 py-2 text-base focus:border-primary focus:outline-none"
                  placeholder="AI, disputes, London…"
                />
              </label>
              <label className="mt-4 flex flex-col gap-2 text-sm text-neutral-600">
                Format
                <select
                  name="format"
                  defaultValue={filters.format}
                  className="rounded-none border border-[#CCCCCC] bg-white px-3 py-2 text-base focus:border-primary focus:outline-none"
                >
                  <option value="all">All formats</option>
                  {formats.map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-4 flex flex-col gap-2 text-sm text-neutral-600">
                Location
                <select
                  name="location"
                  defaultValue={filters.location}
                  className="rounded-none border border-[#CCCCCC] bg-white px-3 py-2 text-base focus:border-primary focus:outline-none"
                >
                  <option value="all">Any city</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-4 flex flex-col gap-2 text-sm text-neutral-600">
                Timeframe
                <select
                  name="time"
                  defaultValue={filters.time}
                  className="rounded-none border border-[#CCCCCC] bg-white px-3 py-2 text-base focus:border-primary focus:outline-none"
                >
                  <option value="all">Upcoming & past</option>
                  <option value="upcoming">Upcoming only</option>
                  <option value="past">Past sessions</option>
                </select>
              </label>
              <div className="mt-6 flex flex-col items-center gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-none bg-primary px-[50px] py-2 text-sm font-semibold uppercase tracking-wide text-white"
                >
                  Apply filters
                </button>
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center rounded-none border border-[#CCCCCC] px-[50px] py-2 text-sm font-semibold uppercase tracking-wide text-primary-ink"
                >
                  Reset
                </Link>
              </div>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}
