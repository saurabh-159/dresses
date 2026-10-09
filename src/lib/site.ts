export const SITE_NAME = "Dresses";

export const defaultSettings = {
  siteName: SITE_NAME,
  tagline: "Dresses, kurtis, sarees and everyday wear",
  footerBlurb:
    "A clothing store for dresses, kurtis, sarees and co-ords. Browse the collection and message us on WhatsApp to order.",
  aboutText:
    "We sell ready-to-wear clothing for everyday plans and occasions. Each piece lists its fabric, colour and sizes. If you need a size or a closer look, send the product on WhatsApp and we will help you place the order.",
  hours: "All days, 10:00 AM – 8:00 PM",
  address: "Update your store address from the admin panel",
  phone1: "",
  phone2: "",
  email: "",
  whatsapp: "",
  facebook: "",
  instagram: "",
  linkedin: "",
  logoUrl: null as string | null,
};

export function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

export function siteUrl(path = "/") {
  if (!path.startsWith("/")) {
    return `${siteOrigin()}/${path}`;
  }

  return `${siteOrigin()}${path}`;
}
