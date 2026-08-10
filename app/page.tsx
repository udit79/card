"use client";

import { useCallback, useState } from "react";
import BuilderForm from "@/components/builder-form";
import GeneratorPreview from "@/components/generator-preview";
import UploadDropzone from "@/components/upload-dropzone";
import ShareActions from "@/components/share-actions";
import type { BuilderFormData } from "@/lib/types";

export default function Home() {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<BuilderFormData>({ name: "", roles: [], title: "", frame: "SIGNAL" });
  const handleFormChange = useCallback((data: typeof formData) => setFormData(data), []);

  return (
    <main className="min-h-screen bg-brand-primary px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6">
        <header className="space-y-2 text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-brand-accent">HH Goa 2026</p>
          <h1 className="font-display text-responsive-section uppercase text-brand-offwhite leading-none">
            Builder ID
          </h1>
          <p className="mx-auto max-w-[420px] text-sm text-brand-accent md:text-base">
            Less Noise. More Signal. Make your HH Goa 2026 builder card.
          </p>
        </header>

      <section className="w-full rounded-2xl bg-brand-offwhite p-4 shadow-offset md:p-6">
        {!photoDataUrl ? (
          <UploadDropzone onUpload={setPhotoDataUrl} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(260px,0.8fr)_minmax(380px,1.2fr)] lg:items-start">
            <div className="flex flex-col gap-4">
              <div className="border-b-2 border-brand-black pb-3">
                <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-brand-pink">Builder ID / Details</p>
                <h2 className="mt-1 font-display text-3xl uppercase leading-none text-brand-black">Tell us who you are</h2>
                <p className="mt-2 font-mono text-xs leading-relaxed text-brand-black/70">These details become part of your shareable HH Goa card.</p>
              </div>
              <BuilderForm formData={formData} onChange={handleFormChange} />
            </div>

            <div className="flex flex-col gap-4">
              <GeneratorPreview
                photoDataUrl={photoDataUrl}
                formData={formData}
                onReset={() => {
                  setPhotoDataUrl(null);
                  setFinalImageUrl(null);
                }}
                onRenderComplete={setFinalImageUrl}
              />
              <ShareActions finalImageUrl={finalImageUrl} formData={formData} />
            </div>
          </div>
        )}
      </section>

      <footer className="py-2 text-center">
        <p className="text-brand-muted text-xs">4 days. one rhythm. everything intentional.</p>
      </footer>
      </div>
    </main>
  );
}
