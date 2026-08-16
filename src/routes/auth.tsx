import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { SHOP } from "@/lib/shop";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Wholesale Login & Registration — ZS Garments" },
      {
        name: "description",
        content:
          "Shopkeepers: register your shop with ZS Garments to unlock wholesale baby clothing prices and place bulk orders online.",
      },
      { property: "og:title", content: "Wholesale Login & Registration — ZS Garments" },
      {
        property: "og:description",
        content: "Register your shop to see paikari prices and order baby clothing in bulk.",
      },
    ],
  }),
  component: AuthPage,
});

const signupSchema = z.object({
  full_name: z.string().trim().min(2, "Name is required").max(100),
  shop_name: z.string().trim().min(2, "Shop name is required").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^01[3-9]\d{8}$/, "Enter a valid 11-digit BD mobile number"),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({
    full_name: "",
    shop_name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) navigate({ to: "/products", replace: true });
  }, [session, navigate]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const parsed = signupSchema.safeParse(form);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: parsed.data.full_name,
              shop_name: parsed.data.shop_name,
              phone: parsed.data.phone,
            },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          toast.success("Check your email to confirm your account");
        } else {
          toast.success("Welcome to ZS Garments wholesale!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) throw error;
        toast.success("Logged in");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (sent)
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your
          wholesale account.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          আপনার ইমেইলে পাঠানো লিংকে ক্লিক করে অ্যাকাউন্ট চালু করুন।
        </p>
      </div>
    );

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-center font-display text-3xl font-bold">
        {mode === "login" ? "Wholesale Login" : "Register Your Shop"}
      </h1>
      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? "পাইকারি লগইন" : "আপনার দোকান রেজিস্টার করুন"}
      </p>

      <Card className="mt-6 shadow-soft">
        <CardContent className="p-5">
          <form onSubmit={submit} className="space-y-3.5">
            {mode === "signup" && (
              <>
                <div>
                  <Label htmlFor="full_name">Your Name · নাম</Label>
                  <Input id="full_name" value={form.full_name} onChange={set("full_name")} required />
                </div>
                <div>
                  <Label htmlFor="shop_name">Shop Name · দোকানের নাম</Label>
                  <Input id="shop_name" value={form.shop_name} onChange={set("shop_name")} required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone · মোবাইল</Label>
                  <Input
                    id="phone"
                    inputMode="numeric"
                    placeholder="01XXXXXXXXX"
                    value={form.phone}
                    onChange={set("phone")}
                    required
                  />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">Email · ইমেইল</Label>
              <Input id="email" type="email" value={form.email} onChange={set("email")} required />
            </div>
            <div>
              <Label htmlFor="password">Password · পাসওয়ার্ড</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={set("password")}
                required
              />
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "login" ? "Login" : "Create Account"}
            </Button>
          </form>

          <button
            className="mt-4 w-full text-center text-sm text-primary hover:underline"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login"
              ? "New buyer? Register your shop · নতুন? রেজিস্টার করুন"
              : "Already registered? Login · লগইন করুন"}
          </button>

          <p className="mt-4 rounded-lg bg-muted p-3 text-center text-xs text-muted-foreground">
            Trouble registering? Call {SHOP.owner} at{" "}
            <a href={SHOP.phoneHref} className="font-semibold text-primary">
              {SHOP.phone}
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
