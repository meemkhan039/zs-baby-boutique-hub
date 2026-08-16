import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/ImageUploader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { categoriesQuery, productsQuery, type ProductWithImages } from "@/lib/catalog";
import { ORDER_STATUSES, taka } from "@/lib/shop";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — ZS Garments" },
      {
        name: "description",
        content:
          "ZS Garments owner dashboard: add products with photos, manage wholesale orders, view registered shops and sales totals.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Dashboard — ZS Garments" },
      { property: "og:description", content: "Manage products, orders and buyers." },
    ],
  }),
  component: AdminPage,
});

const emptyForm = {
  id: "",
  name_en: "",
  name_bn: "",
  category_id: "",
  description: "",
  fabric: "",
  size_chart: "",
  sizes: "",
  price_per_piece: "",
  moq: "12",
  tier_12_price: "",
  tier_24_price: "",
  tier_50_price: "",
  is_featured: false,
  is_new: true,
  is_active: true,
};
type FormState = typeof emptyForm;

const productSchema = z.object({
  name_en: z.string().trim().min(2, "Product name is required").max(150),
  price_per_piece: z.number().positive("Price must be greater than 0"),
  moq: z.number().int().positive("MOQ must be at least 1"),
});

function AdminPage() {
  const { isAdmin, loading, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  if (loading) return <p className="p-10 text-center text-sm text-muted-foreground">Loading…</p>;
  if (!isAdmin)
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Admin only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This dashboard is for the shop owner. এই পাতা শুধু দোকান মালিকের জন্য।
        </p>
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-sm text-muted-foreground">অ্যাডমিন প্যানেল</p>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="flex w-full flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="buyers">Buyers</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Overview />
        </TabsContent>
        <TabsContent value="products">
          <ProductsAdmin />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersAdmin />
        </TabsContent>
        <TabsContent value="buyers">
          <BuyersAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------- Overview ---------------- */

function Overview() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [orders, buyers, products] = await Promise.all([
        supabase.from("orders").select("total_amount, total_pieces, status"),
        supabase.from("profiles").select("id"),
        supabase.from("products").select("id"),
      ]);
      const rows = orders.data ?? [];
      return {
        totalOrders: rows.length,
        pending: rows.filter((o) => o.status === "pending").length,
        revenue: rows
          .filter((o) => o.status !== "cancelled")
          .reduce((s, o) => s + Number(o.total_amount), 0),
        pieces: rows.reduce((s, o) => s + Number(o.total_pieces), 0),
        buyers: buyers.data?.length ?? 0,
        products: products.data?.length ?? 0,
      };
    },
  });

  const stats = [
    { label: "Total orders · মোট অর্ডার", value: String(data?.totalOrders ?? 0) },
    { label: "Pending · অপেক্ষমাণ", value: String(data?.pending ?? 0) },
    { label: "Revenue · বিক্রি", value: taka(data?.revenue ?? 0) },
    { label: "Pieces sold · পিস", value: String(data?.pieces ?? 0) },
    { label: "Registered shops · দোকান", value: String(data?.buyers ?? 0) },
    { label: "Products · পণ্য", value: String(data?.products ?? 0) },
  ];

  return (
    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
      {stats.map((s) => (
        <Card key={s.label} className="shadow-soft">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-primary">{s.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ---------------- Products ---------------- */

function ProductsAdmin() {
  const qc = useQueryClient();
  const { data: products } = useQuery(productsQuery({ includeInactive: true }));
  const { data: categories } = useQuery(categoriesQuery);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const current = products?.find((p) => p.id === form.id) ?? null;
  const refresh = () => qc.invalidateQueries({ queryKey: ["products"] });

  function edit(p: ProductWithImages) {
    setForm({
      id: p.id,
      name_en: p.name_en,
      name_bn: p.name_bn,
      category_id: p.category_id ?? "",
      description: p.description,
      fabric: p.fabric,
      size_chart: p.size_chart,
      sizes: (p.sizes ?? []).join(", "),
      price_per_piece: String(p.price_per_piece),
      moq: String(p.moq),
      tier_12_price: p.tier_12_price != null ? String(p.tier_12_price) : "",
      tier_24_price: p.tier_24_price != null ? String(p.tier_24_price) : "",
      tier_50_price: p.tier_50_price != null ? String(p.tier_50_price) : "",
      is_featured: p.is_featured,
      is_new: p.is_new,
      is_active: p.is_active,
    });
    setOpen(true);
  }

  const set =
    (k: keyof FormState) => (e: { target: { value: string } }) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const num = (v: string) => (v.trim() === "" ? null : Number(v));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = productSchema.safeParse({
      name_en: form.name_en,
      price_per_piece: Number(form.price_per_piece),
      moq: Number(form.moq),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        name_en: form.name_en.trim(),
        name_bn: form.name_bn.trim(),
        category_id: form.category_id || null,
        description: form.description.trim(),
        fabric: form.fabric.trim(),
        size_chart: form.size_chart.trim(),
        sizes: form.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        price_per_piece: Number(form.price_per_piece),
        moq: Number(form.moq),
        tier_12_price: num(form.tier_12_price),
        tier_24_price: num(form.tier_24_price),
        tier_50_price: num(form.tier_50_price),
        is_featured: form.is_featured,
        is_new: form.is_new,
        is_active: form.is_active,
      };
      if (form.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", form.id);
        if (error) throw error;
        toast.success("Product updated");
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        setForm((f) => ({ ...f, id: data.id }));
        toast.success("Product created — now add photos");
      }
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save product");
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: ProductWithImages) {
    if (!confirm(`Delete "${p.name_en}"?`)) return;
    const paths = p.product_images.map((i) => i.storage_path).filter(Boolean);
    if (paths.length) await supabase.storage.from("product-images").remove(paths);
    await supabase.from("product_images").delete().eq("product_id", p.id);
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Product deleted");
      if (form.id === p.id) {
        setForm(emptyForm);
        setOpen(false);
      }
      refresh();
    }
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Products · পণ্য</h2>
        <Button
          onClick={() => {
            setForm(emptyForm);
            setOpen(true);
          }}
        >
          <Plus className="size-4" /> Add product
        </Button>
      </div>

      {open && (
        <Card className="mt-4 shadow-soft">
          <CardContent className="p-5">
            <form onSubmit={save} className="grid gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor="name_en">Name (English)</Label>
                <Input id="name_en" value={form.name_en} onChange={set("name_en")} required />
              </div>
              <div>
                <Label htmlFor="name_bn">নাম (বাংলা)</Label>
                <Input id="name_bn" value={form.name_bn} onChange={set("name_bn")} />
              </div>
              <div>
                <Label>Category · ক্যাটাগরি</Label>
                <Select
                  value={form.category_id}
                  onValueChange={(v) => setForm((f) => ({ ...f, category_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name_en} · {c.name_bn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sizes">Sizes (comma separated)</Label>
                <Input
                  id="sizes"
                  placeholder="0-3M, 3-6M, 6-12M"
                  value={form.sizes}
                  onChange={set("sizes")}
                />
              </div>
              <div>
                <Label htmlFor="price">Price / piece (৳)</Label>
                <Input
                  id="price"
                  inputMode="decimal"
                  value={form.price_per_piece}
                  onChange={set("price_per_piece")}
                  required
                />
              </div>
              <div>
                <Label htmlFor="moq">Minimum order (pcs)</Label>
                <Input id="moq" inputMode="numeric" value={form.moq} onChange={set("moq")} required />
              </div>
              <div>
                <Label htmlFor="t12">12+ pcs price</Label>
                <Input id="t12" inputMode="decimal" value={form.tier_12_price} onChange={set("tier_12_price")} />
              </div>
              <div>
                <Label htmlFor="t24">24+ pcs price</Label>
                <Input id="t24" inputMode="decimal" value={form.tier_24_price} onChange={set("tier_24_price")} />
              </div>
              <div>
                <Label htmlFor="t50">50+ pcs price</Label>
                <Input id="t50" inputMode="decimal" value={form.tier_50_price} onChange={set("tier_50_price")} />
              </div>
              <div>
                <Label htmlFor="fabric">Fabric · কাপড়</Label>
                <Input id="fabric" value={form.fabric} onChange={set("fabric")} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description · বিবরণ</Label>
                <Textarea id="description" value={form.description} onChange={set("description")} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="size_chart">Size chart · সাইজ চার্ট</Label>
                <Textarea id="size_chart" value={form.size_chart} onChange={set("size_chart")} />
              </div>

              <div className="flex flex-wrap gap-5 md:col-span-2">
                <Toggle
                  label="Featured"
                  checked={form.is_featured}
                  onChange={(v) => setForm((f) => ({ ...f, is_featured: v }))}
                />
                <Toggle
                  label="New arrival"
                  checked={form.is_new}
                  onChange={(v) => setForm((f) => ({ ...f, is_new: v }))}
                />
                <Toggle
                  label="Visible in shop"
                  checked={form.is_active}
                  onChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
                />
              </div>

              <div className="flex gap-2 md:col-span-2">
                <Button type="submit" variant="hero" disabled={busy}>
                  {busy ? "Saving…" : form.id ? "Save changes" : "Create product"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setForm(emptyForm);
                    setOpen(false);
                  }}
                >
                  Close
                </Button>
              </div>
            </form>

            <div className="mt-5 border-t border-border pt-4">
              <h3 className="font-display font-semibold">Photos · ছবি</h3>
              {form.id ? (
                <div className="mt-2">
                  <ImageUploader
                    productId={form.id}
                    images={current?.product_images ?? []}
                    onChange={refresh}
                  />
                </div>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  Create the product first, then upload photos here.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-5 space-y-2">
        {(products ?? []).map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
          >
            <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
              {p.product_images[0] && (
                <img src={p.product_images[0].url} alt="" className="size-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{p.name_en}</p>
              <p className="text-xs text-muted-foreground">
                {taka(Number(p.price_per_piece))} / pc · MOQ {p.moq} · {p.product_images.length}{" "}
                photos
              </p>
            </div>
            {!p.is_active && <Badge variant="outline">Hidden</Badge>}
            <Button size="icon" variant="ghost" onClick={() => edit(p)} aria-label="Edit">
              <Pencil className="size-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => void remove(p)} aria-label="Delete">
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <Switch checked={checked} onCheckedChange={onChange} />
      {label}
    </label>
  );
}

/* ---------------- Orders ---------------- */

function OrdersAdmin() {
  const qc = useQueryClient();
  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(id, product_name, quantity, unit_price, line_total)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Order marked ${status}`);
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
    }
  }

  return (
    <div className="mt-4 space-y-3">
      {(orders ?? []).length === 0 && (
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      )}
      {(orders ?? []).map((o) => (
        <Card key={o.id} className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-display font-bold">
                  #{o.order_no} · {o.shop_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {o.contact_name} ·{" "}
                  <a href={`tel:+88${o.phone}`} className="text-primary">
                    {o.phone}
                  </a>{" "}
                  · {new Date(o.created_at).toLocaleString("en-GB")}
                </p>
              </div>
              <Select value={o.status} onValueChange={(v) => void setStatus(o.id, v)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-3 space-y-1 text-sm">
              {(o.order_items ?? []).map((i) => (
                <div key={i.id} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    {i.product_name} × {i.quantity}
                  </span>
                  <span>{taka(Number(i.line_total))}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {o.delivery_method === "pickup" ? "Pickup at shop" : `Courier — ${o.address}`} ·{" "}
              {o.payment_method.toUpperCase()}
              {o.payment_reference ? ` (${o.payment_reference})` : ""}
              {o.note ? ` · Note: ${o.note}` : ""}
            </p>
            <p className="mt-1 text-right font-display text-lg font-bold text-primary">
              {o.total_pieces} pcs · {taka(Number(o.total_amount))}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ---------------- Buyers ---------------- */

function BuyersAdmin() {
  const { data: buyers } = useQuery({
    queryKey: ["admin-buyers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="mt-4 space-y-2">
      {(buyers ?? []).map((b) => (
        <div key={b.id} className="rounded-2xl border border-border bg-card p-3">
          <p className="font-semibold">{b.shop_name || "(no shop name)"}</p>
          <p className="text-xs text-muted-foreground">
            {b.full_name} ·{" "}
            <a href={`tel:+88${b.phone}`} className="text-primary">
              {b.phone}
            </a>{" "}
            · {b.email}
          </p>
        </div>
      ))}
    </div>
  );
}
