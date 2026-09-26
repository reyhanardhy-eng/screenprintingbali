import type { Metadata } from "next";
import LocalizedHomePage from "@/components/LocalizedHomePage";
import { localizedHomeAlternates } from "@/lib/seo-metadata";

const url = "https://screenprintingbali.com/id";

export const metadata: Metadata = {
  title: "Sablon Pakaian dan Produksi Brand di Bali",
  description: "Sablon, DTF, bordir, dan apparel untuk brand di Bali. Bahas MOQ, sampel, harga, jadwal, dan pengiriman langsung melalui WhatsApp.",
  alternates: { canonical: url, languages: localizedHomeAlternates },
  openGraph: {
    title: "Sablon Pakaian dan Produksi Brand di Bali | Screenprinting Bali",
    description: "Sablon, DTF, bordir, dan apparel untuk brand di Bali. Bahas MOQ, sampel, jadwal, dan pengiriman lewat WhatsApp.",
    url,
    siteName: "Screenprinting Bali",
    type: "website",
    locale: "id_ID",
    images: [{ url: "/images/spb_logo.png", width: 1200, height: 1200, alt: "Screenprinting Bali" }],
  },
};

export default function IndonesianHomePage() {
  return <LocalizedHomePage locale="id" />;
}
