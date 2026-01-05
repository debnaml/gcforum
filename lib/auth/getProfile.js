import { getServerClient, getServiceRoleClient } from "../supabase/serverClient";

const PROFILE_COLUMNS = "id, full_name, role, avatar_url, organisation, title, location, sector, job_level, email, phone, linkedin, status, show_in_directory";

async function fetchProfileById(client, userId) {
  return client.from("profiles").select(PROFILE_COLUMNS).eq("id", userId).single();
}

export async function getCurrentProfile(userId = null) {
  const supabase = await getServerClient();
  if (!supabase) {
    return null;
  }

  let resolvedUserId = userId;
  if (!resolvedUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    resolvedUserId = user?.id ?? null;
  }

  if (!resolvedUserId) {
    return null;
  }

  const { data, error } = await fetchProfileById(supabase, resolvedUserId);
  if (!error) {
    return data;
  }

  const permissionDenied = typeof error.message === "string" && error.message.toLowerCase().includes("permission denied");

  if (permissionDenied) {
    const serviceRoleClient = getServiceRoleClient();
    if (serviceRoleClient) {
      console.warn("Using service role fallback for profile", {
        userId: resolvedUserId,
        hasServiceRoleAccess: true,
      });
      const { data: adminData, error: adminError } = await fetchProfileById(serviceRoleClient, resolvedUserId);
      if (!adminError) {
        return adminData;
      }
      console.error("Failed to load profile with service role", {
        message: adminError.message,
        details: adminError.details,
        hint: adminError.hint,
        code: adminError.code,
      });
      return null;
    }
  }

  console.error("Failed to load profile", {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });
  return null;
}
