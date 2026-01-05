import { cache } from "react";
import { getServerClient } from "./supabase/serverClient";
import { mockMembers, mockResources } from "./data/mockContent";

const DEFAULT_PAGE_SIZE = 10;
const MOCK_MEMBER_RESULTS = Array.isArray(mockMembers) ? mockMembers : [];

export function mapProfileToMember(row) {
  if (!row) {
    return null;
  }

  const jobLevel = row.job_level ?? row.jobLevel ?? null;
  const avatar = row.avatar_url ?? row.avatar ?? null;

  return {
    id: row.id,
    name: row.full_name ?? row.name ?? "",
    title: row.title ?? row.current_role ?? "",
    organisation: row.organisation ?? "",
    email: row.email ?? "",
    phone: row.phone ?? null,
    linkedin: row.linkedin ?? row.linkedin_url ?? null,
    location: row.location ?? "",
    sector: row.sector ?? "",
    job_level: jobLevel,
    jobLevel,
    status: row.status ?? "pending",
    show_in_directory: row.show_in_directory ?? true,
    avatar,
    avatar_url: avatar,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
  };
}

export function normalizeResourceArticle(row) {
  if (!row) return null;

  const status = typeof row.status === "string" ? row.status : "draft";
  const authorIds = Array.isArray(row.author_ids)
    ? row.author_ids
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter((value) => Boolean(value))
    : [];

  const authors = Array.isArray(row.authors)
    ? row.authors
        .map((author) => {
          if (!author) return null;
          const id = author.id ?? author.profile_id ?? author.profileId ?? null;
          const name = author.name ?? author.full_name ?? author.fullName ?? null;
          const avatarUrl = author.avatar_url ?? author.avatarUrl ?? author.avatar ?? null;
          return {
            id,
            name: name ?? "",
            role: author.role ?? author.title ?? null,
            organisation: author.organisation ?? author.organisation_name ?? "",
            avatarUrl,
            email: author.email ?? null,
            phone: author.phone ?? author.telephone ?? null,
            bio: author.bio ?? null,
            linkedin: author.linkedin ?? null,
          };
        })
        .filter((author) => author && (author.id || author.name))
    : [];

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    intro: row.intro ?? "",
    summary: row.summary ?? "",
    contentHtml: row.content_html ?? row.contentHtml ?? "",
    category: row.category_name ?? row.category ?? "",
    categorySlug: row.category_slug ?? row.categorySlug ?? "",
    tags: Array.isArray(row.tags) ? row.tags : [],
    heroImageUrl: row.hero_image_url ?? row.heroImageUrl ?? "",
    publishedOn: row.published_on ?? row.publishedOn ?? null,
    featured: Boolean(row.featured),
    status,
    seoTitle: row.seo_title ?? row.seoTitle ?? "",
    seoDescription: row.seo_description ?? row.seoDescription ?? "",
    seoImageUrl: row.seo_image_url ?? row.seoImageUrl ?? "",
    authors,
    authorIds,
    subject: row.subject ?? row.category_name ?? row.category ?? "",
    type: row.type ?? "Article",
    author: row.author ?? authors[0]?.name ?? "GC Forum Editorial",
  };
}

function buildFilterOptionsFromArticles(items) {
  const categoryMap = new Map();
  const tagSet = new Set();
  const authorMap = new Map();

  (items ?? []).forEach((item) => {
    if (!item) return;
    if (item.categorySlug && item.category) {
      categoryMap.set(item.categorySlug, item.category);
    }
    (item.tags ?? []).forEach((tag) => {
      if (tag) {
        tagSet.add(tag);
      }
    });
    (item.authors ?? []).forEach((author) => {
      if (author?.id && (author.name ?? "").trim()) {
        authorMap.set(author.id, author.name);
      }
    });
  });

  const categories = Array.from(categoryMap.entries())
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const tags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  const authors = Array.from(authorMap.entries())
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return { categories, tags, authors };
}

const MOCK_RESOURCE_ARTICLES = mockResources.map((resource) => normalizeResourceArticle(resource)).filter(Boolean);

const MOCK_RESOURCES_PAYLOAD = {
  items: MOCK_RESOURCE_ARTICLES,
  pagination: {
    page: 1,
    pageSize: MOCK_RESOURCE_ARTICLES.length,
    totalItems: MOCK_RESOURCE_ARTICLES.length,
    totalPages: 1,
  },
  filters: buildFilterOptionsFromArticles(MOCK_RESOURCE_ARTICLES),
};

