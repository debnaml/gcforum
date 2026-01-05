import Image from "next/image";

const footerColumns = [
  {
    title: "Information",
    links: [
      { label: "About GC Forum", href: "/#about" },
      { label: "About Birketts", href: "/#about-birketts-details" },
      { label: "Meet the Team", href: "/#about-birketts" },
      { label: "Membership", href: "/#apply" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Events", href: "/events" },
      { label: "Insights", href: "/articles" },
      { label: "Resources", href: "/resources" },
      { label: "Contact", href: "/#contact" },
    ],
  },
];

const legalLinks = [
  { label: "Terms of Use", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Cookies Policy", href: "/cookies" },
  { label: "Contact Us", href: "/contact" },
];

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-primary-ink text-white">
      <div className="mx-auto max-w-6xl px-6 pt-[75px] pb-12">
        <div>
          <Image src="/birketslogo.svg" alt="Birketts" width={160} height={40} priority />
        </div>
        <div className="mt-[75px] flex flex-col gap-10 text-sm text-white/80 md:flex-row md:gap-16">
          {footerColumns.map((column) => (
            <div key={column.title} className="w-full md:w-auto">
              <p className="text-base font-semibold text-white">{column.title}</p>
              <ul className="mt-4 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="transition hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-[75px] border-t border-white/10 pt-5 pb-2 text-sm text-white/70">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p>© Birketts LLP {currentYear}. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              {legalLinks.map((link) => (
                <a key={link.label} href={link.href} className="transition hover:text-white">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
