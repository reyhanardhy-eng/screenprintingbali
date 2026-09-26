import type { Metadata } from "next";
import "./globals.css";
import AIChatWidget from "@/components/AIChatWidget";
import { localizedHomeAlternates } from "@/lib/seo-metadata";

export const metadata: Metadata = {
  metadataBase: new URL("https://screenprintingbali.com"),
  title: {
    default: "Custom Apparel Printing in Bali for Clothing Brands",
    template: "%s | Screenprinting Bali",
  },
  description:
    "In-house screen printing, DTF, embroidery, and garment finishing in Bali for brand drops and merchandise. Check minimums and request a WhatsApp quote.",
  authors: [{ name: "Screenprinting Bali" }],
  alternates: {
    canonical: "https://screenprintingbali.com",
    languages: localizedHomeAlternates,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: "Custom Apparel Printing in Bali for Clothing Brands",
    description:
      "In-house screen printing, DTF, embroidery, and garment finishing in Bali for brand drops and merchandise. Request a WhatsApp quote.",
    url: "https://screenprintingbali.com",
    siteName: "Screenprinting Bali",
    type: "website",
    locale: "en_US",
    images: [{ url: "/images/spb_logo.png", width: 1200, height: 1200, alt: "Screenprinting Bali" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Apparel Printing in Bali for Clothing Brands",
    description:
      "In-house screen printing, DTF, embroidery, and garment finishing in Bali for brand drops and merchandise.",
    images: ["/images/spb_logo.png"],
  },
  icons: {
    icon: [
      { url: "/images/favicon_32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon_16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/images/favicon_180.png", sizes: "180x180" }],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Screenprinting Bali",
  description:
    "A design-led screen printing and garment studio in Bali. In-house production for brand drops, small runs, and one-off custom prints.",
  url: "https://screenprintingbali.com",
  image: "https://screenprintingbali.com/images/spb_logo.png",
  telephone: "+6283174145415",
  areaServed: "Bali, Indonesia",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bali",
    addressCountry: "ID",
  },
  sameAs: ["https://instagram.com/screenprintingbali"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <AIChatWidget />
      </body>
    </html>
  );
}
