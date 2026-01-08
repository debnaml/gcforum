"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Button from "../ui/Button";
import { ROLES } from "../../lib/auth/roles";
import { useAuth } from "../auth/AuthProvider";

const guestLinks = [
  { href: "/#about", label: "About" },
  { href: "/#team", label: "Our Team" },
  { href: "/#about-birketts", label: "About Birketts" },
];

const memberLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/resources", label: "Resource Centre" },
  { href: "/members", label: "Members" },
  { href: "/about", label: "About" },
];

export default function SiteHeader({ profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const navLinks = profile ? memberLinks : guestLinks;
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const initials = useMemo(() => {
    if (!profile?.full_name) return "GC";
    return profile.full_name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [profile?.full_name]);

  const hideHeaderRoutes = ["/signup", "/reset"];
  const hideHeader = hideHeaderRoutes.some((route) => pathname?.startsWith(route));

  useEffect(() => {
    if (!menuOpen || hideHeader) {
      return undefined;
    }
    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [menuOpen, hideHeader]);

  useEffect(() => {
    if (hideHeader) {
      return undefined;
    }

    const handleScroll = () => {
      setScrolled(window.scrollY >= 100);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hideHeader]);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      if (logout) {
        await logout();
      }
    } catch (_error) {
      // ignore errors so navigation can proceed
    } finally {
      router.replace("/login");
      router.refresh();
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, logout, router]);

  if (hideHeader) {
    return null;
  }

  const primaryMenuItems = [
    { label: "My Profile", href: "/profile" },
    { label: "My Favourites", href: "/favourites" },
  ];

  const secondaryMenuItems = [
    ...(profile?.role === ROLES.admin ? [{ label: "Admin", href: "/admin" }] : []),
    { label: "My Settings", href: "/settings" },
    { label: "Logout", href: "/logout", isLogout: true },
  ];

  const headerBackground = scrolled ? "bg-primary-ink/90 backdrop-blur" : "bg-transparent";

  return (
    <header className={`fixed left-0 right-0 top-0 z-50 h-[110px] border-b border-white/30 text-white transition-colors duration-300 ${headerBackground}`}>
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="inline-flex items-center" aria-label="GC Forum home">
          <Image src="/gcforum.svg" alt="GC Forum" width={155} height={47} priority />
        </Link>
        <div className="flex items-center gap-8">
          <nav className="hidden gap-8 text-[18px] font-normal md:flex">
            {navLinks.map((link) => {
              const isAnchorLink = link.href.includes("#");
              const isActive = !isAnchorLink && pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative pb-1 transition-colors ${isActive ? "text-white" : "text-[#ffffff]"}`}
                >
                  {isActive && <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-white" aria-hidden />}
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            {profile ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  aria-label="Open profile menu"
                  aria-expanded={menuOpen}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-sm font-semibold uppercase text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                >
                  {initials}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-60 rounded-2xl border border-neutral-200 bg-white py-3 text-left text-sm text-neutral-700 shadow-2xl">
                    <div className="px-3 pb-2">
                      {primaryMenuItems.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block rounded-xl px-3 py-2 font-medium transition hover:bg-neutral-100"
                          onClick={() => setMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-neutral-100 pt-2">
                      {secondaryMenuItems.map((item) => (
                        item.isLogout ? (
                          <button
                            key={item.label}
                            type="button"
                            className="block w-full px-6 py-2 text-left text-sm font-medium transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => {
                              setMenuOpen(false);
                              void handleLogout();
                            }}
                            disabled={isLoggingOut}
                          >
                            {isLoggingOut ? "Signing out..." : item.label}
                          </button>
                        ) : (
                          <Link
                            key={item.label}
                            href={item.href}
                            className="block px-6 py-2 text-sm font-medium transition hover:bg-neutral-100"
                            onClick={() => setMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button as={Link} href="/login" variant="secondary" size="sm" className="text-[18px] font-normal">
                Member login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
