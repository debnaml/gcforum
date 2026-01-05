"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getBrowserClient } from "../../lib/supabase/browserClient";

const AuthContext = createContext({ session: null, profile: null, loading: true, logout: () => Promise.resolve() });

export function AuthProvider({ children }) {
  const supabase = getBrowserClient();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  const loadProfile = async (client, userId, stillMounted) => {
    const { data } = await client
      .from("profiles")
      .select("id, full_name, role, avatar_url")
      .eq("id", userId)
      .single();
    if (stillMounted) {
      setProfile(data ?? null);
    }
  };

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;

    const getInitialSession = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();
      if (mounted) {
        setSession(initialSession);
        if (initialSession?.user) {
          await loadProfile(supabase, initialSession.user.id, mounted);
        }
        setLoading(false);
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        await loadProfile(supabase, nextSession.user.id, mounted);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const logout = useCallback(async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch (_error) {
        // ignore local sign-out errors so the UI flow can continue
      }
    }

    setSession(null);
    setProfile(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        keepalive: true,
        signal: controller.signal,
      });
    } catch (_error) {
      // swallow network errors; the caller will redirect regardless
    } finally {
      clearTimeout(timeoutId);
    }
  }, [supabase]);

  const value = useMemo(
    () => ({ session, profile, loading, role: profile?.role ?? null, logout }),
    [session, profile, loading, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
