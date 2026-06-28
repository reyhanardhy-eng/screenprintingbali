const FAQS = [
  {
    q: "What's the minimum order?",
    a: "One piece for DTF, twelve pieces for screen printing. We're flexible at the bottom end: if you want a single tee to test your design before committing to a full drop, that's exactly what DTF is for.",
  },
  {
    q: "How long does it take?",
    a: "DTF: 1–3 days. Screen print: 7–10 days from approved artwork. Brand Starter projects with full design and finishing: 2–4 weeks. We give you a real timeline up front, not a hopeful one.",
  },
  {
    q: "Can you help with the design?",
    a: "Yes, that's the whole point. We're a design studio first, a print shop second. Bring a scribble on a napkin, a Pinterest board, or nothing at all. We'll work it into something printable.",
  },
  {
    q: "Will my design stay exclusive?",
    a: "Yes. Your design belongs to you, and we don't reprint it for anyone else. Every custom order is treated as your own.",
  },
  {
    q: "How much deposit do you take?",
    a: "50% to start production, balance on delivery. Brand Starter projects sometimes split into three: deposit, design approval, delivery. Bank transfer or international payment, and we'll send the details with the quote.",
  },
  {
    q: "Do you ship outside Bali?",
    a: "Yes, Indonesia-wide via JNE/SiCepat, international via DHL or your courier of choice. We'll quote the shipping with your order. Picking up in Bali is always cheaper if you can.",
  },
  {
    q: "What kind of blanks do you use?",
    a: "100% cotton combed 24s as standard, heavier and more substantial than the thin tees you'll find at tourist print shops, around 180–190 gsm. If you want something lighter (30s) or a specific blend, just tell us and we'll source it.",
  },
  {
    q: "Can I see samples before placing a big order?",
    a: "Always recommended for a screen print drop. We can produce a paid sample first, usually a single DTF or a one-color screen test, so you see the design on the actual garment before committing the full quantity.",
  },
];

export default function Faq() {
  return (
    <section id="faq">
      <div className="container">
        <div className="section-head section-head--center">
          <h2 className="section-head__title">Before you message.</h2>
        </div>

        <div className="faq">
          {FAQS.map((item) => (
            <details className="faq__item" key={item.q}>
              <summary>{item.q}</summary>
              <div className="faq__item__answer">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
