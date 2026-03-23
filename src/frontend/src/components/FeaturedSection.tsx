import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useState } from "react";
import type { Product } from "../backend.d";
import {
  getProductImage,
  useAllProducts,
  useFeaturedProducts,
  useImageOverrides,
} from "../hooks/useQueries";
import { ProductCard } from "./ProductCard";
import { ProductQuickView } from "./ProductQuickView";

export function FeaturedSection() {
  const { data: featured, isLoading } = useFeaturedProducts();
  const { data: allProducts } = useAllProducts();
  const imageOverrides = useImageOverrides();

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );
  const [quickViewImage, setQuickViewImage] = useState<string>("");

  const products = featured ?? [];

  const getImage = (product: Product) => {
    if (imageOverrides[product.id.toString()]) {
      return imageOverrides[product.id.toString()];
    }
    const catProds = (allProducts ?? []).filter(
      (p) => p.category === product.category,
    );
    return getProductImage(product, catProds);
  };

  const handleQuickView = (product: Product, image: string) => {
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
        {/* Section Header */}
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

        {/* Product Grid */}
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
            {products.map((product, idx) => (
              <ProductCard
                key={product.id.toString()}
                product={product}
                image={getImage(product)}
                index={idx + 1}
                ocidScope="featured"
                onQuickView={handleQuickView}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        image={quickViewImage}
        open={quickViewProduct !== null}
        onClose={handleCloseQuickView}
      />
    </section>
  );
}
