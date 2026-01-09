import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { formatDate } from "../../lib/utils";

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "GC";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatTitle(text = "") {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function AuthorAvatar({ name, avatarUrl }) {
  const initials = getInitials(name);
  if (avatarUrl) {
    return (
      <div className="relative inline-flex h-10 w-10 overflow-hidden rounded-full border border-white bg-white shadow-sm">
        <Image src={avatarUrl} alt={name || "Author avatar"} fill sizes="40px" className="object-cover object-left" />
      </div>
    );
  }

  return (
    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white bg-primary-ink/5 text-sm font-semibold text-primary-ink">
      {initials}
    </div>
  );
}

function FavoriteStarButton({ resourceId }) {
  return (
    <button
      type="button"
      className="text-[#333333] transition hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      aria-label="Add resource to favourites"
      data-resource-id={resourceId}
    >
      <Star className="h-5 w-5" strokeWidth={1.5} />
    </button>
  );
}

export default function ResourceCard({ resource, disableHover = false }) {
  const authors = Array.isArray(resource?.authors) && resource.authors.length > 0 ? resource.authors : null;
  const primaryAuthor = authors?.[0] ?? { name: "GC Forum Editorial" };
  const avatarAuthors = (authors ?? [primaryAuthor]).slice(0, 3);
  const multipleAuthors = (authors?.length ?? 0) > 1;
  const formattedDate = resource.publishedOn ? formatDate(resource.publishedOn, "dd MMMM yyyy") : null;
  const formattedTitle = formatTitle(resource.title || "");
  const isVideo = (resource?.type ?? "").toLowerCase() === "video";

  const baseClasses = "relative overflow-hidden flex h-[250px] flex-col justify-between gap-6 border border-[#CCCCCC] px-[15px] py-5";
  const hoverClasses = disableHover ? "" : "transform transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]";

  return (
    <article className={`${baseClasses} ${hoverClasses} ${isVideo ? "bg-[#EAF8FA]" : "bg-[#FEFEFE]"}`}>
      <div className="relative flex h-full flex-col justify-between gap-6">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-sans text-[16px] leading-[1.3] text-[#14848F]">{resource.category || "Resource"}</span>
            {isVideo && <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">Video</span>}
          </div>
          <FavoriteStarButton resourceId={resource.id ?? resource.slug} />
        </div>
        <h3 className="font-hero-serif text-[18px] leading-[1.2] text-[#333333]">
          <Link href={`/resources/${resource.slug}`} className="transition hover:text-primary">
            <span
              className="block"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {formattedTitle}
            </span>
          </Link>
        </h3>
      </div>
      <div className="mt-auto flex items-center justify-between gap-4 border-t border-[#CCCCCC] pt-4 text-sm text-neutral-600">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {avatarAuthors.map((author, index) => (
              <AuthorAvatar key={`${author.id ?? author.name ?? index}-${index}`} name={author.name} avatarUrl={author.avatarUrl} />
            ))}
          </div>
          <span className="text-sm text-[#333333]">
            {multipleAuthors ? "Multiple" : primaryAuthor.name ?? "GC Forum Editorial"}
          </span>
        </div>
        {formattedDate && <span className="text-sm text-neutral-500">{formattedDate}</span>}
      </div>
      </div>
    </article>
  );
}
