'use server';
import { revalidatePath } from "next/cache";
import { hasServiceRoleAccess, hasSupabaseClient, siteUrl, supabaseUrl } from "../../../lib/env";
import { ROLES } from "../../../lib/auth/roles";
import { getServerClient, getServiceRoleClient } from "../../../lib/supabase/serverClient";
import {
  directoryPreferenceInitialState,
  memberApplicationInitialState,
} from "../../../lib/memberState";

function applicantFullName(application) {
  return `${application.first_name ?? ""} ${application.last_name ?? ""}`.trim();
}

function normalizeEmail(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().toLowerCase();
}

async function findProfileIdByEmail(client, email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return null;
  }
  const { data, error } = await client
    .from("profiles")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error("Failed to look up profile by email", error.message);
    return null;
  }

  return data?.id ?? null;
}

function assertServiceRole() {
  if (!hasServiceRoleAccess) {
    return null;
  }
  return getServiceRoleClient();
}

function revalidateMemberRoutes() {
  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath("/members");
}

async function inviteApplicantUser(client, application) {
  if (!hasServiceRoleAccess) {
    return { profileId: null, invited: false };
  }

  const fullName = applicantFullName(application);

  try {
    const { data, error } = await client.auth.admin.inviteUserByEmail(application.email, {
      data: {
        full_name: fullName,
        organisation: application.organisation ?? undefined,
      },
      redirectTo: `${siteUrl}/login`,
    });

    if (error) {
      const duplicate = typeof error.message === "string" && error.message.toLowerCase().includes("already registered");
      if (duplicate) {
        console.warn("Applicant already registered", { email: application.email });
        return { profileId: null, invited: false, duplicate: true };
      }
      throw error;
    }

    return { profileId: data?.user?.id ?? null, invited: true };
  } catch (inviteError) {
    console.error("Failed to invite applicant", inviteError.message);
    throw inviteError;
  }
}

async function upsertApplicantProfile(client, profileId, application) {
  if (!profileId) {
    return null;
  }

  const payload = {
    id: profileId,
    full_name: applicantFullName(application),
    role: ROLES.member,
    organisation: application.organisation ?? null,
    email: normalizeEmail(application.email) || application.email,
  };

  const { error } = await client.from("profiles").upsert(payload).select("id").single();
  if (error) {
    console.error("Failed to upsert applicant profile", error.message);
    throw error;
  }
  return profileId;
}

async function applyApplicationToProfile(client, profileId, application) {
  if (!profileId) {
    throw new Error("Missing profile reference for this applicant.");
  }

  const payload = {
    full_name: applicantFullName(application) || null,
    organisation: application.organisation ?? null,
    title: application.current_role ?? "General Counsel",
    email: normalizeEmail(application.email) || application.email,
    phone: application.phone ?? null,
    linkedin: application.linkedin_url ?? null,
    location: application.location ?? null,
    sector: application.sector ?? null,
    job_level: application.current_role ?? null,
    status: "approved",
    show_in_directory: Boolean(application.consent_show_directory),
  };

  const { error } = await client.from("profiles").update(payload).eq("id", profileId);
  if (error) {
    console.error("Failed to update profile with application data", error.message);
    throw error;
  }

  return profileId;
}

export async function reviewMemberApplication(formData) {
  const client = assertServiceRole();
  if (!client) {
    return { success: false, message: "Enable SUPABASE_SERVICE_ROLE_KEY to review applications." };
  }

  const applicationId = formData.get("application_id")?.toString().trim();
  const decisionInput = formData.get("decision")?.toString().trim();
  const reviewerId = formData.get("reviewer_id")?.toString().trim() || null;
  const notes = formData.get("notes")?.toString().trim() || null;

  if (!applicationId || !decisionInput) {
    return { success: false, message: "Application ID and decision are required." };
  }

  const decision = decisionInput === "approved" ? "approved" : "rejected";

  const { data: application, error } = await client
    .from("member_applications")
    .select("*")
    .eq("id", applicationId)
    .single();

  if (error || !application) {
    console.error("Unable to load application", error?.message);
    return { success: false, message: "We couldn't find that application." };
  }

  if ((application.status ?? "pending") !== "pending") {
    return { success: false, message: "This application has already been processed." };
  }

  let profileId = null;

  if (decision === "approved") {
    try {
      const inviteResult = await inviteApplicantUser(client, application);
      profileId = inviteResult.profileId ?? null;
      if (profileId) {
        await upsertApplicantProfile(client, profileId, application);
      } else {
        profileId = await findProfileIdByEmail(client, application.email);
      }

      if (!profileId) {
        throw new Error("We couldn't locate an account for this applicant.");
      }

      await applyApplicationToProfile(client, profileId, application);
    } catch (approvalError) {
      return {
        success: false,
        message: approvalError?.message ?? "We couldn't finalise the approval. Please try again.",
      };
    }
  }

  const reviewPayload = {
    status: decision,
    reviewer_id: reviewerId,
    reviewer_notes: notes,
    reviewed_at: new Date().toISOString(),
  };

  const { error: reviewError } = await client
    .from("member_applications")
    .update(reviewPayload)
    .eq("id", applicationId);

  if (reviewError) {
    console.error("Failed to update application status", reviewError.message);
    return { success: false, message: "Unable to update the application status." };
  }

  revalidateMemberRoutes();
  revalidatePath("/join");

  return { success: true, memberId: profileId };
}

