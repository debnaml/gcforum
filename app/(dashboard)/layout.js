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

  return <div className="bg-white min-h-screen">{children}</div>;
}
