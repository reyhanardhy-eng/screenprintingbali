import type { PricingData } from "./pricing-types";

// Mirrors the initial calculator seed in database/schema.mysql.sql for local previews.
export const LOCAL_PREVIEW_PRICING: PricingData = {
  products: [
    { slug: "tshirt", label: "T-shirt", has_cut_option: true, has_bag_size_option: false, moq: 1, sort_order: 1 },
    { slug: "hoodie", label: "Hoodie", has_cut_option: true, has_bag_size_option: false, moq: 1, sort_order: 2 },
    { slug: "croptop", label: "Crop top", has_cut_option: true, has_bag_size_option: false, moq: 1, sort_order: 3 },
    { slug: "tanktop", label: "Tank top / Singlet", has_cut_option: true, has_bag_size_option: false, moq: 1, sort_order: 4 },
    { slug: "totebag", label: "Totebag", has_cut_option: false, has_bag_size_option: true, moq: 100, sort_order: 5 },
    { slug: "paperbag", label: "Paperbag", has_cut_option: false, has_bag_size_option: true, moq: 100, sort_order: 6 },
  ],
  fabrics: [
    { id: 1, product_slug: "tshirt", value: "combed16s", label: "Combed 16s", price: 115000, sort_order: 1 },
    { id: 2, product_slug: "tshirt", value: "combed24s", label: "Combed 24s", price: 105000, sort_order: 2 },
    { id: 3, product_slug: "tshirt", value: "combed30s", label: "Combed 30s", price: 90000, sort_order: 3 },
    { id: 4, product_slug: "hoodie", value: "fleece", label: "Fleece premium", price: 130000, sort_order: 1 },
    { id: 5, product_slug: "croptop", value: "combed24s", label: "Combed 24s", price: 95000, sort_order: 1 },
    { id: 6, product_slug: "croptop", value: "combed30s", label: "Combed 30s", price: 90000, sort_order: 2 },
    { id: 7, product_slug: "tanktop", value: "combed24s", label: "Combed 24s", price: 95000, sort_order: 1 },
    { id: 8, product_slug: "tanktop", value: "combed30s", label: "Combed 30s", price: 90000, sort_order: 2 },
    { id: 9, product_slug: "totebag", value: "spunbond", label: "Spunbond", price: 7000, sort_order: 1 },
    { id: 10, product_slug: "totebag", value: "blacu", label: "Blacu", price: 21000, sort_order: 2 },
    { id: 11, product_slug: "totebag", value: "rami", label: "Rami / jute", price: 28000, sort_order: 3 },
    { id: 12, product_slug: "paperbag", value: "kraft", label: "Kraft", price: 8500, sort_order: 1 },
    { id: 13, product_slug: "paperbag", value: "artcarton", label: "Art carton", price: 12500, sort_order: 2 },
  ],
  cuts: [
    { slug: "basic", label: "Basic", multiplier: 1, sort_order: 1 },
    { slug: "oversize", label: "Oversize", multiplier: 1.1, sort_order: 2 },
    { slug: "boxy", label: "Boxy", multiplier: 1.18, sort_order: 3 },
    { slug: "fitted", label: "Fitted", multiplier: 1.2, sort_order: 4 },
  ],
  bagSizes: [
    { slug: "small", label: "Small", dim: "~25x30cm", multiplier: 0.8, sort_order: 1 },
    { slug: "medium", label: "Medium", dim: "~30x40cm", multiplier: 1, sort_order: 2 },
    { slug: "large", label: "Large", dim: "~35x45cm", multiplier: 1.25, sort_order: 3 },
  ],
  printMethods: [
    {
      slug: "dtf", label: "DTF", type: "dtf", moq: 1,
      film_rate_per_cm2: 8.181818, press_margin: 1.6, press_flat_cost: 12000,
      base_cost: null, per_extra_color: null, setup_per_color: null,
      applicable_products: null, sort_order: 1,
    },
    {
      slug: "plastisol", label: "Plastisol", type: "screen", moq: 24,
      film_rate_per_cm2: null, press_margin: null, press_flat_cost: null,
      base_cost: 15000, per_extra_color: 8000, setup_per_color: 40000,
      applicable_products: ["tshirt", "hoodie", "croptop", "tanktop"], sort_order: 2,
    },
    {
      slug: "rubber", label: "Rubber", type: "screen", moq: 24,
      film_rate_per_cm2: null, press_margin: null, press_flat_cost: null,
      base_cost: 11000, per_extra_color: 6000, setup_per_color: 40000,
      applicable_products: null, sort_order: 3,
    },
    {
      slug: "waterbased", label: "Waterbased", type: "screen", moq: 1,
      film_rate_per_cm2: null, press_margin: null, press_flat_cost: null,
      base_cost: 10000, per_extra_color: 5000, setup_per_color: 35000,
      applicable_products: ["totebag", "paperbag"], sort_order: 4,
    },
  ],
  designSizes: [
    { slug: "small", label: "Small", dim: "A6, ~10x15cm", area_cm2: 150, multiplier: 0.6, sort_order: 1 },
    { slug: "medium", label: "Medium", dim: "A5, ~15x21cm", area_cm2: 315, multiplier: 1, sort_order: 2 },
    { slug: "large", label: "Large", dim: "A4, ~21x30cm", area_cm2: 630, multiplier: 1.5, sort_order: 3 },
    { slug: "xl", label: "XL", dim: "A3, ~30x42cm", area_cm2: 1260, multiplier: 2.2, sort_order: 4 },
  ],
};
