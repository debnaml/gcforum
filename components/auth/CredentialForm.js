"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import { getBrowserClient } from "../../lib/supabase/browserClient";

export default function CredentialForm({ mode = "signin", redirectTo = "/dashboard" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicLink, setMagicLink] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      if (magicLink) {
        const supabase = getBrowserClient();
        if (!supabase) {
          setMessage("Supabase is not configured. Add your environment variables to .env.local.");
          return;
        }

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        setMessage("Check your inbox for the magic link.");
        return;
      }

      if (mode === "signin") {
        const response = await fetch("/api/auth/signin", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({ email, password }),
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          setMessage(payload?.error ?? "Unable to sign in with those credentials.");
          return;
        }

        setMessage("Success! Redirecting…");
        const target = redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard";
        router.push(target);
        router.refresh();
        return;
      }

      const supabase = getBrowserClient();
      if (!supabase) {
        setMessage("Supabase is not configured. Add your environment variables to .env.local.");
        return;
      }

      const { error } = await supabase.auth.signUp({ email, password });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Account created.");
    } catch (error) {
      setMessage(error?.message ?? "We couldn’t complete that request. Please try again.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="flex flex-col gap-2 text-sm font-semibold text-primary-ink">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-xl border border-neutral-200 px-4 py-3"
        />
      </label>
      {!magicLink && (
        <label className="flex flex-col gap-2 text-sm font-semibold text-primary-ink">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-xl border border-neutral-200 px-4 py-3"
          />
        </label>
      )}
      <label className="flex items-center gap-2 text-sm text-neutral-600">
        <input type="checkbox" checked={magicLink} onChange={(event) => setMagicLink(event.target.checked)} />
        Sign in with a magic link
      </label>
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
      </Button>
      {message && <p className="text-sm text-neutral-600">{message}</p>}
    </form>
  );
}
