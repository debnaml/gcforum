"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eventResourcesBucket, hasServiceRoleAccess } from "../../../lib/env";
import { getServiceRoleClient } from "../../../lib/supabase/serverClient";

function slugify(value) {
  return (value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseDateTimeInput(value) {
  if (!value) {
    return null;
  }
  const normalized = value.toString().trim();
  if (!normalized) {
    return null;
  }
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
}

function parseBooleanInput(value) {
  if (value === null || value === undefined) {
    return false;
  }
  const normalized = value.toString().toLowerCase();
  return normalized === "true" || normalized === "on" || normalized === "1" || normalized === "yes";
}

function extractEventResources(formData) {
  if (!formData?.getAll) {
    return [];
  }
  const ids = formData.getAll("resource_id");
  const titles = formData.getAll("resource_title");
  const descriptions = formData.getAll("resource_description");
  const urls = formData.getAll("resource_url");
  const types = formData.getAll("resource_type");
  const sizes = formData.getAll("resource_size");
  const storagePaths = formData.getAll("resource_storage_path");
  const positions = formData.getAll("resource_position");

  const resources = [];
  for (let index = 0; index < urls.length; index += 1) {
    const fileUrl = urls[index]?.toString().trim();
    if (!fileUrl) {
      continue;
    }
    const title = titles[index]?.toString().trim() || "Download";
    const description = descriptions[index]?.toString().trim() || null;
    const fileType = types[index]?.toString().trim() || null;
    const storagePath = storagePaths[index]?.toString().trim() || null;
    const sizeValue = sizes[index];
    const fileSizeBytes = sizeValue !== undefined && sizeValue !== null && sizeValue !== "" ? Number(sizeValue) : null;
    const positionValue = positions[index];
    const position = positionValue !== undefined && positionValue !== null && positionValue !== ""
      ? Number(positionValue)
      : index;
    const id = ids[index]?.toString().trim() || undefined;

    resources.push({
      id,
      title,
      description,
      file_url: fileUrl,
      file_type: fileType,
      file_size_bytes: fileSizeBytes,
      storage_path: storagePath,
      position,
    });
  }

  return resources;
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

export async function upsertResourceVideo(formData) {
  if (!hasServiceRoleAccess) {
    return { success: false, message: "Enable SUPABASE_SERVICE_ROLE_KEY for write access." };
  }

  const client = getServiceRoleClient();
  const providedId = formData.get("id")?.toString().trim() || null;
  const titleInput = formData.get("title")?.toString().trim() ?? "";
  const slugInput = formData.get("slug")?.toString().trim() ?? "";
  const normalizedSlug = slugify(slugInput || titleInput);

  if (!normalizedSlug) {
    return { success: false, message: "A title or slug is required." };
  }

  const publishedOnRaw = formData.get("published_on")?.toString().trim();
  const statusInput = formData.get("status")?.toString().trim().toLowerCase();
  const status = statusInput === "draft" ? "draft" : "published";
  const videoUrl = formData.get("video_url")?.toString().trim() ?? "";
  const heroImageUrl = formData.get("hero_image_url")?.toString().trim() ?? "";
  const summary = formData.get("summary")?.toString() ?? "";
  const contentHtml = formData.get("content_html")?.toString() ?? "";
  const categorySlug = formData.get("category_slug")?.toString().trim() || null;

  if (!videoUrl) {
    return { success: false, message: "A video URL is required." };
  }

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
    summary,
    content_html: contentHtml || "<p></p>",
    video_url: videoUrl,
    hero_image_url: heroImageUrl,
    published_on: publishedOnRaw || null,
    status,
    featured: formData.get("featured") === "on",
  };

  if (providedId) {
    payload.id = providedId;
  }

  const { data: video, error } = await client
    .from("resource_videos")
    .upsert(payload)
    .select("id")
    .single();

  if (error) {
    console.error(error.message);
    return { success: false, message: error.message };
  }

  const authorIds = formData.getAll("author_ids").map((value) => value?.toString().trim()).filter(Boolean);

  const { error: removeAuthorsError } = await client
    .from("resource_video_authors")
    .delete()
    .eq("video_id", video.id);

  if (removeAuthorsError) {
    console.error(removeAuthorsError.message);
    return { success: false, message: removeAuthorsError.message };
  }

  if (authorIds.length > 0) {
    const insertPayload = authorIds.map((partnerId, index) => ({
      video_id: video.id,
      partner_id: partnerId,
      position: index,
    }));
    const { error: insertAuthorsError } = await client.from("resource_video_authors").insert(insertPayload);
    if (insertAuthorsError) {
      console.error(insertAuthorsError.message);
      return { success: false, message: insertAuthorsError.message };
    }
  }

  revalidatePath("/");
  revalidatePath("/resources");
  revalidatePath("/admin");
  revalidatePath("/admin/videos");

  const feedback = providedId ? "video-updated" : "video-created";
  redirect(`/admin/videos?feedback=${feedback}`);
}

export async function deleteResourceVideo(formData) {
  if (!hasServiceRoleAccess) {
    return { success: false, message: "Enable SUPABASE_SERVICE_ROLE_KEY for write access." };
  }

  const id = formData.get("id")?.toString().trim();
  if (!id) {
    return { success: false, message: "Video ID is required." };
  }

  const client = getServiceRoleClient();
  const { error } = await client.from("resource_videos").delete().eq("id", id);

  if (error) {
    console.error(error.message);
    return { success: false, message: error.message };
  }

  revalidatePath("/");
  revalidatePath("/resources");
  revalidatePath("/admin");
  revalidatePath("/admin/videos");

  redirect("/admin/videos?feedback=video-deleted");
}

export async function upsertEvent(formData) {
  if (!hasServiceRoleAccess) {
    return { success: false, message: "Enable SUPABASE_SERVICE_ROLE_KEY for write access." };
  }

  const client = getServiceRoleClient();
  const providedId = formData.get("id")?.toString().trim() || null;
  const titleInput = formData.get("title")?.toString().trim() ?? "";
  const slugInput = formData.get("slug")?.toString().trim() ?? "";
  const normalizedSlug = slugify(slugInput || titleInput);

  if (!normalizedSlug) {
    return { success: false, message: "A title or slug is required." };
  }

  const startsAt = parseDateTimeInput(formData.get("starts_at"));
  if (!startsAt) {
    return { success: false, message: "Start date and time are required." };
  }
  const endsAt = parseDateTimeInput(formData.get("ends_at"));
  const timezone = "Europe/London";
  const statusInput = formData.get("status")?.toString().trim().toLowerCase();
  const status = statusInput === "published" ? "published" : "draft";
  const featured = parseBooleanInput(formData.get("featured"));
  const isVirtual = parseBooleanInput(formData.get("is_virtual"));

  const payload = {
    slug: normalizedSlug,
    title: titleInput,
    summary: formData.get("summary")?.toString().trim() ?? "",
    description_html: formData.get("description_html")?.toString() ?? "",
    hero_image_url: formData.get("hero_image_url")?.toString().trim() || null,
    hero_image_alt: formData.get("hero_image_alt")?.toString().trim() || null,
    format: formData.get("format")?.toString().trim() || "roundtable",
    location_label: formData.get("location_label")?.toString().trim() || null,
    location_city: formData.get("location_city")?.toString().trim() || null,
    location_region: formData.get("location_region")?.toString().trim() || null,
    venue_name: formData.get("venue_name")?.toString().trim() || null,
    is_virtual: isVirtual,
    starts_at: startsAt,
    ends_at: endsAt,
    timezone,
    registration_url: formData.get("registration_url")?.toString().trim() || null,
    registration_label: formData.get("registration_label")?.toString().trim() || "Register",
    status,
    featured,
    seo_title: formData.get("seo_title")?.toString().trim() || null,
    seo_description: formData.get("seo_description")?.toString().trim() || null,
    seo_image_url: formData.get("seo_image_url")?.toString().trim() || null,
  };

  if (providedId) {
    payload.id = providedId;
  }

  const { data: event, error } = await client
    .from("events")
    .upsert(payload)
    .select("id, slug")
    .single();

  if (error) {
    console.error(error.message);
    return { success: false, message: error.message };
  }

  const resources = extractEventResources(formData);
  const keepIds = resources.map((resource) => resource.id).filter(Boolean);

  const { data: existingResources, error: existingResourcesError } = await client
    .from("event_resources")
    .select("id, storage_path")
    .eq("event_id", event.id);

  if (existingResourcesError) {
    console.error(existingResourcesError.message);
    return { success: false, message: existingResourcesError.message };
  }

  const idsToDelete = (existingResources ?? [])
    .map((resource) => resource.id)
    .filter((id) => !keepIds.includes(id));

  if (idsToDelete.length > 0) {
    const storagePathsToDelete = (existingResources ?? [])
      .filter((resource) => idsToDelete.includes(resource.id) && resource.storage_path)
      .map((resource) => resource.storage_path);

    if (storagePathsToDelete.length > 0) {
      const { error: storageDeleteError } = await client
        .storage
        .from(eventResourcesBucket)
        .remove(storagePathsToDelete);
      if (storageDeleteError) {
        console.error("Failed to remove event resource files", storageDeleteError.message);
      }
    }

    const { error: deleteResourcesError } = await client.from("event_resources").delete().in("id", idsToDelete);
    if (deleteResourcesError) {
      console.error(deleteResourcesError.message);
      return { success: false, message: deleteResourcesError.message };
    }
  }

  if (resources.length > 0) {
    const upsertPayload = resources.map((resource) => ({ ...resource, event_id: event.id }));
    const { error: upsertResourcesError } = await client.from("event_resources").upsert(upsertPayload);
    if (upsertResourcesError) {
      console.error(upsertResourcesError.message);
      return { success: false, message: upsertResourcesError.message };
    }
  }

  revalidatePath("/events");
  revalidatePath(`/events/${event.slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/events");

  const feedback = providedId ? "event-updated" : "event-created";
  redirect(`/admin/events?feedback=${feedback}`);
}

export async function deleteEvent(formData) {
  if (!hasServiceRoleAccess) {
    return { success: false, message: "Enable SUPABASE_SERVICE_ROLE_KEY for write access." };
  }

  const id = formData.get("id")?.toString().trim();
  if (!id) {
    return { success: false, message: "Event ID is required." };
  }

  const client = getServiceRoleClient();

  const { data: resourceRows, error: resourcesError } = await client
    .from("event_resources")
    .select("storage_path")
    .eq("event_id", id)
    .not("storage_path", "is", null);

  if (resourcesError) {
    console.error(resourcesError.message);
    return { success: false, message: resourcesError.message };
  }

  const { data: deletedEvent, error } = await client
    .from("events")
    .delete()
    .eq("id", id)
    .select("slug")
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  const storagePaths = (resourceRows ?? []).map((resource) => resource.storage_path).filter(Boolean);
  if (storagePaths.length > 0) {
    const { error: storageDeleteError } = await client.storage.from(eventResourcesBucket).remove(storagePaths);
    if (storageDeleteError) {
      console.error("Failed to remove event resource files", storageDeleteError.message);
    }
  }

  revalidatePath("/events");
  if (deletedEvent?.slug) {
    revalidatePath(`/events/${deletedEvent.slug}`);
  }
  revalidatePath("/admin");
  revalidatePath("/admin/events");

  redirect("/admin/events?feedback=event-deleted");
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
