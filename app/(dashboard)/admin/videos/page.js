import Link from "next/link";
import { getCurrentProfile } from "../../../../lib/auth/getProfile";
import RoleGate from "../../../../components/auth/RoleGate";
import { ROLES } from "../../../../lib/auth/roles";
import PanelScrollAnchor from "../../../../components/admin/PanelScrollAnchor";
import PortraitUploadField from "../../../../components/admin/PortraitUploadField";
import DeleteVideoButton from "../../../../components/admin/DeleteVideoButton";
import Pagination from "../../../../components/ui/Pagination";
import { getServerClient } from "../../../../lib/supabase/serverClient";
import { deleteResourceVideo, upsertResourceVideo } from "../../actions/contentActions";

export const metadata = {
  title: "Resource Videos Admin | GC Forum",
};

const ADMIN_PAGE_SIZE = 20;

function normalizeVideo(row) {
  if (!row) return null;
  const status = typeof row.status === "string" ? row.status : "draft";
  const authorIds = Array.isArray(row.author_ids) ? row.author_ids.filter(Boolean) : [];
  const authors = Array.isArray(row.authors) ? row.authors : [];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? "",
    description: row.description ?? row.intro ?? "",
    videoUrl: row.video_url ?? "",
    heroImageUrl: row.hero_image_url ?? "",
    publishedOn: row.published_on ?? null,
    status,
    featured: Boolean(row.featured),
    authors,
    authorIds,
  };
}

