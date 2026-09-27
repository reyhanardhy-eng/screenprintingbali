import Topbar from "@/components/Topbar";
import Paths from "@/components/Paths";
import Methods from "@/components/Methods";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import { sitePageMetadata } from "@/lib/seo-metadata";

export const metadata = sitePageMetadata("/services", "Printing & Apparel Services in Bali", "Compare screen printing, DTF printing, embroidery, garment finishing, and apparel brand production in Bali.");

export default function ServicesPage() {
  return <><Topbar /><main className="inner-page inner-page--services">
    <section className="services-opening">
      <div className="container">
        <div className="services-opening__head">
          <div><p className="eyebrow"><span>01 / Production index</span> Bali, Indonesia</p><h1>One studio.<br /><em>Three ways to make it.</em></h1></div>
          <div className="services-opening__aside"><p>Choose the route that fits the product you have in mind. We can help settle the process, quantity, and finishing before anything goes to print.</p><a href="#methods">See every method <span aria-hidden="true">↓</span></a></div>
        </div>
        <nav className="services-route-map" aria-label="Choose a production route">
          <a className="services-route services-route--screen" href="/screen-printing-bali"><span className="services-route__number">01</span><span className="services-route__copy"><small>For a full brand drop</small><strong>Screen print</strong><span>24+ garments / planned runs</span></span><span className="services-route__arrow" aria-hidden="true">↗</span></a>
          <a className="services-route services-route--dtf" href="/dtf-printing-bali"><span className="services-route__number">02</span><span className="services-route__copy"><small>For a first sample</small><strong>DTF transfer</strong><span>From one piece / full colour</span></span><span className="services-route__arrow" aria-hidden="true">↗</span></a>
          <a className="services-route services-route--brand" href="/apparel-brand-starter-bali"><span className="services-route__number">03</span><span className="services-route__copy"><small>For a label taking shape</small><strong>Brand Starter</strong><span>Design / production / finishing</span></span><span className="services-route__arrow" aria-hidden="true">↗</span></a>
        </nav>
      </div>
      <div className="services-opening__ticker" aria-hidden="true"><span>SCREEN / DTF / EMBROIDERY / FINISHING / SCREEN / DTF / EMBROIDERY / FINISHING /</span></div>
    </section>
    <Paths />
    <Methods />
    <FinalCta />
  </main><Footer /></>;
}
