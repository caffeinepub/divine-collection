import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { DisplayProduct } from "../hooks/useQueries";
import {
  getProductImage,
  toDisplayProduct,
  useAllProducts,
  useFeaturedProducts,
  useImageOverrides,
  useProductOverrides,
} from "../hooks/useQueries";
import { ProductCard } from "./ProductCard";
import { ProductQuickView } from "./ProductQuickView";

export function FeaturedSection() {
  const { data: featured, isLoading } = useFeaturedProducts();
  const { data: allProducts } = useAllProducts();
  const imageOverrides = useImageOverrides();
  const { data: overrides } = useProductOverrides();

  const [quickViewProduct, setQuickViewProduct] =
    useState<DisplayProduct | null>(null);
  const [quickViewImage, setQuickViewImage] = useState<string>("");

  const overrideMap = useMemo(() => {
    const map: Record<
      string,
      { price?: bigint; description?: string; imageUrl?: string }
    > = {};
    if (overrides) {
      for (const o of overrides) {
        map[o.productId] = {
          price: o.price ?? undefined,
          description: o.description ?? undefined,
          imageUrl: o.imageUrl ?? undefined,
        };
      }
    }
    return map;
  }, [overrides]);

  const displayProducts = useMemo(() => {
    return (featured ?? []).map((product) => {
      const ov = overrideMap[product.id.toString()];
      const fallbackImage =
        imageOverrides[product.id.toString()] ??
        (() => {
          const catProds = (allProducts ?? []).filter(
            (p) => p.category === product.category,
          );
          return getProductImage(product, catProds);
        })();
      return toDisplayProduct(
        product,
        ov?.imageUrl || fallbackImage,
        ov?.price,
        ov?.description,
      );
    });
  }, [featured, overrideMap, imageOverrides, allProducts]);

  const handleQuickView = (product: DisplayProduct, image: string) => {
    setQuickViewProduct(product);
    setQuickViewImage(image);
  };

  const handleCloseQuickView = () => {
    setQuickViewProduct(null);
    setQuickViewImage("");
  };

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gold text-xs uppercase tracking-[0.35em] font-medium mb-2">
            Handpicked for You
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-3">
            Featured Pieces
          </h2>
          <div className="section-divider max-w-xs mx-auto mt-4" />
          <p className="text-muted-foreground mt-4 text-base max-w-xl mx-auto leading-relaxed">
            Our most celebrated garments, each crafted with centuries of
            artisanal wisdom and the finest materials from across India.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="space-y-3"
                data-ocid="featured.loading_state"
              >
                <Skeleton className="aspect-[3/4] w-full rounded-sm" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                image={
                  product.imageUrl ??
                  "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.46-PM-1--1.jpeg"
                }
                index={idx + 1}
                ocidScope="featured"
                onQuickView={handleQuickView}
              />
            ))}
          </div>
        )}
      </div>

      <ProductQuickView
        product={quickViewProduct}
        image={quickViewImage}
        open={quickViewProduct !== null}
        onClose={handleCloseQuickView}
      />
    </section>
  );
}
