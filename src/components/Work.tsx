import Image from "next/image";
import { fetchPortfolioItems } from "@/lib/portfolio";
import type { PortfolioItem } from "@/lib/portfolio-types";
import Link from "next/link";
import { getPortfolioCaption, isStudioEquipmentMeta } from "@/lib/portfolio-categories";

function WorkItem({ item, className = "" }: { item: PortfolioItem; className?: string }) {
  const caption = getPortfolioCaption(item.meta);
  return (
    <div className={`work-item ${className}`.trim()}>
      <Image
        src={item.image_url!}
        alt={`${item.title_line1} ${item.title_line2} ${caption}`.trim()}
        fill
        unoptimized={item.image_url?.startsWith("https://www.screenprintingbali.com/api/media/")}
        sizes={className.includes("lead")
          ? "(max-width: 720px) 100vw, 60vw"
          : "(max-width: 720px) 50vw, 30vw"}
      />
      {caption && <div className="work-item__meta">{caption}</div>}
    </div>
  );
}

function WorkEditorial({ items }: { items: PortfolioItem[] }) {
  const secondaryItems = items.slice(1, 3);
  const extraItems = items.slice(3);

  return (
    <div className={`work-editorial work-editorial--${Math.min(items.length, 3)}`}>
      <WorkItem item={items[0]} className="work-item--lead" />
      <div className="work-editorial__rail">
        {secondaryItems.map((item) => <WorkItem item={item} key={item.id} className="work-item--support" />)}
        {items.length < 3 && (
          <aside className="work-editorial__note">
            <span className="work-editorial__note-label">STUDIO NOTE · 001</span>
            <h3>Good work has a few layers.</h3>
            <p>Artwork, setup, ink, print, finish. The details stay close to the people making them.</p>
            <svg viewBox="0 0 210 124" fill="none" aria-hidden="true">
              <path d="M10 62h190M105 8v108" />
              <circle cx="105" cy="62" r="48" />
              <circle cx="105" cy="62" r="32" />
              <circle cx="105" cy="62" r="5" />
              <path d="m70 27 70 70m0-70L70 97" />
            </svg>
            <span className="work-editorial__note-foot">MADE IN-HOUSE · BALI, INDONESIA</span>
          </aside>
        )}
      </div>
      {extraItems.length > 0 && (
        <div className="work-editorial__strip">
          {extraItems.map((item) => <WorkItem item={item} key={item.id} className="work-item--strip" />)}
        </div>
      )}
    </div>
  );
}

function WorkTrack({ items }: { items: PortfolioItem[] }) {
  return (
    <div className="work-track">
      {items.map((item) => (
        <WorkItem key={`a-${item.id}`} item={item} />
      ))}
      {items.map((item) => (
        <WorkItem key={`b-${item.id}`} item={item} />
      ))}
    </div>
  );
}

function splitIntoRows(items: PortfolioItem[]): [PortfolioItem[], PortfolioItem[]] {
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

export default async function Work({
  layout = "marquee",
  limit,
  title,
}: {
  layout?: "marquee" | "grid" | "editorial";
  limit?: number;
  title?: string;
}) {
  let items: PortfolioItem[] = [];

  try {
    items = (await fetchPortfolioItems()).filter(
      (item) => Boolean(item.image_url) && !isStudioEquipmentMeta(item.meta)
    );
  } catch {
    // MySQL may be unavailable during build or initial setup; keep the contact CTA available.
  }

  const displayItems = typeof limit === "number" ? items.slice(0, limit) : items;
  const [row1, row2] = splitIntoRows(displayItems);

  return (
    <section id="work">
      <div className="container">
        <div className={`section-head${layout === "editorial" ? " section-head--editorial" : " section-head--center"}`}>
          {layout === "editorial" && <p className="eyebrow">Field notes from our Bali studio</p>}
          <h2 className="section-head__title">
            {title ?? (items.length > 0 ? "Some things we’ve printed." : "Let’s make your idea real.")}
          </h2>
          {layout === "editorial" && (
            <p className="section-head__intro">Screens, inks, samples, finished pieces — the full story of a production run, made in our Bali studio.</p>
          )}
        </div>

        {displayItems.length > 0 && layout === "editorial" ? (
          <WorkEditorial items={displayItems} />
        ) : displayItems.length > 0 && layout === "grid" ? (
          <div className="work-grid">
            {displayItems.map((item) => <WorkItem key={item.id} item={item} />)}
          </div>
        ) : items.length > 0 ? (
          <div className="work-marquee-wrap">
            <div className="work-row">
              <WorkTrack items={row1} />
            </div>
            {row2.length > 0 && (
              <div className="work-row work-row--reverse">
                <WorkTrack items={row2} />
              </div>
            )}
          </div>
        ) : (
          <div className="work-empty">
            <div className="work-empty__intro">
              <p className="eyebrow">Your next project starts here</p>
              <h3>Let&apos;s make your idea real.</h3>
              <p className="work-empty__text">
                We are building out this portfolio. In the meantime, explore
                production options or send us a brief and we can guide you to a
                suitable print method.
              </p>
              <a href="https://wa.me/6283174145415?text=Hi%2C%20I%27d%20like%20to%20plan%20a%20print%20run" target="_blank" rel="noopener noreferrer">
                Plan your print run <span aria-hidden="true">↗</span>
              </a>
            </div>
            <nav className="work-empty__routes" aria-label="Plan a project">
              <Link href="/services"><span>01</span><strong>Compare services</strong><span aria-hidden="true">↗</span></Link>
              <Link href="/pricing"><span>02</span><strong>Explore pricing</strong><span aria-hidden="true">↗</span></Link>
              <Link href="/studio"><span>03</span><strong>Meet the studio</strong><span aria-hidden="true">↗</span></Link>
            </nav>
          </div>
        )}
        {items.length > 0 && typeof limit === "number" && items.length > limit && (
          <div className="work-more"><Link className="btn btn--ghost" href="/work">View all projects →</Link></div>
        )}
      </div>
    </section>
  );
}
