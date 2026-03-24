import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Category,
  type DynamicCategory,
  type DynamicProduct,
  type Product,
} from "../backend.d";
import type { ProductOverride } from "../backend.d";
import { useActor } from "./useActor";

// Extended actor type for product overrides
interface ActorWithOverrides {
  getProductOverrides(): Promise<Array<ProductOverride>>;
}

export type { Product, Category, DynamicProduct, DynamicCategory };

// ── Normalised display type used by product card / quick-view ─────────────────
export interface DisplayProduct {
  id: string;
  name: string;
  description: string;
  price: bigint;
  categoryId: string;
  categoryName: string;
  sizes: string[];
  imageUrl?: string;
  displayOrder: number;
}

// ── Static image paths (served from public/assets/uploads/) ──────────────────
const suit1Img =
  "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.46-PM-1--1.jpeg";
const suit2Img = "/assets/uploads/ChatGPT-Image-Mar-11-2026-05_41_46-PM-1.png";
const suit3Img =
  "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.47-PM-1--3.jpeg";
const suit4Img =
  "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.47-PM-4.jpeg";
const suit5Img =
  "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.46-PM-2--5.jpeg";
const suit6Img =
  "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.47-PM-3--6.jpeg";
const kurti1Img =
  "/assets/uploads/ChatGPT-Image-Mar-17-2026-05_21_56-PM-1-1.png";
const kurti2Img =
  "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.45-PM-2--2.jpeg";
const kurti3Img =
  "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.45-PM-3--3.jpeg";
export const coord1Img =
  "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.45-PM-1--1.jpeg";
export const kurtiHeroImg =
  "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.46-PM-1.jpeg";
export const sizeChartImg =
  "/assets/uploads/WhatsApp-Image-2026-03-09-at-10.34.16-PM-1.jpeg";

// Export suit1Img for use in CollectionPage hero
export { suit1Img };
export const suit1ImgExport = suit1Img;

/**
 * The single source of truth for all products in Divine Collection.
 */
export const CATALOG_PRODUCTS: Product[] = [
  // ── Kurti Sets (Category.Sarees repurposed) ────────────────────────────────
  {
    id: BigInt(21),
    name: "Kurti 1",
    description:
      "A beautifully crafted Indian kurti set, perfect for casual and festive occasions.",
    isFeatured: true,
    category: Category.Sarees,
    price: BigInt(650),
  },
  {
    id: BigInt(22),
    name: "Kurti 2",
    description:
      "An elegant kurti set featuring traditional Indian prints and comfortable everyday styling.",
    isFeatured: false,
    category: Category.Sarees,
    price: BigInt(650),
  },
  {
    id: BigInt(23),
    name: "Kurti 3",
    description:
      "A vibrant kurti set with coordinated bottoms, ideal for both casual wear and light festivities.",
    isFeatured: false,
    category: Category.Sarees,
    price: BigInt(650),
  },
  // ── Coord Sets ─────────────────────────────────────────────────────────────
  {
    id: BigInt(4),
    name: "Coord 1",
    description:
      "A stunning coordinated top-and-bottom set blending traditional craftsmanship with a contemporary silhouette.",
    isFeatured: true,
    category: Category.CoordSets,
    price: BigInt(595),
  },
  // ── Suit Sets (Category.Kurties) ───────────────────────────────────────────
  {
    id: BigInt(7),
    name: "Suit 1",
    description:
      "A classic Indian suit set with intricate detailing, complete with matching dupatta — perfect for all occasions.",
    isFeatured: true,
    category: Category.Kurties,
    price: BigInt(885),
  },
  {
    id: BigInt(8),
    name: "Suit 2",
    description:
      "A vibrant and stylish Indian suit set with bold prints and a matching dupatta.",
    isFeatured: false,
    category: Category.Kurties,
    price: BigInt(885),
  },
  {
    id: BigInt(9),
    name: "Suit 3",
    description:
      "An elegantly designed suit set with traditional embellishments and a graceful silhouette.",
    isFeatured: false,
    category: Category.Kurties,
    price: BigInt(885),
  },
  {
    id: BigInt(16),
    name: "Suit 4",
    description:
      "A beautifully crafted suit set featuring traditional Indian textile artistry and vibrant hues.",
    isFeatured: false,
    category: Category.Kurties,
    price: BigInt(950),
  },
  {
    id: BigInt(17),
    name: "Suit 5",
    description:
      "A rich and festive suit set with artistic prints and coordinated dupatta, ideal for celebrations.",
    isFeatured: false,
    category: Category.Kurties,
    price: BigInt(950),
  },
  {
    id: BigInt(18),
    name: "Suit 6",
    description:
      "A stunning suit set adorned with traditional Indian motifs, crafted for both everyday and festive wear.",
    isFeatured: true,
    category: Category.Kurties,
    price: BigInt(885),
  },
];

