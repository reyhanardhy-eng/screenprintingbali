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
          A design-led screen printing &amp; garment studio for the drop
          you&apos;ve been planning. Eight years of design, two rotary
          presses, one island. Designed and printed in-house, not outsourced.
        </p>
        <div className="hero__cta">
          <a href="#pricing" className="btn">
            Start your order →
          </a>
          <a href="#work" className="btn btn--ghost">
            See our work →
          </a>
        </div>
      </div>
    </section>
  );
}
