import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const userAgent = request.headers.get("user-agent") ?? "unknown";
    const logEntry = {
      ...body,
      userAgent,
      receivedAt: new Date().toISOString(),
    };

    console.error("[login-debug]", JSON.stringify(logEntry));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[login-debug] failed to parse payload", error);
    return NextResponse.json({ ok: false, error: "invalid-payload" }, { status: 400 });
  }
}
