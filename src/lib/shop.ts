export const SHOP = {
  name: "ZS Garments",
  nameBn: "জেড এস গার্মেন্টস",
  tagline: "Baby clothing wholesale — direct from factory to your shop",
  taglineBn: "বেবি পোশাকের পাইকারি — সরাসরি কারখানা থেকে আপনার দোকানে",
  owner: "Osama Bin Ibrahim",
  phone: "01716314776",
  phoneHref: "tel:+8801716314776",
  address: "Noyamati, Momtaz Market, Shop No. 15",
  addressBn: "নোয়ামতি, মমতাজ মার্কেট, দোকান নং ১৫",
  hours: "10:00 AM – 8:00 PM",
  hoursBn: "সকাল ১০টা – রাত ৮টা",
  closed: "Closed on Friday",
  closedBn: "শুক্রবার বন্ধ",
  bkash: "01716314776",
  nagad: "01716314776",
} as const;

export function taka(n: number): string {
  return `৳${Number(n || 0).toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
}

export type Tiered = {
  price_per_piece: number;
  tier_12_price: number | null;
  tier_24_price: number | null;
  tier_50_price: number | null;
};

/** Wholesale unit price for a given piece quantity, applying bulk tiers. */
export function unitPriceFor(p: Tiered, qty: number): number {
  if (qty >= 50 && p.tier_50_price) return Number(p.tier_50_price);
  if (qty >= 24 && p.tier_24_price) return Number(p.tier_24_price);
  if (qty >= 12 && p.tier_12_price) return Number(p.tier_12_price);
  return Number(p.price_per_piece);
}

export const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
