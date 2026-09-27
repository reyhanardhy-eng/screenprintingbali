import Link from "next/link";
import Topbar from "@/components/Topbar";
import Footer from "@/components/Footer";
import { sitePageMetadata } from "@/lib/seo-metadata";

export const metadata = sitePageMetadata("/contact", "Contact & Request a Print Quote", "Contact our Bali apparel printing studio on WhatsApp or Instagram. Send your product, quantity, artwork, deadline, and delivery destination for a quote.");

export default function ContactPage() {
  return <><Topbar /><main className="inner-page inner-page--contact contact-page">
    <section className="contact-opening"><div className="container contact-opening__grid"><div className="contact-opening__copy"><p className="eyebrow">06 / Start a conversation · Bali</p><h1>Tell us what<br />you&apos;re making.</h1><p>Send the rough idea. We will help turn it into a brief we can quote and produce.</p></div><div className="contact-opening__board"><a className="contact-opening__whatsapp" href="https://wa.me/6283174145415?text=Hi%2C%20I%27d%20like%20a%20quote%20for%20an%20apparel%20project" target="_blank" rel="noopener noreferrer"><span>01 / DIRECT LINE</span><strong>Message on WhatsApp <i aria-hidden="true">↗</i></strong></a><a className="contact-opening__instagram" href="https://instagram.com/screenprintingbali" target="_blank" rel="noopener noreferrer"><span>02 / FOLLOW THE WORK</span><strong>Instagram <i aria-hidden="true">↗</i></strong></a><div className="contact-opening__hours"><span>REPLY WINDOW</span><strong>Mon–Sat<br />09:00–18:00 WITA</strong><small>Sunday by appointment · Bali, Indonesia</small></div></div></div></section>
    <div className="container">
      <div className="contact-grid">
        <section><p className="eyebrow">A good first brief</p><h2>Give us the useful bits.</h2><ul><li>Product or garment type</li><li>Estimated quantity and size breakdown</li><li>Artwork, reference image, colours, and print positions</li><li>Required date and delivery destination</li></ul></section>
        <section><p className="eyebrow">Not sure yet?</p><h2>Start with what you know.</h2><p>A product idea, rough quantity, or reference is enough. We can help narrow down the method and next step.</p><Link href="/services">Explore production services →</Link></section>
      </div>
    </div>
  </main><Footer /></>;
}
