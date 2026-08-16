import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { unitPriceFor, type Tiered } from "./shop";

export type CartItem = Tiered & {
  productId: string;
  name: string;
  image: string | null;
  moq: number;
  qty: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  setQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  totalPieces: number;
  totalAmount: number;
};

const KEY = "zs-cart-v1";
const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartState>(() => {
    const totalPieces = items.reduce((s, i) => s + i.qty, 0);
    const totalAmount = items.reduce((s, i) => s + i.qty * unitPriceFor(i, i.qty), 0);
    return {
      items,
      totalPieces,
      totalAmount,
      addItem: (item) =>
        setItems((prev) => {
          const found = prev.find((p) => p.productId === item.productId);
          if (found)
            return prev.map((p) =>
              p.productId === item.productId ? { ...p, qty: p.qty + item.qty } : p,
            );
          return [...prev, item];
        }),
      setQty: (productId, qty) =>
        setItems((prev) =>
          prev.map((p) => (p.productId === productId ? { ...p, qty: Math.max(1, qty) } : p)),
        ),
      removeItem: (productId) => setItems((prev) => prev.filter((p) => p.productId !== productId)),
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
