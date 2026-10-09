import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryShowcase from "@/components/category/CategoryShowcase";
import Pagination from "@/components/category/Pagination";
import MediaCover from "@/components/media/MediaCover";
import CatalogCard from "@/components/product/CatalogCard";
import {
  getCategoryBySlug,
  getCategoryProductsPage,
  getChildCategories,
  getRelatedCategories,
  getSiteSettings,
} from "@/lib/db/queries";
import { SITE_NAME } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "Category" };
  }

  return {
    title: category.name,
    description: `Shop ${category.name} from the collection.`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  let requestedPage = Number(pageParam || "1");
  if (!Number.isFinite(requestedPage)) {
    requestedPage = 1;
  }
  requestedPage = Math.max(1, Math.floor(requestedPage));

  const [children, data, related, settings] = await Promise.all([
    getChildCategories(category.id),
    getCategoryProductsPage(category.id, requestedPage, 12),
    getRelatedCategories(category.id, category.parent?.id || null),
    getSiteSettings(),
  ]);

  const siteName = settings?.siteName || SITE_NAME;
  const hasMedia = Boolean(category.videoUrl || category.imageUrl);

  return (
    <main className="bg-white">
      <div className="container-aw py-6 md:py-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-stone-500 md:text-sm">
          <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-stone-900">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
          <Chevron />
          {category.parent ? (
            <Link href={`/category/${category.parent.slug}`} className="transition-colors hover:text-stone-900">
              {category.parent.name}
            </Link>
          ) : (
            <Link href="/shop" className="transition-colors hover:text-stone-900">
              Shop
            </Link>
          )}
          <Chevron />
          <span className="font-semibold text-stone-900">{category.name}</span>
        </nav>

        <section className="relative mb-8 overflow-hidden rounded-[1.25rem] md:mb-10 md:rounded-[1.5rem]">
          <div className="absolute inset-0 bg-stone-800">
            {hasMedia ? (
              <MediaCover
                imageUrl={category.imageUrl}
                videoUrl={category.videoUrl}
                alt=""
                imageWidth={1600}
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-stone-700 via-stone-800 to-stone-950" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/15" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 flex min-h-[200px] flex-col justify-end px-6 py-8 sm:min-h-[240px] sm:px-8 md:min-h-[280px] md:px-10 md:py-10">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                {data.total} {data.total === 1 ? "piece" : "pieces"}
              </p>
            </div>
            <h1 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-none">
              {category.name}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75 md:text-[15px]">
              Shop our {category.name.toLowerCase()} collection.
            </p>
          </div>
        </section>

        {children.length > 0 ? (
          <CategoryShowcase
            eyebrow="Types"
            title={`Shop ${category.name}`}
            description="Open a type to see those pieces."
            categories={children.map((child) => ({
              ...child,
              label: category.name,
            }))}
            className="mb-10 md:mb-12"
          />
        ) : null}

        {data.products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {data.products.map((product) => (
              <CatalogCard
                key={product.id}
                product={product}
                className="[content-visibility:auto] [contain-intrinsic-size:auto_560px]"
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-black/[0.06] bg-[#faf7f3] px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-stone-950">No pieces in this category yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
              Nothing is listed here yet. Explore the rest of the edit.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-full bg-stone-950 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Browse the shop
            </Link>
          </div>
        )}

        <Pagination
          currentPage={data.page}
          totalPages={data.totalPages}
          hrefForPage={(page) => `/category/${slug}?page=${page}`}
        />

        <CategoryShowcase
          eyebrow="Collections"
          title="Explore more"
          description={`Other looks from the ${siteName} edit`}
          action={{ href: "/shop", label: "Shop all" }}
          categories={related.map((item) => ({
            ...item,
            label: item.parentName || "Collection",
          }))}
          className="mt-14 border-t border-stone-200/80 pt-12 md:mt-16 md:pt-14"
        />
      </div>
    </main>
  );
}

function Chevron() {
  return (
    <svg className="h-3.5 w-3.5 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
