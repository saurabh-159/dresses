import Link from "next/link";
import Container from "@/components/ui/Container";
import { SITE_NAME } from "@/lib/site";

export default function NotFound() {
  return (
    <section className="py-24">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-stone-500">{SITE_NAME}</p>
          <h1 className="mt-4 text-6xl font-extrabold">404</h1>
          <h2 className="mt-4 text-2xl font-bold">Page not found</h2>
          <p className="mt-3 text-stone-500">That page or piece is not in the store.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/" className="rounded-xl bg-blush px-6 py-3 font-semibold text-stone-800">
              Home
            </Link>
            <Link href="/shop" className="rounded-xl border border-stone-200 px-6 py-3 font-semibold">
              Shop
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
