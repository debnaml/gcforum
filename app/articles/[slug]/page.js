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

  return (
    <div className="bg-white">
      <div className="bg-primary-ink py-16 text-white">
        <div className="mx-auto max-w-4xl px-6">
          <Badge tone="primary">{article.category}</Badge>
          <h1 className="mt-6 text-4xl font-serif">{article.title}</h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
            <span>By {article.author}</span>
            <span>{formatDate(article.date)}</span>
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
              <h3 className="text-lg font-semibold text-primary-ink">Author</h3>
              <p className="mt-2 text-sm text-neutral-600">{article.author}</p>
              <p className="text-sm text-accent">Head of Intellectual Property</p>
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
