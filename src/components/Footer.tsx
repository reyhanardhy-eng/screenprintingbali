import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__col">
            <div className="footer__brand">
              <Image
                src="/images/spb_logo_footer.png"
                alt="Screenprinting Bali"
                width={56}
                height={56}
              />
              <span>
                Screenprinting
                <br />
                Bali.
              </span>
            </div>
            <p>In-house screen printing studio. Bali, Indonesia.</p>
          </div>
          <div className="footer__col">
            <h5>Studio</h5>
            <Link href="/services">Services</Link>
            <Link href="/work">Portfolio</Link>
            <Link href="/pricing">Pricing &amp; calculator</Link>
            <Link href="/studio">Studio</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/screen-printing-bali">Screen printing for brands</Link>
            <Link href="/dtf-printing-bali">DTF printing</Link>
            <Link href="/apparel-brand-starter-bali">Brand Starter</Link>
          </div>
          <div className="footer__col">
            <h5>Find us</h5>
            <a href="https://wa.me/6283174145415" target="_blank" rel="noopener">
              WhatsApp
            </a>
            <a
              href="https://instagram.com/screenprintingbali"
              target="_blank"
              rel="noopener"
            >
              Instagram
            </a>
          </div>
          <div className="footer__col">
            <h5>Hours</h5>
            <p>
              Mon–Sat
              <br />
              09:00–18:00 WITA
            </p>
            <p>Sun by appointment</p>
          </div>
        </div>
        <div className="footer__legal">
          <span>© 2026 Screenprinting Bali</span>
          <span>Designed &amp; printed in Bali</span>
          <nav className="footer__languages" aria-label="Choose language">
            <span>Language</span>
            <Link href="/">English</Link>
            <Link href="/id" lang="id">Bahasa Indonesia</Link>
            <Link href="/zh-cn" lang="zh-Hans">简体中文</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
