import Link from "next/link";
import MediaCover from "@/components/media/MediaCover";

export type ShowcaseCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  videoUrl?: string | null;
  itemCount: number;
  label?: string | null;
};

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  categories: ShowcaseCategory[];
  action?: { href: string; label: string };
  className?: string;
};

export default function CategoryShowcase({
  eyebrow,
  title,
  description,
  categories,
  action,
  className = "",
}: Props) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-stone-900" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-900">
              {eyebrow}
            </p>
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-stone-950 md:text-2xl lg:text-[1.75rem]">
            {title}
          </h2>
          <p className="mt-1 text-sm text-stone-500">{description}</p>
        </div>
        {action ? (
          <Link
            href={action.href}
            className="group hidden items-center gap-1.5 text-sm font-medium text-stone-700 transition hover:text-stone-950 md:inline-flex"
          >
            {action.label}
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group relative aspect-[3/4] overflow-hidden rounded-[1.25rem] bg-stone-200 shadow-[0_10px_28px_-18px_rgba(0,0,0,0.45)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-16px_rgba(0,0,0,0.4)]"
          >
            {category.videoUrl || category.imageUrl ? (
              <MediaCover
                imageUrl={category.imageUrl}
                videoUrl={category.videoUrl}
                alt={category.name}
                imageWidth={640}
                className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-400 to-stone-700 text-5xl font-semibold text-white">
                {category.name.charAt(0)}
              </div>
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition duration-300 group-hover:from-black/85" />
            <span className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
              <span className="mb-1.5 block truncate text-[10px] font-medium uppercase tracking-[0.16em] text-white/75">
                {category.label || "Collection"}
              </span>
              <span className="block text-sm font-semibold leading-tight tracking-tight sm:text-base md:text-lg">
                {category.name}
              </span>
              <span className="mt-2.5 flex items-center justify-between gap-2">
                <span className="text-[11px] text-white/80">
                  {category.itemCount === 1 ? "1 item" : `${category.itemCount} items`}
                </span>
                <span className="translate-y-1.5 text-[11px] font-semibold text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  Explore →
                </span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
