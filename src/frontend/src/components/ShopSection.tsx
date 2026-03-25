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

const ALL_TAB = "__all__";

export function ShopSection() {
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);
  const { data: dynamicCategories, isLoading: catsLoading } =
    useDynamicCategories();
  const { data: dynamicProducts, isLoading: prodsLoading } =
    useDynamicProducts();

  const [quickViewProduct, setQuickViewProduct] =
    useState<DisplayProduct | null>(null);
  const [quickViewImage, setQuickViewImage] = useState<string>("");

  const isLoading = catsLoading || prodsLoading;

  // Build category name map from dynamic categories
  const categoryNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const cat of dynamicCategories ?? []) {
      map[cat.id] = cat.name;
    }
    return map;
  }, [dynamicCategories]);

  // Convert dynamic products to DisplayProduct
  const allDisplayProducts = useMemo(() => {
    if (!dynamicProducts) return [];
    return dynamicProducts
      .filter((p) => p.isActive)
      .map((p) =>
        dynamicToDisplayProduct(
          p,
          categoryNameMap[p.categoryId] ?? p.categoryId,
        ),
      );
  }, [dynamicProducts, categoryNameMap]);

  // Build tabs from dynamic categories
  const tabs = useMemo(() => {
    const list: { value: string; label: string }[] = [
      { value: ALL_TAB, label: "All Collections" },
    ];
    if (dynamicCategories && dynamicCategories.length > 0) {
      for (const cat of dynamicCategories) {
        list.push({ value: cat.id, label: cat.name });
      }
    }
    return list;
  }, [dynamicCategories]);

  const filteredProducts = useMemo(() => {
    if (activeTab === ALL_TAB) return allDisplayProducts;
    return allDisplayProducts.filter((p) => p.categoryId === activeTab);
  }, [allDisplayProducts, activeTab]);

  const handleQuickView = (product: DisplayProduct, image: string) => {
    setQuickViewProduct(product);
    setQuickViewImage(image);
  };

  const handleCloseQuickView = () => {
    setQuickViewProduct(null);
    setQuickViewImage("");
  };

  return (
    <section id="shop" className="py-20 bg-secondary/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gold text-xs uppercase tracking-[0.35em] font-medium mb-2">
            Our Collections
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-3">
            Shop the Collection
          </h2>
          <div className="section-divider max-w-xs mx-auto mt-4" />
          <p className="text-muted-foreground mt-4 text-base max-w-xl mx-auto">
            From elegant suit sets to kurti sets and co-ord sets — find your
            perfect piece.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              data-ocid="shop.tab"
              onClick={() => setActiveTab(tab.value)}
              className={`px-5 py-2.5 text-sm font-medium transition-all duration-200 rounded-none border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                activeTab === tab.value
                  ? "gold-gradient text-charcoal border-transparent shadow-sm"
                  : "bg-card text-foreground border-border hover:border-gold hover:text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {["s1", "s2", "s3", "s4", "s5", "s6"].map((key) => (
              <div
                key={key}
                className="space-y-3"
                data-ocid="shop.loading_state"
              >
                <Skeleton className="aspect-[3/4] w-full rounded-sm" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            data-ocid="shop.empty_state"
            className="text-center py-20 text-muted-foreground"
          >
            <p className="text-lg">No products found in this category.</p>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                image={
                  product.imageUrl ??
                  "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.46-PM-1--1.jpeg"
                }
                index={idx + 1}
                ocidScope="shop"
                onQuickView={handleQuickView}
              />
            ))}
          </motion.div>
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
