import ProductCard from "@/components/product/ProductCard";
import Pagination from "@/components/category/Pagination";
import SearchField from "@/components/search/SearchField";
import { searchProducts } from "@/lib/db/queries";

export const metadata = {
  title: "Search",
};

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "", page: pageParam } = await searchParams;
  const requestedPage = Math.max(1, Math.floor(Number(pageParam || "1")) || 1);
  const data = await searchProducts(q, requestedPage, 24);
  const query = data.query;

  return (
    <main className="py-8 sm:py-14">
      <div className="container-aw">
        <h1 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">Search</h1>
        <SearchField
          key={query}
          submitLabel="Search"
          defaultValue={query}
          formClassName="mt-6 max-w-xl"
          placeholder="Name, colour, fabric or SKU"
          inputClassName="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm outline-none focus:border-stone-900 sm:px-4 sm:text-base"
        />

        <p className="mt-6 text-sm text-stone-500">
          {query
            ? `${data.total} result${data.total === 1 ? "" : "s"} for “${query}”`
            : "Type a dress name, colour or fabric."}
        </p>

        {data.products.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {data.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : query ? (
          <p className="mt-10 text-stone-600">No clothes matched that search.</p>
        ) : null}

        <Pagination
          currentPage={data.page}
          totalPages={data.totalPages}
          hrefForPage={(page) =>
            `/search?q=${encodeURIComponent(query)}&page=${page}`
          }
        />
      </div>
    </main>
  );
}
