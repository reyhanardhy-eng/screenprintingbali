export default function Paths() {
  return (
    <section id="paths">
      <div className="container">
        <div className="section-head">
          <h2 className="section-head__title">From idea to garment.</h2>
          <p className="section-head__intro">
            Whatever you&apos;re printing, a single test piece, a full brand
            drop, or a batch of uniforms, it starts with a message and ends
            with something made in-house, by us.
          </p>
        </div>
        <div className="doors">
          <article className="door" id="make">
            <div className="door__num">01 / DESIGN &amp; PRODUCTION</div>
            <h3 className="door__title">
              Design <span className="accent">with</span> us.
            </h3>
            <p className="door__desc">
              Bring an idea, a sketch, or just a feeling. Eight years of
              design experience goes into every order, and we&apos;ll walk
              you from first mockup to finished print.
            </p>
            <ul className="door__list">
              <li>
                Custom design &amp; artwork <span>Included</span>
              </li>
              <li>
                Screen print &amp; DTF <span>In-house</span>
              </li>
              <li>
                Neck labels &amp; hangtags <span>Optional</span>
              </li>
              <li>
                From <span>1 piece</span>
              </li>
            </ul>
            <div className="door__cta">
              <a href="#pricing" className="btn">
                See pricing →
              </a>
            </div>
          </article>

          <article className="door" id="wear">
            <div className="door__num">02 / IN-HOUSE PRODUCTION</div>
            <h3 className="door__title">
              Made <span className="accent">on</span> island.
            </h3>
            <p className="door__desc">
              Two rotary presses and two sewing machines, run by us, not a
              third party. What you approve is exactly what we print, with
              photos before it ships.
            </p>
            <ul className="door__list">
              <li>
                Rotary screen presses <span>2 units</span>
              </li>
              <li>
                Sewing &amp; finishing <span>2 machines</span>
              </li>
              <li>
                QC before delivery <span>Always</span>
              </li>
              <li>
                Turnaround <span>1–10 days</span>
              </li>
            </ul>
            <div className="door__cta">
              <a
                href="https://wa.me/6283174145415?text=Hi%2C%20I%27d%20like%20to%20ask%20about%20your%20production%20capabilities"
                target="_blank"
                rel="noopener"
                className="btn btn--ghost"
              >
                Ask a question →
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
