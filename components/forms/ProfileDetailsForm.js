"use client";

import { useActionState } from "react";
import PortraitUploadField from "../admin/PortraitUploadField";
import { updateMemberProfile } from "../../app/(dashboard)/actions/memberActions";
import { profileDetailsInitialState } from "../../lib/memberState";

export default function ProfileDetailsForm({ profile }) {
  const [state, formAction] = useActionState(updateMemberProfile, profileDetailsInitialState);
  const disabled = !profile;
  const inputClasses = "mt-1 w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-3";

  if (!profile) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-600">
        We need to finish setting up your member record before you can edit your details. Please contact the GC Forum team.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <PortraitUploadField
        initialValue={profile?.avatar_url ?? ""}
        label="Profile photo"
        name="avatar"
        uploadEndpoint="/api/uploads/member-avatars"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Full name
          <input name="full_name" defaultValue={profile?.full_name ?? ""} required className={inputClasses} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Job title
          <input name="title" defaultValue={profile?.title ?? ""} className={inputClasses} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Organisation
          <input name="organisation" defaultValue={profile?.organisation ?? ""} className={inputClasses} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Email (directory contact)
          <input type="email" name="email" defaultValue={profile?.email ?? ""} className={inputClasses} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Phone
          <input name="phone" defaultValue={profile?.phone ?? ""} className={inputClasses} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Location
          <input name="location" defaultValue={profile?.location ?? ""} className={inputClasses} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Sector
          <input name="sector" defaultValue={profile?.sector ?? ""} className={inputClasses} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Job level
          <input name="job_level" defaultValue={profile?.job_level ?? ""} className={inputClasses} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500 md:col-span-2">
          LinkedIn URL
          <input
            type="url"
            name="linkedin"
            defaultValue={profile?.linkedin ?? ""}
            className={inputClasses}
            placeholder="https://www.linkedin.com/in/your-profile"
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={disabled}
          className="rounded-none bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white"
        >
          Save profile
        </button>
        {state.message && (
          <p className={`text-sm ${state.status === "success" ? "text-emerald-700" : "text-red-600"}`}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