// ── Static-product image helpers ──────────────────────────────────────────────

const SUIT_IMAGE_BY_ID: Record<string, string> = {
  "7": suit1Img,
  "8": suit2Img,
  "9": suit3Img,
  "16": suit4Img,
  "17": suit5Img,
  "18": suit6Img,
};

const KURTI_IMAGE_BY_ID: Record<string, string> = {
  "21": kurti1Img,
  "22": kurti2Img,
  "23": kurti3Img,
};

const COORD_IMAGE_BY_ID: Record<string, string> = {
  "4": coord1Img,
};

export function getProductImage(
  product: Product,
  _allProductsInCategory: Product[],
): string {
  const key = product.id.toString();
  switch (product.category) {
    case Category.Kurties:
      return SUIT_IMAGE_BY_ID[key] ?? suit1Img;
    case Category.Sarees:
      return KURTI_IMAGE_BY_ID[key] ?? kurtiHeroImg;
    case Category.CoordSets:
      return COORD_IMAGE_BY_ID[key] ?? coord1Img;
    default:
      return suit1Img;
  }
}

const CATEGORY_NAMES: Record<string, string> = {
  [Category.Sarees]: "Kurti Sets",
  [Category.CoordSets]: "Co-ord Sets",
  [Category.Kurties]: "Suit Sets",
};

/** Convert a static Product + override to DisplayProduct */
export function toDisplayProduct(
  product: Product,
  imageOverride?: string,
  priceOverride?: bigint,
  descriptionOverride?: string,
): DisplayProduct {
  return {
    id: product.id.toString(),
    name: product.name,
    description: descriptionOverride ?? product.description,
    price: priceOverride ?? product.price,
    categoryId: product.category as string,
    categoryName:
      CATEGORY_NAMES[product.category as string] ?? product.category,
    sizes: ["M", "L", "XL", "XXL"],
    imageUrl: imageOverride || getProductImage(product, []),
    displayOrder: 0,
  };
}

/** Convert a DynamicProduct + category name to DisplayProduct */
export function dynamicToDisplayProduct(
  dp: DynamicProduct,
  categoryName: string,
): DisplayProduct {
  return {
    id: dp.id,
    name: dp.name,
    description: dp.description,
    price: dp.price,
    categoryId: dp.categoryId,
    categoryName,
    sizes: dp.sizes,
    imageUrl: dp.imageUrl,
    displayOrder: Number(dp.displayOrder),
  };
}

// ── Product Overrides ─────────────────────────────────────────────────────────

export function useProductOverrides() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["product-overrides"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as unknown as ActorWithOverrides).getProductOverrides();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useImageOverrides(): Record<string, string> {
  const { data: overrides } = useProductOverrides();
  const map: Record<string, string> = {};
  if (overrides) {
    for (const o of overrides) {
      if (o.imageUrl) {
        map[o.productId] = o.imageUrl;
      }
    }
  }
  return map;
}

