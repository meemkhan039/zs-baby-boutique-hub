import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { taka } from "@/lib/shop";

export const Route = createFileRoute("/my-orders")({
  head: () => ({
    meta: [
      { title: "My Wholesale Orders — ZS Garments" },
      {
        name: "description",
        content:
          "Track your ZS Garments bulk orders: order number, total pieces, amount and current delivery status.",
      },
      { property: "og:title", content: "My Wholesale Orders — ZS Garments" },
      { property: "og:description", content: "Track your bulk baby clothing orders and status." },
    ],
  }),
  component: MyOrders,
});

const statusTone: Record<string, string> = {
  pending: "bg-muted text-foreground",
  confirmed: "bg-primary text-primary-foreground",
  shipped: "bg-accent text-accent-foreground",
  delivered: "bg-primary text-primary-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

function MyOrders() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const userId = session?.user?.id;

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  const { data: orders } = useQuery({
    queryKey: ["my-orders", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">My Orders</h1>
      <p className="text-sm text-muted-foreground">আমার অর্ডার</p>

      {orders && orders.length === 0 && (
        <div className="mt-8 rounded-2xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">No orders yet.</p>
          <Button asChild className="mt-4">
            <Link to="/products">Start ordering</Link>
          </Button>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {(orders ?? []).map((o) => (
          <Link
            key={o.id}
            to="/order/$orderId"
            params={{ orderId: o.id }}
            className="block rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary"
          >
            <div className="flex items-center justify-between">
              <span className="font-display font-bold">#{o.order_no}</span>
              <Badge className={statusTone[o.status] ?? "bg-muted"}>{o.status}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(o.created_at).toLocaleDateString("en-GB")} · {o.total_pieces} pcs ·{" "}
              {o.delivery_method}
            </p>
            <p className="mt-1 font-display text-lg font-bold text-primary">
              {taka(Number(o.total_amount))}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
