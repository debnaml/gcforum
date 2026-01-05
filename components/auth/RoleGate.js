"use client";

import { canAccess } from "../../lib/auth/roles";
import { useAuth } from "./AuthProvider";

export default function RoleGate({ role, fallback = null, initialRole = null, children }) {
  const { profile, loading } = useAuth();
  const resolvedRole = profile?.role ?? initialRole;
  const stillLoading = loading && !resolvedRole;

  if (stillLoading) {
    return <div className="rounded-xl border border-dashed border-primary/30 p-6">Checking permissions…</div>;
  }

  if (!canAccess(role, resolvedRole)) {
    return fallback ?? (
      <div className="rounded-xl border border-dashed border-primary/30 p-6 text-sm text-neutral-600">
        You need {role} access to view this area.
      </div>
    );
  }

  return children;
}
