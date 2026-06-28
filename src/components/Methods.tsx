const METHODS = [
  {
    num: "M / 01",
    title: "Screen printing",
    desc: "Manual rotary press, plastisol or water-based ink. The good stuff: thick, opaque, lasts a hundred washes. Best for runs of a dozen or more.",
    spec: [
      ["MOQ", "24 pcs"],
      ["Colors", "Up to 4 per design"],
      ["Lead time", "7–10 days"],
    ],
  },
  {
    num: "M / 02",
    title: "DTF transfer",
    desc: "Direct-to-film, heat pressed. Photographic detail, unlimited colors, no screen setup. Best for single pieces, gradients, and small test runs.",
    spec: [
      ["MOQ", "1 pc"],
      ["Colors", "Unlimited"],
      ["Lead time", "1–3 days"],
    ],
  },
  {
    num: "M / 03",
    title: "Embroidery",
    desc: 'For logos, badges, chest hits, and caps. Texture you can feel: the upgrade from "printed on a tee" to "made into a product."',
    spec: [
      ["MOQ", "24 pcs"],
      ["Stitch count", "Quoted per design"],
      ["Lead time", "7–10 days"],
    ],
  },
  {
    num: "M / 04",
    title: "The blank",
    desc: "100% cotton combed 24s as standard, heavier and more substantial than the thin tourist-shop tee. Built to feel like a real garment, not a souvenir.",
    spec: [
      ["Fabric", "100% Combed 24s"],
      ["Weight", "~180–190 gsm"],
      ["Upgrade", "Premium blanks on request"],
    ],
  },
  {
    num: "M / 05",
    title: "Garment finishing",
    desc: "Custom neck labels, woven tags, hangtags, packaging. The details that turn a blank tee into your brand's product. Done in-house, by us.",
    spec: [
      ["Labels", "Print or woven"],
      ["Hangtags", "Custom design"],
      ["Sold as", "Add-on"],
    ],
  },
];

export default function Methods() {
  return (
    <section id="methods">
      <div className="container">
        <div className="section-head section-head--center">
          <h2 className="section-head__title">What we put on cotton.</h2>
        </div>

        <div className="methods">
          {METHODS.map((m) => (
            <div className="method" key={m.num}>
              <div className="method__num">{m.num}</div>
              <div className="method__body">
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
              </div>
              <div className="method__spec">
                {m.spec.map(([label, value]) => (
                  <span key={label}>
                    <strong>{label}</strong> {value}
                    <br />
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
