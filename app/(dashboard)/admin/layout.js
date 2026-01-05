import Link from "next/link";

const adminNavLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/articles", label: "Articles" },
];

export default function AdminLayout({ children }) {
  return (
    <div className="space-y-8">
      <nav
        aria-label="Admin sections"
        className="rounded-3xl border border-primary/10 bg-white/90 px-6 py-4 text-sm font-semibold text-primary-ink shadow-sm"
      >
        <div className="flex flex-wrap gap-3">
          {adminNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-primary/30 px-4 py-2 transition hover:border-primary hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
      {children}
    </div>
  );
}
