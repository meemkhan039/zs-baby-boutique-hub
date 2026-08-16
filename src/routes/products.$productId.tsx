import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ImageIcon, Lock, Minus, Phone, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { productQuery } from "@/lib/catalog";
import { SHOP, taka, unitPriceFor } from "@/lib/shop";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/products/$productId")({
  head: () => ({
    meta: [
      { title: "Product Details — ZS Garments Wholesale" },
      {
        name: "description",
        content:
          "Wholesale baby clothing details: per-piece price, bulk discount tiers, fabric, size chart and minimum order quantity from ZS Garments.",
      },
      { property: "og:title", content: "Product Details — ZS Garments Wholesale" },
      {
        property: "og:description",
        content: "Per-piece paikari price, bulk tiers and MOQ for baby clothing from ZS Garments.",
      },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { productId } = Route.useParams();
  const { data: product, isLoading } = useQuery(productQuery(productId));
  const { session } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState<number | null>(null);

  if (isLoading) return <p className="p-10 text-center text-sm text-muted-foreground">Loading…</p>;
  if (!product)
    return (
      <div className="p-10 text-center">
        <p className="text-sm text-muted-foreground">Product not found.</p>
        <Button asChild className="mt-4">
          <Link to="/products">Back to products</Link>
        </Button>
      </div>
    );

  const images = product.product_images ?? [];
  const quantity = qty ?? product.moq;
  const unit = unitPriceFor(product, quantity);
  const tiers = [
    { label: `${product.moq}–11 pcs`, min: 1, price: product.price_per_piece },
    { label: "12+ pcs", min: 12, price: product.tier_12_price },
    { label: "24+ pcs", min: 24, price: product.tier_24_price },
    { label: "50+ pcs", min: 50, price: product.tier_50_price },
  ].filter((t) => t.price != null);

  const step = product.moq >= 12 ? 12 : 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
            {images[active] ? (
              <img
                src={images[active]!.url}
                alt={product.name_en}
                className="size-full object-cover"
              />
            ) : (
              <div className="grid size-full place-items-center text-muted-foreground">
                <ImageIcon className="size-10" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActive(i)}
                  className={`size-16 shrink-0 overflow-hidden rounded-lg border-2 ${i === active ? "border-primary" : "border-border"}`}
                >
                  <img src={img.url} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex gap-2">
            {product.is_new && <Badge className="bg-accent text-accent-foreground">New</Badge>}
            {product.is_featured && <Badge className="bg-primary">Featured</Badge>}
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold">{product.name_en}</h1>
          {product.name_bn && <p className="text-muted-foreground">{product.name_bn}</p>}

          {session ? (
            <div className="mt-4 rounded-2xl border border-border bg-card p-4">
              <p className="font-display text-3xl font-bold text-primary">
                {taka(unit)}
                <span className="ml-1 text-sm font-medium text-muted-foreground">/ piece</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Minimum order: {product.moq} pcs · সর্বনিম্ন অর্ডার {product.moq} পিস
              </p>

              {tiers.length > 1 && (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {tiers.map((t) => (
                    <div
                      key={t.label}
                      className={`rounded-xl border p-2 text-center ${quantity >= t.min ? "border-primary bg-secondary" : "border-border"}`}
                    >
                      <p className="text-[11px] text-muted-foreground">{t.label}</p>
                      <p className="font-display text-sm font-bold">{taka(Number(t.price))}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-border">
                  <button
                    className="p-2.5"
                    onClick={() => setQty(Math.max(product.moq, quantity - step))}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-4" />
                  </button>
                  <input
                    className="w-16 border-x border-border bg-transparent p-2 text-center text-sm font-semibold outline-none"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                  />
                  <button
                    className="p-2.5"
                    onClick={() => setQty(quantity + step)}
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">
                  pieces{step === 12 ? " (1 dozen = 12 pcs)" : ""}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl bg-muted p-3">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-display text-xl font-bold">{taka(unit * quantity)}</span>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="mt-3 w-full"
                onClick={() => {
                  if (quantity < product.moq) {
                    toast.error(`Minimum order is ${product.moq} pieces`);
                    return;
                  }
                  addItem({
                    productId: product.id,
                    name: product.name_en,
                    image: images[0]?.url ?? null,
                    moq: product.moq,
                    qty: quantity,
                    price_per_piece: Number(product.price_per_piece),
                    tier_12_price: product.tier_12_price,
                    tier_24_price: product.tier_24_price,
                    tier_50_price: product.tier_50_price,
                  });
                  toast.success("Added to cart · কার্টে যোগ হয়েছে");
                }}
              >
                <ShoppingCart className="size-5" /> Add to Cart
              </Button>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-accent/40 bg-secondary p-5 text-center">
              <Lock className="mx-auto size-6 text-accent" />
              <p className="mt-2 font-display text-lg font-semibold">
                Login to see wholesale price
              </p>
              <p className="text-sm text-muted-foreground">
                পাইকারি দাম দেখতে লগইন করুন
              </p>
              <Button className="mt-3 w-full" onClick={() => navigate({ to: "/auth" })}>
                Login / Register
              </Button>
              <Button asChild variant="outline" className="mt-2 w-full">
                <a href={SHOP.phoneHref}>
                  <Phone className="size-4" /> Call {SHOP.phone}
                </a>
              </Button>
            </div>
          )}

          <div className="mt-6 space-y-4 text-sm">
            {product.description && (
              <section>
                <h2 className="font-display text-base font-semibold">Description · বিবরণ</h2>
                <p className="mt-1 whitespace-pre-line text-muted-foreground">
                  {product.description}
                </p>
              </section>
            )}
            {product.fabric && (
              <section>
                <h2 className="font-display text-base font-semibold">Fabric · কাপড়</h2>
                <p className="mt-1 text-muted-foreground">{product.fabric}</p>
              </section>
            )}
            {(product.sizes?.length ?? 0) > 0 && (
              <section>
                <h2 className="font-display text-base font-semibold">Sizes · সাইজ</h2>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <span key={s} className="rounded-full border border-border px-3 py-1 text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}
            {product.size_chart && (
              <section>
                <h2 className="font-display text-base font-semibold">Size chart · সাইজ চার্ট</h2>
                <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded-xl bg-muted p-3 font-sans text-xs text-muted-foreground">
                  {product.size_chart}
                </pre>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
