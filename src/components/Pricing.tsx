export default function Pricing() {
  return (
    <section id="pricing" style={{ background: "var(--paper-deep)" }}>
      <div className="container">
        <div className="section-head section-head--center">
          <h2 className="section-head__title">Three ways to start.</h2>
        </div>

        <div className="pricing">
          <div className="tier">
            <div className="tier__label">
              <span>Tier 01</span>
              <span>Test the idea</span>
            </div>
            <h3 className="tier__title">Test the idea</h3>
            <p className="tier__desc">
              For a single piece, a sample, or just seeing what your design
              looks like in real life. Full-color DTF, no minimum, starting
              on combed 30s.
            </p>
            <div className="tier__price">
              <span className="price-prefix">Start from</span>IDR 104
              <small>k</small>
            </div>
            <div className="tier__unit">Per piece, blank included</div>
            <ul className="tier__list">
              <li>
                From <strong>1 piece</strong>
              </li>
              <li>
                Method <strong>DTF</strong>
              </li>
              <li>
                Colors <strong>Full color, no extra charge</strong>
              </li>
              <li>
                Lead time <strong>1–3 days</strong>
              </li>
            </ul>
            <div className="tier__cta">
              <a
                href="https://wa.me/6283174145415?text=Hi%2C%20I%27d%20like%20to%20test%20a%20single%20print"
                target="_blank"
                rel="noopener"
                className="btn btn--ghost"
              >
                Start small →
              </a>
            </div>
          </div>

          <div className="tier tier--featured">
            <div className="tier__label">
              <span>Tier 02</span>
              <span className="badge">Most popular</span>
            </div>
            <h3 className="tier__title">Launch your drop</h3>
            <p className="tier__desc">
              Your first proper run. Screen print on cotton tees — entry
              pricing on combed 30s, 1 color, scaling up from there as
              fabric, colors, and quantity grow.
            </p>
            <div className="tier__price">
              <span className="price-prefix">Start from</span>IDR 99
              <small>k / pc</small>
            </div>
            <div className="tier__unit">From 24 pcs, 1+ colors</div>
            <ul className="tier__list">
              <li>
                From <strong>24 pieces</strong>
              </li>
              <li>
                Method <strong>Plastisol or Rubber</strong>
              </li>
              <li>
                Screen setup{" "}
                <strong>Cheaper per piece at higher volume</strong>
              </li>
              <li>
                Lead time <strong>7–10 days</strong>
              </li>
            </ul>
            <div className="tier__cta">
              <a
                href="https://wa.me/6283174145415?text=Hi%2C%20I%27d%20like%20to%20launch%20a%20drop"
                target="_blank"
                rel="noopener"
                className="btn"
              >
                Plan your drop →
              </a>
            </div>
          </div>

          <div className="tier">
            <div className="tier__label">
              <span>Tier 03</span>
              <span>Full package</span>
            </div>
            <h3 className="tier__title">Brand Starter</h3>
            <p className="tier__desc">
              Design + production + custom labels + hangtags + packaging.
              Everything you need to walk out of Bali with a real brand.
            </p>
            <div className="tier__price">
              <span className="price-prefix">Start from</span>IDR 2.5m
              <small></small>
            </div>
            <div className="tier__unit">Project-based, quoted to fit</div>
            <ul className="tier__list">
              <li>
                Brand &amp; design work <strong>Included</strong>
              </li>
              <li>
                Neck label &amp; hangtag <strong>Custom</strong>
              </li>
              <li>
                Packaging <strong>Optional</strong>
              </li>
              <li>
                Lead time <strong>2–4 weeks</strong>
              </li>
            </ul>
            <div className="tier__cta">
              <a
                href="https://wa.me/6283174145415?text=Hi%2C%20I%27m%20interested%20in%20the%20Brand%20Starter%20package"
                target="_blank"
                rel="noopener"
                className="btn btn--ghost"
              >
                Build a brand →
              </a>
            </div>
          </div>
        </div>
        <p className="pricing-note">
          // &quot;Start from&quot; prices reflect our entry-level fabric and
          design size. Final quote depends on garment, fabric grade, colors,
          quantity, and design size. Screen setup is a one-time fee per
          color, amortized across your order — the more pieces, the lower
          the cost per piece.
        </p>
      </div>
    </section>
  );
}
