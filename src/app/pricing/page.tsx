import Topbar from "@/components/Topbar";
import Pricing from "@/components/Pricing";
import Calculator from "@/components/Calculator";
import Footer from "@/components/Footer";
import { sitePageMetadata } from "@/lib/seo-metadata";

export const metadata = sitePageMetadata("/pricing", "Apparel Printing Prices & Calculator", "Compare starting prices for DTF, bulk screen printing, and Brand Starter projects. Use the live calculator for a ballpark quote.");

export default function PricingPage() {
  return <><Topbar /><main className="inner-page">
    <div className="container inner-page__intro"><p className="eyebrow">Pricing / Estimate your run</p><h1>Know the range before you commit.</h1><p>Prices depend on the garment, artwork, colours, print positions, quantity, and finishing. Start with the guide, then use the calculator for an estimate we can confirm against your brief.</p></div>
    <Pricing />
    <Calculator />
  </main><Footer /></>;
}
