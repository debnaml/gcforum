import Button from "../ui/Button";
import { formatDate } from "../../lib/utils";

export default function EventCard({ event }) {
  const fill = `${event.attendees} of ${event.capacity} attendees`;
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5">
      <p className="text-sm font-semibold text-accent">{event.category}</p>
      <h3 className="text-lg font-semibold text-primary-ink">{event.title}</h3>
      <p className="text-sm text-neutral-500">{fill}</p>
      <p className="text-sm text-neutral-500">{formatDate(event.date)}</p>
      <div className="mt-2 flex gap-3">
        <Button size="sm" variant="secondary">
          {event.cta}
        </Button>
        {event.status && (
          <Button size="sm" variant="ghost">
            {event.status}
          </Button>
        )}
      </div>
    </article>
  );
}
