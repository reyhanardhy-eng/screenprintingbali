import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://screenprintingbali.com"),
  title: {
    default: "Screenprinting Bali: Custom Apparel Printing, Made In-House",
    template: "%s | Screenprinting Bali",
  },
  description:
    "Premium screen printing & DTF studio in Bali for your own clothing brand. In-house production, no middlemen. Order instantly on WhatsApp. From 1 piece to full drops.",
  keywords: [
    "screen printing Bali",
    "screenprinting Bali",
    "custom t-shirt printing Bali",
    "DTF printing Bali",
    "kaos custom Bali",
    "sablon Bali",
    "clothing brand Bali",
    "custom apparel Bali",
    "print shop Bali",
    "totebag custom Bali",
  ],
  authors: [{ name: "Screenprinting Bali" }],
  alternates: {
    canonical: "https://screenprintingbali.com",
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
    title: "Screenprinting Bali: Custom Apparel Printing, Made In-House",
    description:
      "Premium screen printing & DTF studio in Bali for your own clothing brand. In-house production, no middlemen. Order instantly on WhatsApp.",
    url: "https://screenprintingbali.com",
    siteName: "Screenprinting Bali",
    type: "website",
    locale: "en_US",
    images: [{ url: "/images/spb_logo.png", width: 1200, height: 1200, alt: "Screenprinting Bali" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Screenprinting Bali: Custom Apparel Printing, Made In-House",
    description:
      "Premium screen printing & DTF studio in Bali for your own clothing brand. In-house production, no middlemen. Order instantly on WhatsApp.",
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
  priceRange: "$$",
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
    <html
      lang="en"
      className={`${bricolage.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
