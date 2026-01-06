"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../../../components/ui/Button";
import { getBrowserClient } from "../../../lib/supabase/browserClient";
import { supabaseAnonKey, supabaseUrl } from "../../../lib/env";

function logResetDebug(message, details) {
  if (typeof console === "undefined") {
    return;
  }
  if (details !== undefined) {
    console.info("[reset]", message, details);
  } else {
    console.info("[reset]", message);
  }
}

function extractRecoveryPayload() {
  if (typeof window === "undefined") {
    return null;
  }

  const sources = [window.location.hash?.slice(1), window.location.search?.slice(1)];

  for (const source of sources) {
    if (!source) continue;
    const params = new URLSearchParams(source);
    const type = params.get("type");
    if (type !== "recovery") {
      continue;
    }

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (accessToken && refreshToken) {
      return { mode: "session", accessToken, refreshToken };
    }

    const code = params.get("code") || params.get("token") || null;
    if (code) {
      return { mode: "code", code };
    }
  }

  return null;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => getBrowserClient(), []);
  const [stage, setStage] = useState("checking");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [debugDetails, setDebugDetails] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    if (!supabase) {
      setError("Supabase is not configured.");
      setStage("error");
      logResetDebug("Missing Supabase client");
      return;
    }

    let cancelled = false;
    const locationDetails = {
      hash: typeof window !== "undefined" ? window.location.hash ?? "" : "",
      search: typeof window !== "undefined" ? window.location.search ?? "" : "",
    };
    setDebugDetails(locationDetails);
    logResetDebug("Captured location details", locationDetails);

    const handleSessionEvent = (event, session) => {
      if (cancelled) return;
      logResetDebug("Auth state event", { event, hasSession: Boolean(session) });
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) {
        setStage((current) => (current === "success" ? current : "ready"));
        setError("");
        setActiveSession(session);
      }
    };

    const authListener = supabase.auth.onAuthStateChange(handleSessionEvent);
    const subscription = authListener?.data?.subscription;

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled && data?.session) {
        logResetDebug("Existing session detected", { accessToken: Boolean(data.session.access_token) });
        setStage((current) => (current === "success" ? current : "ready"));
        setActiveSession(data.session);
      }
    });

    const run = async () => {
      const payload = extractRecoveryPayload();
      if (!payload) {
        logResetDebug("No recovery payload found");
        setStage("missing");
        return;
      }

      try {
        if (payload.mode === "session") {
          logResetDebug("Using recovery hash tokens without Supabase handshake", {
            hasAccessToken: Boolean(payload.accessToken),
            hasRefreshToken: Boolean(payload.refreshToken),
          });
          setActiveSession({
            access_token: payload.accessToken,
            refresh_token: payload.refreshToken,
          });
          setStage("ready");
          setError("");
          if (typeof window !== "undefined" && typeof window.history?.replaceState === "function") {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          logResetDebug("Stage ready via hash tokens");
          return;
        } else if (payload.mode === "code") {
          logResetDebug("Exchanging code for session");
          const { data, error: codeError } = await supabase.auth.exchangeCodeForSession(payload.code);
          if (codeError) {
            throw codeError;
          }
          setActiveSession(data?.session ?? null);
        }

        if (cancelled) return;
        if (typeof window !== "undefined" && typeof window.history?.replaceState === "function") {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        setStage("ready");
        logResetDebug("Recovery payload validated, stage ready");
      } catch (sessionError) {
        if (cancelled) return;
        setError(sessionError?.message ?? "We couldn't verify this reset link.");
        setStage("error");
        logResetDebug("Failed to process recovery payload", sessionError);
      }
    };

    run();

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
      setActiveSession(null);
      logResetDebug("Cleanup: unsubscribed from auth state");
    };
  }, [supabase]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    logResetDebug("Submit triggered", { stage, passwordLength: password?.length ?? 0 });
    if (!supabase) {
      setError("Supabase is not configured.");
      setStage("error");
      logResetDebug("Submit failed: missing Supabase client");
      return;
    }

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.");
      logResetDebug("Submit failed: password requirements not met");
      return;
    }

    setStatus("loading");
    setError("");

    const missingConfig = !supabaseUrl || !supabaseAnonKey;
    if (missingConfig) {
      setError("Supabase credentials are missing. Contact the site administrator.");
      setStatus("idle");
      logResetDebug("Submit failed: missing Supabase env");
      return;
    }

    const currentSession = activeSession;
    logResetDebug("Current session snapshot", {
      hasSession: Boolean(currentSession),
      hasAccessToken: Boolean(currentSession?.access_token),
    });

    const accessToken = currentSession?.access_token ?? null;
    if (!accessToken) {
      setError("This secure link expired. Request a fresh password reset email.");
      setStatus("idle");
      logResetDebug("Submit failed: no access token");
      return;
    }

    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 12000) : null;

    try {
      logResetDebug("Submitting password update request");
      const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ password }),
        signal: controller?.signal,
      });

      logResetDebug("Password update response", { status: response.status });
      if (!response.ok) {
        let detail = null;
        try {
          detail = await response.json();
        } catch (_parseError) {
          // ignore body parse failures
        }
        const message =
          detail?.msg ||
          detail?.message ||
          detail?.error_description ||
          detail?.error ||
          "We couldn't update your password. Request a fresh link and try again.";
        logResetDebug("Password update rejected", detail || response.statusText);
        throw new Error(message);
      }

      setStage("success");
      setError("");
      logResetDebug("Password updated successfully, redirect scheduled");
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 1200);
    } catch (updateError) {
      logResetDebug("Password update error", updateError);
      if (updateError?.name === "AbortError") {
        setError("The update timed out. Check your connection or request a new link.");
      } else {
        setError(updateError?.message ?? "We couldn't update your password. Try again.");
      }
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setStatus("idle");
      logResetDebug("Submit completed; status reset");
    }
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-xl px-6 py-16">
        <p className="text-sm uppercase tracking-[0.3em] text-primary/60">Password reset</p>
        <h1 className="mt-4 text-4xl font-serif text-primary-ink">Choose a new password</h1>
        {stage === "checking" && <p className="mt-6 text-neutral-600">Validating your secure link…</p>}
        {stage === "missing" && (
          <div className="mt-6 space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 text-neutral-600">
            <p>That link looks incomplete or expired. Request a fresh reset link from the admin dashboard.</p>
            <Button as="a" href="/login" variant="secondary">
              Back to sign in
            </Button>
            {debugDetails && (
              <p className="break-words text-xs text-neutral-400">{JSON.stringify(debugDetails)}</p>
            )}
          </div>
        )}
        {stage === "error" && (
          <div className="mt-6 space-y-4 rounded-3xl border border-rose-200 bg-white p-6 text-rose-600">
            <p>{error || "We couldn't verify this reset link."}</p>
            <Button as="a" href="/login" variant="secondary">
              Return to sign in
            </Button>
          </div>
        )}
        {stage === "ready" && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-3xl border border-neutral-200 bg-white p-6">
            <label className="text-sm font-semibold text-primary-ink">
              New password
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3"
              />
            </label>
            <Button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Updating…" : "Save password"}
            </Button>
            {error && <p className="text-sm text-rose-600">{error}</p>}
          </form>
        )}
        {stage === "success" && (
          <div className="mt-6 space-y-4 rounded-3xl border border-emerald-200 bg-white p-6 text-emerald-700">
            <p>Password updated. Redirecting you to sign in…</p>
          </div>
        )}
      </div>
    </div>
  );
}
