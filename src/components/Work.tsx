import { fetchPortfolioItems, type PortfolioItem } from "@/lib/portfolio";

const FALLBACK_ROW_1: PortfolioItem[] = [
  { id: -1, title_line1: "Brand drop", title_line2: "2 colors screen", meta: "Local brand · 36 pcs · Plastisol", image_url: null, sort_order: 0 },
  { id: -2, title_line1: "Custom one-off", title_line2: "DTF on cotton", meta: "Custom order · DTF · 1 pc", image_url: null, sort_order: 0 },
  { id: -3, title_line1: "Custom hoodie", title_line2: "4-color screen", meta: "Surf label · 50 pcs · Screen", image_url: null, sort_order: 0 },
  { id: -4, title_line1: "Cafe staff tees", title_line2: "1-color screen", meta: "Hospitality · 24 pcs · Water-based", image_url: null, sort_order: 0 },
];

const FALLBACK_ROW_2: PortfolioItem[] = [
  { id: -5, title_line1: "Woven neck label", title_line2: "Finishing detail", meta: "Brand starter · Detail shot", image_url: null, sort_order: 0 },
  { id: -6, title_line1: "Tourist tee", title_line2: "Bali print", meta: "Custom one-off · DTF", image_url: null, sort_order: 0 },
  { id: -7, title_line1: "Event totebag", title_line2: "1-color screen", meta: "Brand drop · 100 pcs · Plastisol", image_url: null, sort_order: 0 },
  { id: -8, title_line1: "Streetwear crop", title_line2: "DTF full color", meta: "Custom order · DTF · 12 pcs", image_url: null, sort_order: 0 },
];

function WorkItem({ item }: { item: PortfolioItem }) {
  return (
    <div className="work-item">
      {item.image_url ? (
        <img src={item.image_url} alt={`${item.title_line1} ${item.title_line2}`} loading="lazy" />
      ) : (
        <div className="work-item__placeholder">
          {item.title_line1}
          <br />
          {item.title_line2}
        </div>
      )}
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

export default async function Work() {
  let row1 = FALLBACK_ROW_1;
  let row2 = FALLBACK_ROW_2;

  try {
    const items = await fetchPortfolioItems();
    if (items.length >= 2) {
      [row1, row2] = splitIntoRows(items);
    }
  } catch {
    // Supabase not configured yet or table empty — fall back to placeholders.
  }

  return (
    <section id="work">
      <div className="container">
        <div className="section-head section-head--center">
          <h2 className="section-head__title">Some things we&apos;ve printed.</h2>
        </div>

        <div className="work-marquee-wrap">
          <div className="work-row">
            <WorkTrack items={row1} />
          </div>
          <div className="work-row work-row--reverse">
            <WorkTrack items={row2} />
          </div>
        </div>
      </div>
    </section>
  );
}
