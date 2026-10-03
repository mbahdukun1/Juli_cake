import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, PRODUCTS, Variant } from './catalog';

export type CartLine = {
  key: string;
  product: Product;
  variant: Variant;
  qty: number;
};

type StoredLine = { productId: string; variantLabel: string; qty: number };

const STORAGE_KEY = 'juli-cake.cart.v1';

export const lineKey = (productId: string, variantLabel: string) =>
  `${productId}|${variantLabel}`;

function resolve(stored: StoredLine[], products: Product[]) {
  const restored: Record<string, CartLine> = {};
  for (const item of stored) {
    const product = products.find((p) => p.id === item.productId);
    const variant = product?.variants.find((v) => v.label === item.variantLabel);
    if (!product || !variant || !(item.qty > 0)) continue;
    const key = lineKey(product.id, variant.label);
    restored[key] = { key, product, variant, qty: Math.floor(item.qty) };
  }
  return restored;
}

const toStored = (lines: Record<string, CartLine>): StoredLine[] =>
  Object.values(lines).map((l) => ({
    productId: l.product.id,
    variantLabel: l.variant.label,
    qty: l.qty,
  }));

export function useCart(products: Product[] = PRODUCTS, catalogReady = true) {
  const [lines, setLines] = useState<Record<string, CartLine>>({});
  const [hydrated, setHydrated] = useState(false);
  const canPersist = useRef(false);
  const startedHydrate = useRef(false);

  useEffect(() => {
    if (!catalogReady || startedHydrate.current) return;
    startedHydrate.current = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setLines(resolve(JSON.parse(raw) as StoredLine[], products));
      })
      .catch(() => {
      })
      .finally(() => {
        canPersist.current = true;
        setHydrated(true);
      });
  }, [catalogReady, products]);

  useEffect(() => {
    if (!canPersist.current) return;
    setLines((prev) => resolve(toStored(prev), products));
  }, [products]);

  useEffect(() => {
    if (!canPersist.current) return;

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toStored(lines))).catch(() => {});
  }, [lines]);

  const add = useCallback((product: Product, variant: Variant, delta = 1) => {
    const key = lineKey(product.id, variant.label);
    setLines((prev) => {
      const qty = (prev[key]?.qty ?? 0) + delta;
      if (qty <= 0) {
        const { [key]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: { key, product, variant, qty } };
    });
  }, []);

  const remove = useCallback((key: string) => {
    setLines((prev) => {
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const clear = useCallback(() => setLines({}), []);

  const qtyOf = useCallback(
    (productId: string, variantLabel: string) =>
      lines[lineKey(productId, variantLabel)]?.qty ?? 0,
    [lines]
  );

  const items = useMemo(() => Object.values(lines), [lines]);
  const totalQty = useMemo(() => items.reduce((s, l) => s + l.qty, 0), [items]);
  const totalPrice = useMemo(
    () => items.reduce((s, l) => s + l.qty * l.variant.price, 0),
    [items]
  );

  return { items, totalQty, totalPrice, hydrated, add, remove, clear, qtyOf };
}
