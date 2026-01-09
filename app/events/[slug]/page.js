import Link from "next/link";
import { notFound } from "next/navigation";
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
  const scheduleCopy = event.startsAt
    ? `${formatDate(event.startsAt, "EEEE d MMMM yyyy")} · ${formatDate(event.startsAt, "HH:mm")} ${event.timezone || ""}`
    : "Schedule to be confirmed";
  const heroImage = event.heroImageUrl || event.seoImageUrl || null;

  return (
    <div className="bg-neutral-50">
      <PageBanner
        title={event.title}
        description={event.summary || ""}
        eyebrow={event.format}
        centerContent={false}
      />
      <section>
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="border border-[#CCCCCC] bg-[#F5F4F6] p-6 text-sm text-neutral-700">
                <p className="font-semibold text-primary-ink">When</p>
                <p className="text-base text-primary-ink">{scheduleCopy}</p>
                <p className="mt-4 font-semibold text-primary-ink">Where</p>
                <p className="text-base text-neutral-800">{location}</p>
              </div>
              {heroImage && (
                <div className="border border-[#CCCCCC] bg-white">
                  <img src={heroImage} alt={event.heroImageAlt || event.title} className="h-full w-full object-cover" />
                </div>
              )}
            </div>
            <div className="border border-[#CCCCCC] bg-[#F5F4F6] p-6">
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
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6 py-16 space-y-16">
        <article className="prose prose-lg max-w-none text-neutral-800" dangerouslySetInnerHTML={{ __html: event.descriptionHtml || "" }} />

        {event.keyTakeaways?.length > 0 && (
          <section className="rounded-3xl border border-neutral-200 bg-white p-6">
            <h2 className="text-2xl font-serif text-primary-ink">Key takeaways</h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-neutral-700">
              {event.keyTakeaways.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {event.resources?.length > 0 && (
          <section className="rounded-3xl border border-primary/20 bg-white p-6">
            <h2 className="text-2xl font-serif text-primary-ink">Downloads for members</h2>
            <p className="mt-1 text-sm text-neutral-600">Slides, worksheets, and recaps shared during the session.</p>
            <ul className="mt-6 space-y-4">
              {event.resources.map((resource) => {
                const sizeLabel = formatFileSize(resource.fileSizeBytes);
                return (
                  <li key={resource.id ?? resource.fileUrl} className="rounded-2xl border border-neutral-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-primary-ink">{resource.title}</p>
                        <p className="text-sm text-neutral-600">{resource.description || resource.fileType || "Download"}</p>
                      </div>
                      <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary"
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
      </main>
    </div>
  );
}
