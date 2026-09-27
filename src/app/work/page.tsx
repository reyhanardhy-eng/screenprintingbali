import Topbar from "@/components/Topbar";
import Work from "@/components/Work";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import { sitePageMetadata } from "@/lib/seo-metadata";

export const metadata = sitePageMetadata("/work", "Portfolio & Project Photos", "Browse apparel printing and garment work produced by Screenprinting Bali. Ask about a similar run for your brand.");

export const revalidate = 60;

export default function WorkPage() {
  return <><Topbar /><main className="inner-page inner-page--work work-archive">
    <Work layout="editorial" headingLevel={1} title="The proof is in the print." intro="A closer look at garments, artwork, ink, and finished runs from the Bali studio." />
    <div className="container work-archive__afterword"><span>MADE IN-HOUSE · BALI, INDONESIA</span><a href="/contact">Make something for your label <span aria-hidden="true">↗</span></a></div>
    <FinalCta />
  </main><Footer /></>;
}
