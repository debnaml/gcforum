import { notFound } from "next/navigation";
import { getArticleBySlug, getArticles } from "../../../lib/content";
import { formatDate } from "../../../lib/utils";
import Badge from "../../../components/ui/Badge";
import ArticleCard from "../../../components/cards/ArticleCard";

export async function generateMetadata({ params }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) {
    return { title: "Article not found" };
  }
  return { title: `${article.title} | GC Forum` };
}

export default async function ArticlePage({ params }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) {
    notFound();
  }
  const related = (await getArticles()).filter((item) => item.id !== article.id).slice(0, 3);
  const normalizedAuthors = Array.isArray(article.authors)
    ? article.authors
        .map((author, index) => {
          if (!author) return null;
          if (typeof author === "string") {
            const name = author.trim();
            if (!name) return null;
            return { id: `author-${index}-${name}`, name, role: null, organisation: null };
          }
          const name = author.name ?? author.full_name ?? author.fullName ?? author.display_name ?? author.displayName ?? "";
          if (!name) return null;
          return {
            id: author.id ?? author.profile_id ?? author.profileId ?? `author-${index}`,
            name,
            role: author.role ?? author.title ?? author.jobTitle ?? null,
            organisation: author.organisation ?? author.organization ?? author.organisation_name ?? author.organization_name ?? null,
          };
        })
        .filter(Boolean)
    : [];
  const fallbackAuthors = normalizedAuthors.length
    ? []
    : article.author
      ? [
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
          },
        ]
      : [];
  const authorEntries = normalizedAuthors.length ? normalizedAuthors : fallbackAuthors;
  const authorLine = authorEntries.map((author) => author.name).filter(Boolean).join(", ");

  return (
    <div className="bg-white">
      <div className="bg-primary-ink py-16 text-white">
        <div className="mx-auto max-w-4xl px-6">
          <Badge tone="primary">{article.category}</Badge>
          <h1 className="mt-6 text-4xl font-serif">{article.title}</h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
            {authorLine && <span>By {authorLine}</span>}
            {article.date && <span>{formatDate(article.date)}</span>}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <article className="prose max-w-none">
            {article.content?.map((section) => (
              <section key={section.heading} className="mb-8">
                <h2 className="heading-2">{section.heading}</h2>
                <p>{section.body}</p>
              </section>
            ))}
            <section className="rounded-2xl bg-soft px-6 py-8">
              <h3 className="text-2xl font-serif text-primary-ink">Conclusion</h3>
              <p className="mt-3 text-neutral-700">
                The IP landscape in 2026 will be shaped by technological innovation, global trade dynamics, and evolving consumer expectations.
              </p>
            </section>
          </article>
          <aside className="space-y-6">
            <div className="rounded-2xl border border-neutral-200 p-5">
              <h3 className="text-lg font-semibold text-primary-ink">
                {authorEntries.length > 1 ? "Authors" : "Author"}
              </h3>
              {authorEntries.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {authorEntries.map((author) => (
                    <div key={author.id} className="text-sm text-neutral-700">
                      <p className="font-semibold text-primary-ink">{author.name}</p>
                      {author.role && <p className="text-xs text-neutral-500">{author.role}</p>}
                      {author.organisation && <p className="text-xs text-neutral-400">{author.organisation}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-neutral-600">GC Forum Editorial</p>
              )}
            </div>
            <div className="rounded-2xl border border-neutral-200 p-5">
              <h3 className="text-lg font-semibold text-primary-ink">Tags</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {article.tags?.map((tag) => (
                  <span key={tag} className="rounded-full bg-soft px-3 py-1 text-sm text-primary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-ink">Related Articles</h3>
              <div className="mt-4 space-y-4">
                {related.map((item) => (
                  <ArticleCard key={item.id} article={item} />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
