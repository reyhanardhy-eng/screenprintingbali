import Topbar from "@/components/Topbar";
import StayMove from "@/components/StayMove";
import Paths from "@/components/Paths";
import Process from "@/components/Process";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import { sitePageMetadata } from "@/lib/seo-metadata";

export const metadata = sitePageMetadata("/studio", "Bali Apparel Printing Studio", "Learn how our in-house Bali studio handles design support, screen printing, finishing, quality checks, and delivery planning.");

export default function StudioPage() {
  return <><Topbar /><main className="inner-page">
    <div className="container inner-page__intro"><p className="eyebrow">Studio / Bali, Indonesia</p><h1>A small, hands-on production studio.</h1><p>We help brands, teams, and visitors turn an apparel idea into a considered product, with design support and production managed directly by our Bali studio.</p></div>
    <StayMove />
    <Paths />
    <Process />
    <FinalCta />
  </main><Footer /></>;
}
