import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Category, type Product } from "../backend.d";
import { useActor } from "./useActor";

export type { Product, Category };

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

/** Always returns the full static catalog — backend is bypassed. */
export function useAllProducts() {
  return { data: CATALOG_PRODUCTS, isLoading: false };
}

/** Always returns only featured products from the static catalog. */
export function useFeaturedProducts() {
  return {
    data: CATALOG_PRODUCTS.filter((p) => p.isFeatured),
    isLoading: false,
  };
}

/** Always returns products for the given category from the static catalog. */
export function useProductsByCategory(category: Category) {
  return {
    data: CATALOG_PRODUCTS.filter((p) => p.category === category),
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
  return `₹${num.toLocaleString("en-IN")}/-`;
}
