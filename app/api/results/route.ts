import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { saveResult, StorageNotConfiguredError } from "@/lib/storage";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 8 * 1024 * 1024;
const PNG_PREFIX = "data:image/png;base64,";
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 10;
const requestsByIp = new Map<string, { startedAt: number; count: number }>();

function getBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NODE_ENV === "development") {
    const host = request.headers.get("host") || "localhost:3000";
    return `http://${host}`;
  }
  return "https://localhost";
}

function isRateLimited(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  if (requestsByIp.size > 10_000) {
    for (const [key, value] of requestsByIp) {
      if (now - value.startedAt >= RATE_WINDOW_MS) requestsByIp.delete(key);
    }
  }
  const current = requestsByIp.get(ip);
  if (!current || now - current.startedAt >= RATE_WINDOW_MS) {
    requestsByIp.set(ip, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT;
}

export async function POST(request: Request) {
  try {
    if (isRateLimited(request)) {
      return NextResponse.json({ error: "Too many share attempts. Try again shortly." }, { status: 429 });
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Generated image is too large." }, { status: 413 });
    }

    const rawBody = new Uint8Array(await request.arrayBuffer());
    if (rawBody.byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Generated image is too large." }, { status: 413 });
    }
    const body = JSON.parse(new TextDecoder().decode(rawBody));
    if (!body || typeof body.image !== "string" || !body.image.startsWith(PNG_PREFIX)) {
      return NextResponse.json({ error: "Missing or invalid PNG image data." }, { status: 400 });
    }

    const base64Data = body.image.slice(PNG_PREFIX.length);
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data) || base64Data.length % 4 !== 0) {
      return NextResponse.json({ error: "Invalid image encoding." }, { status: 400 });
    }

    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length === 0 || buffer.length > 6 * 1024 * 1024 || !buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
      return NextResponse.json({ error: "Invalid or oversized PNG image." }, { status: 400 });
    }

    const id = nanoid(10);
    const saved = await saveResult(id, buffer);
    const baseUrl = getBaseUrl(request);

    return NextResponse.json({
      id,
      url: `${baseUrl}/result/${id}`,
      imageUrl: `${baseUrl}/api/og/${id}`,
      expiresAt: new Date(saved.expiresAt).toISOString(),
    });
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return NextResponse.json({ error: "Sharing storage is not configured on this deployment." }, { status: 503 });
    }
    console.error("Failed to save result", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
