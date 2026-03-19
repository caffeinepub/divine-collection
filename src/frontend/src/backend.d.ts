import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: ProductId;
    name: string;
    description: string;
    isFeatured: boolean;
    category: Category;
    price: bigint;
}
export interface VisitRecord {
    page: string;
    timestamp: Timestamp;
}
export type Timestamp = bigint;
export interface ContactMessage {
    name: string;
    email: string;
    message: string;
    timestamp: Timestamp;
}
export interface CostPriceEntry {
    productId: string;
    costPrice: number;
}
export type SaleId = bigint;
export type ProductId = bigint;
export interface Sale {
    id: SaleId;
    customerName: string;
    total: bigint;
    date: Timestamp;
    address: string;
    mobile: string;
    items: Array<SaleItem>;
}
export interface SaleItem {
    size: string;
    productId: string;
    productName: string;
    quantity: bigint;
    price: bigint;
}
export interface StockEntry {
    size: string;
    productId: string;
    productName: string;
    quantity: bigint;
    category: string;
}
export enum Category {
    Sarees = "Sarees",
    CoordSets = "CoordSets",
    Kurties = "Kurties"
}
export interface backendInterface {
    addSale(customerName: string, mobile: string, address: string, items: Array<SaleItem>, total: bigint): Promise<void>;
    deductStock(productId: string, size: string, amount: bigint): Promise<void>;
    getAllContactMessages(): Promise<Array<ContactMessage>>;
    getAllProducts(): Promise<Array<Product>>;
    getAllSales(): Promise<Array<Sale>>;
    getAnalytics(): Promise<Array<VisitRecord>>;
    getCostPrices(): Promise<Array<CostPriceEntry>>;
    getFeaturedProducts(): Promise<Array<Product>>;
    getProductById(id: ProductId): Promise<Product>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
    getStock(): Promise<Array<StockEntry>>;
    init(): Promise<void>;
    initStock(entries: Array<StockEntry>): Promise<void>;
    recordVisit(page: string): Promise<void>;
    resetAllStock(): Promise<void>;
    setCostPrice(productId: string, costPrice: number): Promise<void>;
    setStockEntry(productId: string, productName: string, category: string, size: string, quantity: bigint): Promise<void>;
    submitContactMessage(name: string, email: string, message: string): Promise<void>;
}
