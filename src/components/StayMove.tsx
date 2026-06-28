const OLD_STEPS = [
  "Google five print shops, none of them answer",
  "Ride across town to a workshop you've never seen",
  "Explain your idea in person, hope they get it",
  "Ride back, wait, ride back again to check",
  "Lose half a day of your trip to a kaos",
];

const NEW_STEPS = [
  "Message us on WhatsApp, from wherever you are",
  "Send a photo, a sketch, or just an idea",
  "We quote, design, and confirm in chat",
  "We print, sew, and QC it ourselves, in-house",
  "Pick up, or we deliver. You kept your day.",
];

export default function StayMove() {
  return (
    <section className="stay-move">
      <div className="container">
        <div className="section-head section-head--center" style={{ marginBottom: 0 }}>
          <p className="eyebrow">Our promise</p>
          <h2 className="section-head__title">You stay. We move.</h2>
          <p className="section-head__intro">
            You&apos;re on holiday, or you just decided mid-trip to start a
            brand. Either way, your time in Bali isn&apos;t for chasing down a
            print shop. We come to you, in WhatsApp.
          </p>
        </div>

        <div className="sm-compare">
          <div className="sm-col sm-col--old">
            <span className="sm-col__label">The old way</span>
            {OLD_STEPS.map((step, i) => (
              <div className="sm-step" key={step}>
                <span className="sm-step__num">{String(i + 1).padStart(2, "0")}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>

          <div className="sm-divider"></div>

          <div className="sm-col sm-col--new">
            <span className="sm-col__label">With us</span>
            {NEW_STEPS.map((step, i) => (
              <div className="sm-step" key={step}>
                <span className="sm-step__num">{String(i + 1).padStart(2, "0")}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="sm-tagline">
          No office to find. No workshop to visit.
          <br />
          <span className="accent">Just WhatsApp, and your time back.</span>
        </p>
        <div className="sm-cta">
          <a
            href="https://wa.me/6283174145415?text=Hi%2C%20I%27m%20in%20Bali%20and%20want%20to%20start%20a%20brand%20%E2%80%94%20can%20you%20help%3F"
            target="_blank"
            rel="noopener"
            className="btn"
          >
            Message us, we&apos;ll handle the rest →
          </a>
        </div>
      </div>
    </section>
  );
}
