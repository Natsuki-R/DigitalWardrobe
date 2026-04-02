"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string | null;
  onChange: (file: File | null) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    onChange(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      {preview ? (
        <div className="relative aspect-square w-full max-w-[200px] rounded-lg overflow-hidden border">
          <Image
            src={preview}
            alt="Preview"
            fill
            sizes="200px"
            className="object-cover"
            unoptimized={preview.startsWith("data:")}
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "aspect-square w-full max-w-[200px] rounded-lg border-2 border-dashed",
            "flex flex-col items-center justify-center gap-2 text-muted-foreground",
            "hover:border-primary/50 hover:text-primary/70 transition-colors"
          )}
        >
          <ImagePlus className="h-8 w-8" />
          <span className="text-xs">Add photo</span>
        </button>
      )}
    </div>
  );
}