export async function submitMemberApplication(prevState, formData) {
  const serviceClient = getServiceRoleClient();
  const supabase = serviceClient ?? (await getServerClient());
  const usingServiceClient = Boolean(serviceClient);
  const supabaseConfigured = Boolean(supabase);
  if (process.env.NODE_ENV !== "production") {
    console.info("submitMemberApplication debug", {
      usingServiceClient,
      supabaseConfigured,
      hasServiceRoleAccess,
      hasSupabaseClient,
      supabaseUrl,
      anonKeySet: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    });
  }
  if (!supabase) {
    return { ...memberApplicationInitialState, status: "error", message: "Supabase is not configured.", errors: {} };
  }

  const requiredFields = {
    first_name: "First name is required.",
    last_name: "Last name is required.",
    email: "Email is required.",
    location: "Location is required.",
    current_role: "Current role is required.",
    organisation: "Organisation is required.",
    sector: "Sector is required.",
    responsibility: "Tell us about your responsibilities.",
  };

  const errors = {};
  const payload = {
    first_name: formData.get("first_name")?.toString().trim() ?? "",
    last_name: formData.get("last_name")?.toString().trim() ?? "",
    email: formData.get("email")?.toString().trim().toLowerCase() ?? "",
    phone: formData.get("phone")?.toString().trim() || null,
    linkedin_url: formData.get("linkedin_url")?.toString().trim() || null,
    location: formData.get("location")?.toString().trim() ?? "",
    current_role: formData.get("current_role")?.toString().trim() ?? "",
    organisation: formData.get("organisation")?.toString().trim() ?? "",
    sector: formData.get("sector")?.toString().trim() ?? "",
    team_size: formData.get("team_size")?.toString().trim() || "sole-gc",
    responsibility: formData.get("responsibility")?.toString().trim() ?? "",
    topics: formData.getAll("areas_of_interest").map((value) => value?.toString().trim()).filter(Boolean),
    consent_show_directory: formData.get("directory_consent") === "yes",
    privacy_accepted: formData.get("privacy_accepted") === "on",
  };

  Object.entries(requiredFields).forEach(([key, message]) => {
    if (!payload[key]) {
      errors[key] = message;
    }
  });

  if (!payload.privacy_accepted) {
    errors.privacy_accepted = "You need to accept the privacy policy.";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Please review the highlighted fields.", errors };
  }

  const { error } = await supabase.from("member_applications").insert(payload);

  if (error) {
    console.error("Failed to submit member application", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      usingServiceClient,
    });
    const debugMessage = process.env.NODE_ENV !== "production" && error.message
      ? `Unable to save application: ${error.message}${error.details ? ` — ${error.details}` : ""} (serviceClient=${usingServiceClient})`
      : "We couldn't save your application. Please try again.";
    return { status: "error", message: debugMessage, errors: {} };
  }

  return {
    status: "success",
    message: "Thanks for applying. Our team will review your answers and respond within two working days.",
    errors: {},
  };
}

export async function updateMemberStatus(formData) {
  const client = assertServiceRole();
  if (!client) {
    return { success: false, message: "Enable SUPABASE_SERVICE_ROLE_KEY for membership updates." };
  }

  const id = formData.get("member_id");
  const status = formData.get("status");
  if (!id || !status) {
    return { success: false, message: "Member ID and status are required." };
  }

  const payload = {
    status,
  };

  const { error } = await client.from("profiles").update(payload).eq("id", id);
  if (error) {
    console.error("Failed to update member status", error.message);
    return { success: false, message: error.message };
  }

  revalidateMemberRoutes();
  return { success: true };
}

