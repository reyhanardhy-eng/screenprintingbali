import Image from "next/image";
import { fetchPortfolioItems } from "@/lib/portfolio";
import { getPortfolioCaption, isStudioEquipmentMeta } from "@/lib/portfolio-categories";
import type { PortfolioItem } from "@/lib/portfolio-types";

export default async function StudioEquipment() {
  let items: PortfolioItem[] = [];

  try {
    items = (await fetchPortfolioItems()).filter(
      (item) => Boolean(item.image_url) && isStudioEquipmentMeta(item.meta)
    );
  } catch {
    return null;
  }

  if (items.length === 0) return null;

  return (
    <section className="studio-equipment" id="studio-equipment">
      <div className="container">
        <header className="studio-equipment__heading">
          <div>
            <p className="eyebrow">Inside our Bali print room</p>
            <h2>Real tools. <em>Hands-on production.</em></h2>
          </div>
          <p>See the screens, presses, and equipment behind the pieces we make. Every order is handled by our team in the studio.</p>
        </header>
        <div className="studio-equipment__grid">
          {items.map((item, index) => {
            const caption = getPortfolioCaption(item.meta);
            return (
              <figure className={`studio-equipment__item studio-equipment__item--${index % 4}`} key={item.id}>
                <div className="studio-equipment__photo">
                  <Image
                    src={item.image_url!}
                    alt={caption || "Screen printing equipment in the Bali production studio"}
                    fill
                    unoptimized={item.image_url?.startsWith("https://www.screenprintingbali.com/api/media/")}
                    sizes="(max-width: 720px) 100vw, (max-width: 1000px) 50vw, 33vw"
                  />
                  <span className="studio-equipment__index">STUDIO / {String(index + 1).padStart(2, "0")}</span>
                </div>
                {caption && <figcaption>{caption}</figcaption>}
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
