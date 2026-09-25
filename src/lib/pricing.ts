import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import type { PricingData, PrintMethod } from "./pricing-types";
import { rows } from "./db";

type PrintMethodRow = RowDataPacket & PrintMethod & { applicable_products: unknown };

function decodeProducts(value: unknown): string[] | null {
  if (value == null) return null;
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : null;
    } catch {
      return null;
    }
  }
  return null;
}
export async function fetchPricingData(): Promise<PricingData> {
  const [products, fabrics, cuts, bagSizes, printMethods, designSizes] = await Promise.all([
    rows("SELECT slug, label, has_cut_option, has_bag_size_option, moq, sort_order FROM products ORDER BY sort_order"),
    rows("SELECT id, product_slug, value, label, price, sort_order FROM fabrics ORDER BY sort_order"),
    rows("SELECT slug, label, multiplier, sort_order FROM cuts ORDER BY sort_order"),
    rows("SELECT slug, label, dim, multiplier, sort_order FROM bag_sizes ORDER BY sort_order"),
    rows<PrintMethodRow>("SELECT slug, label, type, moq, film_rate_per_cm2, press_margin, press_flat_cost, base_cost, per_extra_color, setup_per_color, applicable_products, sort_order FROM print_methods ORDER BY sort_order"),
    rows("SELECT slug, label, dim, area_cm2, multiplier, sort_order FROM design_sizes ORDER BY sort_order"),
  ]);

  return {
    products: products as unknown as PricingData["products"],
    fabrics: fabrics as unknown as PricingData["fabrics"],
    cuts: cuts as unknown as PricingData["cuts"],
    bagSizes: bagSizes as unknown as PricingData["bagSizes"],
    printMethods: printMethods.map((row) => ({
      ...row,
      applicable_products: decodeProducts(row.applicable_products),
    })),
    designSizes: designSizes as unknown as PricingData["designSizes"],
  };
}
