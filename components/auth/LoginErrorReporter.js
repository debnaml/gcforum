"use client";

import { useEffect, useMemo } from "react";
import { hasSupabaseClient } from "../../lib/env";

const endpoint = "/api/debug/login-error";

export default function LoginErrorReporter({ redirectTo = "/dashboard" }) {
  const context = useMemo(
    () => ({
      redirectTo,
      hasSupabaseClient,
    }),
    [redirectTo],
  );

  useEffect(() => {
    const baseMeta = {
      href: typeof window !== "undefined" ? window.location.href : null,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    };

    const sendLog = (entry) => {
      const payload = {
        timestamp: new Date().toISOString(),
        meta: baseMeta,
        context,
        ...entry,
      };
      const body = JSON.stringify(payload);

      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon(endpoint, blob);
        return;
      }

      fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
      }).catch(() => {
        // ignore network issues in fallback logger
      });
    };

    const handleError = (event) => {
      sendLog({
        type: "error",
        message: event?.message ?? "Unknown error",
        stack: event?.error?.stack ?? null,
        filename: event?.filename ?? null,
        lineno: event?.lineno ?? null,
        colno: event?.colno ?? null,
      });
    };

    const handleRejection = (event) => {
      const reason = event?.reason ?? null;
      sendLog({
        type: "unhandledrejection",
        message: typeof reason === "string" ? reason : reason?.message ?? "Unknown rejection",
        stack: typeof reason === "object" ? reason?.stack ?? null : null,
      });
    };

    const manual = (details) => {
      sendLog({ type: "manual", ...details });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    window.__gcLoginDebug = manual;

    sendLog({ type: "init" });

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
      if (window.__gcLoginDebug === manual) {
        delete window.__gcLoginDebug;
      }
    };
  }, [context]);

  return null;
}