async function getVideosAdminData({ page = 1, pageSize = ADMIN_PAGE_SIZE } = {}) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.min(Math.floor(pageSize), 50) : ADMIN_PAGE_SIZE;
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;
  const supabase = await getServerClient();
  if (!supabase) {
    return {
      videos: [],
      authors: [],
      pagination: {
        page: safePage,
        pageSize: safePageSize,
        totalItems: 0,
        totalPages: 1,
      },
    };
  }

  const [videosRes, authorsRes] = await Promise.all([
    supabase
      .from("resource_videos_public")
      .select("id, slug, title, summary, intro, video_url, hero_image_url, published_on, status, featured, authors, author_ids", { count: "exact" })
      .order("published_on", { ascending: false })
      .range(from, to),
    supabase.from("partners").select("id, name").eq("is_author", true).order("name", { ascending: true }),
  ]);

  if (videosRes.error) {
    console.error(videosRes.error.message);
  }
  if (authorsRes.error) {
    console.error(authorsRes.error.message);
  }

  const normalizedVideos = (videosRes.data ?? []).map((row) => normalizeVideo(row)).filter(Boolean);
  const totalItems = typeof videosRes.count === "number" ? videosRes.count : normalizedVideos.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));

  return {
    videos: normalizedVideos,
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

export default async function AdminVideosPage({ searchParams }) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const currentPage = parsePageParam(resolvedSearchParams?.page);
  const [profile, adminData] = await Promise.all([getCurrentProfile(), getVideosAdminData({ page: currentPage, pageSize: ADMIN_PAGE_SIZE })]);

  const videos = adminData.videos ?? [];
  const pagination = adminData.pagination ?? {
    page: currentPage,
    pageSize: ADMIN_PAGE_SIZE,
    totalItems: videos.length,
    totalPages: 1,
  };
  const authorOptions = (adminData.authors ?? [])
    .map((author) => ({ id: author.id, label: author.name ?? author.full_name ?? "Unnamed" }))
    .filter((author) => author.id && author.label);

  const mode = typeof resolvedSearchParams?.mode === "string" ? resolvedSearchParams.mode : null;
  const selectedVideoId = typeof resolvedSearchParams?.video === "string" ? resolvedSearchParams.video : null;
  const selectedVideo = videos.find((video) => video.id === selectedVideoId) ?? null;
  const isCreateMode = mode === "create";
  const hasPanel = isCreateMode || Boolean(selectedVideo);
  const feedback = typeof resolvedSearchParams?.feedback === "string" ? resolvedSearchParams.feedback : null;
  const feedbackMessage =
    feedback === "video-created"
      ? "Resource video created successfully."
      : feedback === "video-updated"
        ? "Resource video updated."
        : feedback === "video-deleted"
          ? "Resource video deleted."
          : null;
  const feedbackColorClasses =
    feedback === "video-deleted" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800";

  const selectedPublishedDate = selectedVideo?.publishedOn ? selectedVideo.publishedOn.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const selectedAuthors = selectedVideo?.authorIds ?? [];
  const totalVideosCount = typeof pagination.totalItems === "number" ? pagination.totalItems : videos.length;

  return (
    <RoleGate role={ROLES.admin} initialRole={profile?.role}>
      <div className="space-y-8">
        <header className="rounded-3xl border border-neutral-200 bg-white p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-primary/60">Resources</p>
              <h1 className="text-3xl font-serif text-primary-ink">Manage resource videos</h1>
              <p className="text-sm text-neutral-600">
                Publish YouTube videos into the Resource Centre. Drafts stay hidden until published, and featured items feed the homepage
                carousel.
              </p>
            </div>
            <Link href="/admin/videos?mode=create" className="inline-flex items-center rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary">
              + Add video
            </Link>
          </div>
        </header>

        {feedbackMessage && (
          <div className={`flex items-center justify-between gap-4 rounded-3xl border px-6 py-4 text-sm ${feedbackColorClasses}`}>
            <span>{feedbackMessage}</span>
            <Link href="/admin/videos" className="text-xs font-semibold uppercase tracking-[0.2em] text-current">
              Dismiss
            </Link>
          </div>
        )}

        {hasPanel && (
          <section className="rounded-3xl border border-neutral-200 bg-white p-8">
            <PanelScrollAnchor activeKey={isCreateMode ? "create" : selectedVideo?.id ?? null} />
            <p className="text-sm uppercase tracking-[0.3em] text-primary/60">{isCreateMode ? "Add video" : "Edit video"}</p>
            <h2 className="mt-1 heading-2 text-primary-ink">{isCreateMode ? "Create a new resource video" : selectedVideo?.title ?? "Select a video"}</h2>
            {isCreateMode && <p className="mt-2 text-xs text-neutral-500">Slugs auto-generate from the title but you can override them below.</p>}

            <div className="mt-6">
              {isCreateMode || selectedVideo ? (
                <form action={upsertResourceVideo} className="grid gap-4 md:grid-cols-2">
                  {!isCreateMode && <input type="hidden" name="id" defaultValue={selectedVideo?.id} />}
                  <label className="text-sm font-semibold text-primary-ink">
                    Title
                    <input name="title" defaultValue={selectedVideo?.title ?? ""} className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3" required />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    Slug
                    <input
                      name="slug"
                      defaultValue={selectedVideo?.slug ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      placeholder="video-future-proofing"
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    Status
                    <select name="status" defaultValue={selectedVideo?.status ?? "draft"} className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3">
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-primary-ink">
                    Publish date
                    <input type="date" name="published_on" defaultValue={selectedPublishedDate} className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3" />
                  </label>
                  <label className="flex items-center gap-3 text-sm font-semibold text-primary-ink">
                    <input type="checkbox" name="featured" defaultChecked={selectedVideo?.featured ?? false} className="h-5 w-5 rounded border border-neutral-300" />
                    Feature on homepage
                  </label>
                  <label className="text-sm font-semibold text-primary-ink md:col-span-2">
                    Video URL (YouTube)
                    <input
                      type="url"
                      name="video_url"
                      defaultValue={selectedVideo?.videoUrl ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      placeholder="https://www.youtube.com/watch?v=..."
                      required
                    />
                  </label>
                  <PortraitUploadField
                    initialValue={selectedVideo?.heroImageUrl ?? ""}
                    label="Hero image"
                    name="hero_image_url"
                    uploadEndpoint="/api/uploads/member-avatars"
                  />
                  <label className="text-sm font-semibold text-primary-ink md:col-span-2">
                    Summary
                    <textarea
                      name="summary"
                      rows={2}
                      defaultValue={selectedVideo?.summary ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      placeholder="One-line summary shown on cards"
                    />
                  </label>
                  <label className="text-sm font-semibold text-primary-ink md:col-span-2">
                    Description
                    <textarea
                      name="description"
                      rows={4}
                      defaultValue={selectedVideo?.description ?? ""}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
                      placeholder="Full description displayed on the video page"
                    />
                  </label>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-primary-ink w-full">
                      Authors
                      <select name="author_ids" multiple defaultValue={selectedAuthors} className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3">
                        {authorOptions.length === 0 && <option value="">No author profiles yet — enable via Team admin</option>}
                        {authorOptions.map((author) => (
                          <option key={author.id} value={author.id}>
                            {author.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-neutral-500">Hold ⌘ (Mac) or Ctrl (Windows) to select multiple authors.</p>
                    </label>
                  </div>
                  <div className="flex gap-4 md:col-span-2">
                    <button type="submit" className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white">
                      {isCreateMode ? "Create video" : "Update video"}
                    </button>
                    <Link href="/admin/videos" className="rounded-full border border-neutral-300 px-6 py-2 text-sm font-semibold text-primary-ink">
                      Cancel
                    </Link>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-neutral-500">No video selected.</p>
              )}
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-neutral-200 bg-white p-8">
          <div className="flex items-center justify-between">
            <h3 className="heading-3 text-primary-ink">All videos ({totalVideosCount})</h3>
          </div>
          {videos.length === 0 ? (
            <div className="mt-6 border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center">
              <p className="text-sm text-neutral-600">No videos yet. Create one above.</p>
            </div>
          ) : (
            <>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
                    <tr>
                      <th className="pb-3 pr-4 font-semibold">Title</th>
                      <th className="pb-3 pr-4 font-semibold">Status</th>
                      <th className="pb-3 pr-4 font-semibold">Published</th>
                      <th className="pb-3 pr-4 font-semibold">Featured</th>
                      <th className="pb-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {videos.map((video) => (
                      <tr key={video.id} className="group">
                        <td className="py-3 pr-4">
                          <Link href={`/admin/videos?video=${video.id}`} className="font-medium text-primary-ink hover:text-primary">
                            {video.title}
                          </Link>
                          <div className="mt-1 text-xs text-neutral-500">{video.slug}</div>
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide ${
                              video.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {video.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-neutral-600">{formatDate(video.publishedOn)}</td>
                        <td className="py-3 pr-4 text-neutral-600">{video.featured ? "Yes" : "No"}</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Link
                              href={`/admin/videos?video=${video.id}`}
                              className="rounded border border-neutral-300 px-3 py-1 text-xs font-semibold text-primary-ink hover:bg-neutral-50"
                            >
                              Edit
                            </Link>
                            <DeleteVideoButton videoId={video.id} videoTitle={video.title} deleteAction={deleteResourceVideo} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6">
                <Pagination pagination={pagination} searchParams={resolvedSearchParams} />
              </div>
            </>
          )}
        </section>
      </div>
    </RoleGate>
  );
}