function filterMockMembers(filters = {}, options = {}) {
  const normalizedFilters = {
    organisation: filters.organisation ?? "all",
    location: filters.location ?? "all",
    sector: filters.sector ?? "all",
    jobLevel: filters.jobLevel ?? "all",
    search: filters.search ?? "",
  };

  const includeAllStatuses = Boolean(options?.includeAllStatuses);
  const includeHidden = Boolean(options?.includeHidden);

  return MOCK_MEMBER_RESULTS.filter((member) => {
    const isApproved = (member.status ?? "pending") === "approved";
    if (!includeAllStatuses && !isApproved) {
      return false;
    }

    const showInDirectory = member.show_in_directory ?? member.showInDirectory ?? true;
    if (!includeHidden && showInDirectory === false) {
      return false;
    }

    if (normalizedFilters.search) {
      const haystack = `${member.name ?? ""} ${member.organisation ?? ""}`.toLowerCase();
      if (!haystack.includes(normalizedFilters.search.toLowerCase())) {
        return false;
      }
    }

    const valueForKey = (key) => {
      if (key === "jobLevel") {
        return member.jobLevel ?? member.job_level ?? "";
      }
      return member[key] ?? "";
    };

    return ["organisation", "location", "sector", "jobLevel"].every((key) => {
      const filterValue = normalizedFilters[key];
      if (filterValue === "all") {
        return true;
      }
      return valueForKey(key) === filterValue;
    });
  });
}

async function withFallback(fn, fallback) {
  try {
    const result = await fn();
    if (!result) return fallback;
    return result;
  } catch (error) {
    console.warn("Falling back to empty content", error.message);
    return fallback;
  }
}

const EMPTY_HERO = {
  eyebrow: "",
  title: "",
  copy: "",
  ctaPrimary: { label: "Apply to join", href: "/join#apply" },
  ctaSecondary: { label: "Contact the team", href: "/about" },
};

const EMPTY_HOMEPAGE = {
  hero: EMPTY_HERO,
  highlights: [],
  contact: null,
  stats: [],
  featuredResources: MOCK_RESOURCE_ARTICLES.slice(0, 2),
  members: [],
  articles: [],
  partners: [],
};

export const getHomepageContent = cache(async () => {
  const supabase = await getServerClient();
  if (!supabase) {
    return EMPTY_HOMEPAGE;
  }

  return withFallback(async () => {
    const { data: homepage } = await supabase
      .from("homepage_content")
      .select("*")
      .single();

    const { data: stats } = await supabase.from("stats").select("*");
    const { data: featuredResourceRows } = await supabase
      .from("resource_articles_public")
      .select(
        "id, slug, title, intro, summary, content_html, tags, hero_image_url, seo_title, seo_description, seo_image_url, published_on, featured, category_name, category_slug, authors"
      )
      .eq("featured", true)
      .eq("status", "published")
      .order("published_on", { ascending: false })
      .limit(6);
    const featuredResources = (featuredResourceRows ?? []).map((row) => normalizeResourceArticle(row)).filter(Boolean);
    const { data: memberRows } = await supabase
      .from("profiles")
      .select("id, full_name, title, organisation, avatar_url, status, show_in_directory, location, sector, job_level, email, phone, linkedin, created_at")
      .eq("status", "approved")
      .eq("show_in_directory", true)
      .order("full_name", { ascending: true })
      .limit(3);
    const members = (memberRows ?? []).map((row) => mapProfileToMember(row)).filter(Boolean);
    const { data: articles } = await supabase
      .from("articles")
      .select("*")
      .eq("featured", true)
      .limit(3);
    const { data: partners } = await supabase
      .from("partners")
      .select("*")
      .eq("show_on_team", true)
      .order("order_index", { ascending: true });

    const hero = {
      eyebrow: homepage?.eyebrow ?? "",
      title: homepage?.title ?? "",
      copy: homepage?.copy ?? "",
      ctaPrimary: {
        label: homepage?.cta_primary_label ?? "",
        href: homepage?.cta_primary_href ?? "#",
      },
      ctaSecondary: {
        label: homepage?.cta_secondary_label ?? "",
        href: homepage?.cta_secondary_href ?? "#",
      },
    };

    return {
      hero,
      highlights: [],
      contact: null,
      stats,
      featuredResources,
      members,
      articles,
      partners,
    };
  }, EMPTY_HOMEPAGE);
});

export const getMembers = cache(async (filters = {}, options = {}) => {
  const supabase = await getServerClient();
  if (!supabase) {
    return filterMockMembers(filters, options);
  }

  return withFallback(async () => {
    let query = supabase
      .from("profiles")
      .select("id, full_name, title, organisation, email, phone, linkedin, location, sector, job_level, status, show_in_directory, avatar_url, created_at");

    if (!options.includeAllStatuses) {
      query = query.eq("status", "approved");
    }

    if (!options.includeHidden) {
      query = query.eq("show_in_directory", true);
    }

    const filterMap = {
      organisation: "organisation",
      location: "location",
      sector: "sector",
      jobLevel: "job_level",
    };

    Object.entries(filterMap).forEach(([key, column]) => {
      const value = filters[key];
      if (value && value !== "all") {
        query = query.eq(column, value);
      }
    });

    if (filters.search) {
      query = query.ilike("full_name", `%${filters.search}%`);
    }

    const { data } = await query.order("full_name", { ascending: true });
    return Array.isArray(data) ? data.map((row) => mapProfileToMember(row)).filter(Boolean) : [];
  }, filterMockMembers(filters, options));
});

