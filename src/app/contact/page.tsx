import Link from "next/link";
import Topbar from "@/components/Topbar";
import Footer from "@/components/Footer";
import { sitePageMetadata } from "@/lib/seo-metadata";

export const metadata = sitePageMetadata("/contact", "Contact & Request a Print Quote", "Contact our Bali apparel printing studio on WhatsApp or Instagram. Send your product, quantity, artwork, deadline, and delivery destination for a quote.");

export default function ContactPage() {
  return <><Topbar /><main className="inner-page contact-page">
    <div className="container">
      <div className="inner-page__intro"><p className="eyebrow">Contact / Bali, Indonesia</p><h1>Tell us what you are making.</h1><p>Send your product, quantity, artwork or reference, required date, and delivery destination. We will help confirm the right method and prepare a quote.</p>
        <div className="contact-actions"><a className="btn" href="https://wa.me/6283174145415?text=Hi%2C%20I%27d%20like%20a%20quote%20for%20an%20apparel%20project" target="_blank" rel="noopener noreferrer">Message on WhatsApp ↗</a><a className="btn btn--ghost" href="https://instagram.com/screenprintingbali" target="_blank" rel="noopener noreferrer">Instagram ↗</a></div>
      </div>
      <div className="contact-grid">
        <section><p className="eyebrow">What to include</p><h2>Help us quote accurately.</h2><ul><li>Product or garment type</li><li>Estimated quantity and size breakdown</li><li>Artwork, reference image, colours, and print positions</li><li>Required date and where the order needs to go</li></ul></section>
        <section><p className="eyebrow">Studio hours</p><h2>When we reply.</h2><p>Monday–Saturday, 09:00–18:00 WITA</p><p>Sunday by appointment</p><p>Bali, Indonesia</p><Link href="/services">Explore production services →</Link></section>
      </div>
    </div>
  </main><Footer /></>;
}
