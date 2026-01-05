"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../../../components/ui/Button";
import { getBrowserClient } from "../../../lib/supabase/browserClient";

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

  useEffect(() => {
    if (!supabase) {
      setError("Supabase is not configured.");
      setStage("error");
      return;
    }

    let cancelled = false;
    const locationDetails = {
      hash: typeof window !== "undefined" ? window.location.hash ?? "" : "",
      search: typeof window !== "undefined" ? window.location.search ?? "" : "",
    };
    setDebugDetails(locationDetails);

    const handleSessionEvent = (event, session) => {
      if (cancelled) return;
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) {
        setStage("ready");
        setError("");
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleSessionEvent);

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled && data?.session) {
        setStage("ready");
      }
    });

    const run = async () => {
      const payload = extractRecoveryPayload();
      if (!payload) {
        setStage("missing");
        return;
      }

      try {
        if (payload.mode === "session") {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: payload.accessToken,
            refresh_token: payload.refreshToken,
          });
          if (sessionError) {
            throw sessionError;
          }
        } else if (payload.mode === "code") {
          const { error: codeError } = await supabase.auth.exchangeCodeForSession(payload.code);
          if (codeError) {
            throw codeError;
          }
        }

        if (cancelled) return;
        if (typeof window !== "undefined" && typeof window.history?.replaceState === "function") {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        setStage("ready");
      } catch (sessionError) {
        if (cancelled) return;
        setError(sessionError?.message ?? "We couldn't verify this reset link.");
        setStage("error");
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!supabase) {
      setError("Supabase is not configured.");
      setStage("error");
      return;
    }

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
      subscription.unsubscribe();

    setStatus("loading");
    setError("");

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setStatus("idle");
      return;
    }

    setStage("success");
    setStatus("idle");

    setTimeout(() => {
      router.push("/login?reset=success");
    }, 1200);
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
