import Image from "next/image";
import { fetchPortfolioItems } from "@/lib/portfolio";
import type { PortfolioItem } from "@/lib/portfolio-types";
import Link from "next/link";

function WorkItem({ item }: { item: PortfolioItem }) {
  return (
    <div className="work-item">
      <Image
        src={item.image_url!}
        alt={`${item.title_line1} ${item.title_line2}`}
        fill
        sizes="(max-width: 720px) 50vw, 34vw"
      />
      <div className="work-item__meta">{item.meta}</div>
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
  layout?: "marquee" | "grid";
  limit?: number;
  title?: string;
}) {
  let items: PortfolioItem[] = [];

  try {
    items = (await fetchPortfolioItems()).filter((item) => Boolean(item.image_url));
  } catch {
    // MySQL may be unavailable during build or initial setup; keep the contact CTA available.
  }

  const displayItems = typeof limit === "number" ? items.slice(0, limit) : items;
  const [row1, row2] = splitIntoRows(displayItems);

  return (
    <section id="work">
      <div className="container">
        <div className="section-head section-head--center">
          <h2 className="section-head__title">
            {title ?? (items.length > 0 ? "Some things we’ve printed." : "Let’s make your idea real.")}
          </h2>
        </div>

        {displayItems.length > 0 && layout === "grid" ? (
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
            <p>Your brand could be next.</p>
            <span>Tell us what you&apos;re making and we&apos;ll help you choose the right print method.</span>
            <a href="https://wa.me/6283174145415" target="_blank" rel="noopener noreferrer">
              Plan your print run <span aria-hidden="true">↗</span>
            </a>
          </div>
        )}
        {items.length > 0 && typeof limit === "number" && items.length > limit && (
          <div className="work-more"><Link className="btn btn--ghost" href="/work">View all projects →</Link></div>
        )}
      </div>
    </section>
  );
}
