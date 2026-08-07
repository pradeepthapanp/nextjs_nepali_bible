"use client";

import { useRef } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedImage } from "./featured-image";
import { cn } from "@/utils/cn";

export interface ImageUploaderProps {
  /** The current featured-image URL (the editor draft's `featuredImage`). */
  value?: string;
  /**
   * Fired with the picked File. The page wires this to
   * `useArticleEditor().uploadFeaturedImage` (the SHARED UploadService) — no
   * upload logic lives here.
   */
  onFileSelected: (file: File) => void;
  uploading?: boolean;
  /** 0..1 upload progress (from the editor hook's `upload` state). */
  progress?: number;
  error?: string;
  className?: string;
}

/**
 * ImageUploader — the featured-image picker/uploader for the editor (the web
 * replacement of Flutter's `_pickImage` + the upload progress card). Purely
 * presentational: it shows the current `FeaturedImage`, a hidden file input,
 * the upload progress and any error. Uploading is delegated to the page via
 * `onFileSelected` (which calls the shared `UploadService` through
 * `useArticleEditor`) — no upload logic is duplicated here.
 */
export function ImageUploader({
  value,
  onFileSelected,
  uploading = false,
  progress = 0,
  error,
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className={cn("space-y-2", className)}>
      <FeaturedImage
        src={value}
        alt="Featured image"
        fit="contain"
        className="h-40 w-full rounded-lg"
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileSelected(file);
          event.target.value = "";
        }}
      />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus />
          {value ? "Change image" : "Add featured image"}
        </Button>
        {uploading ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" aria-hidden />
            {Math.round(progress * 100)}%
          </span>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
