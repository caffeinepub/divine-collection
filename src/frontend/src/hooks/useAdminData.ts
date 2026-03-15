import { useState } from "react";
import { Category } from "../backend.d";
import { CATALOG_PRODUCTS } from "./useQueries";

export const SIZES: Array<"M" | "L" | "XL" | "XXL"> = ["M", "L", "XL", "XXL"];

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

const CATEGORY_LABEL: Record<string, string> = {
  [Category.Kurties]: "Suit Set",
  [Category.Sarees]: "Kurti Set",
  [Category.CoordSets]: "Co-ord Set",
};

export function getSales(): SaleRecord[] {
  try {
    const raw = localStorage.getItem("dc_sales");
    if (!raw) return [];
    return JSON.parse(raw) as SaleRecord[];
  } catch {
    return [];
  }
}

export function saveSales(sales: SaleRecord[]): void {
  localStorage.setItem("dc_sales", JSON.stringify(sales));
}

export function addSaleRecord(record: Omit<SaleRecord, "id" | "date">): void {
  const sales = getSales();
  const newRecord: SaleRecord = {
    ...record,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
  };
  saveSales([...sales, newRecord]);
}

export function getStock(): StockEntry[] {
  try {
    const raw = localStorage.getItem("dc_stock");
    if (!raw) return [];
    return JSON.parse(raw) as StockEntry[];
  } catch {
    return [];
  }
}

export function saveStock(stock: StockEntry[]): void {
  localStorage.setItem("dc_stock", JSON.stringify(stock));
}

export function initializeStock(): void {
  const entries: StockEntry[] = [];
  for (const product of CATALOG_PRODUCTS) {
    for (const size of SIZES) {
      entries.push({
        productId: product.id.toString(),
        productName: product.name,
        category:
          CATEGORY_LABEL[product.category as string] ??
          (product.category as string),
        size,
        quantity: 1,
      });
    }
  }
  saveStock(entries);
}

export function useSales(): [SaleRecord[], (s: SaleRecord[]) => void] {
  const [sales, setSalesState] = useState<SaleRecord[]>(() => getSales());

  const setSales = (s: SaleRecord[]) => {
    saveSales(s);
    setSalesState(s);
  };

  return [sales, setSales];
}

export function useStock(): [StockEntry[], (s: StockEntry[]) => void] {
  const [stock, setStockState] = useState<StockEntry[]>(() => {
    const existing = getStock();
    if (existing.length === 0) {
      initializeStock();
      return getStock();
    }
    return existing;
  });

  const setStock = (s: StockEntry[]) => {
    saveStock(s);
    setStockState(s);
  };

  return [stock, setStock];
}
