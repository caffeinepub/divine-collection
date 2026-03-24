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
export interface SaleItem {
    size: string;
    productId: string;
    productName: string;
    quantity: bigint;
    price: bigint;
}
export type Timestamp = bigint;
export interface StockEntry {
    size: string;
    productId: string;
    productName: string;
    quantity: bigint;
    category: string;
}
export interface Sale {
    id: SaleId;
    customerName: string;
    total: bigint;
    date: Timestamp;
    address: string;
    mobile: string;
    items: Array<SaleItem>;
}
export interface DynamicCategory {
    id: string;
    displayOrder: bigint;
    name: string;
}
export interface VisitRecord {
    page: string;
    timestamp: Timestamp;
}
export interface DynamicProduct {
    id: string;
    categoryId: string;
    displayOrder: bigint;
    name: string;
    description: string;
    isActive: boolean;
    sizes: Array<string>;
    imageUrl?: string;
    price: bigint;
}
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
export interface ProductOverride {
    description?: string;
    productId: string;
    imageUrl?: string;
    price?: bigint;
}
export enum Category {
    Sarees = "Sarees",
    CoordSets = "CoordSets",
    Kurties = "Kurties"
}
export interface backendInterface {
    addDynamicCategory(name: string): Promise<string>;
    addDynamicProduct(categoryId: string, name: string, description: string, price: bigint, sizes: Array<string>, imageUrl: string | null): Promise<string>;
    addSale(customerName: string, mobile: string, address: string, items: Array<SaleItem>, total: bigint): Promise<void>;
    deductStock(productId: string, size: string, amount: bigint): Promise<void>;
    deleteDynamicCategory(id: string): Promise<boolean>;
    deleteDynamicProduct(id: string): Promise<boolean>;
    getAllContactMessages(): Promise<Array<ContactMessage>>;
    getAllProducts(): Promise<Array<Product>>;
    getAllSales(): Promise<Array<Sale>>;
    getAnalytics(): Promise<Array<VisitRecord>>;
    getCostPrices(): Promise<Array<CostPriceEntry>>;
    getDynamicCategories(): Promise<Array<DynamicCategory>>;
    getDynamicProducts(): Promise<Array<DynamicProduct>>;
    getDynamicProductsByCategory(categoryId: string): Promise<Array<DynamicProduct>>;
    getFeaturedProducts(): Promise<Array<Product>>;
    getProductById(id: ProductId): Promise<Product>;
    getProductOverrides(): Promise<Array<ProductOverride>>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
    getStock(): Promise<Array<StockEntry>>;
    init(): Promise<void>;
    initStock(entries: Array<StockEntry>): Promise<void>;
    recordVisit(page: string): Promise<void>;
    resetAllStock(): Promise<void>;
    setCategoryOrder(id: string, newOrder: bigint): Promise<void>;
    setCostPrice(productId: string, costPrice: number): Promise<void>;
    setDynamicProductOrder(id: string, newOrder: bigint): Promise<void>;
    setProductOverride(productId: string, price: bigint | null, description: string | null, imageUrl: string | null): Promise<void>;
    setStockEntry(productId: string, productName: string, category: string, size: string, quantity: bigint): Promise<void>;
    submitContactMessage(name: string, email: string, message: string): Promise<void>;
    updateDynamicCategory(id: string, name: string): Promise<boolean>;
    updateDynamicProduct(id: string, name: string, description: string, price: bigint, sizes: Array<string>, imageUrl: string | null, isActive: boolean): Promise<boolean>;
}
