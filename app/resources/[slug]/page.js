import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import PageBanner from "../../../components/ui/PageBanner";
import VideoPlayer from "../../../components/ui/VideoPlayer";
import { getResourceBySlug, getResources } from "../../../lib/content";
import { siteUrl } from "../../../lib/env";
import { formatDate } from "../../../lib/utils";

function toAbsoluteUrl(path) {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${siteUrl}${path}`;
}

function buildArticleJsonLd(article) {
  const authorList = (article.authors ?? []).map((author) => ({
    "@type": "Person",
    name: author.name,
    jobTitle: author.role ?? undefined,
    worksFor: author.organisation ? { "@type": "Organization", name: author.organisation } : undefined,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.seoTitle || article.title,
    description: article.seoDescription || article.summary || article.intro,
    datePublished: article.publishedOn,
    author: authorList.length > 0 ? authorList : undefined,
    image: toAbsoluteUrl(article.seoImageUrl || article.heroImageUrl) || `${siteUrl}/gcforum-og.png`,
    mainEntityOfPage: `${siteUrl}/resources/${article.slug}`,
    publisher: {
      "@type": "Organization",
      name: "GC Forum",
    },
  };
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "GC";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getResourceBySlug(slug);
  if (!article) {
    return {
      title: "Resource not found | GC Forum",
    };
  }

  const title = article.seoTitle || `${article.title} | GC Forum`;
  const description = article.seoDescription || article.summary || article.intro || "GC Forum resource";
  const canonical = `${siteUrl}/resources/${article.slug}`;
  const image = toAbsoluteUrl(article.seoImageUrl || article.heroImageUrl);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      publishedTime: article.publishedOn ?? undefined,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ResourceDetailPage({ params }) {
  const { slug } = await params;
  const article = await getResourceBySlug(slug);
  if (!article) {
    notFound();
  }

  const isVideo = article.type === "video";
  const jsonLd = buildArticleJsonLd(article);
  const normalizedAuthors = Array.isArray(article.authors)
    ? article.authors
        .map((author, index) => {
          if (!author) return null;
          if (typeof author === "string") {
            const name = author.trim();
            if (!name) return null;
            return {
              id: `author-${index}-${name}`,
              name,
              role: null,
              organisation: null,
              avatarUrl: null,
              email: null,
              phone: null,
            };
          }
          const name =
            author.name ??
            author.full_name ??
            author.fullName ??
            author.display_name ??
            author.displayName ??
            "";
          if (!name) return null;
          return {
            id: author.id ?? author.profile_id ?? author.profileId ?? `author-${index}`,
            name,
            role: author.role ?? author.title ?? author.jobTitle ?? null,
            organisation:
              author.organisation ??
              author.organization ??
              author.organisation_name ??
              author.organization_name ??
              null,
            avatarUrl: author.avatarUrl ?? author.avatar_url ?? author.avatar ?? null,
            email: author.email ?? null,
            phone: author.phone ?? author.telephone ?? null,
          };
        })
        .filter(Boolean)
    : [];
  const fallbackAuthors =
    normalizedAuthors.length || !article.author
      ? []
      : [
          {
            id: "primary-author",
            name: article.author,
            role: article.authorRole ?? article.author_role ?? null,
            organisation:
              article.authorOrganisation ??
              article.authorOrganization ??
              article.author_organisation ??
              article.author_organization ??
              null,
            avatarUrl: null,
            email: null,
            phone: null,
          },
        ];
  const authorEntries = normalizedAuthors.length ? normalizedAuthors : fallbackAuthors;
  const authorLine = authorEntries.map((author) => author.name).filter(Boolean).join(", ");
  const displayTitle = article.title ? `${article.title.charAt(0).toUpperCase()}${article.title.slice(1)}` : "";
  const publishedDate = article.publishedOn ? formatDate(article.publishedOn, "dd MMMM yyyy") : null;
  const primaryAuthor = authorEntries[0] ?? null;
  const authorDisplayName = authorLine || primaryAuthor?.name || "GC Forum Editorial";
  const relatedPayload = await getResources({
    category: article.categorySlug || "all",
    pageSize: 6,
    page: 1,
  });
  const relatedArticles = (relatedPayload?.items ?? [])
    .filter((item) => item?.slug && item.slug !== article.slug)
    .slice(0, 3);

  return (
    <div className="bg-white">
      <PageBanner eyebrow={article.category || "Resources"} title={displayTitle} spacing="compact" />
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 pb-12 pt-0">
          <div className="flex flex-col gap-4 rounded-2xl bg-white px-0 py-[50px] md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              {authorDisplayName && (
                <p className="flex flex-wrap items-center gap-2 text-[18px] font-normal text-[#666666]">
                  <span>{isVideo ? "Featuring" : "By"}</span>
                  {primaryAuthor?.id ? (
                    <Link
                      href={`/resources?author=${primaryAuthor.id}`}
                      className="text-[#237781] underline"
                    >
                      {authorDisplayName}
                    </Link>
                  ) : (
                    <span className="text-[#237781] underline">{authorDisplayName}</span>
                  )}
                </p>
              )}
              {publishedDate && <p className="text-[18px] font-normal text-[#666666]">{publishedDate}</p>}
            </div>
            <button
              type="button"
              className="flex items-center gap-3 self-start rounded-none border border-transparent px-4 py-2 text-[16px] font-normal text-[#237781] transition hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label={isVideo ? "Save video" : "Save article"}
            >
              <Star className="h-5 w-5" strokeWidth={1.5} />
              {isVideo ? "Save video" : "Save article"}
            </button>
          </div>
          <hr className="border-t border-[#E5E2EB]" />
          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="space-y-8">
              {isVideo ? (
                <>
                  <VideoPlayer
                    videoUrl={article.videoUrl}
                    posterImage={article.heroImageUrl}
                    title={article.title}
                  />
                  {article.contentHtml?.trim() && (
                    <div className="space-y-4">
                      <h2 className="heading-2 text-primary-ink">About this video</h2>
                      <div
                        className="rich-text space-y-6 text-base leading-relaxed text-neutral-800 [&_h2]:mt-10 [&_h2]:text-3xl [&_h2]:font-hero-serif [&_h3]:mt-8 [&_h3]:text-2xl [&_table]:w-full [&_table]:border-collapse [&_th]:text-left [&_td]:border-t [&_td]:border-neutral-200 [&_td]:py-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_img]:rounded-2xl"
                        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  {article.intro && (
                    <div className="space-y-4">
                      <h2 className="heading-2 text-primary-ink">Intro</h2>
                      <p className="text-lg leading-relaxed text-neutral-700">{article.intro}</p>
                    </div>
                  )}
                  {article.heroImageUrl && (
                    <div className="overflow-hidden rounded-3xl">
                      <Image
                        src={article.heroImageUrl}
                        alt={article.title}
                        width={1600}
                        height={720}
                        className="h-72 w-full object-cover"
                        unoptimized
                        priority
                      />
                    </div>
                  )}
                  <div
                    className="rich-text space-y-6 text-base leading-relaxed text-neutral-800 [&_h2]:mt-10 [&_h2]:text-3xl [&_h2]:font-hero-serif [&_h3]:mt-8 [&_h3]:text-2xl [&_table]:w-full [&_table]:border-collapse [&_th]:text-left [&_td]:border-t [&_td]:border-neutral-200 [&_td]:py-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_img]:rounded-2xl"
                    dangerouslySetInnerHTML={{ __html: article.contentHtml }}
                  />
                  {article.summary && (
                    <div className="bg-[#D6D2DB] p-6 text-base text-neutral-800">
                      <h2 className="heading-2 text-primary-ink">The Birketts View</h2>
                      <p className="mt-4 leading-relaxed">{article.summary}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <aside className="space-y-8">
              <div className="rounded-none border border-[#E5E2EB] bg-[#F9F7FB] p-6">
                <p className="font-hero-serif text-2xl text-primary-ink">
                  {isVideo ? (authorEntries.length > 1 ? "Featuring" : "Featuring") : authorEntries.length > 1 ? "Authors" : "Author"}
                </p>
                {authorEntries.length > 0 ? (
                  <div className="mt-4 space-y-4">
                    {authorEntries.map((author, index) => (
                      <div key={author.id ?? `${author.name}-${index}`} className="flex items-start gap-4 border-b border-[#E5E2EB] pb-4 last:border-b-0 last:pb-0">
                        <div className="relative h-16 w-16 overflow-hidden rounded-full bg-[#E5DFF3]">
                          {author.avatarUrl ? (
                            <Image src={author.avatarUrl} alt={author.name ?? "Author avatar"} fill sizes="64px" className="object-cover object-left" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-primary-ink">
                              {getInitials(author.name)}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-neutral-600">
                          <p className="text-lg font-semibold text-primary-ink">{author.name}</p>
                          {author.role && <p className="text-neutral-600">{author.role}</p>}
                          {author.organisation && <p className="text-xs text-neutral-500">{author.organisation}</p>}
                          {author.phone && (
                            <a href={`tel:${author.phone.replace(/[^+\d]/g, "")}`} className="block text-xs text-[#237781] underline">
                              {author.phone}
                            </a>
                          )}
                          {author.email && (
                            <a href={`mailto:${author.email}`} className="block text-xs text-[#237781] underline">
                              {author.email}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-neutral-600">GC Forum Editorial</p>
                )}
              </div>
              {article.tags?.length > 0 && (
                <div className="rounded-2xl border border-[#E5E2EB] bg-white p-6">
                  <p className="font-hero-serif text-xl text-primary-ink">Tags</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-primary/30 px-3 py-1 text-sm text-primary">
                        #{tag.replace(/-/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="rounded-none border border-[#E5E2EB] bg-white p-6">
                <p className="font-hero-serif text-xl text-primary-ink">Related {isVideo ? "content" : "articles"}</p>
                {relatedArticles.length > 0 ? (
                  <ul className="mt-4 space-y-4">
                    {relatedArticles.map((related) => (
                      <li key={related.slug}>
                        <Link
                          href={`/resources/${related.slug}`}
                          className="block rounded-xl border border-transparent px-4 py-3 transition hover:border-primary hover:bg-[#F5F4F6]"
                        >
                          <p className="text-base font-semibold text-primary-ink">{related.title}</p>
                          {related.publishedOn && (
                            <p className="mt-1 text-sm text-neutral-500">{formatDate(related.publishedOn, "dd MMM yyyy")}</p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-neutral-500">More related articles will be published soon.</p>
                )}
              </div>
            </aside>
          </div>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        </div>
      </section>
    </div>
  );
}
