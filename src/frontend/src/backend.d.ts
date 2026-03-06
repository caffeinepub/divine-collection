import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ProductId = bigint;
export type Time = bigint;
export interface ContactMessage {
    name: string;
    email: string;
    message: string;
    timestamp: Time;
}
export interface Product {
    id: ProductId;
    name: string;
    description: string;
    isFeatured: boolean;
    category: Category;
    price: bigint;
}
export enum Category {
    Sarees = "Sarees",
    CoordSets = "CoordSets",
    Kurties = "Kurties"
}
export interface backendInterface {
    getAllContactMessages(): Promise<Array<ContactMessage>>;
    getAllProducts(): Promise<Array<Product>>;
    getFeaturedProducts(): Promise<Array<Product>>;
    getProductById(id: ProductId): Promise<Product>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
    init(): Promise<void>;
    submitContactMessage(name: string, email: string, message: string): Promise<void>;
}
