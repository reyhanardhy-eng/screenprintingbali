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
