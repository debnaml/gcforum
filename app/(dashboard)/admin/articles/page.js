import Link from "next/link";
import { getCurrentProfile } from "../../../../lib/auth/getProfile";
import RoleGate from "../../../../components/auth/RoleGate";
import { ROLES } from "../../../../lib/auth/roles";
import PanelScrollAnchor from "../../../../components/admin/PanelScrollAnchor";
import ResourceRichTextEditor from "../../../../components/admin/ResourceRichTextEditor";
import Pagination from "../../../../components/ui/Pagination";
import { getServerClient } from "../../../../lib/supabase/serverClient";
import { normalizeResourceArticle } from "../../../../lib/content";
import { deleteResourceArticle, upsertResourceArticle } from "../../actions/contentActions";

export const metadata = {
  title: "Resource Articles Admin | GC Forum",
};

const ADMIN_PAGE_SIZE = 20;

async function getArticlesAdminData({ page = 1, pageSize = ADMIN_PAGE_SIZE } = {}) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.min(Math.floor(pageSize), 50) : ADMIN_PAGE_SIZE;
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;
  const supabase = await getServerClient();
  if (!supabase) {
    return {
      articles: [],
      categories: [],
      authors: [],
      pagination: {
        page: safePage,
        pageSize: safePageSize,
        totalItems: 0,
        totalPages: 1,
      },
    };
  }

  const [articlesRes, categoriesRes, authorsRes] = await Promise.all([
    supabase
      .from("resource_articles_public")
      .select(
        "id, slug, title, intro, summary, content_html, tags, hero_image_url, seo_title, seo_description, seo_image_url, published_on, status, featured, category_name, category_slug, authors, author_ids",
        { count: "exact" },
      )
      .order("published_on", { ascending: false })
      .range(from, to),
    supabase.from("resource_categories").select("id, name, slug").order("name", { ascending: true }),
    supabase.from("partners").select("id, name").eq("is_author", true).order("name", { ascending: true }),
  ]);

  if (articlesRes.error) {
    console.error(articlesRes.error.message);
  }
  if (categoriesRes.error) {
    console.error(categoriesRes.error.message);
  }
  if (authorsRes.error) {
    console.error(authorsRes.error.message);
  }

  const normalizedArticles = (articlesRes.data ?? []).map((row) => normalizeResourceArticle(row)).filter(Boolean);
  const totalItems = typeof articlesRes.count === "number" ? articlesRes.count : normalizedArticles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));

  return {
    articles: normalizedArticles,
    categories: categoriesRes.data ?? [],
    authors: authorsRes.data ?? [],
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      totalItems,
      totalPages,
    },
  };
}

