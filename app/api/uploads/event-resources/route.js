import { NextResponse } from "next/server";
import { eventResourcesBucket, hasServiceRoleAccess } from "../../../../lib/env";
import { getServiceRoleClient } from "../../../../lib/supabase/serverClient";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const BUCKET = eventResourcesBucket || "event-resources";

export const runtime = "nodejs";

function sanitizeFilename(value) {
  return (value || "resource").replace(/[^a-zA-Z0-9._-]/g, "");
}

function buildObjectPath(filename) {
  const safeName = sanitizeFilename(filename);
  const extension = safeName.includes(".") ? safeName.split(".").pop()?.toLowerCase() : null;
  const baseName = safeName.replace(/\.[^.]+$/, "");
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `events/${suffix}-${baseName || "file"}.${extension || "bin"}`;
}

export async function POST(request) {
  if (!hasServiceRoleAccess) {
    return NextResponse.json({ message: "Supabase service role key missing." }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof Blob)) {
    return NextResponse.json({ message: "Attach a file before uploading." }, { status: 400 });
  }

  if (typeof file.size === "number" && file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ message: "Files must be 10 MB or smaller." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const objectPath = buildObjectPath(file.name);
  const contentType = file.type || "application/octet-stream";

  const client = getServiceRoleClient();
  const { data, error } = await client.storage.from(BUCKET).upload(objectPath, buffer, {
    contentType,
    upsert: false,
  });

  if (error) {
    console.error("Event resource upload failed", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = client.storage.from(BUCKET).getPublicUrl(data.path);

  return NextResponse.json({
    publicUrl,
    storagePath: data.path,
    path: data.path,
    mimeType: contentType,
    size: file.size ?? buffer.byteLength,
    filename: file.name,
  });
}
