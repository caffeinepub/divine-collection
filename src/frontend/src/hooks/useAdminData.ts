import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Category } from "../backend.d";
import type { ProductOverride } from "../backend.d";
import { useActor } from "./useActor";
import { CATALOG_PRODUCTS } from "./useQueries";

// Extended actor type that includes product override methods (from backend.d.ts)
interface ActorWithOverrides {
  setProductOverride(
    productId: string,
    price: bigint | null,
    description: string | null,
    imageUrl: string | null,
  ): Promise<void>;
  getProductOverrides(): Promise<Array<ProductOverride>>;
}

export const SIZES: Array<"M" | "L" | "XL" | "XXL"> = ["M", "L", "XL", "XXL"];

const CATEGORY_LABEL: Record<string, string> = {
  [Category.Kurties]: "Suit Set",
  [Category.Sarees]: "Kurti Set",
  [Category.CoordSets]: "Co-ord Set",
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SaleRecord {
  id: string;
  date: string;
  customerName: string;
  mobile: string;
  address: string;
  items: Array<{ name: string; size: string; quantity: number; price: number }>;
  total: number;
}

export interface StockEntry {
  productId: string;
  productName: string;
  category: string;
  size: "M" | "L" | "XL" | "XXL";
  quantity: number;
}

export type CostPriceMap = Record<string, number>;

export interface VisitRecord {
  page: string;
  timestamp: string; // ISO string
}

// ── useSales ──────────────────────────────────────────────────────────────────

export function useSales(): { sales: SaleRecord[]; isLoading: boolean } {
  const { actor, isFetching } = useActor();
  const query = useQuery<SaleRecord[]>({
    queryKey: ["sales"],
    queryFn: async () => {
      if (!actor) return [];
      const rawSales = await actor.getAllSales();
      return rawSales.map((s) => ({
        id: s.id.toString(),
        date: new Date(Number(s.date / 1_000_000n)).toISOString(),
        customerName: s.customerName,
        mobile: s.mobile,
        address: s.address,
        total: Number(s.total),
        items: s.items.map((item) => ({
          name: item.productName,
          size: item.size,
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
      }));
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
  return { sales: query.data ?? [], isLoading: query.isLoading };
}

// ── useAddSale ────────────────────────────────────────────────────────────────

export function useAddSale() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: Omit<SaleRecord, "id" | "date">) => {
      if (!actor) return;
      const saleItems = record.items.map((item) => ({
        productId: item.name, // use name as productId fallback — real productId passed in CartDrawer
        productName: item.name,
        size: item.size,
        quantity: BigInt(item.quantity),
        price: BigInt(Math.round(item.price)),
      }));
      await actor.addSale(
        record.customerName,
        record.mobile,
        record.address,
        saleItems,
        BigInt(Math.round(record.total)),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
    },
  });
}

// ── addSaleRecord (imperative helper for CartDrawer) ──────────────────────────
// Kept for backward-compat signature; CartDrawer now calls useAddSale() directly.
export function addSaleRecord(_record: Omit<SaleRecord, "id" | "date">): void {
  // no-op: CartDrawer now uses the useAddSale mutation hook directly
}

// ── useStock ──────────────────────────────────────────────────────────────────

export function useStock(): {
  stock: StockEntry[];
  isLoading: boolean;
  refetch: () => void;
} {
  const { actor, isFetching } = useActor();
  const query = useQuery<StockEntry[]>({
    queryKey: ["stock"],
    queryFn: async () => {
      if (!actor) return [];
      const rawStock = await actor.getStock();
      // If no stock in backend, return empty (admin can initialize)
      return rawStock.map((e) => ({
        productId: e.productId,
        productName: e.productName,
        category: e.category,
        size: e.size as "M" | "L" | "XL" | "XXL",
        quantity: Number(e.quantity),
      }));
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
  return {
    stock: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

// ── useSetStockEntry ──────────────────────────────────────────────────────────

export function useSetStockEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: StockEntry) => {
      if (!actor) return;
      await actor.setStockEntry(
        entry.productId,
        entry.productName,
        entry.category,
        entry.size,
        BigInt(Math.max(0, entry.quantity)),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
    },
  });
}

// ── useResetAllStock ──────────────────────────────────────────────────────────

export function useResetAllStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.resetAllStock();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
    },
  });
}

// ── useInitStock ──────────────────────────────────────────────────────────────

export function useInitStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) return;
      const entries: Array<{
        productId: string;
        productName: string;
        category: string;
        size: string;
        quantity: bigint;
      }> = [];
      for (const product of CATALOG_PRODUCTS) {
        for (const size of SIZES) {
          entries.push({
            productId: product.id.toString(),
            productName: product.name,
            category:
              CATEGORY_LABEL[product.category as string] ??
              (product.category as string),
            size,
            quantity: 1n as bigint,
          });
        }
      }
      await actor.initStock(entries);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
    },
  });
}

// ── useCostPrices ─────────────────────────────────────────────────────────────

export function useCostPrices(): {
  costPrices: CostPriceMap;
  isLoading: boolean;
} {
  const { actor, isFetching } = useActor();
  const query = useQuery<CostPriceMap>({
    queryKey: ["cost-prices"],
    queryFn: async () => {
      if (!actor) return {};
      const raw = await actor.getCostPrices();
      const map: CostPriceMap = {};
      for (const e of raw) {
        map[e.productId] = e.costPrice;
      }
      return map;
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
  return { costPrices: query.data ?? {}, isLoading: query.isLoading };
}

// ── useSetCostPrice ───────────────────────────────────────────────────────────

export function useSetCostPrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      costPrice,
    }: { productId: string; costPrice: number }) => {
      if (!actor) return;
      await actor.setCostPrice(productId, costPrice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cost-prices"] });
    },
  });
}

// ── useSetProductOverride ─────────────────────────────────────────────────────

export function useSetProductOverride() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      price,
      description,
      imageUrl,
    }: {
      productId: string;
      price?: number;
      description?: string;
      imageUrl?: string;
    }) => {
      if (!actor) return;
      await (actor as unknown as ActorWithOverrides).setProductOverride(
        productId,
        price !== undefined ? BigInt(Math.round(price)) : null,
        description !== undefined ? description : null,
        imageUrl !== undefined ? imageUrl : null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-overrides"] });
    },
  });
}

// ── useAnalytics ──────────────────────────────────────────────────────────────

export function useAnalytics(): { visits: VisitRecord[]; isLoading: boolean } {
  const { actor, isFetching } = useActor();
  const query = useQuery<VisitRecord[]>({
    queryKey: ["analytics"],
    queryFn: async () => {
      if (!actor) return [];
      const raw = await actor.getAnalytics();
      return raw.map((v) => ({
        page: v.page,
        timestamp: new Date(Number(v.timestamp / 1_000_000n)).toISOString(),
      }));
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
  return { visits: query.data ?? [], isLoading: query.isLoading };
}

// ── recordVisit (fire-and-forget helper) ──────────────────────────────────────
// Called from App.tsx — will use createActorWithConfig for anonymous call
import { createActorWithConfig } from "../config";
export function recordVisit(page: string): void {
  createActorWithConfig()
    .then((actor) => actor.recordVisit(page))
    .catch(() => {
      // fire-and-forget, ignore errors
    });
}

// ── Legacy stubs (kept for any remaining references) ─────────────────────────
export function getStock(): StockEntry[] {
  return [];
}
export function initializeStock(): void {
  // no-op: use useInitStock hook
}
export function useVisits(): VisitRecord[] {
  // Legacy stub - no longer used
  return [];
}
