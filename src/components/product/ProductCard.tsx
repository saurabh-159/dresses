import Link from "next/link";
import { optimizedImageUrl } from "@/lib/images";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    priceText: string;
    minQty: number;
    images: { url: string }[];
    videos?: { url: string }[];
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  const firstImage = product.images[0]?.url || "";
  const firstVideo = product.videos?.[0]?.url || "";

  return (
    <Link
      href={`/product/${product.slug}`}
      className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white [content-visibility:auto] [contain-intrinsic-size:auto_420px]"
    >
      <div className="aspect-[3/4] overflow-hidden bg-stone-100">
        {firstVideo && !firstImage ? (
          <video
            src={firstVideo}
            muted
            loop
            playsInline
            autoPlay
            className="h-full w-full object-cover"
          />
        ) : firstImage ? (
          <img
            src={optimizedImageUrl(firstImage, 640)}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-stone-400">
            Photo coming soon
          </div>
        )}
      </div>
      <div className="p-3 sm:p-5">
        <h2 className="line-clamp-2 text-sm leading-snug font-bold text-stone-900 sm:min-h-12 sm:text-base">{product.name}</h2>
        <p className="mt-2 text-sm font-semibold text-stone-700 sm:mt-3">{product.priceText}</p>
        <div className="mt-3 inline-flex rounded-lg bg-blush px-2.5 py-2 text-[10px] font-bold uppercase tracking-wide text-stone-800 sm:mt-5 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-xs">
          View piece
        </div>
      </div>
    </Link>
  );
}
