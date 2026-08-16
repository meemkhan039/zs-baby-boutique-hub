import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { SHOP, taka, unitPriceFor } from "@/lib/shop";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — ZS Garments Wholesale Order" },
      {
        name: "description",
        content:
          "Confirm your bulk baby clothing order: shop details, courier or pickup delivery, and Cash on Delivery or bKash/Nagad payment.",
      },
      { property: "og:title", content: "Checkout — ZS Garments Wholesale Order" },
      {
        property: "og:description",
        content: "Place your paikari order with courier or pickup and COD / bKash / Nagad payment.",
      },
    ],
  }),
  component: CheckoutPage,
});

const schema = z.object({
  shop_name: z.string().trim().min(2, "Shop name is required").max(120),
  contact_name: z.string().trim().min(2, "Contact name is required").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^01[3-9]\d{8}$/, "Enter a valid 11-digit BD mobile number"),
  address: z.string().trim().min(5, "Delivery address is required").max(500),
  note: z.string().trim().max(500),
  payment_reference: z.string().trim().max(100),
});

function CheckoutPage() {
  const { session, profile } = useAuth();
  const { items, totalPieces, totalAmount, clear } = useCart();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [delivery, setDelivery] = useState<"courier" | "pickup">("courier");
  const [payment, setPayment] = useState<"cod" | "bkash" | "nagad">("cod");
  const [form, setForm] = useState({
    shop_name: "",
    contact_name: "",
    phone: "",
    address: "",
    note: "",
    payment_reference: "",
  });

  useEffect(() => {
    if (profile)
      setForm((f) => ({
        ...f,
        shop_name: f.shop_name || profile.shop_name,
        contact_name: f.contact_name || profile.full_name,
        phone: f.phone || profile.phone,
      }));
  }, [profile]);

  useEffect(() => {
    if (session === null) navigate({ to: "/auth", replace: true });
  }, [session, navigate]);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Your cart is empty.</p>
      </div>
    );

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    const userId = session?.user?.id;
    if (!userId) {
      navigate({ to: "/auth" });
      return;
    }
    setBusy(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          shop_name: parsed.data.shop_name,
          contact_name: parsed.data.contact_name,
          phone: parsed.data.phone,
          address: delivery === "pickup" ? `Pickup at shop — ${SHOP.address}` : parsed.data.address,
          delivery_method: delivery,
          payment_method: payment,
          payment_reference: parsed.data.payment_reference,
          note: parsed.data.note,
          total_pieces: totalPieces,
          total_amount: totalAmount,
          status: "pending",
        })
        .select("id")
        .single();
      if (error) throw error;

      const { error: itemsError } = await supabase.from("order_items").insert(
        items.map((i) => {
          const unit = unitPriceFor(i, i.qty);
          return {
            order_id: order.id,
            product_id: i.productId,
            product_name: i.name,
            quantity: i.qty,
            unit_price: unit,
            line_total: unit * i.qty,
          };
        }),
      );
      if (itemsError) throw itemsError;

      clear();
      navigate({ to: "/order/$orderId", params: { orderId: order.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place the order");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Checkout</h1>
      <p className="text-sm text-muted-foreground">অর্ডার সম্পন্ন করুন</p>

      <form onSubmit={placeOrder} className="mt-6 grid gap-5 md:grid-cols-[1.4fr_1fr]">
        <Card className="shadow-soft">
          <CardContent className="space-y-3.5 p-5">
            <div>
              <Label htmlFor="shop_name">Shop Name · দোকানের নাম</Label>
              <Input id="shop_name" value={form.shop_name} onChange={set("shop_name")} required />
            </div>
            <div>
              <Label htmlFor="contact_name">Contact Person · যোগাযোগকারী</Label>
              <Input
                id="contact_name"
                value={form.contact_name}
                onChange={set("contact_name")}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone · মোবাইল</Label>
              <Input id="phone" inputMode="numeric" value={form.phone} onChange={set("phone")} required />
            </div>

            <div>
              <Label>Delivery method · ডেলিভারি</Label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {(
                  [
                    { v: "courier", en: "Courier", bn: "কুরিয়ার" },
                    { v: "pickup", en: "Pickup at shop", bn: "দোকান থেকে নিব" },
                  ] as const
                ).map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => setDelivery(o.v)}
                    className={`rounded-xl border p-3 text-left text-sm ${delivery === o.v ? "border-primary bg-secondary" : "border-border"}`}
                  >
                    <span className="block font-semibold">{o.en}</span>
                    <span className="block text-xs text-muted-foreground">{o.bn}</span>
                  </button>
                ))}
              </div>
            </div>

            {delivery === "courier" ? (
              <div>
                <Label htmlFor="address">Delivery Address · ঠিকানা</Label>
                <Textarea id="address" value={form.address} onChange={set("address")} required />
              </div>
            ) : (
              <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                Collect from: {SHOP.address} ({SHOP.hours}, {SHOP.closed})
              </p>
            )}

            <div>
              <Label>Payment · পেমেন্ট</Label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {(
                  [
                    { v: "cod", en: "Cash on Delivery", bn: "ক্যাশ অন ডেলিভারি" },
                    { v: "bkash", en: "bKash", bn: "বিকাশ" },
                    { v: "nagad", en: "Nagad", bn: "নগদ" },
                  ] as const
                ).map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => setPayment(o.v)}
                    className={`rounded-xl border p-2.5 text-center text-xs ${payment === o.v ? "border-primary bg-secondary" : "border-border"}`}
                  >
                    <span className="block font-semibold">{o.en}</span>
                    <span className="block text-[11px] text-muted-foreground">{o.bn}</span>
                  </button>
                ))}
              </div>
            </div>

            {payment !== "cod" && (
              <div className="rounded-xl bg-secondary p-3">
                <p className="text-sm">
                  Send money to{" "}
                  <strong>{payment === "bkash" ? SHOP.bkash : SHOP.nagad}</strong> (
                  {payment === "bkash" ? "bKash" : "Nagad"} personal), then enter the transaction
                  ID below.
                </p>
                <Label htmlFor="txn" className="mt-2 block">
                  Transaction ID · ট্রানজেকশন আইডি
                </Label>
                <Input
                  id="txn"
                  value={form.payment_reference}
                  onChange={set("payment_reference")}
                  placeholder="e.g. 8N7A2K1LQZ"
                  className="mt-1 bg-card"
                />
              </div>
            )}

            <div>
              <Label htmlFor="note">Note (optional) · মন্তব্য</Label>
              <Textarea id="note" value={form.note} onChange={set("note")} />
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit shadow-soft md:sticky md:top-28">
          <CardContent className="p-5">
            <h2 className="font-display text-lg font-bold">Order Summary</h2>
            <div className="mt-3 space-y-2 text-sm">
              {items.map((i) => (
                <div key={i.productId} className="flex justify-between gap-2">
                  <span className="min-w-0 truncate text-muted-foreground">
                    {i.name} × {i.qty}
                  </span>
                  <span className="font-medium">{taka(unitPriceFor(i, i.qty) * i.qty)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-border pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total pieces</span>
                <span className="font-semibold">{totalPieces}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display text-xl font-bold text-primary">
                  {taka(totalAmount)}
                </span>
              </div>
            </div>
            <Button type="submit" variant="hero" size="lg" className="mt-4 w-full" disabled={busy}>
              {busy ? "Placing order…" : "Place Order · অর্ডার করুন"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
