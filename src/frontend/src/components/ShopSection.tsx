import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Category } from "../backend.d";
import type { Product } from "../backend.d";
import {
  getProductImage,
  useAllProducts,
  useImageOverrides,
} from "../hooks/useQueries";
import { ProductCard } from "./ProductCard";
import { ProductQuickView } from "./ProductQuickView";

type FilterTab = "All" | Category;

const tabs: { value: FilterTab; label: string }[] = [
  { value: "All", label: "All Collections" },
  { value: Category.Kurties, label: "Suit Sets" },
  { value: Category.Sarees, label: "Kurti Sets" },
  { value: Category.CoordSets, label: "Co-ord Sets" },
  { value: Category.NightWear, label: "Night Wear" },
];

export function ShopSection() {
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const { data: allProducts, isLoading } = useAllProducts();
  const imageOverrides = useImageOverrides();

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );
  const [quickViewImage, setQuickViewImage] = useState<string>("");

  const products = allProducts ?? [];

  const filteredProducts = useMemo(() => {
    if (activeTab === "All") return products;
    return products.filter((p) => p.category === activeTab);
  }, [products, activeTab]);

  const getImage = (product: Product) => {
    return (
      imageOverrides[product.id.toString()] ?? getProductImage(product, [])
    );
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
    <section id="shop" className="py-20 bg-secondary/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
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
            From elegant suit sets to kurti sets, co-ord sets and comfortable
            night wear — find your perfect piece.
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

        {/* Product Grid */}
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
                key={product.id.toString()}
                product={product}
                image={getImage(product)}
                index={idx + 1}
                ocidScope="shop"
                onQuickView={handleQuickView}
              />
            ))}
          </motion.div>
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
