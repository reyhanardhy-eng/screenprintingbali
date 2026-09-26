import Topbar from "@/components/Topbar";
import Work from "@/components/Work";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import { sitePageMetadata } from "@/lib/seo-metadata";

export const metadata = sitePageMetadata("/work", "Portfolio & Project Photos", "Browse apparel printing and garment work produced by Screenprinting Bali. Ask about a similar run for your brand.");

export const revalidate = 60;

export default function WorkPage() {
  return <><Topbar /><main className="inner-page">
    <div className="container inner-page__intro"><p className="eyebrow">Selected work / Bali</p><h1>Print, made tangible.</h1><p>A selection of projects produced by our studio. Each brief has its own garment, artwork, quantity, and finish; ask us what will work for yours.</p></div>
    <Work layout="grid" title="Projects from the studio." />
    <FinalCta />
  </main><Footer /></>;
}
