import Link from "next/link";
import ResourceCard from "../../components/cards/ResourceCard";
import Pagination from "../../components/ui/Pagination";
import PageBanner from "../../components/ui/PageBanner";
import { getResources } from "../../lib/content";

export const metadata = {
  title: "Resource Centre | GC Forum",
  description: "Browse GC Forum articles, insights, and training assets curated for in-house legal leaders.",
};

function getFilterValue(searchParams, key, fallback = "") {
  const value = searchParams?.[key];
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }
  return value ?? fallback;
}

export default async function ResourcePage({ searchParams = {} }) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const filters = {
    search: getFilterValue(resolvedSearchParams, "search", ""),
    category: getFilterValue(resolvedSearchParams, "category", "all"),
    tag: getFilterValue(resolvedSearchParams, "tag", "all"),
    author: getFilterValue(resolvedSearchParams, "author", "all"),
    page: Number(getFilterValue(resolvedSearchParams, "page", "1")) || 1,
  };

  const resources = await getResources(filters);
  const items = resources.items ?? [];
  const pagination = resources.pagination ?? { page: 1, totalPages: 1 };
  const filterOptions = resources.filters ?? { categories: [], tags: [], authors: [] };

  return (
    <div className="bg-white">
      <PageBanner title="Resource Center" centerContent />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-3xl space-y-4">
          <h2 className="heading-2 text-[#333333]">Latest Resources</h2>
          <p className="text-base leading-relaxed text-neutral-600">
            The Birketts GC Forum resource centre provides a library of valuable insights and assets for you to use and share.
          </p>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {items.length === 0 ? (
              <div className="border border-dashed border-[#CCCCCC] bg-[#F5F4F6] p-8 text-center">
                <p className="text-lg font-semibold text-primary-ink">No resources match these filters (yet).</p>
                <p className="mt-2 text-sm text-neutral-500">Try adjusting your filters or resetting to view the full library.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {items.map((resource) => (
                  <ResourceCard key={resource.id ?? resource.slug} resource={resource} />
                ))}
              </div>
            )}
            <Pagination pagination={pagination} searchParams={resolvedSearchParams} />
          </div>
          <aside className="lg:col-span-1 border border-[#CCCCCC] bg-[#F5F4F6] p-6">
            <form method="get">
              <input type="hidden" name="page" value="1" />
              <h4 className="font-hero-serif text-xl text-[#333333]">Filter resources</h4>
              <p className="mt-1 text-sm text-neutral-600">Refine the library by keyword, category, tag, or author.</p>
              <label className="mt-6 flex flex-col gap-2 text-sm text-neutral-600">
                Keyword
                <input
                  type="text"
                  name="search"
                  defaultValue={filters.search}
                  placeholder="e.g. AI, training"
                  className="rounded-none border border-[#CCCCCC] bg-white px-3 py-2 text-base focus:border-primary focus:outline-none"
                />
              </label>
              <label className="mt-4 flex flex-col gap-2 text-sm text-neutral-600">
                Category
                <select
                  name="category"
                  defaultValue={filters.category}
                  className="rounded-none border border-[#CCCCCC] bg-white px-3 py-2 text-base focus:border-primary focus:outline-none"
                >
                  <option value="all">All categories</option>
                  {filterOptions.categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-4 flex flex-col gap-2 text-sm text-neutral-600">
                Tag
                <select
                  name="tag"
                  defaultValue={filters.tag}
                  className="rounded-none border border-[#CCCCCC] bg-white px-3 py-2 text-base focus:border-primary focus:outline-none"
                >
                  <option value="all">All tags</option>
                  {filterOptions.tags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag.replace(/-/g, " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-4 flex flex-col gap-2 text-sm text-neutral-600">
                Author
                <select
                  name="author"
                  defaultValue={filters.author}
                  className="rounded-none border border-[#CCCCCC] bg-white px-3 py-2 text-base focus:border-primary focus:outline-none"
                >
                  <option value="all">All editors</option>
                  {filterOptions.authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.label}
                    </option>
                  ))}
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
                  href="/resources"
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
