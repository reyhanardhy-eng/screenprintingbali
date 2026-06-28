const STEPS = [
  {
    title: "Brief",
    desc: "Message us on WhatsApp with your idea, sketch, or reference. We reply with a quote and a clear scope, no calls required.",
  },
  {
    title: "Design",
    desc: "We mock it up. You approve, or we revise. Two rounds of changes are included on every order, no extra cost.",
  },
  {
    title: "Production",
    desc: "Printed in-house on our presses. Every piece is QC'd before it leaves, and you see photos before pickup.",
  },
  {
    title: "Delivery",
    desc: "Pick up in Bali, courier delivery on the island, or shipped to wherever you're flying home to next.",
  },
];

export default function Process() {
  return (
    <section id="process">
      <div className="container">
        <div className="section-head section-head--center">
          <h2 className="section-head__title">How it works.</h2>
        </div>

        <div className="process">
          {STEPS.map((step) => (
            <div className="step" key={step.title}>
              <h4>{step.title}</h4>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
