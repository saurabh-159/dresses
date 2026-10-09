"use client";

import { useRef, useState } from "react";

type UploadedImage = {
  fileId: string;
  url: string;
  filePath: string;
};

type ImageUploaderProps = {
  folder: string;
  multiple?: boolean;
  kind?: "image" | "video";
  onUpload: (images: UploadedImage[]) => void;
};

export default function ImageUploader({
  folder,
  multiple = false,
  kind = "image",
  onUpload,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    try {
      setUploading(true);
      setError("");

      const uploaded: UploadedImage[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("folder", folder);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Upload failed"
          );
        }

        uploaded.push({
          fileId: data.fileId,
          url: data.url,
          filePath: data.filePath,
        });

        if (!multiple) {
          break;
        }
      }

      onUpload(uploaded);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={kind === "video" ? "video/*" : "image/*"}
        multiple={multiple}
        onChange={handleFiles}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded-xl border border-[var(--theme-accent)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--theme-accent-dark)] transition hover:bg-blush hover:text-[var(--theme-on-accent)] disabled:opacity-50"
      >
        {uploading
          ? "Uploading..."
          : kind === "video"
            ? multiple
              ? "Upload Videos"
              : "Upload Video"
            : multiple
              ? "Upload Images"
              : "Upload Image"}
      </button>

      {error && (
        <p className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}