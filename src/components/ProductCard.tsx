import { Link } from "@tanstack/react-router";
import { Lock, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { taka } from "@/lib/shop";
import { useAuth } from "@/lib/auth";
import type { ProductWithImages } from "@/lib/catalog";

export default function ProductCard({ product }: { product: ProductWithImages }) {
  const { session } = useAuth();
  const img = product.product_images?.[0]?.url ?? null;

  return (
    <Link
      to="/products/$productId"
      params={{ productId: product.id }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-card"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {img ? (
          <img
            src={img}
            alt={product.name_en}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <ImageIcon className="size-8" />
          </div>
        )}
        <div className="absolute left-2 top-2 flex gap-1">
          {product.is_new && <Badge className="bg-accent text-accent-foreground">New</Badge>}
          {product.is_featured && <Badge className="bg-primary">Featured</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-1 font-display text-sm font-semibold">{product.name_en}</h3>
        {product.name_bn && (
          <p className="line-clamp-1 text-xs text-muted-foreground">{product.name_bn}</p>
        )}
        <div className="mt-auto pt-2">
          {session ? (
            <p className="font-display text-lg font-bold text-primary">
              {taka(product.price_per_piece)}
              <span className="ml-1 text-xs font-medium text-muted-foreground">/ pc</span>
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-xs font-medium text-accent">
              <Lock className="size-3.5" /> Login to see wholesale price
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            MOQ: {product.moq} pcs · সর্বনিম্ন {product.moq} পিস
          </p>
        </div>
      </div>
    </Link>
  );
}
