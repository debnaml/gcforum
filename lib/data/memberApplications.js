import { hasServiceRoleAccess } from "../env";
import { getServiceRoleClient } from "../supabase/serverClient";

export async function getMemberApplications() {
  if (!hasServiceRoleAccess) {
    return [];
  }

  const client = getServiceRoleClient();
  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from("member_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load member applications", error.message);
    return [];
  }

  return Array.isArray(data) ? data : [];
}
