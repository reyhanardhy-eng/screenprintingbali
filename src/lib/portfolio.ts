import "server-only";
import { rows } from "./db";
import { setPortfolioCategory } from "./portfolio-categories";
import type { PortfolioItem } from "./portfolio-types";

export type { PortfolioItem } from "./portfolio-types";

const LOCAL_PREVIEW_IMAGES = [
  "4c5bd353-abcf-4494-b6e3-76ef03101246.webp",
  "c9123aed-35ab-4a7a-b3bd-9b76b6a0af00.webp",
  "2f0bcbd4-a8a4-4a1a-8b01-9529301cf468.webp",
  "759d8115-5ea1-497c-89be-1abbf7e86ce8.webp",
  "5fc47b17-582e-426a-9842-12a7c67dffd5.webp",
  "0c6dac24-5934-43fb-89be-3ed1199c2cac.webp",
  "4b00a4a1-8f30-4f50-9c86-0d9e7b8ce6fc.webp",
  "f7c277b4-825a-4000-a137-8e7690112d9e.webp",
  "39d9db56-c76e-4253-9d0e-fd57961a023a.webp",
  "b8a18f3e-a1e6-40c9-8930-d3d338c7bb9a.webp",
  "7238e617-c65a-4fbb-a3c0-acf46ae9f7b1.webp",
  "a0ab941e-d0a4-4bbd-8b17-3a415529c72f.webp",
  "ce895e82-d79a-4b1c-b96a-aaab046d0ce3.webp",
  "06d0efa5-f1a6-4fbf-ad53-b0cd0ef7f85b.webp",
  "2ae06822-d2bd-47f9-bd54-808c0f4a163e.webp",
  "b945f294-aace-42d4-83ce-a45f90a43d18.webp",
  "c47e6956-c020-409f-b8ce-2008c8c88661.webp",
  "7ada3c7d-ec04-47f5-8e1e-8ec61adece57.webp",
  "d5882b33-a515-4452-b327-e0ac37118cf9.webp",
  "01aebc79-edb1-4963-aa56-e3051edf8a95.webp",
];

const LOCAL_PREVIEW_STUDIO_EQUIPMENT = [
  {
    image_url: "/images/studio-screenpress-01.webp",
    caption: "Carousel screen-printing press · workshop setup",
  },
  {
    image_url: "/images/studio-screenpress-02.webp",
    caption: "Carousel screen-printing press · garment setup",
  },
];

function getLocalPreviewItems(): PortfolioItem[] {
  const portfolioItems = LOCAL_PREVIEW_IMAGES.map((filename, index) => ({
    id: index + 1,
    title_line1: "Screenprinting Bali",
    title_line2: `Portfolio ${String(index + 1).padStart(2, "0")}`,
    meta: "Bali studio · portfolio preview",
    image_url: `https://www.screenprintingbali.com/api/media/${filename}`,
    sort_order: index,
  }));

  const equipmentItems = LOCAL_PREVIEW_STUDIO_EQUIPMENT.map((item, index) => ({
    id: LOCAL_PREVIEW_IMAGES.length + index + 1,
    title_line1: "Screen-printing",
    title_line2: "Carousel press",
    meta: setPortfolioCategory(item.caption, true),
    image_url: item.image_url,
    sort_order: LOCAL_PREVIEW_IMAGES.length + index,
  }));

  return [...portfolioItems, ...equipmentItems];
}

export async function fetchPortfolioItems(): Promise<PortfolioItem[]> {
  // Keep the local design preview representative when it has no local MySQL database.
  // Production always reads the real portfolio records from Hostinger's database.
  if (process.env.NODE_ENV === "development" && !process.env.DB_HOST && !process.env.DATABASE_URL) {
    return getLocalPreviewItems();
  }

  const items = await rows(
    `SELECT id, title_line1, title_line2, meta, image_url, sort_order
     FROM portfolio_items ORDER BY sort_order, id`
  );
  return items as unknown as PortfolioItem[];
}
