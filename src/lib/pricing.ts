import { supabase } from "./supabase";

export type Product = {
  slug: string;
  label: string;
  has_cut_option: boolean;
  has_bag_size_option: boolean;
  moq: number;
  sort_order: number;
};

export type Fabric = {
  id: number;
  product_slug: string;
  value: string;
  label: string;
  price: number;
  sort_order: number;
};

export type Cut = {
  slug: string;
  label: string;
  multiplier: number;
  sort_order: number;
};

export type BagSize = {
  slug: string;
  label: string;
  dim: string;
  multiplier: number;
  sort_order: number;
};

export type PrintMethod = {
  slug: string;
  label: string;
  type: "dtf" | "screen";
  moq: number;
  film_rate_per_cm2: number | null;
  press_margin: number | null;
  press_flat_cost: number | null;
  base_cost: number | null;
  per_extra_color: number | null;
  setup_per_color: number | null;
  applicable_products: string[] | null;
  sort_order: number;
};

export type DesignSize = {
  slug: string;
  label: string;
  dim: string;
  area_cm2: number;
  multiplier: number;
  sort_order: number;
};

export type PricingData = {
  products: Product[];
  fabrics: Fabric[];
  cuts: Cut[];
  bagSizes: BagSize[];
  printMethods: PrintMethod[];
  designSizes: DesignSize[];
};

export async function fetchPricingData(): Promise<PricingData> {
  const [products, fabrics, cuts, bagSizes, printMethods, designSizes] =
    await Promise.all([
      supabase.from("products").select("*").order("sort_order"),
      supabase.from("fabrics").select("*").order("sort_order"),
      supabase.from("cuts").select("*").order("sort_order"),
      supabase.from("bag_sizes").select("*").order("sort_order"),
      supabase.from("print_methods").select("*").order("sort_order"),
      supabase.from("design_sizes").select("*").order("sort_order"),
    ]);

  if (products.error) throw products.error;
  if (fabrics.error) throw fabrics.error;
  if (cuts.error) throw cuts.error;
  if (bagSizes.error) throw bagSizes.error;
  if (printMethods.error) throw printMethods.error;
  if (designSizes.error) throw designSizes.error;

  return {
    products: products.data as Product[],
    fabrics: fabrics.data as Fabric[],
    cuts: cuts.data as Cut[],
    bagSizes: bagSizes.data as BagSize[],
    printMethods: printMethods.data as PrintMethod[],
    designSizes: designSizes.data as DesignSize[],
  };
}
