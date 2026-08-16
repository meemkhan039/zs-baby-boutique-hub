import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SHOP, taka } from "@/lib/shop";

export const Route = createFileRoute("/order/$orderId")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — ZS Garments Wholesale" },
      {
        name: "description",
        content:
          "Your wholesale order at ZS Garments is placed. See your order number, items, delivery method and payment instructions.",
      },
      { property: "og:title", content: "Order Confirmed — ZS Garments Wholesale" },
      { property: "og:description", content: "Order details and payment instructions." },
    ],
  }),
  component: OrderPage,
});

const orderQuery = (id: string) => ({
  queryKey: ["order", id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(id, product_name, quantity, unit_price, line_total)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
});

function OrderPage() {
  const { orderId } = Route.useParams();
  const { data: order, isLoading } = useQuery(orderQuery(orderId));

  if (isLoading) return <p className="p-10 text-center text-sm text-muted-foreground">Loading…</p>;
  if (!order)
    return (
      <div className="p-10 text-center">
        <p className="text-sm text-muted-foreground">Order not found.</p>
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-14 text-primary" />
        <h1 className="mt-3 font-display text-3xl font-bold">Order Confirmed!</h1>
        <p className="text-muted-foreground">আপনার অর্ডার গৃহীত হয়েছে</p>
        <p className="mt-2 text-sm">
          Order No: <strong>#{order.order_no}</strong>
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="space-y-2 text-sm">
          {(order.order_items ?? []).map((i) => (
            <div key={i.id} className="flex justify-between gap-2">
              <span className="min-w-0 truncate text-muted-foreground">
                {i.product_name} × {i.quantity} @ {taka(Number(i.unit_price))}
              </span>
              <span className="font-medium">{taka(Number(i.line_total))}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
          <Row label="Total pieces" value={String(order.total_pieces)} />
          <Row label="Shop" value={order.shop_name} />
          <Row label="Phone" value={order.phone} />
          <Row
            label="Delivery"
            value={order.delivery_method === "pickup" ? "Pickup at shop" : "Courier"}
          />
          <Row label="Address" value={order.address} />
          <Row label="Payment" value={order.payment_method.toUpperCase()} />
          {order.payment_reference && <Row label="Txn ID" value={order.payment_reference} />}
          <Row label="Status" value={order.status} />
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="text-muted-foreground">Total</span>
          <span className="font-display text-2xl font-bold text-primary">
            {taka(Number(order.total_amount))}
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-secondary p-4 text-center text-sm">
        <p>
          We will call you shortly to confirm. Any question? Call {SHOP.owner}.
        </p>
        <p className="text-muted-foreground">যেকোনো প্রশ্নে ফোন করুন।</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Button asChild variant="hero">
            <a href={SHOP.phoneHref}>
              <Phone className="size-4" /> Call {SHOP.phone}
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link to="/my-orders">My Orders</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/products">Keep shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
