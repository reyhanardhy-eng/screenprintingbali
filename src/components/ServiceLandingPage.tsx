import Footer from "@/components/Footer";
import Link from "next/link";

export type ServicePageData = {
  slug: string;
  kind?: "guide";
  title: string;
  description: string;
  eyebrow: string;
  intro: string;
  facts: Array<{ label: string; value: string }>;
  sections: Array<{
    title: string;
    paragraphs: string[];
    bullets?: string[];
  }>;
  faqs: Array<{ question: string; answer: string }>;
  ctaLabel: string;
  whatsappMessage: string;
};

const SITE_URL = "https://screenprintingbali.com";
const WHATSAPP_URL = "https://wa.me/6283174145415";
const RELATED_SERVICES = [
  { slug: "screen-printing-bali", title: "Bulk screen printing for brands", detail: "A defined colour design and a planned garment run." },
  { slug: "dtf-printing-bali", title: "DTF printing for samples", detail: "Full-colour artwork, a single piece, or a short run." },
  { slug: "apparel-brand-starter-bali", title: "Apparel Brand Starter", detail: "Design, print production, labels, and optional finishing." },
];

export default function ServiceLandingPage({ data }: { data: ServicePageData }) {
  const pageUrl = `${SITE_URL}/${data.slug}`;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      ...(data.kind === "guide" ? [] : [{ "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services` }]),
      { "@type": "ListItem", position: data.kind === "guide" ? 2 : 3, name: data.title, item: pageUrl },
    ],
  };

  return (
    <>
    <main className="seo-page" lang="en">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [breadcrumbJsonLd, {
            "@type": data.kind === "guide" ? "WebPage" : "Service",
            "@id": `${pageUrl}#${data.kind === "guide" ? "guide" : "service"}`,
            name: data.title,
            description: data.description,
            url: pageUrl,
            ...(data.kind === "guide" ? {
              inLanguage: "en",
              publisher: { "@id": `${SITE_URL}/#studio` },
            } : {
              serviceType: data.title,
              provider: { "@id": `${SITE_URL}/#studio` },
              areaServed: { "@type": "Place", name: "Bali, Indonesia" },
            }),
          }],
        }).replace(/</g, "\\u003c") }}
      />
      <header className="seo-page__header">
        <Link className="seo-page__brand" href="/" aria-label="Screenprinting Bali home">
          Screenprinting Bali<span>/ Studio</span>
        </Link>
        <nav aria-label="Page navigation and language switcher">
          <Link href="/services">Services</Link>
          <Link href="/work">Work</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/id" lang="id">ID</Link>
          <Link href="/zh-cn" lang="zh-Hans">中文</Link>
          <a href={`${WHATSAPP_URL}?text=${encodeURIComponent(data.whatsappMessage)}`} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </nav>
      </header>

      <div className="container seo-page__container">
        <nav className="seo-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span>{data.kind !== "guide" && <><Link href="/services">Services</Link><span aria-hidden="true">/</span></>}<span>{data.title}</span>
        </nav>

        <section className={`seo-hero seo-hero--${data.slug}`}>
          <div className="seo-hero__copy">
            <p className="eyebrow">{data.eyebrow}</p>
            <h1>{data.title}</h1>
            <p className="seo-hero__intro">{data.intro}</p>
            <div className="seo-hero__actions">
              <a className="btn" href={`${WHATSAPP_URL}?text=${encodeURIComponent(data.whatsappMessage)}`} target="_blank" rel="noopener noreferrer">
                {data.ctaLabel} <span aria-hidden="true">↗</span>
              </a>
              <Link className="btn btn--ghost" href="/pricing#calculator">Build a ballpark quote</Link>
            </div>
          </div>
          <aside className="seo-facts" aria-label="Service details">
            <div className="seo-facts__art" aria-hidden="true">
              <svg viewBox="0 0 240 150" fill="none"><path d="M26 25h188v100H26z" /><path d="M45 44h78v62H45zM140 45h54M140 64h54M140 83h36" /><circle cx="84" cy="75" r="18" /></svg>
              <span>SPB / 08°39′S</span>
            </div>
            {data.facts.map((fact) => (
              <div className="seo-facts__item" key={fact.label}>
                <span>{fact.label}</span><strong>{fact.value}</strong>
              </div>
            ))}
            <p>Timelines are estimates. Confirm garment availability, artwork, quantity, and delivery date with us before booking.</p>
          </aside>
        </section>

        <div className="seo-page__body">
          {data.sections.map((section) => (
            <section className="seo-copy-section" key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets && (
                <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
              )}
            </section>
          ))}

          <section className="seo-copy-section">
            {data.kind !== "guide" && <p>Planning your first order or visiting Bali? Read our <Link href="/ordering-apparel-in-bali">custom apparel ordering guide</Link> before preparing your brief.</p>}
            <h2>Explore related services</h2>
            <div className="localized-cards">
              {RELATED_SERVICES.filter((service) => service.slug !== data.slug).map((service) => (
                <Link className="localized-card" href={`/${service.slug}`} key={service.slug}>
                  <p className="eyebrow">Bali / Studio</p>
                  <h3>{service.title}</h3>
                  <p>{service.detail}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="seo-copy-section" aria-labelledby="seo-faq-heading">
            <h2 id="seo-faq-heading">Questions before you request a quote</h2>
            <div className="faq seo-page__faq">
              {data.faqs.map((faq) => (
                <details className="faq__item" key={faq.question}>
                  <summary>{faq.question}</summary>
                  <div className="faq__item__answer">{faq.answer}</div>
                </details>
              ))}
            </div>
          </section>

          <section className="seo-final-cta">
            <p className="eyebrow">Bali, Indonesia</p>
            <h2>Bring us the brief. We&apos;ll help shape the run.</h2>
            <p>Send your product, quantity, artwork or reference, required date, and delivery destination. We&apos;ll confirm the practical next step and prepare a quote.</p>
            <a className="btn" href={`${WHATSAPP_URL}?text=${encodeURIComponent(data.whatsappMessage)}`} target="_blank" rel="noopener noreferrer">
              {data.ctaLabel} <span aria-hidden="true">↗</span>
            </a>
          </section>
        </div>
      </div>
    </main>
    <Footer />
    </>
  );
}
