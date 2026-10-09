import HeroSlider from "@/components/home/HeroSlider";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import WhyUs from "@/components/home/WhyUs";
import MeetingCta from "@/components/home/MeetingCta";
import {
  getActiveSliders,
  getFeaturedProducts,
  getHomeCategories,
  getSiteSettings,
} from "@/lib/db/queries";

export default async function HomePage() {
  const [sliders, categories, featuredProducts, settings] = await Promise.all([
    getActiveSliders(),
    getHomeCategories(),
    getFeaturedProducts(),
    getSiteSettings(),
  ]);

  return (
    <>
      <HeroSlider sliders={sliders} />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={featuredProducts} />
      <WhyUs />
      <MeetingCta
        phone={settings?.phone1 || ""}
        whatsapp={settings?.whatsapp || ""}
      />
    </>
  );
}
