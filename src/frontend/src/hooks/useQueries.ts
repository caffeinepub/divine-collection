import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Category, type Product } from "../backend.d";
import { useActor } from "./useActor";

export type { Product, Category };

/** Filter predicate: removes any legacy backend products whose name contains "saree". */
function excludeSarees(products: Product[]): Product[] {
  return products.filter((p) => !p.name.toLowerCase().includes("saree"));
}

/**
 * Renames products to numbered names (Suit 1, Suit 2, Kurti 1, Coord 1, etc.)
 * grouped by category, in ascending ID order, so names are always consistent.
 */
function renumberProducts(products: Product[]): Product[] {
  const byCategory: Record<string, Product[]> = {};
  for (const p of products) {
    const key = String(p.category);
    if (!byCategory[key]) byCategory[key] = [];
    byCategory[key].push(p);
  }
  // Sort each category by ID ascending for stable numbering
  for (const key of Object.keys(byCategory)) {
    byCategory[key].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  }
  const categoryLabel: Record<string, string> = {
    [String(Category.Kurties)]: "Suit",
    [String(Category.Sarees)]: "Kurti",
    [String(Category.CoordSets)]: "Coord",
  };
  return products.map((p) => {
    const key = String(p.category);
    const label = categoryLabel[key] ?? "Product";
    const idx = byCategory[key].findIndex((x) => x.id === p.id);
    return { ...p, name: `${label} ${idx + 1}` };
  });
}

export function useAllProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return renumberProducts(excludeSarees(await actor.getAllProducts()));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFeaturedProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      if (!actor) return [];
      return renumberProducts(excludeSarees(await actor.getFeaturedProducts()));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProductsByCategory(category: Category) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      return renumberProducts(
        excludeSarees(await actor.getProductsByCategory(category)),
      );
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitContactMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      email,
      message,
    }: {
      name: string;
      email: string;
      message: string;
    }) => {
      if (!actor) throw new Error("No actor available");
      return actor.submitContactMessage(name, email, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    },
  });
}

export function useInitBackend() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["init"],
    queryFn: async () => {
      if (!actor) return null;
      await actor.init();
      return true;
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

/**
 * Maps a product to its image path based on product ID.
 * Each ID is pinned to a specific uploaded image so no two products share
 * the same photo and every image is shown regardless of context.
 *
 * Static literals are required so the build prune script keeps the files.
 */

// Suite Sets (Category.Kurties) — 8 uploaded photos, one per product ID
const SUIT_IMAGE_BY_ID: Record<string, string> = {
  "7": "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.46-PM-1--1.jpeg",
  "8": "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.48-PM-2.jpeg",
  "9": "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.47-PM-1--3.jpeg",
  "16": "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.47-PM-4.jpeg",
  "17": "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.46-PM-2--5.jpeg",
  "18": "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.47-PM-3--6.jpeg",
  "19": "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.47-PM-2--7.jpeg",
  "20": "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.51-PM-8.jpeg",
};

// Kurti Sets (Category.Sarees repurposed) — 3 uploaded photos
const KURTI_IMAGE_BY_ID: Record<string, string> = {
  "21": "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.46-PM-1.jpeg",
  "22": "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.45-PM-2--2.jpeg",
  "23": "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.45-PM-3--3.jpeg",
};

// Coord Sets (Category.CoordSets) — 1 uploaded photo
const COORD_IMAGE_BY_ID: Record<string, string> = {
  "4": "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.45-PM-1--1.jpeg",
};

export function getProductImage(
  product: Product,
  _allProductsInCategory: Product[],
): string {
  const key = product.id.toString();
  switch (product.category) {
    case Category.Kurties:
      return (
        SUIT_IMAGE_BY_ID[key] ??
        "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.46-PM-1--1.jpeg"
      );
    case Category.Sarees:
      return (
        KURTI_IMAGE_BY_ID[key] ??
        "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.46-PM-1.jpeg"
      );
    case Category.CoordSets:
      return (
        COORD_IMAGE_BY_ID[key] ??
        "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.45-PM-1--1.jpeg"
      );
    default:
      return "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.46-PM-1--1.jpeg";
  }
}

/**
 * Format bigint price as Indian Rupee string
 */
export function formatPrice(price: bigint): string {
  const num = Number(price);
  return `₹${num.toLocaleString("en-IN")}`;
}
