"use client";

import { useEffect, useRef } from "react";

const SCROLL_OFFSET = 120;

export default function PanelScrollAnchor({ activeKey }) {
  const anchorRef = useRef(null);

  useEffect(() => {
    if (!activeKey || !anchorRef.current || typeof window === "undefined") {
      return;
    }

    const mediaQuery = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    const prefersReducedMotion = mediaQuery?.matches;
    const behavior = prefersReducedMotion ? "auto" : "smooth";

    anchorRef.current.scrollIntoView({ behavior, block: "start" });
    requestAnimationFrame(() => {
      window.scrollBy({ top: -SCROLL_OFFSET, behavior });
    });
  }, [activeKey]);

  return <div ref={anchorRef} aria-hidden />;
}
