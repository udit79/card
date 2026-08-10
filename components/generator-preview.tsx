"use client";

import { useEffect, useRef, useState } from "react";
import { drawIdCard } from "@/lib/image/compositor";
import { RefreshCcw, RotateCcw } from "lucide-react";
import Image from "next/image";
import type { BuilderFormData, PhotoAdjustments } from "@/lib/types";

const DEFAULT_ADJUSTMENTS: PhotoAdjustments = { zoom: 1.25, offsetX: 0, offsetY: 0 };

interface GeneratorPreviewProps {
  photoDataUrl: string;
  formData: BuilderFormData;
  onReset: () => void;
  onRenderComplete?: (dataUrl: string) => void;
}

export default function GeneratorPreview({
  photoDataUrl,
  formData,
  onReset,
  onRenderComplete,
}: GeneratorPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastRenderedTitleRef = useRef<string | null>(null);
  const [phase, setPhase] = useState<"rendering" | "stamping" | "ready">("rendering");
  const [adjustments, setAdjustments] = useState<PhotoAdjustments>(DEFAULT_ADJUSTMENTS);

  useEffect(() => {
    let active = true;
    
    let stampTimer: number | undefined;
    const debounceTimer = window.setTimeout(async () => {
      setPhase("rendering");
      if (canvasRef.current && photoDataUrl) {
        try {
          await Promise.race([document.fonts.ready, new Promise((resolve) => window.setTimeout(resolve, 120))]);
          await drawIdCard(
            canvasRef.current,
            photoDataUrl,
            formData.name,
            formData.roles,
            formData.title,
            formData.frame,
            "/brand/HackerHouseLogo.png",
            adjustments,
          );
          if (active && onRenderComplete) {
            onRenderComplete(canvasRef.current.toDataURL("image/png"));
          }
          if (active) {
            const titleChanged = Boolean(formData.title.trim()) && lastRenderedTitleRef.current !== formData.title;
            lastRenderedTitleRef.current = formData.title;
            if (titleChanged) {
              setPhase("stamping");
              stampTimer = window.setTimeout(() => active && setPhase("ready"), 1400);
            } else {
              setPhase("ready");
            }
          }
        } catch (e) {
          console.error("Failed to render canvas", e);
          if (active) setPhase("ready");
        }
      }
    }, 120);

    return () => {
      active = false;
      window.clearTimeout(debounceTimer);
      if (stampTimer) window.clearTimeout(stampTimer);
    };
  }, [photoDataUrl, formData, adjustments, onRenderComplete]);

  function updateAdjustment(key: keyof PhotoAdjustments, value: number) {
    setAdjustments((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-end">
        <label className="block text-xs font-bold text-brand-black uppercase">
          Preview
        </label>
        <button
          onClick={onReset}
          className="text-xs flex items-center gap-1 text-brand-muted hover:text-brand-pink transition-colors uppercase font-bold"
        >
          <RefreshCcw size={12} />
          Change Photo
        </button>
      </div>

      <div className="relative w-full aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden shadow-inner border-2 border-brand-black">
        {phase !== "ready" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-brand-primary/90">
            {phase === "rendering" ? (
              <div className="hh-loader flex flex-col items-center gap-3 text-center text-brand-offwhite">
                <span className="hh-loader-ring" aria-hidden="true" />
                <span className="font-mono text-xs font-bold uppercase tracking-[0.18em]">Building your ID</span>
                <span className="font-mono text-[10px] uppercase text-brand-accent">Loading signal...</span>
              </div>
            ) : (
              <div className="hh-stamp flex items-center gap-3 border-4 border-brand-pink bg-brand-offwhite px-4 py-3 text-brand-black shadow-[5px_5px_0_#000]">
                <Image src="/brand/HackerHouseLogo.png" alt="" width={56} height={56} className="h-14 w-14 object-cover" />
                <div className="text-left">
                  <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-brand-pink">Hacker House Goa</span>
                  <span className="block max-w-[180px] truncate font-display text-2xl uppercase leading-none">{formData.name || "Builder"}</span>
                  <span className="block font-mono text-[11px] font-bold uppercase text-brand-black mt-1 leading-tight">{formData.title}</span>
                  <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-brand-primary mt-1">HH GOA 2026</span>
                </div>
              </div>
            )}
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain bg-brand-primary"
        />
      </div>
      <div className="grid gap-3 border-2 border-brand-black bg-brand-white p-3 text-brand-black">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.12em]">Adjust photo in frame</p>
          <button
            type="button"
            onClick={() => setAdjustments(DEFAULT_ADJUSTMENTS)}
            className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase text-brand-primary hover:text-brand-pink"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
        <label className="grid grid-cols-[82px_1fr_40px] items-center gap-2 font-mono text-[10px] font-bold uppercase">
          Zoom
          <input type="range" min="1" max="2.5" step="0.01" value={adjustments.zoom} onChange={(event) => updateAdjustment("zoom", Number(event.target.value))} className="accent-brand-pink" />
          <span className="text-right">{Math.round(adjustments.zoom * 100)}%</span>
        </label>
        <label className="grid grid-cols-[82px_1fr_40px] items-center gap-2 font-mono text-[10px] font-bold uppercase">
          Left / right
          <input type="range" min="-1" max="1" step="0.01" value={adjustments.offsetX} onChange={(event) => updateAdjustment("offsetX", Number(event.target.value))} className="accent-brand-pink" />
          <span className="text-right">{Math.round(adjustments.offsetX * 100)}%</span>
        </label>
        <label className="grid grid-cols-[82px_1fr_40px] items-center gap-2 font-mono text-[10px] font-bold uppercase">
          Up / down
          <input type="range" min="-1" max="1" step="0.01" value={adjustments.offsetY} onChange={(event) => updateAdjustment("offsetY", Number(event.target.value))} className="accent-brand-pink" />
          <span className="text-right">{Math.round(adjustments.offsetY * 100)}%</span>
        </label>
      </div>
    </div>
  );
}
