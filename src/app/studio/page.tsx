import Topbar from "@/components/Topbar";
import StayMove from "@/components/StayMove";
import Process from "@/components/Process";
import StudioEquipment from "@/components/StudioEquipment";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import { sitePageMetadata } from "@/lib/seo-metadata";

export const metadata = sitePageMetadata("/studio", "Bali Apparel Printing Studio", "Learn how our in-house Bali studio handles design support, screen printing, finishing, quality checks, and delivery planning.");

export default function StudioPage() {
  return <><Topbar /><main className="inner-page inner-page--studio">
    <section className="studio-opening">
      <div className="container studio-opening__layout">
        <div className="studio-opening__copy"><p className="eyebrow">04 / The workshop · Bali, Indonesia</p><h1>Inside the<br /><em>print room.</em></h1><p>Small team, direct communication, and production kept close to the people who make it. See the tools, then see how your project moves through the studio.</p><a href="#process">See the production flow <span aria-hidden="true">↓</span></a></div>
        <div className="studio-opening__notes"><div><strong>01</strong><span>Design support</span></div><div><strong>02</strong><span>Print in-house</span></div><div><strong>03</strong><span>Check every run</span></div><p>ONE TEAM<br />FROM BRIEF TO FINISH</p></div>
      </div>
    </section>
    <StudioEquipment />
    <StayMove />
    <Process />
    <FinalCta />
  </main><Footer /></>;
}
