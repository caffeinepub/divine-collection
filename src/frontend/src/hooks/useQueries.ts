import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Category, type Product } from "../backend.d";
import { useActor } from "./useActor";

export type { Product, Category };

export function useAllProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
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
      return actor.getFeaturedProducts();
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
      return actor.getProductsByCategory(category);
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
 * Maps a product to its image path based on category + sorted index
 */
// Static image maps — filenames must appear as literals so the build prune
// script can detect them in compiled JS and does not delete the files.
// Category.Sarees is repurposed as "Kurti Sets"
const KURTI_SET_IMAGES: Record<number, string> = {
  1: "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.46-PM-1.jpeg",
  2: "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.45-PM-2--2.jpeg",
  3: "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.45-PM-3--3.jpeg",
};
const COORD_SET_IMAGES: Record<number, string> = {
  1: "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.45-PM-1--1.jpeg",
};
const SUIT_IMAGES: Record<number, string> = {
  1: "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.46-PM-1--1.jpeg",
  2: "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.48-PM-2.jpeg",
  3: "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.47-PM-1--3.jpeg",
  4: "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.47-PM-4.jpeg",
  5: "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.46-PM-2--5.jpeg",
  6: "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.47-PM-3--6.jpeg",
  7: "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.47-PM-2--7.jpeg",
  8: "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.51-PM-8.jpeg",
};

export function getProductImage(
  product: Product,
  allProductsInCategory: Product[],
): string {
  const sorted = [...allProductsInCategory].sort((a, b) =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
  );
  const idx = sorted.findIndex((p) => p.id === product.id);

  switch (product.category) {
    case Category.Sarees: {
      // Repurposed as Kurti Sets
      const position = (idx % 3) + 1;
      return KURTI_SET_IMAGES[position] ?? KURTI_SET_IMAGES[1];
    }
    case Category.CoordSets: {
      const position = (idx % 1) + 1;
      return COORD_SET_IMAGES[position] ?? COORD_SET_IMAGES[1];
    }
    case Category.Kurties: {
      const position = (idx % 8) + 1;
      return SUIT_IMAGES[position] ?? SUIT_IMAGES[1];
    }
    default: {
      const position = (idx % 3) + 1;
      return KURTI_SET_IMAGES[position] ?? KURTI_SET_IMAGES[1];
    }
  }
}

/**
 * Format bigint price as Indian Rupee string
 */
export function formatPrice(price: bigint): string {
  const num = Number(price);
  return `₹${num.toLocaleString("en-IN")}`;
}
