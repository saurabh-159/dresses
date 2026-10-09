import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { SITE_NAME, defaultSettings } from "@/lib/site";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: defaultSettings.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={outfit.variable}>{children}</body>
    </html>
  );
}