function formatDate(dateString) {
  if (!dateString) {
    return "Not scheduled";
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function parsePageParam(value) {
  const normalized = Array.isArray(value) ? value[0] : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

export default async function AdminArticlesPage({ searchParams }) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const currentPage = parsePageParam(resolvedSearchParams?.page);
  const [profile, adminData] = await Promise.all([
    getCurrentProfile(),
    getArticlesAdminData({ page: currentPage, pageSize: ADMIN_PAGE_SIZE }),
  ]);

  const articles = adminData.articles ?? [];
  const pagination = adminData.pagination ?? {
    page: currentPage,
    pageSize: ADMIN_PAGE_SIZE,
    totalItems: articles.length,
    totalPages: 1,
  };
  const categoryOptions = (adminData.categories ?? [])
    .map((category) => ({
      id: category.id,
      slug: category.slug,
      label: category.name ?? category.slug ?? "Uncategorised",
    }))
    .filter((category) => category.slug);
  const authorOptions = (adminData.authors ?? [])
    .map((author) => ({ id: author.id, label: author.name ?? author.full_name ?? "Unnamed" }))
    .filter((author) => author.id && author.label);

  const mode = typeof resolvedSearchParams?.mode === "string" ? resolvedSearchParams.mode : null;
  const selectedArticleId = typeof resolvedSearchParams?.article === "string" ? resolvedSearchParams.article : null;
  const selectedArticle = articles.find((article) => article.id === selectedArticleId) ?? null;
  const isCreateMode = mode === "create";
  const hasPanel = isCreateMode || Boolean(selectedArticle);
  const feedback = typeof resolvedSearchParams?.feedback === "string" ? resolvedSearchParams.feedback : null;
  const feedbackMessage =
    feedback === "article-created"
      ? "Resource article created successfully."
      : feedback === "article-updated"
        ? "Resource article updated."
        : feedback === "article-deleted"
          ? "Resource article deleted."
          : null;
  const feedbackColorClasses = feedback === "article-deleted"
    ? "border-red-200 bg-red-50 text-red-700"
    : "border-emerald-200 bg-emerald-50 text-emerald-800";

  const selectedPublishedDate = selectedArticle?.publishedOn
    ? selectedArticle.publishedOn.slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const selectedAuthors = selectedArticle?.authorIds ?? [];
  const selectedTags = (selectedArticle?.tags ?? []).join(", ");
  const totalArticlesCount = typeof pagination.totalItems === "number" ? pagination.totalItems : articles.length;

  return (
    <RoleGate role={ROLES.admin} initialRole={profile?.role}>
      <div className="space-y-8">
        <header className="rounded-3xl border border-neutral-200 bg-white p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-primary/60">Resources</p>
              <h1 className="text-3xl font-serif text-primary-ink">Manage long-form resource articles</h1>
              <p className="text-sm text-neutral-600">
                These articles power the public /resources experience. Drafts stay hidden until published, and featured articles feed the
                homepage carousel.
              </p>
            </div>
            <Link
              href="/admin/articles?mode=create"
              className="inline-flex items-center rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary"
            >
              + Add article
            </Link>
          </div>
        </header>

        {feedbackMessage && (
          <div className={`flex items-center justify-between gap-4 rounded-3xl border px-6 py-4 text-sm ${feedbackColorClasses}`}>
            <span>{feedbackMessage}</span>
            <Link href="/admin/articles" className="text-xs font-semibold uppercase tracking-[0.2em] text-current">
              Dismiss
            </Link>
          </div>
        )}

        {hasPanel && (
          <section className="rounded-3xl border border-neutral-200 bg-white p-8">
            <PanelScrollAnchor activeKey={isCreateMode ? "create" : selectedArticle?.id ?? null} />
            <p className="text-sm uppercase tracking-[0.3em] text-primary/60">
              {isCreateMode ? "Add article" : "Edit article"}
            </p>
            <h2 className="mt-1 heading-2 text-primary-ink">
              {isCreateMode ? "Create a new resource" : selectedArticle?.title ?? "Select an article"}
            </h2>
            {isCreateMode && (
              <p className="mt-2 text-xs text-neutral-500">Slugs auto-generate from the title but you can override them below.</p>
            )}

            <div className="mt-6">
              {isCreateMode || selectedArticle ? (
                <form action={upsertResourceArticle} className="grid gap-4 md:grid-cols-2">
                  {!isCreateMode && <input type="hidden" name="id" defaultValue={selectedArticle?.id} />}
                  <label className="text-sm font-semibold text-primary-ink">
                    Title
                    <input
                      name="title"
                      defaultValue={selectedArticle?.title ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      required
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    Slug
                    <input
                      name="slug"
                      defaultValue={selectedArticle?.slug ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      placeholder="resources-future-proofing"
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    Status
                    <select
                      name="status"
                      defaultValue={selectedArticle?.status ?? "draft"}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    Publish date
                    <input
                      type="date"
                      name="published_on"
                      defaultValue={selectedPublishedDate}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    Category
                    <select
                      name="category_slug"
                      defaultValue={selectedArticle?.categorySlug ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                    >
                      <option value="">Uncategorised</option>
                      {categoryOptions.map((category) => (
                        <option key={category.id} value={category.slug}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-3 text-sm font-semibold text-primary-ink">
                    <input
                      type="checkbox"
                      name="featured"
                      defaultChecked={selectedArticle?.featured ?? false}
                      className="h-5 w-5 rounded border border-neutral-300"
                    />
                    Feature on homepage
                  </label>
                  <label className="text-sm font-semibold text-primary-ink md:col-span-2">
                    Intro
                    <textarea
                      name="intro"
                      rows={3}
                      defaultValue={selectedArticle?.intro ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      placeholder="Short hook that appears on cards"
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink md:col-span-2">
                    Summary
                    <textarea
                      name="summary"
                      rows={4}
                      defaultValue={selectedArticle?.summary ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      placeholder="Two-sentence overview displayed above the fold"
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink md:col-span-2">
                    Content
                    <div className="mt-2">
                      <ResourceRichTextEditor
                        name="content_html"
                        initialContent={selectedArticle?.contentHtml ?? ""}
                      />
                    </div>
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    Hero image URL
                    <input
                      type="url"
                      name="hero_image_url"
                      defaultValue={selectedArticle?.heroImageUrl ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    Tags (comma separated)
                    <input
                      name="tags"
                      defaultValue={selectedTags}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      placeholder="technology, disputes"
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    SEO title
                    <input
                      name="seo_title"
                      defaultValue={selectedArticle?.seoTitle ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    SEO description
                    <textarea
                      name="seo_description"
                      rows={3}
                      defaultValue={selectedArticle?.seoDescription ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    SEO image URL
                    <input
                      type="url"
                      name="seo_image_url"
                      defaultValue={selectedArticle?.seoImageUrl ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      placeholder="https://.../social-card.jpg"
                    />
                  </label>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-primary-ink w-full">
                      Authors
                      <select
                        name="author_ids"
                        multiple
                        defaultValue={selectedAuthors}
                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      >
                        {authorOptions.length === 0 && (
                          <option value="">No author profiles yet — enable via Team admin</option>
                        )}
                        {authorOptions.map((author) => (
                          <option key={author.id} value={author.id}>
                            {author.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className="mt-2 text-xs text-neutral-500">
                      Hold Cmd/Ctrl to select multiple authors. Manage eligible authors in the Team admin by toggling “Make author”.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 md:col-span-2">
                    <button type="submit" className="rounded-none bg-primary px-6 py-3 text-white">
                      {isCreateMode ? "Save article" : "Update article"}
                    </button>
                    <Link
                      href="/admin/articles"
                      className="rounded-none border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-600"
                    >
                      Cancel
                    </Link>
                  </div>
                </form>
              ) : (
                <p className="rounded-2xl border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-600">
                  Select an article from the list to edit its details.
                </p>
              )}
            </div>

            {!isCreateMode && selectedArticle && (
              <form action={deleteResourceArticle} className="mt-6">
                <input type="hidden" name="id" value={selectedArticle.id} />
                <button className="rounded-none border border-red-200 px-4 py-2 text-sm font-semibold text-red-600">
                  Delete this article
                </button>
              </form>
            )}
          </section>
        )}

        <section className="rounded-3xl border border-neutral-200 bg-white p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary/60">All resources</p>
              <h2 className="mt-1 heading-2 text-primary-ink">{totalArticlesCount > 0 ? totalArticlesCount : "No"} articles</h2>
            </div>
          </div>
          {articles.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-600">
              No resource articles found. Click “Add article” to create the first entry.
            </p>
          ) : (
            <ul className="mt-6 space-y-4">
              {articles.map((article) => (
                <li key={article.id} className="rounded-2xl border border-neutral-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-primary-ink">{article.title}</p>
                      <p className="text-sm text-neutral-600">
                        {article.category || "Uncategorised"} · {formatDate(article.publishedOn)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                          article.status === "draft"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {article.status === "draft" ? "Draft" : "Published"}
                      </span>
                      {article.featured && (
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-neutral-600">{article.summary || article.intro || "No summary provided."}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
                    <div className="flex flex-wrap gap-2">
                      {(article.tags ?? []).map((tag) => (
                        <span key={tag} className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/admin/articles?article=${article.id}`}
                      className="text-sm font-semibold text-primary transition hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Pagination pagination={pagination} searchParams={resolvedSearchParams} basePath="/admin/articles" />
        </section>
      </div>
    </RoleGate>
  );
}
