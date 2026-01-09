import Link from "next/link";
import Button from "../ui/Button";

function formatMonthDay(value) {
  if (!value) {
    return { month: "--", day: "--" };
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { month: "--", day: "--" };
  }
  return {
    month: date.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
    day: date.toLocaleDateString("en-GB", { day: "2-digit" }),
  };
}

export default function EventCard({ event }) {
  const { month, day } = formatMonthDay(event.startsAt);
  const location = event.locationLabel || event.locationCity || (event.isVirtual ? "Virtual" : "Location TBC");
  const venueName = typeof event.venueName === "string" ? event.venueName.trim() : "";
  const locationDisplay = venueName ? `${location} - ${venueName}` : location;
  const isPast = Boolean(event.isPast);
  const showRegistration = Boolean(event.registrationUrl) && !isPast;
  const hasResources = typeof event.resourceCount === "number" && event.resourceCount > 0;
  const cardBackground = isPast ? "rgb(203, 238, 243)" : "rgb(244, 238, 249)";

  return (
    <article
      className="flex h-full flex-col justify-between gap-6 border border-[#CCCCCC] px-[15px] py-5 transform transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]"
      style={{ backgroundColor: cardBackground }}
    >
      <div className="flex items-start gap-4">
        <div className="border border-primary/30 bg-white px-3 py-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{month}</p>
          <p className="text-2xl font-serif text-primary-ink">{day}</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">{event.format}</p>
          <h3 className="text-xl font-serif text-primary-ink">
            <Link href={`/events/${event.slug}`} className="transition hover:text-primary">
              {event.title}
            </Link>
          </h3>
          <p className="text-sm text-neutral-600">{event.summary}</p>
        </div>
      </div>
      <div className="border-t border-[#CCCCCC] pt-4 text-sm text-neutral-600">
        <p className="font-semibold text-primary-ink">{locationDisplay}</p>
        {hasResources && (
          <p className="text-xs text-neutral-500">{event.resourceCount} downloadable resource{event.resourceCount === 1 ? "" : "s"}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-3 border-t border-[#CCCCCC] pt-4">
        <Link href={`/events/${event.slug}`} className="inline-flex">
          <Button as="span" size="sm">
            View details
          </Button>
        </Link>
        {showRegistration && (
          <Button
            as="a"
            href={event.registrationUrl}
            target="_blank"
            rel="noreferrer"
            variant="ghost"
            size="sm"
          >
            {event.registrationLabel || "Register"}
          </Button>
        )}
      </div>
    </article>
  );
}
