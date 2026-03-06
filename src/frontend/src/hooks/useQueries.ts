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
const SAREE_IMAGES: Record<number, string> = {
  1: "/assets/generated/saree-1.dim_600x800.jpg",
  2: "/assets/generated/saree-2.dim_600x800.jpg",
  3: "/assets/generated/saree-3.dim_600x800.jpg",
};
const COORD_SET_IMAGES: Record<number, string> = {
  1: "/assets/generated/coord-set-1.dim_600x800.jpg",
  2: "/assets/generated/coord-set-2.dim_600x800.jpg",
  3: "/assets/generated/coord-set-3.dim_600x800.jpg",
};
const KURTI_IMAGES: Record<number, string> = {
  1: "/assets/generated/kurti-1.dim_600x800.jpg",
  2: "/assets/generated/kurti-2.dim_600x800.jpg",
  3: "/assets/generated/kurti-3.dim_600x800.jpg",
};

export function getProductImage(
  product: Product,
  allProductsInCategory: Product[],
): string {
  const sorted = [...allProductsInCategory].sort((a, b) =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
  );
  const idx = sorted.findIndex((p) => p.id === product.id);
  const position = (idx % 3) + 1;

  switch (product.category) {
    case Category.Sarees:
      return SAREE_IMAGES[position] ?? SAREE_IMAGES[1];
    case Category.CoordSets:
      return COORD_SET_IMAGES[position] ?? COORD_SET_IMAGES[1];
    case Category.Kurties:
      return KURTI_IMAGES[position] ?? KURTI_IMAGES[1];
    default:
      return SAREE_IMAGES[position] ?? SAREE_IMAGES[1];
  }
}

/**
 * Format bigint price as Indian Rupee string
 */
export function formatPrice(price: bigint): string {
  const num = Number(price);
  return `₹${num.toLocaleString("en-IN")}`;
}
