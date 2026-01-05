"use client";

import { useState } from "react";

export default function PortraitUploadField({
  initialValue = "",
  label = "Portrait",
  name = "avatar",
  uploadEndpoint = "/api/uploads/team-avatars",
}) {
  const [value, setValue] = useState(initialValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [fallbackNotice, setFallbackNotice] = useState("");

  function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Unable to read file"));
        }
      };
      reader.onerror = () => reject(new Error("Unable to read file"));
      reader.readAsDataURL(file);
    });
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setError("");
    setFallbackNotice("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch(uploadEndpoint, {
        method: "POST",
        body,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "Upload failed");
      }
      setValue(payload.publicUrl ?? "");
    } catch (uploadError) {
      try {
        const inlineImage = await readAsDataUrl(file);
        setValue(inlineImage);
        setFallbackNotice("Upload failed, so this photo will be embedded directly. Set up the Supabase bucket for CDN hosting.");
      } catch (readerError) {
        setError(readerError.message ?? uploadError.message ?? "Upload failed");
      }
    } finally {
      setUploading(false);
    }
  }

  function handleManualChange(event) {
    setValue(event.target.value);
  }

  return (
    <div className="text-sm font-semibold text-primary-ink md:col-span-2">
      {label}
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-2xl border border-neutral-200 bg-soft text-xs text-neutral-500">
          {value ? (
            <img src={value} alt="Portrait preview" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center">No photo</span>
          )}
        </div>
        <label className="cursor-pointer rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700">
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          {uploading ? "Uploading…" : "Upload photo"}
        </label>
      </div>
      <input
        type="url"
        className="mt-3 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm font-normal text-neutral-700"
        placeholder="https://images.unsplash.com/..."
        value={value}
        onChange={handleManualChange}
      />
      <input type="hidden" name={name} value={value} />
      <p className="mt-2 text-xs text-neutral-500">
        Images upload to the Supabase bucket defined by <code>NEXT_PUBLIC_SUPABASE_AVATAR_BUCKET</code> (defaults to <code>team-avatars</code>).
      </p>
      {fallbackNotice && <p className="mt-1 text-xs text-amber-600">{fallbackNotice}</p>}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
