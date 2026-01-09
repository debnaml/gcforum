import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import Button from "../../../components/ui/Button";
import PageBanner from "../../../components/ui/PageBanner";
import { getEventBySlug } from "../../../lib/content";
import { formatDate } from "../../../lib/utils";

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) {
    return null;
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = typeof resolvedParams?.slug === "string" ? resolvedParams.slug : null;
  if (!slug) {
    return { title: "Event | GC Forum" };
  }
  const event = await getEventBySlug(slug);
  if (!event) {
    return { title: "Event | GC Forum" };
  }
  return {
    title: `${event.title} | GC Forum`,
    description: event.seoDescription || event.summary,
    openGraph: {
      title: event.seoTitle || event.title,
      description: event.seoDescription || event.summary,
      images: event.seoImageUrl ? [event.seoImageUrl] : event.heroImageUrl ? [event.heroImageUrl] : undefined,
    },
  };
}

export default async function EventDetailPage({ params }) {
  const resolvedParams = await params;
  const slug = typeof resolvedParams?.slug === "string" ? resolvedParams.slug : null;
  const event = slug ? await getEventBySlug(slug) : null;
  if (!event) {
    notFound();
  }

  const location = event.locationLabel || event.locationCity || (event.isVirtual ? "Virtual" : "Location TBC");
  const venueName = typeof event.venueName === "string" ? event.venueName.trim() : "";
  const eventDate = event.startsAt ? formatDate(event.startsAt) : null;
  const eventTime = event.startsAt ? formatDate(event.startsAt, "HH:mm") : null;
  const eventEndDate = event.endsAt ? formatDate(event.endsAt) : null;
  const eventEndTime = event.endsAt ? formatDate(event.endsAt, "HH:mm") : null;
  const hasDistinctEndDate = Boolean(eventEndDate && eventEndDate !== eventDate);
  const hasEndTime = Boolean(eventEndTime);
  const dateRange = eventDate
    ? hasDistinctEndDate
      ? `${eventDate} - ${eventEndDate}`
      : eventDate
    : null;
  const timeRange = eventTime
    ? hasEndTime
      ? `${eventTime} - ${eventEndTime}`
      : eventTime
    : null;
  const scheduleCopy = dateRange
    ? timeRange
      ? `${dateRange} · ${timeRange}`
      : dateRange
    : "Schedule to be confirmed";
  const heroImage = event.heroImageUrl || event.seoImageUrl || null;

  return (
    <div className="bg-white">
      <PageBanner
        title={event.title}
        description={event.summary || ""}
        eyebrow={event.format}
        centerContent={false}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 pb-12 pt-0">
          <div className="flex flex-col gap-4 py-[50px] md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="flex flex-wrap items-center gap-2 text-[18px] font-normal text-[#666666]">
                <span>Where</span>
                <span className="text-[#237781]">{location}</span>
                {venueName ? <span>{` - ${venueName}`}</span> : null}
              </p>
              <p className="text-[18px] font-normal text-[#666666]">{scheduleCopy}</p>
            </div>
            <button
              type="button"
              className="flex items-center gap-3 self-start rounded-none border border-transparent px-4 py-2 text-[16px] font-normal text-[#237781] transition hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="Save event"
            >
              <Star className="h-5 w-5" strokeWidth={1.5} />
              Save event
            </button>
          </div>
          <hr className="border-t border-[#E5E2EB]" />
          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="space-y-8">
              {heroImage && (
                <div className="overflow-hidden">
                  <img src={heroImage} alt={event.heroImageAlt || event.title} className="h-full w-full object-cover" />
                </div>
              )}
              <article className="prose prose-lg max-w-none text-neutral-800" dangerouslySetInnerHTML={{ __html: event.descriptionHtml || "" }} />

              {event.keyTakeaways?.length > 0 && (
                <section className="border border-neutral-200 bg-white p-6">
                  <h2 className="text-2xl font-serif text-primary-ink">Key takeaways</h2>
                  <ul className="mt-4 list-disc space-y-2 pl-6 text-neutral-700">
                    {event.keyTakeaways.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}

              {event.resources?.length > 0 && (
                <section className="border border-primary/20 bg-white p-6">
                  <h2 className="text-2xl font-serif text-primary-ink">Downloads for members</h2>
                  <p className="mt-1 text-sm text-neutral-600">Slides, worksheets, and recaps shared during the session.</p>
                  <ul className="mt-6 space-y-4">
                    {event.resources.map((resource) => {
                      const sizeLabel = formatFileSize(resource.fileSizeBytes);
                      return (
                        <li key={resource.id ?? resource.fileUrl} className="border border-neutral-200 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-primary-ink">{resource.title}</p>
                              <p className="text-sm text-neutral-600">{resource.description || resource.fileType || "Download"}</p>
                            </div>
                            <a
                              href={resource.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="border border-primary px-4 py-2 text-sm font-semibold text-primary"
                            >
                              Download
                            </a>
                          </div>
                          <div className="mt-2 text-xs text-neutral-500">
                            <span>{resource.fileType}</span>
                            {sizeLabel ? <span className="ml-3">{sizeLabel}</span> : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </div>
            <aside className="space-y-6">
              <div className="border border-[#CCCCCC] bg-[#FEFEFE] p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-primary/70">Attend</p>
                <p className="mt-2 text-lg font-serif text-primary-ink">Join this GC Forum session</p>
                <div className="mt-6 flex flex-col gap-3">
                  {event.registrationUrl && (
                    <Button
                      as="a"
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {event.registrationLabel || "Register"}
                    </Button>
                  )}
                  <Link href="/events" className="inline-flex">
                    <Button as="span" variant="ghost">
                      View all events
                    </Button>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
