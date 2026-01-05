import { Linkedin, Mail } from "lucide-react";
import Image from "next/image";

function getInitials(name) {
  if (!name) return "";
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

export default function MemberCard({ member }) {
  const initials = getInitials(member.name);
  const hasEmail = Boolean(member.email);
  const hasLinkedIn = Boolean(member.linkedin);
  const hasContacts = hasEmail || hasLinkedIn;
  const avatarUrl = member.avatar || member.avatar_url || null;
  const jobLine = [member.title, member.organisation].filter(Boolean).join(" at ");

  return (
    <article className="flex h-[550px] flex-col border border-[#CCCCCC] bg-white">
      <div className="relative w-full overflow-hidden flex-shrink-0" style={{ height: 300 }}>
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={member.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#F4F4F4] text-4xl font-semibold text-[#333333]">
            {initials || "GC"}
          </div>
        )}
      </div>
      <div className="flex-1 px-[15px] py-5" style={{ minHeight: 190 }}>
        <h3
          className="text-[26px] leading-[130%] text-[#333333]"
          style={{ fontFamily: '"Noto Serif", serif', fontWeight: 400 }}
        >
          {member.name || "GC Forum Member"}
        </h3>
        <p
          className="mt-3 text-[18px] leading-[130%] text-[#666666] line-clamp-[4]"
          style={{ fontFamily: '"Open Sans", sans-serif' }}
        >
          {jobLine || member.organisation || member.title || "Member"}
        </p>
      </div>
      {hasContacts && (
        <div className="mt-auto flex-shrink-0 px-[15px]">
          <div className="flex h-[60px] items-center gap-6 border-t border-[#CCCCCC] text-sm font-semibold text-[#1A9AA5]">
            {hasEmail && (
              <a
                href={`mailto:${member.email}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2"
              >
                <Mail size={16} />
                <span>Email</span>
              </a>
            )}
            {hasLinkedIn && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2"
              >
                <Linkedin size={16} />
                <span>LinkedIn</span>
              </a>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