export const getResources = cache(async (options = {}) => {
  const supabase = await getServerClient();
  if (!supabase) {
    return MOCK_RESOURCES_PAYLOAD;
  }

  return withFallback(async () => {
    const pageSizeInput = Number(options.pageSize) || DEFAULT_PAGE_SIZE;
    const pageSize = Math.max(1, Math.min(pageSizeInput, 24));
    const pageInput = Number(options.page) || 1;
    const page = Math.max(1, pageInput);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("resource_articles_public")
      .select(
        "id, slug, title, intro, summary, content_html, tags, hero_image_url, seo_title, seo_description, seo_image_url, published_on, status, featured, category_name, category_slug, authors, author_ids",
        { count: "exact" },
      )
      .eq("status", "published")
      .order("published_on", { ascending: false })
      .range(from, to);

    if (options.search) {
      query = query.ilike("title", `%${options.search.trim()}%`);
    }
    if (options.category && options.category !== "all") {
      query = query.eq("category_slug", options.category);
    }
    if (options.tag && options.tag !== "all") {
      query = query.contains("tags", [options.tag]);
    }
    if (options.author && options.author !== "all") {
      query = query.contains("author_ids", [options.author]);
    }

    const [{ data, count }, categoriesRes, authorsRes, tagsRes] = await Promise.all([
      query,
      supabase.from("resource_categories").select("name, slug").order("name", { ascending: true }),
      supabase.from("partners").select("id, name").eq("is_author", true).order("name", { ascending: true }),
      supabase.from("resource_articles_public").select("tags"),
    ]);

    const items = (data ?? []).map((row) => normalizeResourceArticle(row)).filter(Boolean);
    const totalItems = typeof count === "number" ? count : items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const categories = (categoriesRes.data ?? [])
      .map((category) => ({ slug: category.slug, label: category.name }))
      .filter((category) => category.slug && category.label);

    const authors = (authorsRes.data ?? [])
      .map((author) => ({ id: author.id, label: author.name ?? author.full_name ?? "" }))
      .filter((author) => author.id && author.label)
      .sort((a, b) => a.label.localeCompare(b.label));

    const tagSet = new Set();
    (tagsRes.data ?? []).forEach((row) => {
      (row?.tags ?? []).forEach((tag) => {
        if (tag) {
          tagSet.add(tag);
        }
      });
    });
    const tags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));

    return {
      items,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
      filters: {
        categories,
        tags,
        authors,
      },
    };
  }, MOCK_RESOURCES_PAYLOAD);
});

export const getResourceBySlug = cache(async (slug) => {
  const supabase = await getServerClient();
  if (!supabase) {
    return MOCK_RESOURCE_ARTICLES.find((article) => article.slug === slug) ?? null;
  }

  return withFallback(async () => {
    const { data } = await supabase
      .from("resource_articles_public")
      .select(
        "id, slug, title, intro, summary, content_html, tags, hero_image_url, seo_title, seo_description, seo_image_url, published_on, status, featured, category_name, category_slug, authors",
      )
      .eq("slug", slug)
      .single();
    return normalizeResourceArticle(data);
  }, null);
});

export const getEvents = cache(async () => {
  const supabase = await getServerClient();
  if (!supabase) {
    return { upcoming: [], past: [] };
  }

  return withFallback(async () => {
    const { data: upcoming, error: upcomingError } = await supabase
      .from("events")
      .select("*")
      .eq("is_past", false)
      .order("date", { ascending: true });
    const { data: past, error: pastError } = await supabase
      .from("events")
      .select("*")
      .eq("is_past", true)
      .order("date", { ascending: false });
    if (upcomingError || pastError) {
      throw new Error(upcomingError?.message ?? pastError?.message ?? "Failed to load events");
    }
    return {
      upcoming: Array.isArray(upcoming) ? upcoming : [],
      past: Array.isArray(past) ? past : [],
    };
  }, { upcoming: [], past: [] });
});

export const getArticles = cache(async () => {
  const supabase = await getServerClient();
  if (!supabase) {
    return [];
  }

  return withFallback(async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .order("published_on", { ascending: false });
    return data;
  }, []);
});

export const getArticleBySlug = cache(async (slug) => {
  const supabase = await getServerClient();
  if (!supabase) {
    return null;
  }

  return withFallback(async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .single();
    return data;
  }, null);
});

export const getPartners = cache(async () => {
  const supabase = await getServerClient();
  if (!supabase) {
    return [];
  }

  return withFallback(async () => {
    const { data } = await supabase
      .from("partners")
      .select("*")
      .order("order_index", { ascending: true });
    return data;
  }, []);
});
