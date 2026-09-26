import Link from "next/link";

const STARTING_POINTS = [
  {
    number: "01",
    title: "Screen printing",
    detail: "For larger runs, from 24 pieces.",
    href: "/screen-printing-bali",
  },
  {
    number: "02",
    title: "DTF printing",
    detail: "For samples and short runs, from one piece.",
    href: "/dtf-printing-bali",
  },
  {
    number: "03",
    title: "Apparel Brand Starter",
    detail: "For building an apparel label from an idea.",
    href: "/apparel-brand-starter-bali",
  },
];

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero__layout">
        <div className="hero__copy">
          <div className="hero__spec">
            <span>In-house production</span>
            <span>Design-led studio</span>
            <span>Drops from 1 piece</span>
          </div>
          <h1>
            <span className="line">Print your</span>
            <span className="line">
              <span className="misreg" data-text="brand">
                brand
              </span>{" "}
              in Bali.
            </span>
          </h1>
          <p className="hero__sub">
            A design-led printing and garment studio in Bali. Explore our
            services, see real production work, and get a quote for your brand.
          </p>
          <div className="hero__cta">
            <Link href="/services" className="btn">Explore services →</Link>
            <Link href="/work" className="btn btn--ghost">See our work →</Link>
          </div>
        </div>

        <nav className="hero__routes" aria-label="Choose a production route">
          <p className="eyebrow">Find your starting point</p>
          <h2>What are you making?</h2>
          <p className="hero__routes-intro">Choose a route to see the process, timing, and details.</p>
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
    </section>
  );
}
