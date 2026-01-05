"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function RecoveryRedirector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname !== "/login") {
      return;
    }

    const redirectParam = searchParams?.get("redirect") ?? null;
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const search = typeof window !== "undefined" ? window.location.search : "";
    const hasRecoveryHash = hash.includes("type=recovery") || search.includes("type=recovery");

    if (redirectParam === "/reset" && hasRecoveryHash) {
      const suffix = hash || search;
      router.replace(`/reset${suffix}`);
    }
  }, [pathname, router, searchParams]);

  return null;
}
