"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../../../components/ui/Button";
import { getBrowserClient } from "../../../lib/supabase/browserClient";

function extractRecoveryParams() {
  if (typeof window === "undefined") {
    return null;
  }

  const sources = [window.location.hash?.slice(1), window.location.search?.slice(1)];
  for (const source of sources) {
    if (!source) continue;
    const params = new URLSearchParams(source);
    const type = params.get("type");
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (type === "recovery" && accessToken && refreshToken) {
      return { accessToken, refreshToken };
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

  useEffect(() => {
    if (!supabase) {
      setError("Supabase is not configured.");
      setStage("error");
      return;
    }

    const params = extractRecoveryParams();
    if (!params) {
      setStage("missing");
      return;
    }

    const { accessToken, refreshToken } = params;
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error: sessionError }) => {
      if (sessionError) {
        setError(sessionError.message);
        setStage("error");
        return;
      }
      window.history.replaceState({}, document.title, window.location.pathname);
      setStage("ready");
    });
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
