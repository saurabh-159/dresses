import Link from "next/link";
import { whatsappUrl } from "@/lib/whatsapp";

type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl: string | null;
  children: CategoryNode[];
};

type SiteSettings = {
  siteName: string;
  footerBlurb: string;
  address: string;
  hours: string;
  phone1: string;
  phone2: string;
  email: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  linkedin: string;
};

type FooterProps = {
  settings: SiteSettings;
  categories: CategoryNode[];
};

export default function Footer({ settings, categories }: FooterProps) {
  const socials = [
    { label: "Facebook", href: settings.facebook },
    { label: "Instagram", href: settings.instagram },
    { label: "LinkedIn", href: settings.linkedin },
  ].filter((item) => item.href);

  return (
    <footer className="mt-20 border-t border-gold bg-paper text-stone-800">
      <div className="container-aw py-14">
        <div className="grid grid-cols-2 gap-8 md:gap-10 lg:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-2xl font-extrabold tracking-tight">
              {settings.siteName}
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-stone-600">
              {settings.footerBlurb}
            </p>

            {settings.whatsapp ? (
              <a
                href={whatsappUrl(settings.whatsapp, "Hi, I would like to order from your clothing collection.")}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex rounded-xl bg-blush px-5 py-3 text-sm font-bold text-stone-800"
              >
                Order on WhatsApp
              </a>
            ) : (
              <Link
                href="/contact"
                className="mt-6 inline-flex rounded-xl bg-blush px-5 py-3 text-sm font-bold text-stone-800"
              >
                Contact the store
              </Link>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
              Categories
            </h3>
            <div className="mt-5 space-y-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="block text-sm text-stone-600 hover:text-wine"
                >
                  {category.name}
                </Link>
              ))}
              <Link href="/shop" className="block text-sm text-stone-600 hover:text-wine">
                All clothes
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
              Explore
            </h3>
            <div className="mt-5 space-y-3">
              <Link href="/" className="block text-sm text-stone-600 hover:text-wine">Home</Link>
              <Link href="/shop" className="block text-sm text-stone-600 hover:text-wine">Shop</Link>
              <Link href="/about" className="block text-sm text-stone-600 hover:text-wine">About</Link>
              <Link href="/contact" className="block text-sm text-stone-600 hover:text-wine">Contact</Link>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
              Contact
            </h3>
            <div className="mt-5 space-y-4 text-sm leading-6 text-stone-600">
              {settings.address ? <p>{settings.address}</p> : null}
              {settings.hours ? <p>{settings.hours}</p> : null}
              <div>
                {settings.phone1 ? (
                  <a href={`tel:${settings.phone1}`} className="block hover:text-gold">
                    {settings.phone1}
                  </a>
                ) : null}
                {settings.phone2 ? (
                  <a href={`tel:${settings.phone2}`} className="block hover:text-gold">
                    {settings.phone2}
                  </a>
                ) : null}
              </div>
              {settings.email ? (
                <a href={`mailto:${settings.email}`} className="block break-all hover:text-gold">
                  {settings.email}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-200">
        <div className="container-aw flex flex-col gap-3 py-5 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
          {socials.length > 0 ? (
            <div className="flex items-center gap-4">
              {socials.map((item) => (
                <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="hover:text-gold">
                  {item.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