export async function updateMemberDetails(formData) {
  const client = assertServiceRole();
  if (!client) {
    return { success: false, message: "Enable SUPABASE_SERVICE_ROLE_KEY for membership updates." };
  }

  const id = formData.get("member_id");
  if (!id) {
    return { success: false, message: "Member ID is required." };
  }

  const payload = {
    full_name: formData.get("name") ?? undefined,
    title: formData.get("title") ?? undefined,
    organisation: formData.get("organisation") ?? undefined,
    email: formData.get("email") ?? undefined,
    phone: formData.get("phone") ?? undefined,
    location: formData.get("location") ?? undefined,
    sector: formData.get("sector") ?? undefined,
    job_level: formData.get("job_level") ?? undefined,
    linkedin: formData.get("linkedin") ?? undefined,
  };

  const showInDirectoryInput = formData.get("show_in_directory");
  if (showInDirectoryInput !== null) {
    const normalized = showInDirectoryInput.toString().toLowerCase();
    payload.show_in_directory = normalized === "true" || normalized === "on" || normalized === "1";
  }

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined || payload[key] === "") {
      delete payload[key];
    }
  });

  if (Object.keys(payload).length === 0) {
    return { success: false, message: "Provide at least one field to update." };
  }

  const { error } = await client.from("profiles").update(payload).eq("id", id);
  if (error) {
    console.error("Failed to update member details", error.message);
    return { success: false, message: error.message };
  }

  revalidateMemberRoutes();
  return { success: true };
}

export async function resetMemberPassword(formData) {
  const client = assertServiceRole();
  if (!client) {
    return { success: false, message: "Enable SUPABASE_SERVICE_ROLE_KEY to reset passwords." };
  }

  const email = formData.get("email");
  if (!email) {
    return { success: false, message: "Member email is required." };
  }

  const redirectTo = `${siteUrl}/login`;
  const { data, error } = await client.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });

  if (error) {
    console.error("Failed to generate password reset link", error.message);
    return { success: false, message: error.message };
  }

  const link = data?.properties?.action_link;
  console.info(`Password reset link for ${email}: ${link}`);
  return { success: true };
}

export async function updateMemberProfile(prevState, formData) {
  const supabase = await getServerClient();
  if (!supabase) {
    return { status: "error", message: "Supabase is not configured.", errors: {} };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Please sign in to update your profile.", errors: {} };
  }

  const normalizeField = (value) => {
    if (typeof value !== "string") {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const payload = {
    full_name: normalizeField(formData.get("full_name")),
    title: normalizeField(formData.get("title")),
    organisation: normalizeField(formData.get("organisation")),
    email: normalizeField(formData.get("email")),
    phone: normalizeField(formData.get("phone")),
    location: normalizeField(formData.get("location")),
    sector: normalizeField(formData.get("sector")),
    job_level: normalizeField(formData.get("job_level")),
    linkedin: normalizeField(formData.get("linkedin")),
  };

  const avatar = formData.get("avatar");
  if (typeof avatar === "string") {
    payload.avatar_url = normalizeField(avatar);
  }

  Object.keys(payload).forEach((key) => {
    if (payload[key] === null || payload[key] === undefined) {
      delete payload[key];
    }
  });

  if (Object.keys(payload).length === 0) {
    return { status: "error", message: "Update at least one field.", errors: {} };
  }

  const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
  if (error) {
    console.error("Failed to update profile", error.message);
    return { status: "error", message: "We couldn't save these changes.", errors: {} };
  }

  revalidateMemberRoutes();
  revalidatePath("/profile");
  revalidatePath("/settings");

  return { status: "success", message: "Profile updated successfully.", errors: {} };
}

export async function updateDirectoryVisibility(prevState, formData) {
  const supabase = await getServerClient();
  if (!supabase) {
    return { ...directoryPreferenceInitialState, status: "error", message: "Supabase is not configured." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Please sign in to update your visibility." };
  }

  const preference = formData.get("show_in_directory")?.toString().trim();
  const showInDirectory = preference === "true" || preference === "on" || preference === "yes";

  const { data, error } = await supabase
    .from("profiles")
    .update({ show_in_directory: showInDirectory })
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to update directory preference", error.message);
    return { status: "error", message: "We couldn't update your preference. Please try again." };
  }

  if (!data) {
    return { status: "error", message: "We couldn't find your profile yet. Please contact the GC Forum team." };
  }

  revalidateMemberRoutes();

  return {
    status: "success",
    message: showInDirectory ? "You're now visible in the member directory." : "You're hidden from the member directory.",
  };
}
