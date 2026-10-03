import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CategoryId, Product, PRODUCTS } from './catalog';
import { IMAGE_BUCKET, supabase } from './supabase';

type ProductRow = {
  id: string;
  name: string;
  category: string;
  description: string;
  story: string;
  emoji: string;
  tint: string;
  tint_deep: string;
  images: string[] | null;
  variants: { label: string; price: number }[] | null;
  badge: string | null;
  servings: string;
  ready_in: string;
  lead_days: number;
  storage: string;
  ingredients: string[] | null;
  allergens: string[] | null;
  is_active: boolean;
  sort_order: number;
};

const CACHE_KEY = 'juli-cake.catalog.v1';

function fromRow(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    category: r.category as CategoryId,
    description: r.description,
    story: r.story,
    emoji: r.emoji,
    tint: r.tint,
    tintDeep: r.tint_deep,
    images: r.images ?? [],
    variants: r.variants ?? [],
    badge: r.badge || undefined,
    servings: r.servings,
    readyIn: r.ready_in,
    leadDays: r.lead_days,
    storage: r.storage,
    ingredients: r.ingredients ?? [],
    allergens: r.allergens ?? [],
    active: r.is_active,
  };
}

function toRow(p: Product, sortOrder: number): ProductRow {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    description: p.description,
    story: p.story,
    emoji: p.emoji,
    tint: p.tint,
    tint_deep: p.tintDeep,
    images: p.images,
    variants: p.variants,
    badge: p.badge?.trim() || null,
    servings: p.servings,
    ready_in: p.readyIn,
    lead_days: p.leadDays,
    storage: p.storage,
    ingredients: p.ingredients,
    allergens: p.allergens,
    is_active: p.active,
    sort_order: sortOrder,
  };
}

export const IS_DEMO = !supabase;

let demoProducts: Product[] = PRODUCTS.map((p) => ({ ...p }));

export async function fetchProducts(onlyActive: boolean): Promise<Product[]> {
  if (!supabase) {
    return onlyActive ? demoProducts.filter((p) => p.active) : [...demoProducts];
  }
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  const all = (data as ProductRow[]).map(fromRow);
  return onlyActive ? all.filter((p) => p.active) : all;
}

export async function saveProduct(p: Product, sortOrder: number) {
  if (!supabase) {
    const exists = demoProducts.some((x) => x.id === p.id);
    demoProducts = exists
      ? demoProducts.map((x) => (x.id === p.id ? p : x))
      : [...demoProducts.slice(0, sortOrder), p, ...demoProducts.slice(sortOrder)];
    return;
  }
  const { error } = await supabase.from('products').upsert(toRow(p, sortOrder));
  if (error) throw error;
}

export async function saveOrder(products: Product[]) {
  if (!supabase) {
    demoProducts = [...products];
    return;
  }
  const rows = products.map((p, i) => toRow(p, i));
  const { error } = await supabase.from('products').upsert(rows);
  if (error) throw error;
}

export async function deleteProduct(p: Product) {
  if (!supabase) {
    demoProducts = demoProducts.filter((x) => x.id !== p.id);
    return;
  }
  const { error } = await supabase.from('products').delete().eq('id', p.id);
  if (error) throw error;
  await removeImages(p.images);
}

export async function removeImages(urls: string[]) {
  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
  const paths = urls
    .map((u) => (u.includes(marker) ? decodeURIComponent(u.split(marker)[1]) : null))
    .filter((p): p is string => !!p);
  if (!paths.length || !supabase) return;
  await supabase.storage.from(IMAGE_BUCKET).remove(paths);
}

export type CatalogState = {
  products: Product[];
  ready: boolean;
};

export function useCatalog(): CatalogState {
  const [state, setState] = useState<CatalogState>(
    supabase ? { products: [], ready: false } : { products: PRODUCTS, ready: true }
  );

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    let gotFresh = false;

    AsyncStorage.getItem(CACHE_KEY)
      .then((raw) => {
        if (cancelled || gotFresh || !raw) return;
        setState({ products: JSON.parse(raw) as Product[], ready: true });
      })
      .catch(() => {});

    fetchProducts(true)
      .then((products) => {
        if (cancelled) return;
        gotFresh = true;
        setState({ products, ready: true });
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(products)).catch(() => {});
      })
      .catch(() => {
        if (cancelled) return;
        setState((s) => (s.ready ? s : { products: PRODUCTS, ready: true }));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
