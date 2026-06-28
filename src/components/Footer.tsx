import Image from "next/image";

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
            <p>A design-led screen printing studio. Bali, Indonesia.</p>
          </div>
          <div className="footer__col">
            <h5>Studio</h5>
            <a href="#methods">Methods</a>
            <a href="#work">Work</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
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
        </div>
      </div>
    </footer>
  );
}
