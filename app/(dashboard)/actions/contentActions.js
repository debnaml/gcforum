"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasServiceRoleAccess } from "../../../lib/env";
import { getServiceRoleClient } from "../../../lib/supabase/serverClient";

function slugify(value) {
  return (value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function updateHomepageHero(formData) {
  if (!hasServiceRoleAccess) {
    return { success: false, message: "Add SUPABASE_SERVICE_ROLE_KEY to enable CMS updates." };
  }

  const client = getServiceRoleClient();
  const payload = {
    eyebrow: formData.get("eyebrow"),
    title: formData.get("title"),
    copy: formData.get("copy"),
    cta_primary_label: formData.get("cta_primary_label"),
    cta_primary_href: formData.get("cta_primary_href"),
    cta_secondary_label: formData.get("cta_secondary_label"),
    cta_secondary_href: formData.get("cta_secondary_href"),
    updated_at: new Date().toISOString(),
  };

  const { error } = await client.from("homepage_content").update(payload).eq("id", 1);
  if (error) {
    console.error(error.message);
    return { success: false, message: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function upsertResource(formData) {
  if (!hasServiceRoleAccess) {
    return { success: false, message: "Enable SUPABASE_SERVICE_ROLE_KEY for write access." };
  }
  const client = getServiceRoleClient();
  const id = formData.get("id");
  const payload = {
    id: id || undefined,
    title: formData.get("title"),
    subject: formData.get("subject"),
    type: formData.get("type"),
    author: formData.get("author"),
    published_on: formData.get("published_on"),
  };
  const { error } = await client.from("resources").upsert(payload).select("id").single();
  if (error) {
    console.error(error.message);
    return { success: false, message: error.message };
  }
  revalidatePath("/resources");
  return { success: true };
}

export async function deleteResource(formData) {
  if (!hasServiceRoleAccess) {
    return { success: false, message: "Enable SUPABASE_SERVICE_ROLE_KEY for write access." };
  }
  const id = formData.get("id");
  if (!id) {
    return { success: false, message: "Resource ID is required." };
  }
  const client = getServiceRoleClient();
  const { error } = await client.from("resources").delete().eq("id", id);
  if (error) {
    return { success: false, message: error.message };
  }
  revalidatePath("/resources");
  revalidatePath("/admin");
  return { success: true };
}

export async function upsertResourceArticle(formData) {
  if (!hasServiceRoleAccess) {
    return { success: false, message: "Enable SUPABASE_SERVICE_ROLE_KEY for write access." };
  }

  const client = getServiceRoleClient();
  const providedId = formData.get("id");
  const titleInput = formData.get("title")?.toString().trim() ?? "";
  const slugInput = formData.get("slug")?.toString().trim() ?? "";
  const normalizedSlug = slugify(slugInput || titleInput);

  if (!normalizedSlug) {
    return { success: false, message: "A title or slug is required." };
  }

  const publishedOnRaw = formData.get("published_on")?.toString().trim();
  const statusInput = formData.get("status")?.toString().trim().toLowerCase();
  const status = statusInput === "draft" ? "draft" : "published";
  const categorySlug = formData.get("category_slug")?.toString().trim() || null;
  const heroImageUrl = formData.get("hero_image_url")?.toString().trim() ?? "";
  const seoImageUrl = formData.get("seo_image_url")?.toString().trim() ?? "";

  const tagsInput = formData.get("tags");
  const tags = typeof tagsInput === "string"
    ? tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  let categoryId = null;
  if (categorySlug) {
    const { data: categoryRow, error: categoryError } = await client
      .from("resource_categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    if (categoryError && categoryError.code !== "PGRST116") {
      console.error(categoryError.message);
      return { success: false, message: categoryError.message };
    }
    categoryId = categoryRow?.id ?? null;
  }

  const payload = {
    slug: normalizedSlug,
    title: titleInput,
    category_id: categoryId,
    intro: formData.get("intro")?.toString() ?? "",
    summary: formData.get("summary")?.toString() ?? "",
    content_html: formData.get("content_html")?.toString() ?? "",
    hero_image_url: heroImageUrl,
    tags,
    seo_title: formData.get("seo_title")?.toString() ?? "",
    seo_description: formData.get("seo_description")?.toString() ?? "",
    seo_image_url: seoImageUrl,
    published_on: publishedOnRaw || null,
    status,
    featured: formData.get("featured") === "on",
  };

  if (providedId) {
    payload.id = providedId;
  }

  const { data: article, error } = await client
    .from("resource_articles")
    .upsert(payload)
    .select("id, slug")
    .single();

  if (error) {
    console.error(error.message);
    return { success: false, message: error.message };
  }

  const authorIds = formData.getAll("author_ids").map((value) => value?.toString().trim()).filter(Boolean);

  const { error: removeAuthorsError } = await client
    .from("resource_article_authors")
    .delete()
    .eq("article_id", article.id);

  if (removeAuthorsError) {
    console.error(removeAuthorsError.message);
    return { success: false, message: removeAuthorsError.message };
  }

  if (authorIds.length > 0) {
    const insertPayload = authorIds.map((partnerId, index) => ({
      article_id: article.id,
      partner_id: partnerId,
      position: index,
    }));
    const { error: insertAuthorsError } = await client.from("resource_article_authors").insert(insertPayload);
    if (insertAuthorsError) {
      console.error(insertAuthorsError.message);
      return { success: false, message: insertAuthorsError.message };
    }
  }

  revalidatePath("/");
  revalidatePath("/resources");
  revalidatePath("/admin");
  revalidatePath("/admin/articles");

  const feedback = providedId ? "article-updated" : "article-created";
  redirect(`/admin/articles?feedback=${feedback}`);
}

export async function deleteResourceArticle(formData) {
  if (!hasServiceRoleAccess) {
    return { success: false, message: "Enable SUPABASE_SERVICE_ROLE_KEY for write access." };
  }

  const id = formData.get("id")?.toString().trim();
  if (!id) {
    return { success: false, message: "Article ID is required." };
  }

  const client = getServiceRoleClient();
  const { data, error } = await client
    .from("resource_articles")
    .delete()
    .eq("id", id)
    .select("slug")
    .single();

  if (error) {
    console.error(error.message);
    return { success: false, message: error.message };
  }

  revalidatePath("/");
  revalidatePath("/resources");
  revalidatePath("/admin");
  revalidatePath("/admin/articles");

  redirect("/admin/articles?feedback=article-deleted");
}

export async function upsertEvent(formData) {
  if (!hasServiceRoleAccess) {
    return { success: false, message: "Enable SUPABASE_SERVICE_ROLE_KEY for write access." };
  }
  const client = getServiceRoleClient();
  const payload = {
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    category: formData.get("category"),
    date: formData.get("date"),
    attendees: Number(formData.get("attendees")),
    capacity: Number(formData.get("capacity")),
  };
  const { error } = await client.from("events").upsert(payload).select("id").single();
  if (error) {
    return { success: false, message: error.message };
  }
  revalidatePath("/events");
  return { success: true };
}

export async function deleteEvent(formData) {
  if (!hasServiceRoleAccess) {
    return { success: false, message: "Enable SUPABASE_SERVICE_ROLE_KEY for write access." };
  }
  const id = formData.get("id");
  if (!id) {
    return { success: false, message: "Event ID is required." };
  }
  const client = getServiceRoleClient();
  const { error } = await client.from("events").delete().eq("id", id);
  if (error) {
    return { success: false, message: error.message };
  }
  revalidatePath("/events");
  revalidatePath("/admin");
  return { success: true };
}

export async function upsertArticle(formData) {
  if (!hasServiceRoleAccess) {
    return { success: false, message: "Enable SUPABASE_SERVICE_ROLE_KEY for write access." };
  }
  const client = getServiceRoleClient();
  const payload = {
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    category: formData.get("category"),
    author: formData.get("author"),
    date: formData.get("date"),
    excerpt: formData.get("excerpt"),
    featured: formData.get("featured") === "on",
  };
  const { error } = await client.from("articles").upsert(payload).select("id").single();
  if (error) {
    return { success: false, message: error.message };
  }
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteArticle(formData) {
  if (!hasServiceRoleAccess) {
    return { success: false, message: "Enable SUPABASE_SERVICE_ROLE_KEY for write access." };
  }
  const id = formData.get("id");
  if (!id) {
    return { success: false, message: "Article ID is required." };
  }
  const client = getServiceRoleClient();
  const { error } = await client.from("articles").delete().eq("id", id);
  if (error) {
    return { success: false, message: error.message };
  }
  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

export async function upsertPartner(formData) {
  if (!hasServiceRoleAccess) {
    return { success: false, message: "Enable SUPABASE_SERVICE_ROLE_KEY for write access." };
  }
  const client = getServiceRoleClient();
  const providedId = formData.get("id");
  const name = formData.get("name");
  const generatedId = providedId || slugify(name);
  if (!generatedId) {
    return { success: false, message: "A name is required to generate the team member ID." };
  }
  const payload = {
    id: generatedId,
    name,
    title: formData.get("title"),
    bio: formData.get("bio"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    avatar: formData.get("avatar"),
    linkedin: formData.get("linkedin"),
    order_index: Number(formData.get("order_index")) || 0,
    show_on_team: formData.get("show_on_team") === "on",
    is_author: formData.get("is_author") === "on",
  };

  const { error } = await client.from("partners").upsert(payload).select("id").single();
  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/join");
  revalidatePath("/admin/team");
  const feedback = providedId ? "partner-updated" : "partner-created";
  redirect(`/admin/team?feedback=${feedback}`);
}

export async function deletePartner(formData) {
  if (!hasServiceRoleAccess) {
    return { success: false, message: "Enable SUPABASE_SERVICE_ROLE_KEY for write access." };
  }
  const id = formData.get("id");
  if (!id) {
    return { success: false, message: "Partner ID is required." };
  }
  const client = getServiceRoleClient();
  const { error } = await client.from("partners").delete().eq("id", id);
  if (error) {
    return { success: false, message: error.message };
  }
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/join");
  revalidatePath("/admin");
  revalidatePath("/admin/team");
  redirect("/admin/team?feedback=partner-deleted");
}

export async function reorderPartners(orderEntries) {
  if (!hasServiceRoleAccess) {
    return { success: false, message: "Enable SUPABASE_SERVICE_ROLE_KEY for write access." };
  }

  if (!Array.isArray(orderEntries) || orderEntries.length === 0) {
    return { success: false, message: "Provide at least one team member to reorder." };
  }

  const rows = orderEntries
    .map((entry, index) => {
      const id = typeof entry?.id === "string" ? entry.id : null;
      if (!id) {
        return null;
      }
      const orderIndex = Number(entry?.order_index);
      return {
        id,
        order_index: Number.isFinite(orderIndex) ? orderIndex : index,
      };
    })
    .filter(Boolean);

  if (rows.length === 0) {
    return { success: false, message: "Order payload is missing IDs." };
  }

  const client = getServiceRoleClient();
  for (const row of rows) {
    const { error } = await client.from("partners").update({ order_index: row.order_index }).eq("id", row.id);
    if (error) {
      return { success: false, message: error.message };
    }
  }

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/join");
  revalidatePath("/admin/team");
  return { success: true };
}
