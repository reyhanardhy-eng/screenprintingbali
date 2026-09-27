import Topbar from "@/components/Topbar";
import Pricing from "@/components/Pricing";
import Calculator from "@/components/Calculator";
import Footer from "@/components/Footer";
import { sitePageMetadata } from "@/lib/seo-metadata";

export const metadata = sitePageMetadata("/pricing", "Apparel Printing Prices & Calculator", "Compare starting prices for DTF, bulk screen printing, and Brand Starter projects. Use the live calculator for a ballpark quote.");

export default function PricingPage() {
  return <><Topbar /><main className="inner-page inner-page--pricing">
    <section className="pricing-opening">
      <div className="container">
        <div className="pricing-opening__rail"><span>02 / Pricing desk</span><span>Estimate first · Confirm on WhatsApp</span></div>
        <div className="pricing-opening__main">
          <h1>Price it<br /><em>yourself.</em></h1>
          <div className="pricing-opening__copy"><p>Start with the garment and print method. Adjust the run until you find a range that makes sense for your launch.</p><a className="pricing-opening__link" href="#calculator">Open the live calculator <span aria-hidden="true">↓</span></a><div className="pricing-opening__orbit" aria-hidden="true"><span>01</span><span>24+</span><span>∞</span><i /></div></div>
        </div>
        <div className="pricing-opening__scale"><span>01 piece <strong>DTF sample</strong></span><span>24+ pieces <strong>Screen print run</strong></span><span>Project based <strong>Brand Starter</strong></span></div>
      </div>
    </section>
    <Pricing />
    <Calculator />
  </main><Footer /></>;
}
