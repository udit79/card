import { NextResponse } from "next/server";
import { readResult, StorageNotConfiguredError } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const result = await readResult(id);
    if (!result) return new NextResponse("Not found", { status: 404 });

    return new NextResponse(result.bytes, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) return new NextResponse("Storage not configured", { status: 503 });
    return new NextResponse("Internal Error", { status: 500 });
  }
}
