import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SiteChrome from "@/components/layout/SiteChrome";
import TopBar from "@/components/layout/TopBar";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { getCategoryTree, getSiteSettings } from "@/lib/db/queries";
import { defaultSettings } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getCategoryTree(),
  ]);

  const siteSettings = {
    siteName: settings?.siteName || defaultSettings.siteName,
    logoUrl: settings?.logoUrl || null,
    tagline: settings?.tagline || defaultSettings.tagline,
    hours: settings?.hours || defaultSettings.hours,
    address: settings?.address || defaultSettings.address,
    phone1: settings?.phone1 || "",
    phone2: settings?.phone2 || "",
    email: settings?.email || "",
    whatsapp: settings?.whatsapp || "",
    facebook: settings?.facebook || "",
    instagram: settings?.instagram || "",
    linkedin: settings?.linkedin || "",
    footerBlurb: settings?.footerBlurb || defaultSettings.footerBlurb,
  };

  return (
    <>
      <SiteChrome
        topBar={
          <TopBar
            tagline={siteSettings.tagline}
            hours={siteSettings.hours}
            phone1={siteSettings.phone1}
            phone2={siteSettings.phone2}
          />
        }
      >
        <Header
          settings={{
            siteName: siteSettings.siteName,
            logoUrl: siteSettings.logoUrl,
            whatsapp: siteSettings.whatsapp,
          }}
          categories={categories}
        />
      </SiteChrome>

      <div>{children}</div>

      <Footer settings={siteSettings} categories={categories} />

      {siteSettings.whatsapp ? (
        <WhatsAppButton phone={siteSettings.whatsapp} />
      ) : null}
    </>
  );
}
