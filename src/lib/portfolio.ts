import { supabase } from "./supabase";

export type PortfolioItem = {
  id: number;
  title_line1: string;
  title_line2: string;
  meta: string;
  image_url: string | null;
  sort_order: number;
};

export async function fetchPortfolioItems(): Promise<PortfolioItem[]> {
  const { data, error } = await supabase
    .from("portfolio_items")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return data as PortfolioItem[];
}
