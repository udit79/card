import type { Metadata } from "next";
import Link from "next/link";
import { readResult, StorageNotConfiguredError } from "@/lib/storage";

interface Props {
  params: Promise<{ id: string }>;
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const ogUrl = `${getBaseUrl()}/api/og/${id}`;
  return {
    title: "My HH Goa 2026 Builder ID",
    description: "Building, shipping, and showing up in Goa. #FrameInGoa",
    openGraph: {
      title: "My HH Goa 2026 Builder ID",
      description: "Building, shipping, and showing up in Goa. #FrameInGoa",
      images: [{ url: ogUrl, width: 1080, height: 1350, alt: "HH Goa 2026 Builder ID" }],
    },
    twitter: { card: "summary_large_image", images: [ogUrl] },
  };
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params;
  let imageUrl: string | null = null;
  try {
    if (await readResult(id)) imageUrl = `/api/og/${id}`;
  } catch (error) {
    if (!(error instanceof StorageNotConfiguredError)) console.error("Failed to read result", error);
  }

  return (
    <main className="max-w-md mx-auto min-h-screen bg-brand-primary p-4 md:p-8 flex flex-col gap-6 items-center">
      <header className="text-center space-y-2 mt-4">
        <h1 className="font-display text-4xl uppercase text-brand-offwhite leading-none">Builder ID Ready</h1>
      </header>
      <section className="w-full bg-brand-offwhite rounded-2xl p-4 shadow-offset flex flex-col gap-6">
        {imageUrl ? (
          <div className="relative w-full aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden shadow-inner border-2 border-brand-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Generated ID Card" className="w-full h-full object-contain bg-brand-primary" />
          </div>
        ) : (
          <div className="aspect-[4/5] bg-gray-200 flex items-center justify-center text-brand-muted text-center p-4">Image not found or expired.</div>
        )}
        <div className="flex flex-col gap-3">
          {imageUrl && (
            <a href={imageUrl} download="hh-goa-builder-id.png" className="w-full bg-brand-pink text-brand-white uppercase font-bold py-3 px-4 rounded-none shadow-offset active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 text-center">Download PNG</a>
          )}
          <Link href="/" className="w-full bg-brand-black text-brand-white uppercase font-bold py-3 px-4 rounded-none shadow-offset active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 text-center">Make Another</Link>
        </div>
      </section>
    </main>
  );
}
