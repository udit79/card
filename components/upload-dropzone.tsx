"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";

interface UploadDropzoneProps {
  onUpload: (dataUrl: string) => void;
}

export default function UploadDropzone({ onUpload }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setError(null);
    setIsLoading(true);

    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File is too large (max 10MB)");
      }

      const isSupportedRaster = file.type === "image/jpeg" || file.type === "image/png";
      const isHeic = file.type === "image/heic" || file.type === "image/heif" || /\.(heic|heif)$/i.test(file.name);
      if (!isSupportedRaster && !isHeic) {
        throw new Error("Please upload a JPG, PNG, or HEIC image");
      }

      let processedFile = file;

      // Handle HEIC
      if (isHeic) {
        const heic2any = (await import("heic2any")).default;
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.8,
        });
        
        // heic2any might return an array of blobs if it's an image sequence
        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        processedFile = new File([blob], file.name.replace(/\.heic$/i, ".jpg"), {
          type: "image/jpeg",
        });
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Could not read the selected image"));
        reader.onload = () => {
          if (typeof reader.result === "string") resolve(reader.result);
          else reject(new Error("Could not read the selected image"));
        };
        reader.readAsDataURL(processedFile);
      });
      onUpload(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process image");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`w-full aspect-square md:aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors ${
        isDragging 
          ? "border-brand-pink bg-brand-pink/5" 
          : "border-brand-muted hover:border-brand-black"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/heic,image/heif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
          e.currentTarget.value = "";
        }}
      />
      
      <div className="bg-brand-pink text-brand-white p-4 rounded-full mb-4 shadow-brutalist">
        <Upload size={32} />
      </div>
      
      <h3 className="font-display text-2xl uppercase font-bold mb-2">Upload Photo</h3>
      <p className="text-brand-muted text-sm max-w-[200px] font-mono">
        {isLoading ? "Processing..." : "Tap or drop a JPG, PNG, or HEIC."}
      </p>
      
      {error && (
        <p className="text-brand-pink mt-4 font-bold text-sm bg-brand-pink/10 px-3 py-1 rounded">
          {error}
        </p>
      )}
    </div>
  );
}