/** Returns all STATIC products merged with admin overrides. */
export function useAllProducts() {
  const { data: overrides } = useProductOverrides();
  const overrideMap: Record<
    string,
    { price?: bigint; description?: string; imageUrl?: string }
  > = {};
  if (overrides) {
    for (const o of overrides) {
      overrideMap[o.productId] = {
        price: o.price ?? undefined,
        description: o.description ?? undefined,
        imageUrl: o.imageUrl ?? undefined,
      };
    }
  }
  const merged = CATALOG_PRODUCTS.map((p) => {
    const ov = overrideMap[p.id.toString()];
    if (!ov) return p;
    return {
      ...p,
      price: ov.price ?? p.price,
      description: ov.description ?? p.description,
    };
  });
  return { data: merged, isLoading: false };
}

/** Returns only featured products (static), with overrides applied. */
export function useFeaturedProducts() {
  const { data: all } = useAllProducts();
  return {
    data: (all ?? []).filter((p) => p.isFeatured),
    isLoading: false,
  };
}

// ── Dynamic categories ────────────────────────────────────────────────────────

export function useDynamicCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<DynamicCategory[]>({
    queryKey: ["dynamic-categories"],
    queryFn: async () => {
      if (!actor) return [];
      const cats = await actor.getDynamicCategories();
      return [...cats].sort(
        (a, b) => Number(a.displayOrder) - Number(b.displayOrder),
      );
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useAddDynamicCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("No actor");
      return actor.addDynamicCategory(name);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dynamic-categories"] });
    },
  });
}

export function useUpdateDynamicCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateDynamicCategory(id, name);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dynamic-categories"] });
    },
  });
}

export function useDeleteDynamicCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteDynamicCategory(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dynamic-categories"] });
      qc.invalidateQueries({ queryKey: ["dynamic-products"] });
    },
  });
}

export function useSetCategoryOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.setCategoryOrder(id, newOrder);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dynamic-categories"] });
    },
  });
}

// ── Dynamic products ──────────────────────────────────────────────────────────

export function useDynamicProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<DynamicProduct[]>({
    queryKey: ["dynamic-products"],
    queryFn: async () => {
      if (!actor) return [];
      const prods = await actor.getDynamicProducts();
      return [...prods].sort(
        (a, b) => Number(a.displayOrder) - Number(b.displayOrder),
      );
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useAddDynamicProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      categoryId: string;
      name: string;
      description: string;
      price: bigint;
      sizes: string[];
      imageUrl: string | null;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addDynamicProduct(
        p.categoryId,
        p.name,
        p.description,
        p.price,
        p.sizes,
        p.imageUrl,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dynamic-products"] });
    },
  });
}

export function useUpdateDynamicProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      id: string;
      name: string;
      description: string;
      price: bigint;
      sizes: string[];
      imageUrl: string | null;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateDynamicProduct(
        p.id,
        p.name,
        p.description,
        p.price,
        p.sizes,
        p.imageUrl,
        p.isActive,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dynamic-products"] });
    },
  });
}

export function useDeleteDynamicProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteDynamicProduct(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dynamic-products"] });
    },
  });
}

export function useSetDynamicProductOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.setDynamicProductOrder(id, newOrder);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dynamic-products"] });
    },
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

export function useStock() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stock"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStock();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

/**
 * Returns true if the given size is out of stock for a product.
 */
export function isSizeOutOfStock(
  stockData:
    | Array<{ productId: string; size: string; quantity: bigint }>
    | undefined,
  productId: string,
  size: string,
): boolean {
  if (!stockData || stockData.length === 0) return false;
  const entry = stockData.find(
    (s) => s.productId === productId && s.size === size,
  );
  if (!entry) return false;
  return entry.quantity === BigInt(0);
}

/**
 * Returns the available sizes for a given category (legacy, for static products).
 */
export function getSizesForCategory(
  _category: Category,
): Array<"M" | "L" | "XL" | "XXL"> {
  return ["M", "L", "XL", "XXL"];
}

/**
 * Format bigint price as Indian Rupee string
 */
export function formatPrice(price: bigint): string {
  const num = Number(price);
  return `\u20b9${num.toLocaleString("en-IN")}/-`;
}
