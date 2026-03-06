import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Category } from "../backend.d";
import type { Product } from "../backend.d";
import { getProductImage, useAllProducts } from "../hooks/useQueries";
import { ProductCard } from "./ProductCard";

type FilterTab = "All" | Category;

const tabs: { value: FilterTab; label: string }[] = [
  { value: "All", label: "All Collections" },
  { value: Category.Sarees, label: "Sarees" },
  { value: Category.CoordSets, label: "Coord Sets" },
  { value: Category.Kurties, label: "Kurties" },
];

// Fallback products
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: BigInt(1),
    name: "Silk Magenta Saree",
    description:
      "Pure silk saree with golden zari embroidery and traditional woven borders.",
    isFeatured: true,
    category: Category.Sarees,
    price: BigInt(8500),
  },
  {
    id: BigInt(2),
    name: "Royal Blue Silk Saree",
    description:
      "Regal Banarasi silk saree with rich golden zari work and ornate pallu.",
    isFeatured: false,
    category: Category.Sarees,
    price: BigInt(12000),
  },
  {
    id: BigInt(3),
    name: "Red Bridal Saree",
    description:
      "Exquisite bridal saree with heavy golden embroidery, perfect for your special day.",
    isFeatured: false,
    category: Category.Sarees,
    price: BigInt(18500),
  },
  {
    id: BigInt(4),
    name: "Rose Pink Coord Set",
    description:
      "Elegant rose pink coordinate set with delicate mirror work and floral embroidery.",
    isFeatured: true,
    category: Category.CoordSets,
    price: BigInt(3800),
  },
  {
    id: BigInt(5),
    name: "Mustard Yellow Coord Set",
    description:
      "Vibrant mustard yellow ethnic coordinate set with traditional block print patterns.",
    isFeatured: false,
    category: Category.CoordSets,
    price: BigInt(3200),
  },
  {
    id: BigInt(6),
    name: "Orange Mirror Work Coord Set",
    description:
      "Festive orange coordinate set adorned with intricate mirror work embellishments.",
    isFeatured: false,
    category: Category.CoordSets,
    price: BigInt(4500),
  },
  {
    id: BigInt(7),
    name: "Teal Anarkali Kurti",
    description:
      "Flowing teal Anarkali kurti with golden thread embroidery and delicate details.",
    isFeatured: true,
    category: Category.Kurties,
    price: BigInt(2200),
  },
  {
    id: BigInt(8),
    name: "Maroon Chikankari Kurti",
    description:
      "Traditional Lucknawi chikankari kurti in deep maroon with delicate white thread work.",
    isFeatured: false,
    category: Category.Kurties,
    price: BigInt(1800),
  },
  {
    id: BigInt(9),
    name: "Lavender Floral Kurti",
    description:
      "Soft lavender kurti with delicate floral prints and subtle embroidery accents.",
    isFeatured: false,
    category: Category.Kurties,
    price: BigInt(1500),
  },
];

export function ShopSection() {
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const { data: allProducts, isLoading } = useAllProducts();

  const products =
    allProducts && allProducts.length > 0 ? allProducts : FALLBACK_PRODUCTS;

  const getCategoryProducts = (category: Category) =>
    products.filter((p) => p.category === category);

  const filteredProducts = useMemo(() => {
    if (activeTab === "All") return products;
    return products.filter((p) => p.category === activeTab);
  }, [products, activeTab]);

  const getImage = (product: Product) => {
    const catProds = getCategoryProducts(product.category);
    return getProductImage(product, catProds);
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
            From silk sarees to festive coord sets and everyday kurties — find
            your perfect piece.
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
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
