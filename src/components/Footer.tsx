import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Phone, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SHOP } from "@/lib/shop";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h3 className="font-display text-xl font-bold">{SHOP.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{SHOP.nameBn}</p>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{SHOP.tagline}</p>
        </div>

        <div className="space-y-2.5 text-sm">
          <h4 className="font-display text-base font-semibold">Contact · যোগাযোগ</h4>
          <p className="flex items-center gap-2">
            <UserRound className="size-4 text-primary" /> {SHOP.owner}
          </p>
          <p className="flex items-center gap-2">
            <Phone className="size-4 text-primary" />
            <a href={SHOP.phoneHref} className="font-semibold hover:underline">
              {SHOP.phone}
            </a>
          </p>
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" /> {SHOP.address}
          </p>
          <p className="flex items-start gap-2">
            <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              {SHOP.hours} · {SHOP.closed}
            </span>
          </p>
          <Button asChild variant="accent" size="sm" className="mt-1">
            <a href={SHOP.phoneHref}>
              <Phone className="size-4" /> Call Now · এখনই কল করুন
            </a>
          </Button>
        </div>

        <div className="space-y-2 text-sm">
          <h4 className="font-display text-base font-semibold">Links</h4>
          <Link to="/products" className="block text-muted-foreground hover:text-foreground">
            All Products · সব পণ্য
          </Link>
          <Link to="/cart" className="block text-muted-foreground hover:text-foreground">
            Cart · কার্ট
          </Link>
          <Link to="/contact" className="block text-muted-foreground hover:text-foreground">
            Contact Us · যোগাযোগ
          </Link>
          <Link to="/auth" className="block text-muted-foreground hover:text-foreground">
            Wholesale Login · পাইকারি লগইন
          </Link>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SHOP.name} — Wholesale baby clothing, Bangladesh.
      </div>
    </footer>
  );
}
