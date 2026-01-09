/* eslint-disable @next/next/no-img-element */
import { Mail } from "lucide-react";
import Image from "next/image";

const supabaseHost = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  try {
    return url ? new URL(url).hostname : null;
  } catch {
    return null;
  }
})();

const allowedHosts = ["images.unsplash.com", supabaseHost].filter(Boolean);

export default function PartnerCard({ partner }) {
  const hasAvatar = typeof partner?.avatar === "string" && partner.avatar.trim().length > 0;
  let avatarHost = null;
  if (hasAvatar) {
    try {
      avatarHost = new URL(partner.avatar).hostname;
    } catch {
      avatarHost = null;
    }
  }
  const canUseNextImage = Boolean(avatarHost && allowedHosts.includes(avatarHost));
  return (
    <article className="flex h-full max-h-[550px] w-full flex-col overflow-hidden border border-[#CCCCCC] bg-white">
      <div className="relative h-[200px] w-full overflow-hidden">
        {hasAvatar ? (
          canUseNextImage ? (
            <Image
              src={partner.avatar}
              alt={partner.name}
              fill
              sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 25vw"
              className="object-cover object-left"
            />
          ) : (
            <img
              src={partner.avatar}
              alt={partner.name}
              className="h-full w-full object-cover object-left"
              loading="lazy"
            />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-start bg-[#C7F1F1] px-4 text-sm text-neutral-600">
            No portrait available
          </div>
        )}
      </div>
      <div className="flex h-full flex-col px-5 pb-5 pt-5">
        <div>
          <h3 className="font-hero-serif text-[26px] font-normal text-neutral-900">{partner.name}</h3>
          {partner.title && (
            <p className="mt-1 font-sans text-sm font-semibold text-[#237781]">{partner.title}</p>
          )}
        </div>
        {partner.bio && (
          <p className="mt-4 flex-1 text-[14px] leading-relaxed text-neutral-700">
            {partner.bio}
          </p>
        )}
        <div className="mt-6 border-t border-[#E0E0E0] pt-4 text-sm font-semibold text-primary-ink">
          {partner.email && (
            <a href={`mailto:${partner.email}`} className="flex items-center gap-2 text-[#237781]">
              <Mail size={15} className="text-[#237781]" /> Email
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
