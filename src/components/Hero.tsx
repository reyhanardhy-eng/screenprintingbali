import Image from "next/image";
import Link from "next/link";
import { fetchPortfolioItems } from "@/lib/portfolio";
import type { PortfolioItem } from "@/lib/portfolio-types";

const STARTING_POINTS = [
  {
    number: "01",
    title: "Build a bigger run",
    detail: "Screen printing · 24+ pieces",
    href: "/screen-printing-bali",
  },
  {
    number: "02",
    title: "Test a first piece",
    detail: "DTF printing · from 1 piece",
    href: "/dtf-printing-bali",
  },
  {
    number: "03",
    title: "Start an apparel label",
    detail: "Brand Starter · design to production",
    href: "/apparel-brand-starter-bali",
  },
];

function chooseStudioPhoto(items: PortfolioItem[]) {
  const photos = items.filter((item) => Boolean(item.image_url));
  const studioPhoto = photos.find((item) =>
    /\b(machine|equipment|press|screen|studio|workshop|ink|production|tools|squeegee)\b/i.test(
      `${item.title_line1} ${item.title_line2} ${item.meta}`
    )
  );
  return studioPhoto ?? photos[0] ?? null;
}

function RegistrationArt() {
  return (
    <svg className="hero__registration-art" viewBox="0 0 600 700" fill="none" aria-hidden="true">
      <circle cx="365" cy="330" r="208" />
      <circle cx="365" cy="330" r="164" />
      <circle cx="365" cy="330" r="4" />
      <path d="M365 86v52m0 384v52M121 330h52m384 0h52" />
      <path d="M230 156h270v350H230z" />
      <path d="M250 176h230v310H250z" strokeDasharray="4 9" />
      <path d="M188 590h330M208 610h290" />
      <path d="m230 156-24-24m294 24 24-24M230 506l-24 24m294-24 24 24" />
    </svg>
  );
}

export default async function Hero() {
  let studioPhoto: PortfolioItem | null = null;
  try {
    studioPhoto = chooseStudioPhoto(await fetchPortfolioItems());
  } catch {
    // Keep the studio illustration visible while the portfolio database is unavailable.
  }

  return (
    <section className="hero hero--editorial">
      <div className="container hero__layout">
        <div className="hero__copy">
          <div className="hero__spec">
            <span>Printed in-house</span>
            <span>Built for brands</span>
            <span>Bali, Indonesia</span>
          </div>
          <p className="hero__overline">A good idea deserves a real print room.</p>
          <h1>
            <span className="line">Print your</span>
            <span className="line">
              <span className="misreg" data-text="brand">brand</span>
            </span>
            {" "}
            <span className="line hero__last-line">in Bali<span className="hero__period">.</span></span>
          </h1>
          <p className="hero__sub">
            Screen printing, DTF, and hands-on apparel production for labels
            with something to say. Start with a sample or build the full run.
          </p>
          <div className="hero__cta">
            <Link href="/contact" className="btn">Start a project <span aria-hidden="true">↗</span></Link>
            <Link href="/services" className="btn btn--ghost">Find your print method</Link>
          </div>
          <span className="hero__micro-note">No large production brief needed to get started.</span>
        </div>

        <div className="hero__visual" aria-label="Inside the Screenprinting Bali studio">
          <div className="hero__visual-frame">
            {studioPhoto?.image_url ? (
              <Image
                src={studioPhoto.image_url}
                alt={`${studioPhoto.title_line1} ${studioPhoto.title_line2} ${studioPhoto.meta}`.trim()}
                fill
                priority
                sizes="(max-width: 720px) 100vw, 48vw"
                className="hero__visual-photo"
              />
            ) : (
              <div className="hero__visual-illustration">
                <RegistrationArt />
                <span className="hero__illustration-label">SCREEN / INK / BALI</span>
                <span className="hero__illustration-number">01</span>
                <span className="hero__illustration-screen" />
                <span className="hero__illustration-squeegee" />
              </div>
            )}
            <div className="hero__visual-grain" aria-hidden="true" />
            <div className="hero__visual-caption">
              <span>FIELD NOTE 001</span>
              <span>{studioPhoto?.meta || "The work starts at the screen."}</span>
            </div>
          </div>
          <div className="hero__seal" aria-label="Made in Bali">
            <span>MADE</span>
            <span>IN</span>
            <strong>BALI</strong>
          </div>
          <span className="hero__vertical-note" aria-hidden="true">PRINT ROOM · 08°39′S 115°12′E</span>
          <span className="hero__orbit" aria-hidden="true" />
        </div>

        <nav className="hero__routes" aria-label="Choose a production route">
          <span className="hero__routes-label">Where are you in the process?</span>
          <div className="hero__routes-list">
            {STARTING_POINTS.map((point) => (
              <Link href={point.href} key={point.href}>
                <span className="hero__routes-number">{point.number}</span>
                <span className="hero__routes-copy">
                  <strong>{point.title}</strong>
                  <span>{point.detail}</span>
                </span>
                <span className="hero__routes-arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>

      <div className="hero__ticker" aria-label="Screen printing, DTF, garment finishing, and apparel production in Bali">
        <div className="hero__ticker-track" aria-hidden="true">
          <span>INK ON FABRIC <i>✳</i> SCREEN PRINT <i>✳</i> DTF &amp; SHORT RUNS <i>✳</i> BALI PRODUCTION <i>✳</i> BUILT FOR THE NEXT DROP <i>✳</i></span>
          <span>INK ON FABRIC <i>✳</i> SCREEN PRINT <i>✳</i> DTF &amp; SHORT RUNS <i>✳</i> BALI PRODUCTION <i>✳</i> BUILT FOR THE NEXT DROP <i>✳</i></span>
        </div>
      </div>
    </section>
  );
}

