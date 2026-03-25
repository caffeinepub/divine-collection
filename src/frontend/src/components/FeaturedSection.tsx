import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { DisplayProduct } from "../hooks/useQueries";
import {
  dynamicToDisplayProduct,
  useDynamicCategories,
  useDynamicProducts,
} from "../hooks/useQueries";
import { ProductCard } from "./ProductCard";
import { ProductQuickView } from "./ProductQuickView";

export function FeaturedSection() {
  const { data: dynamicCategories, isLoading: catsLoading } =
    useDynamicCategories();
  const { data: dynamicProducts, isLoading: prodsLoading } =
    useDynamicProducts();

  const [quickViewProduct, setQuickViewProduct] =
    useState<DisplayProduct | null>(null);
  const [quickViewImage, setQuickViewImage] = useState<string>("");

  const isLoading = catsLoading || prodsLoading;

  const categoryNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const cat of dynamicCategories ?? []) {
      map[cat.id] = cat.name;
    }
    return map;
  }, [dynamicCategories]);

  // Show first 3 active dynamic products as featured
  const displayProducts = useMemo(() => {
    if (!dynamicProducts) return [];
    return dynamicProducts
      .filter((p) => p.isActive)
      .slice(0, 3)
      .map((p) =>
        dynamicToDisplayProduct(
          p,
          categoryNameMap[p.categoryId] ?? p.categoryId,
        ),
      );
  }, [dynamicProducts, categoryNameMap]);

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
        ) : displayProducts.length === 0 ? (
          <div
            data-ocid="featured.empty_state"
            className="text-center py-16 text-muted-foreground"
          >
            <p className="font-display text-2xl font-semibold text-foreground mb-2">
              New arrivals coming soon
            </p>
            <p className="text-sm">
              Our latest collection is being curated just for you.
            </p>
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
