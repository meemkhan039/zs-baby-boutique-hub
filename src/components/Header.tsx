import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Phone, ShoppingCart, User, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { SHOP } from "@/lib/shop";

const NAV = [
  { to: "/", label: "Home", bn: "হোম" },
  { to: "/products", label: "Products", bn: "পণ্য" },
  { to: "/contact", label: "Contact", bn: "যোগাযোগ" },
] as const;

export default function Header() {
  const [open, setOpen] = useState(false);
  const { session, isAdmin, profile, signOut } = useAuth();
  const { totalPieces } = useCart();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="bg-brand-gradient px-4 py-1.5 text-center text-xs font-medium text-primary-foreground">
        পাইকারি দরে বেবি পোশাক · Wholesale only · MOQ applies
      </div>
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <button
          className="rounded-md p-2 text-foreground md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-gradient font-display text-sm font-bold text-primary-foreground">
            ZS
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold">{SHOP.name}</span>
            <span className="block text-[11px] text-muted-foreground">Baby Wholesale</span>
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
              activeProps={{ className: "bg-secondary text-secondary-foreground" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="rounded-md px-3 py-2 text-sm font-medium text-accent hover:bg-secondary"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Button asChild size="sm" variant="accent" className="hidden sm:inline-flex">
            <a href={SHOP.phoneHref}>
              <Phone className="size-4" /> Call Now
            </a>
          </Button>
          <Button asChild size="icon" variant="accent" className="sm:hidden">
            <a href={SHOP.phoneHref} aria-label="Call now">
              <Phone className="size-4" />
            </a>
          </Button>

          <Link
            to="/cart"
            className="relative rounded-md p-2 hover:bg-secondary"
            aria-label="Cart"
          >
            <ShoppingCart className="size-5" />
            {totalPieces > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {totalPieces}
              </span>
            )}
          </Link>

          {session ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/my-orders"
                className="max-w-28 truncate rounded-md px-2 py-2 text-sm font-medium hover:bg-secondary"
              >
                {profile?.shop_name || "My orders"}
              </Link>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
              >
                Log out
              </Button>
            </div>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link to="/auth">
                <User className="size-4" /> Login
              </Link>
            </Button>
          )}
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-card px-4 py-2 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2.5 text-sm font-medium"
            >
              {n.label} <span className="text-muted-foreground">· {n.bn}</span>
            </Link>
          ))}
          {session && (
            <Link
              to="/my-orders"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2.5 text-sm font-medium"
            >
              My Orders <span className="text-muted-foreground">· আমার অর্ডার</span>
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-accent"
            >
              Admin Dashboard
            </Link>
          )}
          {session && (
            <button
              className="block w-full rounded-md px-3 py-2.5 text-left text-sm font-medium"
              onClick={async () => {
                setOpen(false);
                await signOut();
                navigate({ to: "/" });
              }}
            >
              Log out
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
