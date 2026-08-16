import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  slug: string;
  name_en: string;
  name_bn: string;
  sort_order: number;
};

export type ProductImage = {
  id: string;
  url: string;
  storage_path: string;
  sort_order: number;
};

export type ProductWithImages = {
  id: string;
  category_id: string | null;
  name_en: string;
  name_bn: string;
  description: string;
  fabric: string;
  size_chart: string;
  sizes: string[];
  price_per_piece: number;
  moq: number;
  tier_12_price: number | null;
  tier_24_price: number | null;
  tier_50_price: number | null;
  is_featured: boolean;
  is_new: boolean;
  is_active: boolean;
  created_at: string;
  product_images: ProductImage[];
};

const PRODUCT_SELECT =
  "*, product_images(id, url, storage_path, sort_order)";

const SIGNED_TTL = 60 * 60 * 24 * 7; // 7 days

/** Sort images and turn private storage paths into signed, browser-usable URLs. */
async function hydrate(rows: ProductWithImages[]): Promise<ProductWithImages[]> {
  const sorted = rows.map((p) => ({
    ...p,
    product_images: [...(p.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  }));

  const paths = Array.from(
    new Set(
      sorted.flatMap((p) => p.product_images.map((i) => i.storage_path).filter((s) => !!s)),
    ),
  );
  if (paths.length === 0) return sorted;

  const { data } = await supabase.storage.from("product-images").createSignedUrls(paths, SIGNED_TTL);
  const map = new Map<string, string>();
  for (const row of data ?? []) {
    if (row.path && row.signedUrl) map.set(row.path, row.signedUrl);
  }

  return sorted.map((p) => ({
    ...p,
    product_images: p.product_images.map((i) => ({
      ...i,
      url: map.get(i.storage_path) ?? i.url,
    })),
  }));
}


export const categoriesQuery = {
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Category[];
  },
};

export const productsQuery = (opts?: { includeInactive?: boolean }) => ({
  queryKey: ["products", opts?.includeInactive ? "all" : "active"],
  queryFn: async (): Promise<ProductWithImages[]> => {
    let q = supabase.from("products").select(PRODUCT_SELECT);
    if (!opts?.includeInactive) q = q.eq("is_active", true);
    const { data, error } = await q.order("created_at", { ascending: false });
    if (error) throw error;
    return sortImages((data ?? []) as ProductWithImages[]);
  },
});

export const productQuery = (id: string) => ({
  queryKey: ["product", id],
  queryFn: async (): Promise<ProductWithImages | null> => {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return sortImages([data as ProductWithImages])[0]!;
  },
});
