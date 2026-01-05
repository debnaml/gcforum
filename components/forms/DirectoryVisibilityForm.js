"use client";

import { useActionState } from "react";
import { updateDirectoryVisibility } from "../../app/(dashboard)/actions/memberActions";
import { directoryPreferenceInitialState } from "../../lib/memberState";

export default function DirectoryVisibilityForm({ defaultVisible = true, disabled = false }) {
  const [state, formAction] = useActionState(updateDirectoryVisibility, directoryPreferenceInitialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-3">
        <label className="flex items-center gap-3 text-sm text-neutral-700">
          <input
            type="radio"
            name="show_in_directory"
            value="true"
            defaultChecked={defaultVisible}
            disabled={disabled}
          />
          Show my profile in the member directory
        </label>
        <label className="flex items-center gap-3 text-sm text-neutral-700">
          <input
            type="radio"
            name="show_in_directory"
            value="false"
            defaultChecked={!defaultVisible}
            disabled={disabled}
          />
          Hide my profile from the directory
        </label>
        <p className="text-xs text-neutral-500">
          Changes take effect immediately for visitors browsing the directory.
        </p>
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-primary/40"
      >
        Save preference
      </button>
      {state.message && (
        <p className={`text-sm ${state.status === "success" ? "text-emerald-700" : "text-red-600"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
