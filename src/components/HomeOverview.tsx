import Link from "next/link";

const SERVICES = [
  {
    number: "01 / LARGER RUNS",
    title: "Screen printing",
    text: "A strong fit for a defined design and a larger apparel run, printed in our Bali studio.",
    href: "/screen-printing-bali",
    detail: "From 24 pieces · 7–10 days",
  },
  {
    number: "02 / SAMPLES & SHORT RUNS",
    title: "DTF printing",
    text: "Full-colour transfers for samples, one-off pieces, and smaller quantities.",
    href: "/dtf-printing-bali",
    detail: "From 1 piece · 1–3 days",
  },
  {
    number: "03 / BUILD A LABEL",
    title: "Apparel Brand Starter",
    text: "Get practical design and production support to take an apparel idea into its first product.",
    href: "/apparel-brand-starter-bali",
    detail: "Project-based · from IDR 2.5m",
  },
];

const PAGES = [
  {
    number: "01",
    title: "Services",
    text: "Compare printing methods and production options.",
    href: "/services",
  },
  {
    number: "02",
    title: "Work",
    text: "Visit the portfolio and see what is being made in the studio.",
    href: "/work",
  },
  {
    number: "03",
    title: "Pricing & calculator",
    text: "Explore pricing and estimate the scope of your order.",
    href: "/pricing",
  },
  {
    number: "04",
    title: "The studio",
    text: "Learn how design, printing, finishing, and quality checks come together.",
    href: "/studio",
  },
  {
    number: "05",
    title: "Frequently asked questions",
    text: "Get quick answers about artwork, quantities, timing, and delivery.",
    href: "/faq",
  },
  {
    number: "06",
    title: "Contact & quote",
    text: "Share your idea, quantity, and timeline to start a conversation.",
    href: "/contact",
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
          <p>
            Start with a print method, a garment, or a rough idea. We will help
            shape the brief and confirm what is practical to produce in Bali.
          </p>
        </div>

        <div className="home-services" aria-label="Choose a production service">
          {SERVICES.map((service) => (
            <Link className="home-service" href={service.href} key={service.number}>
              <span className="eyebrow">{service.number}</span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <span className="home-service__detail">{service.detail}</span>
              <span className="home-service__link">
                Explore service <span aria-hidden="true">↗</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="home-facts" aria-label="Production at a glance">
          <div><strong>From 1 piece</strong><span>DTF samples and short runs</span></div>
          <div><strong>From 24 pieces</strong><span>Screen printed bulk orders</span></div>
          <div><strong>Made in Bali</strong><span>Printing and finishing in-house</span></div>
        </div>

        <div className="home-pages">
          <div className="home-pages__heading">
            <div>
              <p className="eyebrow">Explore the studio</p>
              <h2>Everything you need, one step away.</h2>
            </div>
            <p>Choose a page to compare options, understand the process, or move your project forward.</p>
          </div>
          <nav className="home-pages__grid" aria-label="Explore website pages">
            {PAGES.map((page) => (
              <Link className="home-page-link" href={page.href} key={page.href}>
                <span className="home-page-link__number">{page.number}</span>
                <span className="home-page-link__copy">
                  <strong>{page.title}</strong>
                  <span>{page.text}</span>
                </span>
                <span className="home-page-link__arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
