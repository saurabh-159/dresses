import Link from "next/link";
import { getSiteSettings } from "@/lib/db/queries";
import { defaultSettings } from "@/lib/site";

export const metadata = {
  title: "About",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const name = settings?.siteName || defaultSettings.siteName;
  const tagline = settings?.tagline || defaultSettings.tagline;
  const about = settings?.aboutText || defaultSettings.aboutText;

  return (
    <main>
      <section className="bg-white py-10 sm:py-20">
        <div className="container-aw max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-stone-500">About</p>
          <h1 className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-5xl">{name}</h1>
          <p className="mt-4 text-base leading-7 text-stone-600 sm:mt-5 sm:text-lg sm:leading-8">{tagline}</p>
        </div>
      </section>

      <section className="py-10 sm:py-16">
        <div className="container-aw max-w-3xl">
          <p className="whitespace-pre-line text-base leading-7 text-stone-700 sm:text-lg sm:leading-8">{about}</p>
          <Link
            href="/shop"
            className="mt-8 inline-flex rounded-xl bg-blush px-6 py-3.5 font-bold text-stone-800"
          >
            Browse clothes
          </Link>
        </div>
      </section>
    </main>
  );
}
