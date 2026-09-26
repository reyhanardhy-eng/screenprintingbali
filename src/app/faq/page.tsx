import Topbar from "@/components/Topbar";
import Faq from "@/components/Faq";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import { sitePageMetadata } from "@/lib/seo-metadata";

export const metadata = sitePageMetadata("/faq", "Printing Order FAQs", "Answers about minimum quantities, print methods, artwork, turnaround, samples, deposits, and shipping from Bali.");

export default function FaqPage() {
  return <><Topbar /><main className="inner-page">
    <div className="container inner-page__intro"><p className="eyebrow">FAQs / Before you order</p><h1>Clear answers for a better brief.</h1><p>Find the basics about production, pricing, samples, and delivery. If something is specific to your order, message us and we will confirm it directly.</p></div>
    <Faq />
    <FinalCta />
  </main><Footer /></>;
}
