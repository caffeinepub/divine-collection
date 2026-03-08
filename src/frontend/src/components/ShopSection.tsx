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
  { value: Category.Kurties, label: "Suit Sets" },
  { value: Category.Sarees, label: "Kurti Sets" },
  { value: Category.CoordSets, label: "Coord Sets" },
];

// Fallback products
const FALLBACK_PRODUCTS: Product[] = [
  // ── Kurti Sets ──────────────────────────────────────────────────────────────
  {
    id: BigInt(21),
    name: "Kurti Set 1",
    description:
      "A beautifully crafted Indian kurti set, perfect for casual and festive occasions.",
    isFeatured: true,
    category: Category.Sarees,
    price: BigInt(0),
  },
  {
    id: BigInt(22),
    name: "Kurti Set 2",
    description:
      "An elegant kurti set featuring traditional Indian prints and comfortable everyday styling.",
    isFeatured: false,
    category: Category.Sarees,
    price: BigInt(0),
  },
  {
    id: BigInt(23),
    name: "Kurti Set 3",
    description:
      "A vibrant kurti set with coordinated bottoms, ideal for both casual wear and light festivities.",
    isFeatured: false,
    category: Category.Sarees,
    price: BigInt(0),
  },
  // ── Coord Sets ──────────────────────────────────────────────────────────────
  {
    id: BigInt(4),
    name: "Coord Set",
    description:
      "A stunning coordinated top-and-bottom set blending traditional craftsmanship with a contemporary silhouette.",
    isFeatured: true,
    category: Category.CoordSets,
    price: BigInt(0),
  },
  // ── Suite Sets ──────────────────────────────────────────────────────────────
  {
    id: BigInt(7),
    name: "Suit Set 1",
    description:
      "A classic Indian suit set with intricate detailing, complete with matching dupatta — perfect for all occasions.",
    isFeatured: true,
    category: Category.Kurties,
    price: BigInt(0),
  },
  {
    id: BigInt(8),
    name: "Suit Set 2",
    description:
      "A vibrant and stylish Indian suit set with bold prints and a matching dupatta.",
    isFeatured: false,
    category: Category.Kurties,
    price: BigInt(0),
  },
  {
    id: BigInt(9),
    name: "Suit Set 3",
    description:
      "An elegantly designed suit set with traditional embellishments and a graceful silhouette.",
    isFeatured: false,
    category: Category.Kurties,
    price: BigInt(0),
  },
  {
    id: BigInt(16),
    name: "Suit Set 4",
    description:
      "A beautifully crafted suit set featuring traditional Indian textile artistry and vibrant hues.",
    isFeatured: false,
    category: Category.Kurties,
    price: BigInt(0),
  },
  {
    id: BigInt(17),
    name: "Suit Set 5",
    description:
      "A rich and festive suit set with artistic prints and coordinated dupatta, ideal for celebrations.",
    isFeatured: false,
    category: Category.Kurties,
    price: BigInt(0),
  },
  {
    id: BigInt(18),
    name: "Suit Set 6",
    description:
      "A stunning suit set adorned with traditional Indian motifs, crafted for both everyday and festive wear.",
    isFeatured: true,
    category: Category.Kurties,
    price: BigInt(0),
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
            From elegant suit sets to kurti sets and festive coord sets — find
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
