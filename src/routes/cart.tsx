import { createFileRoute, Link } from "@tanstack/react-router";
import { ImageIcon, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { taka, unitPriceFor } from "@/lib/shop";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Wholesale Cart — ZS Garments" },
      {
        name: "description",
        content:
          "Review your bulk baby clothing order: total pieces, per-piece tier price and order total before checkout with ZS Garments.",
      },
      { property: "og:title", content: "Your Wholesale Cart — ZS Garments" },
      { property: "og:description", content: "Review total pieces and price before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, removeItem, totalPieces, totalAmount } = useCart();
  const { session } = useAuth();

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-1 text-sm text-muted-foreground">আপনার কার্ট খালি</p>
        <Button asChild className="mt-5">
          <Link to="/products">Browse products</Link>
        </Button>
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Cart</h1>
      <p className="text-sm text-muted-foreground">কার্ট</p>

      <div className="mt-6 space-y-3">
        {items.map((i) => {
          const unit = unitPriceFor(i, i.qty);
          const step = i.moq >= 12 ? 12 : 1;
          return (
            <div
              key={i.productId}
              className="flex gap-3 rounded-2xl border border-border bg-card p-3"
            >
              <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                {i.image ? (
                  <img src={i.image} alt={i.name} className="size-full object-cover" />
                ) : (
                  <div className="grid size-full place-items-center text-muted-foreground">
                    <ImageIcon className="size-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-semibold">{i.name}</p>
                <p className="text-xs text-muted-foreground">
                  {taka(unit)} / pc · MOQ {i.moq}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center rounded-lg border border-border">
                    <button
                      className="p-1.5"
                      onClick={() => setQty(i.productId, Math.max(i.moq, i.qty - step))}
                      aria-label="Decrease"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-12 text-center text-sm font-semibold">{i.qty}</span>
                    <button
                      className="p-1.5"
                      onClick={() => setQty(i.productId, i.qty + step)}
                      aria-label="Increase"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground">pcs</span>
                  <button
                    className="ml-auto text-destructive"
                    onClick={() => removeItem(i.productId)}
                    aria-label="Remove item"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display font-bold">{taka(unit * i.qty)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total pieces · মোট পিস</span>
          <span className="font-semibold">{totalPieces}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-muted-foreground">Total · সর্বমোট</span>
          <span className="font-display text-2xl font-bold text-primary">{taka(totalAmount)}</span>
        </div>
        {session ? (
          <Button asChild variant="hero" size="lg" className="mt-4 w-full">
            <Link to="/checkout">Proceed to Checkout · অর্ডার করুন</Link>
          </Button>
        ) : (
          <Button asChild size="lg" className="mt-4 w-full">
            <Link to="/auth">Login to place order</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
