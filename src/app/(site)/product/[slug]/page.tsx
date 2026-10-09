import { notFound } from "next/navigation";
import ProductDetails from "@/components/product/ProductDetails";
import { getProductBySlug, getProductsByCategory, getSiteSettings } from "@/lib/db/queries";
import { defaultSettings, siteUrl } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product" };
  }

  return {
    title: product.name,
    description: product.description || product.name,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const settings = await getSiteSettings();
  const whatsapp = settings?.whatsapp || "";
  const category = product.category;
  const relatedProducts = category
    ? await getProductsByCategory(category.id, 4, product.id)
    : [];
  const storeName = settings?.siteName || defaultSettings.siteName;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    image: product.images[0]?.url ? [product.images[0].url] : [],
    description: product.description || product.name,
    color: product.color || undefined,
    brand: { "@type": "Brand", name: storeName },
    url: siteUrl(`/product/${product.slug}`),
  };

  return (
    <main>
      <ProductDetails
        product={{
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          priceText: product.priceText,
          description: product.description,
          sizes: product.sizes,
          fabric: product.fabric,
          color: product.color,
          minQty: product.minQty || 1,
          images: product.images,
          videos: product.videos,
          variants: product.variants,
        }}
        category={
          category
            ? {
                name: category.name,
                slug: category.slug,
                parent: category.parent,
              }
            : null
        }
        related={relatedProducts}
        whatsapp={whatsapp}
        storeName={storeName}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
    </main>
  );
}
