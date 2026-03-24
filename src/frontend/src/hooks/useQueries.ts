import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Category, type Product } from "../backend.d";
import type { ProductOverride } from "../backend.d";
import { useActor } from "./useActor";

// Extended actor type for product overrides
interface ActorWithOverrides {
  getProductOverrides(): Promise<Array<ProductOverride>>;
}

export type { Product, Category };

// ── Static image paths (served from public/assets/uploads/) ──────────────────
// Using string literals so the Caffeine build scanner preserves these files.
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
export const suit1ImgExport = suit1Img;
export const sizeChartImg =
  "/assets/uploads/WhatsApp-Image-2026-03-09-at-10.34.16-PM-1.jpeg";

// Export suit1Img for use in CollectionPage hero
export { suit1Img };

/**
 * The single source of truth for all products in Divine Collection.
 * The backend canister contains stale data, so we bypass it entirely
 * and serve this static catalog directly to every product hook.
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
      if (o.imageUrl.length > 0 && o.imageUrl[0]) {
        map[o.productId] = o.imageUrl[0] as string;
      }
    }
  }
  return map;
}

/** Returns all products merged with any admin overrides for price and description. */
export function useAllProducts() {
  const { data: overrides } = useProductOverrides();
  const overrideMap: Record<string, { price?: bigint; description?: string }> =
    {};
  if (overrides) {
    for (const o of overrides) {
      overrideMap[o.productId] = {
        price: o.price.length > 0 ? (o.price[0] as bigint) : undefined,
        description:
          o.description.length > 0 ? (o.description[0] as string) : undefined,
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

/** Returns only featured products, with overrides applied. */
export function useFeaturedProducts() {
  const { data: all } = useAllProducts();
  return {
    data: (all ?? []).filter((p) => p.isFeatured),
    isLoading: false,
  };
}

/** Returns products for a given category, with overrides applied. */
export function useProductsByCategory(category: Category) {
  const { data: all } = useAllProducts();
  return {
    data: (all ?? []).filter((p) => p.category === category),
    isLoading: false,
  };
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
 * Only returns true when stock data is loaded AND quantity is exactly 0.
 * If stock list is empty (not initialized), all sizes are treated as available.
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
 * Returns the available sizes for a given category.
 * All categories use M, L, XL, XXL.
 */
export function getSizesForCategory(
  _category: Category,
): Array<"M" | "L" | "XL" | "XXL"> {
  return ["M", "L", "XL", "XXL"];
}

/**
 * Maps a product to its static image path.
 */
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

/**
 * Format bigint price as Indian Rupee string
 */
export function formatPrice(price: bigint): string {
  const num = Number(price);
  return `\u20b9${num.toLocaleString("en-IN")}/-`;
}
