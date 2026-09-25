import "server-only";
import { rows } from "./db";
import type { PortfolioItem } from "./portfolio-types";

export type { PortfolioItem } from "./portfolio-types";

export async function fetchPortfolioItems(): Promise<PortfolioItem[]> {
  const items = await rows(
    `SELECT id, title_line1, title_line2, meta, image_url, sort_order
     FROM portfolio_items ORDER BY sort_order, id`
  );
  return items as unknown as PortfolioItem[];
}
