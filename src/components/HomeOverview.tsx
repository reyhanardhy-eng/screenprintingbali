import Link from "next/link";

const SERVICES = [
  {
    number: "01 / BULK RUNS",
    title: "Screen printing",
    text: "A dependable option for apparel drops with a defined design and a larger quantity.",
    href: "/screen-printing-bali",
    detail: "From 24 pieces · 7–10 days",
  },
  {
    number: "02 / SAMPLES & SHORT RUNS",
    title: "DTF printing",
    text: "Full-colour prints for samples, one-off pieces, and smaller runs.",
    href: "/dtf-printing-bali",
    detail: "From 1 piece · 1–3 days",
  },
  {
    number: "03 / BRAND BUILD",
    title: "Apparel Brand Starter",
    text: "Design and production support for turning an early idea into a considered apparel product.",
    href: "/apparel-brand-starter-bali",
    detail: "Project-based · from IDR 2.5m",
  },
];

export default function HomeOverview() {
  return (
    <section className="home-overview">
      <div className="container">
        <div className="home-overview__heading">
          <div>
            <p className="eyebrow">A studio for your next run</p>
            <h2>Make a product people want to keep.</h2>
          </div>
          <p>Start with a print method, a garment, or a rough idea. We will help you shape the brief and confirm what is practical to produce in Bali.</p>
        </div>
        <div className="home-services">
          {SERVICES.map((service) => (
            <Link className="home-service" href={service.href} key={service.number}>
              <span className="eyebrow">{service.number}</span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <span className="home-service__detail">{service.detail}</span>
              <span className="home-service__link">Explore service <span aria-hidden="true">↗</span></span>
            </Link>
          ))}
        </div>
        <div className="home-overview__links">
          <Link href="/pricing">Compare pricing and estimate your order →</Link>
          <Link href="/studio">Meet the studio and see how production works →</Link>
        </div>
      </div>
    </section>
  );
}
