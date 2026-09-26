import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
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
    </section>
  );
}
