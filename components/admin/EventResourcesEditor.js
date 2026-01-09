"use client";

import { useMemo, useRef, useState } from "react";
import { Loader2, Paperclip, Upload } from "lucide-react";

const ACCEPTED_FILE_TYPES = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.zip,.rtf,.pages,.key,.numbers";

function formatFileSize(bytes) {
  if (!bytes || Number.isNaN(bytes)) {
    return "Unknown size";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function sanitizeTitle(filename = "Download") {
  return filename.replace(/\.[^.]+$/, "").replace(/[._-]+/g, " ").trim() || "Download";
}

function hydrateResources(initialResources) {
  return (initialResources ?? []).map((resource, index) => ({
    clientId: resource.clientId ?? resource.id ?? `existing-${index}`,
    id: resource.id ?? "",
    title: resource.title ?? sanitizeTitle(resource.filename ?? resource.fileName ?? "Download"),
    description: resource.description ?? "",
    fileUrl: resource.fileUrl ?? resource.file_url ?? "",
    storagePath: resource.storagePath ?? resource.storage_path ?? "",
    fileType: resource.fileType ?? resource.file_type ?? "",
    fileSizeBytes: resource.fileSizeBytes ?? resource.file_size_bytes ?? null,
    filename: resource.filename ?? resource.fileName ?? resource.title ?? "Download",
  }));
}

export default function EventResourcesEditor({
  initialResources = [],
  uploadEndpoint = "/api/uploads/event-resources",
}) {
  const [resources, setResources] = useState(() => hydrateResources(initialResources));
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(uploadEndpoint, {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || "Upload failed. Please try again.");
      }
      setResources((prev) => [
        ...prev,
        {
          clientId: `resource-${Date.now()}`,
          id: payload.id ?? "",
          title: sanitizeTitle(file.name),
          description: "",
          fileUrl: payload.publicUrl,
          storagePath: payload.storagePath ?? payload.path ?? "",
          fileType: payload.mimeType ?? file.type ?? "application/octet-stream",
          fileSizeBytes: payload.size ?? file.size ?? null,
          filename: payload.filename ?? file.name,
        },
      ]);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const removeResource = (clientId) => {
    setResources((prev) => prev.filter((resource) => resource.clientId !== clientId));
  };

  const updateResourceField = (clientId, field, value) => {
    setResources((prev) =>
      prev.map((resource) =>
        resource.clientId === clientId
          ? {
              ...resource,
              [field]: value,
            }
          : resource,
      ),
    );
  };

  const emptyState = resources.length === 0;
  const uploadLabel = isUploading ? "Uploading…" : "Add download";
  const totalBytes = useMemo(
    () => resources.reduce((sum, resource) => sum + (Number(resource.fileSizeBytes) || 0), 0),
    [resources],
  );

  return (
    <div className="space-y-4">
      {emptyState ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-center text-sm text-neutral-600">
          <p>Attach agendas, slide decks, or worksheets members can download after attending.</p>
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={isUploading}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {uploadLabel}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {resources.map((resource, index) => (
            <div key={resource.clientId} className="rounded-2xl border border-neutral-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-primary-ink">Download {index + 1}</p>
                  <p className="text-xs text-neutral-500">{resource.filename ?? "Unnamed"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeResource(resource.clientId)}
                  className="text-sm font-semibold text-red-600"
                >
                  Remove
                </button>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-semibold text-primary-ink">
                  Display name
                  <input
                    name="resource_title"
                    value={resource.title}
                    onChange={(event) => updateResourceField(resource.clientId, "title", event.target.value)}
                    className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2"
                    placeholder="Slides, agenda, worksheet…"
                  />
                </label>
                <label className="text-sm font-semibold text-primary-ink">
                  Description
                  <input
                    name="resource_description"
                    value={resource.description}
                    onChange={(event) => updateResourceField(resource.clientId, "description", event.target.value)}
                    className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2"
                    placeholder="Optional context for members"
                  />
                </label>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1">
                  <Paperclip className="h-4 w-4" /> {formatFileSize(resource.fileSizeBytes)}
                </span>
                <span>{resource.fileType || "Unknown type"}</span>
              </div>
              <input type="hidden" name="resource_id" value={resource.id ?? ""} />
              <input type="hidden" name="resource_url" value={resource.fileUrl ?? ""} />
              <input type="hidden" name="resource_storage_path" value={resource.storagePath ?? ""} />
              <input type="hidden" name="resource_type" value={resource.fileType ?? ""} />
              <input type="hidden" name="resource_size" value={resource.fileSizeBytes ?? ""} />
              <input type="hidden" name="resource_position" value={index} />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={isUploading}
          className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary"
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {uploadLabel}
        </button>
        <span>10 MB per file · {resources.length} attachment{resources.length === 1 ? "" : "s"}</span>
        <span className="text-neutral-400">Total {formatFileSize(totalBytes)}</span>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        onChange={handleFileSelected}
        hidden
      />
    </div>
  );
}
