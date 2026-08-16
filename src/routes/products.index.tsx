import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ProductCard from "@/components/ProductCard";
import { categoriesQuery, productsQuery } from "@/lib/catalog";

const searchSchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/products/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Wholesale Baby Clothing Products — ZS Garments" },
      {
        name: "description",
        content:
          "Browse baby frocks, dungaree sets, winter wear and cotton sets at wholesale rates. Filter by category, price and size. Register to see paikari prices.",
      },
      { property: "og:title", content: "Wholesale Baby Clothing Products — ZS Garments" },
      {
        property: "og:description",
        content: "Bulk baby dresses with MOQ and tier pricing for shopkeepers in Bangladesh.",
      },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: products = [], isLoading } = useQuery(productsQuery());
  const { data: categories = [] } = useQuery(categoriesQuery);

  const [maxPrice, setMaxPrice] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const q = (search.q ?? "").toLowerCase().trim();
  const category = search.category ?? "";

  const allSizes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.sizes ?? []))).sort(),
    [products],
  );

  const catId = categories.find((c) => c.slug === category)?.id ?? null;

  const filtered = products.filter((p) => {
    if (catId && p.category_id !== catId) return false;
    if (q && !`${p.name_en} ${p.name_bn} ${p.description}`.toLowerCase().includes(q)) return false;
    if (maxPrice && Number(p.price_per_piece) > Number(maxPrice)) return false;
    if (size && !(p.sizes ?? []).includes(size)) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">All Products</h1>
      <p className="text-sm text-muted-foreground">সব পণ্য · পাইকারি দরে</p>

      <div className="mt-5 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search products… / পণ্য খুঁজুন"
            value={search.q ?? ""}
            onChange={(e) =>
              navigate({ search: (prev) => ({ ...prev, q: e.target.value || undefined }) })
            }
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters((s) => !s)}>
          <SlidersHorizontal className="size-4" /> Filters
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          to="/products"
          search={{}}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${!category ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            to="/products"
            search={(prev) => ({ ...prev, category: c.slug })}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${category === c.slug ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}
          >
            {c.name_en}
          </Link>
        ))}
      </div>

      {showFilters && (
        <div className="mt-4 grid gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="maxPrice">Max price per piece (৳)</Label>
            <Input
              id="maxPrice"
              type="number"
              min={0}
              placeholder="e.g. 250"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Size</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <button
                onClick={() => setSize("")}
                className={`rounded-full border px-3 py-1.5 text-xs ${!size ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
              >
                Any
              </button>
              {allSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s === size ? "" : s)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${size === s ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No products match your search. · কোনো পণ্য পাওয়া যায়নি।
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
