import { optimizedImageUrl } from "@/lib/images";

type MediaCoverProps = {
  imageUrl?: string | null;
  videoUrl?: string | null;
  alt: string;
  className?: string;
  imageWidth?: number;
};

export default function MediaCover({
  imageUrl,
  videoUrl,
  alt,
  className = "h-full w-full object-cover",
  imageWidth = 640,
}: MediaCoverProps) {
  if (videoUrl) {
    return (
      <video
        src={videoUrl}
        poster={imageUrl || undefined}
        muted
        loop
        playsInline
        autoPlay
        draggable={false}
        className={className}
      />
    );
  }

  if (imageUrl) {
    return (
      <img
        src={optimizedImageUrl(imageUrl, imageWidth)}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={className}
      />
    );
  }

  return null;
}
