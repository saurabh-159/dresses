import CatalogCard from "@/components/product/CatalogCard";
import Pagination from "@/components/category/Pagination";
import { getShopProducts } from "@/lib/db/queries";

export const metadata = {
  title: "Shop",
  description: "Browse all clothes in the store.",
};

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function ShopPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const requestedPage = Math.max(1, Math.floor(Number(pageParam || "1")) || 1);
  const data = await getShopProducts(requestedPage, 24);

  return (
    <main className="py-8 sm:py-14">
      <div className="container-aw">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-stone-500">Collection</p>
        <h1 className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-4xl">All clothes</h1>
        <p className="mt-4 max-w-2xl text-stone-600">
          Every active piece from the admin catalog. Use search if you know the name, colour or fabric.
        </p>

        {data.products.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {data.products.map((product) => (
              <CatalogCard
                key={product.id}
                product={product}
                className="[content-visibility:auto] [contain-intrinsic-size:auto_560px]"
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-stone-300 px-6 py-16 text-center">
            <h2 className="text-xl font-bold">No clothes yet</h2>
            <p className="mt-2 text-sm text-stone-500">Add categories and products from the admin panel.</p>
          </div>
        )}

        <Pagination
          currentPage={data.page}
          totalPages={data.totalPages}
          hrefForPage={(page) => `/shop?page=${page}`}
        />
      </div>
    </main>
  );
}
