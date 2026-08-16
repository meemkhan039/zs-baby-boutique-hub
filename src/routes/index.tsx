import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin, Package, Phone, Sparkles, Truck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { categoriesQuery, productsQuery } from "@/lib/catalog";
import { SHOP } from "@/lib/shop";
import heroImage from "@/assets/hero-baby-wholesale.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZS Garments — Baby Clothing Wholesale in Bangladesh" },
      {
        name: "description",
        content:
          "Wholesale baby clothing from ZS Garments, Noyamati. Frocks, dungaree sets, winter & cotton wear at factory paikari rates. Call 01716314776.",
      },
      { property: "og:title", content: "ZS Garments — Baby Clothing Wholesale" },
      {
        property: "og:description",
        content:
          "Paikari baby dresses for shopkeepers and resellers across Bangladesh. Register to see wholesale prices.",
      },
    ],
  }),
  component: Home,
});

const PERKS = [
  { icon: Package, en: "Factory paikari rates", bn: "সরাসরি কারখানার দাম" },
  { icon: Truck, en: "Courier all over Bangladesh", bn: "সারাদেশে কুরিয়ার" },
  { icon: Sparkles, en: "New designs every week", bn: "প্রতি সপ্তাহে নতুন ডিজাইন" },
];

function Home() {
  const { data: products = [] } = useQuery(productsQuery());
  const { data: categories = [] } = useQuery(categoriesQuery);

  const featured = products.filter((p) => p.is_featured || p.is_new).slice(0, 8);
  const showcase = featured.length ? featured : products.slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="bg-hero-gradient">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-16">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card/80 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" /> Wholesale only · পাইকারি
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight md:text-5xl">
              {SHOP.name}
            </h1>
            <p className="mt-2 font-display text-lg font-semibold text-primary">{SHOP.nameBn}</p>
            <p className="mt-3 max-w-md text-base text-foreground/80">{SHOP.tagline}</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">{SHOP.taglineBn}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg">
                <Link to="/products">Browse Products · পণ্য দেখুন</Link>
              </Button>
              <Button asChild variant="accent" size="lg">
                <a href={SHOP.phoneHref}>
                  <Phone className="size-5" /> Call Now
                </a>
              </Button>
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              {PERKS.map((p) => (
                <div key={p.en} className="rounded-xl bg-card/70 p-3">
                  <p.icon className="size-5 text-primary" />
                  <p className="mt-1.5 text-sm font-semibold">{p.en}</p>
                  <p className="text-xs text-muted-foreground">{p.bn}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl shadow-card">
            <img
              src={heroImage}
              alt="Stacks of baby frocks and clothing sets ready for wholesale at ZS Garments"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Owner contact strip */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <UserRound className="size-4 text-primary" /> {SHOP.owner}
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4 text-primary" /> {SHOP.address}
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-4 text-primary" /> {SHOP.hours} · {SHOP.closed}
          </span>
          <Button asChild size="sm" variant="accent" className="ml-auto">
            <a href={SHOP.phoneHref}>
              <Phone className="size-4" /> {SHOP.phone}
            </a>
          </Button>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="font-display text-2xl font-bold">Shop by Category</h2>
        <p className="text-sm text-muted-foreground">ক্যাটাগরি অনুযায়ী দেখুন</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/products"
              search={{ category: c.slug }}
              className="rounded-2xl border border-border bg-card p-4 text-center shadow-soft transition-transform hover:-translate-y-0.5"
            >
              <p className="font-display text-sm font-semibold">{c.name_en}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{c.name_bn}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">New Arrivals & Featured</h2>
            <p className="text-sm text-muted-foreground">নতুন ও জনপ্রিয় ডিজাইন</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/products">View all →</Link>
          </Button>
        </div>

        {showcase.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No products yet. The shop owner can add designs from the Admin dashboard.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {showcase.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
