import Topbar from "@/components/Topbar";
import Faq from "@/components/Faq";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import { sitePageMetadata } from "@/lib/seo-metadata";

export const metadata = sitePageMetadata("/faq", "Printing Order FAQs", "Answers about minimum quantities, print methods, artwork, turnaround, samples, deposits, and shipping from Bali.");

export default function FaqPage() {
  return <><Topbar /><main className="inner-page inner-page--faq">
    <section className="faq-opening"><div className="container faq-opening__layout"><div><p className="eyebrow">05 / The quick answers</p><h1>Before the<br /><em>first print.</em></h1><p>Production basics, explained plainly. Still deciding? Bring us your project details and we will talk it through.</p><a href="/contact">Ask about your order <span aria-hidden="true">↗</span></a></div><ol aria-label="Question topics"><li><span>01</span> Quantity &amp; methods</li><li><span>02</span> Artwork &amp; samples</li><li><span>03</span> Timing &amp; delivery</li><li><span>04</span> Payment &amp; finishing</li></ol></div></section>
    <Faq />
    <FinalCta />
  </main><Footer /></>;
}
