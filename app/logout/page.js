"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/auth/AuthProvider";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    let active = true;

    async function performLogout() {
      if (logout) {
        try {
          await logout();
        } catch (_error) {
          // swallow errors and continue to navigation flow
        }
      }

      if (active) {
        router.replace("/login");
        router.refresh();
      }
    }

    performLogout();

    return () => {
      active = false;
    };
  }, [logout, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-white text-primary-ink">
      <p className="text-lg font-medium">Signing you out...</p>
    </div>
  );
}
