import { redirect } from "next/navigation";
import { hasSupabaseClient } from "../../lib/env";
import { getSession } from "../../lib/auth/getSession";

export default async function DashboardLayout({ children }) {
  if (hasSupabaseClient) {
    const { session } = await getSession();
    if (!session) {
      redirect("/login");
    }
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16">{children}</div>
    </div>
  );
}
