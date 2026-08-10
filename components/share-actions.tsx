"use client";

import { Download, Share2, Link } from "lucide-react";
import { useRef, useState } from "react";
import type { BuilderFormData } from "@/lib/types";

export default function ShareActions({ finalImageUrl, formData }: { finalImageUrl: string | null; formData: BuilderFormData }) {
  const [isSharing, setIsSharing] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const shareStartedRef = useRef(false);

  const createShareLink = async () => {
    if (!finalImageUrl) throw new Error("No generated image is ready");
    const res = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: finalImageUrl }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) throw new Error(data.error || 'Failed to generate link.');
    return data.url as string;
  };

  const handleDownload = () => {
    if (!finalImageUrl) return;
    const a = document.createElement("a");
    a.href = finalImageUrl;
    a.download = "hh-goa-builder-id.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShareToX = async () => {
    if (!finalImageUrl || shareStartedRef.current) return;
    shareStartedRef.current = true;
    setIsSharing(true);
    try {
      const url = await createShareLink();
      if (url) {
        const frameEmoji = formData.frame === "COASTAL CIRCUIT" ? "🌊" : formData.frame === "ON-CHAIN" ? "⛓️" : "📡";
        const text = encodeURIComponent(
          `My HH Goa 2026 Builder ID is locked in. ${frameEmoji}\n\n${formData.title || "Builder"} · ${formData.frame}\n\nBuilding weird things, shipping fast, and bringing them to Goa. ⚡\n\nYou can have yours too: https://builderid.vercel.app/\n\n#FrameInGoa`,
        );
        const shareUrl = `https://x.com/intent/post?text=${text}&url=${encodeURIComponent(url)}`;
        // Use one anchor activation so only one X tab is opened.
        const anchor = document.createElement("a");
        anchor.href = shareUrl;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      }
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'Failed to prepare share link.');
    } finally {
      shareStartedRef.current = false;
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!finalImageUrl) return;
    setIsCopying(true);
    try {
      const url = await createShareLink();
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } else {
        throw new Error('Clipboard access is unavailable.');
      }
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'Failed to generate link.');
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button 
        onClick={handleDownload}
        disabled={!finalImageUrl || isSharing || isCopying}
        className="w-full bg-brand-pink text-brand-white uppercase font-bold py-3 px-4 rounded-none shadow-offset active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Download size={20} />
        Download PNG
      </button>
      
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={handleShareToX}
          disabled={!finalImageUrl || isSharing || isCopying}
          className="bg-brand-black text-brand-white uppercase font-bold py-3 px-4 rounded-none shadow-offset active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          <Share2 size={16} />
          {isSharing ? 'Preparing...' : 'Share to X'}
        </button>
        <button 
          onClick={handleCopyLink}
          disabled={!finalImageUrl || isSharing || isCopying}
          className="bg-brand-accent text-brand-black uppercase font-bold py-3 px-4 rounded-none shadow-offset active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          <Link size={16} />
          {isCopying ? 'Copying...' : 'Copy Link'}
        </button>
      </div>
    </div>
  );
}
