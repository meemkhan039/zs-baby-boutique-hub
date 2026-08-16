import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, Phone, Store, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SHOP } from "@/lib/shop";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact ZS Garments — Baby Wholesale, Noyamati" },
      {
        name: "description",
        content:
          "Call ZS Garments at 01716314776. Owner Osama Bin Ibrahim. Noyamati, Momtaz Market, Shop No. 15. Open 10 AM–8 PM, closed Fridays.",
      },
      { property: "og:title", content: "Contact ZS Garments — Baby Wholesale" },
      {
        property: "og:description",
        content: "Wholesale baby clothing in Bangladesh. Call 01716314776 to order in bulk.",
      },
    ],
  }),
  component: ContactPage,
});

const rows = [
  { icon: UserRound, label: "Owner · মালিক", value: SHOP.owner },
  { icon: Store, label: "Shop · দোকান", value: `${SHOP.name} (${SHOP.nameBn})` },
  { icon: MapPin, label: "Address · ঠিকানা", value: `${SHOP.address} — ${SHOP.addressBn}` },
  {
    icon: Clock,
    label: "Business hours · সময়",
    value: `${SHOP.hours} (${SHOP.hoursBn}) — ${SHOP.closed} / ${SHOP.closedBn}`,
  },
];

function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Contact Us</h1>
      <p className="mt-1 text-muted-foreground">আমাদের সাথে যোগাযোগ করুন</p>

      <Card className="mt-6 border-border shadow-soft">
        <CardContent className="space-y-5 p-5">
          <a
            href={SHOP.phoneHref}
            className="flex items-center gap-4 rounded-xl bg-hero-gradient p-4 transition-opacity hover:opacity-95"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
              <Phone className="size-6" />
            </span>
            <span>
              <span className="block text-xs font-medium text-muted-foreground">
                Tap to call · কল করতে চাপুন
              </span>
              <span className="block font-display text-2xl font-bold">{SHOP.phone}</span>
            </span>
          </a>

          <div className="divide-y divide-border">
            {rows.map((r) => (
              <div key={r.label} className="flex gap-3 py-3">
                <r.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {r.label}
                  </p>
                  <p className="text-sm font-medium">{r.value}</p>
                </div>
              </div>
            ))}
          </div>

          <Button asChild variant="hero" size="lg" className="w-full">
            <a href={SHOP.phoneHref}>
              <Phone className="size-5" /> Call Now · এখনই কল করুন
            </a>
          </Button>

          <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            আমরা শুধুমাত্র পাইকারি বিক্রি করি। অর্ডারের আগে সর্বনিম্ন পরিমাণ (MOQ) দেখে নিন। We sell
            wholesale only — please check the minimum order quantity on each product.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
