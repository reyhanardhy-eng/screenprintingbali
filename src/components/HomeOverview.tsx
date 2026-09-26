import Link from "next/link";

const SERVICES = [
  {
    number: "01",
    label: "For the bigger run",
    title: "Screen printing",
    text: "Rich, durable prints for a design you are ready to put into the world. Made for brand drops, teams, and merchandise.",
    href: "/screen-printing-bali",
    detail: "From 24 pieces · 7–10 days",
    mark: "S",
  },
  {
    number: "02",
    label: "For the first sample",
    title: "DTF printing",
    text: "Bring a full-colour idea to life on a single piece, a short run, or a last-minute project.",
    href: "/dtf-printing-bali",
    detail: "From 1 piece · 1–3 days",
    mark: "D",
  },
  {
    number: "03",
    label: "For the brand taking shape",
    title: "Apparel Brand Starter",
    text: "Turn a loose concept into your first product with practical design and production support from our Bali studio.",
    href: "/apparel-brand-starter-bali",
    detail: "Project-based · from IDR 2.5m",
    mark: "B",
  },
];

const QUICK_LINKS = [
  ["See the work", "/work"],
  ["Price calculator", "/pricing"],
  ["Meet the studio", "/studio"],
  ["Common questions", "/faq"],
  ["Talk through an idea", "/contact"],
] as const;

export default function HomeOverview() {
  return (
    <section className="home-overview" id="services">
      <div className="container">
        <header className="home-overview__heading">
          <div>
            <p className="eyebrow">Pick a production path</p>
            <h2>
              Start with an idea.
              <br />
              <em>Leave with a product.</em>
            </h2>
          </div>
          <p>
            Samples, brand drops, or the first pieces of something bigger.
            Tell us what you are making and we will help you find the right way
            to get it made.
          </p>
        </header>

        <nav className="home-services" aria-label="Choose a production service">
          {SERVICES.map((service) => (
            <Link className="home-service" href={service.href} key={service.number}>
              <span className="home-service__number" aria-hidden="true">{service.number}</span>
              <span className="home-service__body">
                <span className="home-service__label">{service.label}</span>
                <strong>{service.title}</strong>
                <span className="home-service__text">{service.text}</span>
              </span>
              <span className="home-service__aside">
                <span>{service.detail}</span>
                <span>Explore route <span aria-hidden="true">↗</span></span>
              </span>
              <span className="home-service__mark" aria-hidden="true">{service.mark}</span>
            </Link>
          ))}
        </nav>

        <div className="home-facts" aria-label="Production at a glance">
          <div><strong>01 piece</strong><span>Start with a DTF sample</span></div>
          <div><strong>24+ pieces</strong><span>Built for screen print runs</span></div>
          <div><strong>Made in Bali</strong><span>Printed and finished in-house</span></div>
        </div>

        <nav className="home-quicklinks" aria-label="Explore the studio">
          <span className="eyebrow">A few useful places</span>
          <div>
            {QUICK_LINKS.map(([label, href]) => (
              <Link href={href} key={href}>{label}<span aria-hidden="true">↗</span></Link>
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
}

