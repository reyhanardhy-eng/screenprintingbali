const ROW_1 = [
  { title: ["Brand drop", "2 colors screen"], meta: "Local brand · 36 pcs · Plastisol" },
  { title: ["Custom one-off", "DTF on cotton"], meta: "Custom order · DTF · 1 pc" },
  { title: ["Custom hoodie", "4-color screen"], meta: "Surf label · 50 pcs · Screen" },
  { title: ["Cafe staff tees", "1-color screen"], meta: "Hospitality · 24 pcs · Water-based" },
];

const ROW_2 = [
  { title: ["Woven neck label", "Finishing detail"], meta: "Brand starter · Detail shot" },
  { title: ["Tourist tee", "Bali print"], meta: "Custom one-off · DTF" },
  { title: ["Event totebag", "1-color screen"], meta: "Brand drop · 100 pcs · Plastisol" },
  { title: ["Streetwear crop", "DTF full color"], meta: "Custom order · DTF · 12 pcs" },
];

function WorkItem({ title, meta }: { title: string[]; meta: string }) {
  return (
    <div className="work-item">
      <div className="work-item__placeholder">
        {title[0]}
        <br />
        {title[1]}
      </div>
      <div className="work-item__meta">{meta}</div>
    </div>
  );
}

function WorkTrack({ items }: { items: typeof ROW_1 }) {
  return (
    <div className="work-track">
      {items.map((item, i) => (
        <WorkItem key={`a-${i}`} title={item.title} meta={item.meta} />
      ))}
      {items.map((item, i) => (
        <WorkItem key={`b-${i}`} title={item.title} meta={item.meta} />
      ))}
    </div>
  );
}

export default function Work() {
  return (
    <section id="work">
      <div className="container">
        <div className="section-head section-head--center">
          <h2 className="section-head__title">Some things we&apos;ve printed.</h2>
        </div>

        <div className="work-marquee-wrap">
          <div className="work-row">
            <WorkTrack items={ROW_1} />
          </div>
          <div className="work-row work-row--reverse">
            <WorkTrack items={ROW_2} />
          </div>
        </div>
      </div>
    </section>
  );
}
