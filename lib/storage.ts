import { del, list, put } from "@vercel/blob";
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const RESULT_TTL_MS = 3 * 24 * 60 * 60 * 1000;
const LOCAL_DIR = path.join(process.cwd(), ".data", "results");

export class StorageNotConfiguredError extends Error {
  constructor() {
    super("Result storage is not configured.");
    this.name = "StorageNotConfiguredError";
  }
}

function assertSafeId(id: string) {
  if (!/^[A-Za-z0-9_-]{10,32}$/.test(id)) throw new Error("Invalid result id");
}

function hasBlobStorage() {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  return Boolean(token && token !== "vercel_blob_rw_...");
}

function assertStorageAvailable() {
  if (!hasBlobStorage() && process.env.NODE_ENV === "production") {
    throw new StorageNotConfiguredError();
  }
}

function expiresAtFromName(name: string) {
  const match = name.match(/-(\d+)\.png$/);
  return match ? Number(match[1]) : 0;
}

function isExpired(name: string) {
  const expiresAt = expiresAtFromName(name);
  return !expiresAt || Date.now() >= expiresAt;
}

export async function saveResult(id: string, bytes: Uint8Array) {
  assertSafeId(id);
  assertStorageAvailable();
  const expiresAt = Date.now() + RESULT_TTL_MS;
  const filename = `${id}-${expiresAt}.png`;

  if (hasBlobStorage()) {
    await put(`hhgoa-results/${filename}`, Buffer.from(bytes), {
      access: "public",
      contentType: "image/png",
      addRandomSuffix: false,
    });
  } else {
    await mkdir(LOCAL_DIR, { recursive: true });
    await writeFile(path.join(LOCAL_DIR, filename), bytes);
  }
  return { expiresAt };
}

async function readLocalResult(id: string) {
  const names = await readdir(LOCAL_DIR).catch(() => [] as string[]);
  const name = names.find((candidate) => candidate.startsWith(`${id}-`) && candidate.endsWith(".png"));
  if (!name) return null;
  if (isExpired(name)) {
    await unlink(path.join(LOCAL_DIR, name)).catch(() => undefined);
    return null;
  }
  return { name, bytes: await readFile(path.join(LOCAL_DIR, name)) };
}

async function readBlobResult(id: string) {
  const { blobs } = await list({ prefix: `hhgoa-results/${id}-`, limit: 10 });
  const blob = blobs.find((candidate) => candidate.pathname.endsWith(".png"));
  if (!blob) return null;
  if (isExpired(blob.pathname)) {
    await del(blob.url).catch(() => undefined);
    return null;
  }
  const response = await fetch(blob.url, { cache: "no-store" });
  if (!response.ok) return null;
  return { name: blob.pathname, bytes: new Uint8Array(await response.arrayBuffer()) };
}

export async function readResult(id: string) {
  assertSafeId(id);
  assertStorageAvailable();
  return hasBlobStorage() ? readBlobResult(id) : readLocalResult(id);
}

export async function deleteResult(id: string) {
  assertSafeId(id);
  if (hasBlobStorage()) return;
  const result = await readLocalResult(id);
  if (result) await unlink(path.join(LOCAL_DIR, result.name)).catch(() => undefined);
}
