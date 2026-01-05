import { NextResponse } from "next/server";
import { hasServiceRoleAccess } from "../../../../lib/env";
import { getServiceRoleClient } from "../../../../lib/supabase/serverClient";

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_AVATAR_BUCKET || "team-avatars";

export const runtime = "nodejs";

export async function POST(request) {
  if (!hasServiceRoleAccess) {
    return NextResponse.json({ message: "Supabase service role key missing." }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof Blob)) {
    return NextResponse.json({ message: "Attach an image file." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const extension = file.name?.split(".").pop()?.toLowerCase() || "jpg";
  const safeName = file.name?.replace(/[^a-zA-Z0-9._-]/g, "") || "portrait";
  const baseName = safeName.replace(/\.[^.]+$/, "");
  const objectPath = `members/${Date.now()}-${Math.random().toString(36).slice(2)}-${baseName}.${extension}`;

  const client = getServiceRoleClient();
  const { data, error } = await client.storage.from(BUCKET).upload(objectPath, buffer, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) {
    console.error("Upload failed", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = client.storage.from(BUCKET).getPublicUrl(data.path);

  return NextResponse.json({ publicUrl });
}
