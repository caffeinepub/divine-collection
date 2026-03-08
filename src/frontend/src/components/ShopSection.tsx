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
  { value: Category.Kurties, label: "Suite Sets" },
  { value: Category.Sarees, label: "Kurti Sets" },
  { value: Category.CoordSets, label: "Coord Sets" },
];

// Fallback products
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: BigInt(21),
    name: "Grey Embroidered Kurti Set",
    description:
      "Elegant grey cotton kurti set with white embroidery detailing on the neckline and sleeves.",
    isFeatured: true,
    category: Category.Sarees,
    price: BigInt(0),
  },
  {
    id: BigInt(22),
    name: "Peach Striped Kurti Set",
    description:
      "Soft peach kurti set with delicate self-stripe pattern and button placket detailing.",
    isFeatured: false,
    category: Category.Sarees,
    price: BigInt(0),
  },
  {
    id: BigInt(23),
    name: "Mint Ikat Kurti Set",
    description:
      "Fresh mint green kurti set featuring traditional ikat print with coordinated straight pants.",
    isFeatured: false,
    category: Category.Sarees,
    price: BigInt(0),
  },
  {
    id: BigInt(4),
    name: "Blue Floral Coord Set",
    description:
      "Stunning teal blue coord set with bold white floral print, featuring a button-front kurta and matching straight pants.",
    isFeatured: true,
    category: Category.CoordSets,
    price: BigInt(0),
  },
  {
    id: BigInt(7),
    name: "White Embroidered Suit",
    description:
      "Elegant off-white silk suit with subtle gold embroidery on neckline and hem, complete with matching dupatta.",
    isFeatured: true,
    category: Category.Kurties,
    price: BigInt(2200),
  },
  {
    id: BigInt(8),
    name: "Magenta Floral Suit",
    description:
      "Vibrant magenta cotton suit featuring bold white floral prints with a matching printed dupatta.",
    isFeatured: false,
    category: Category.Kurties,
    price: BigInt(1800),
  },
  {
    id: BigInt(9),
    name: "Purple Floral Suit",
    description:
      "Graceful dusty purple suit with delicate white floral motifs and embroidered neckline details.",
    isFeatured: false,
    category: Category.Kurties,
    price: BigInt(1500),
  },
  {
    id: BigInt(16),
    name: "Mustard Bandhani Suit",
    description:
      "Cheerful mustard yellow suit with traditional bandhani circular print pattern and tie-neck detail.",
    isFeatured: false,
    category: Category.Kurties,
    price: BigInt(2800),
  },
  {
    id: BigInt(17),
    name: "Olive Geometric Suit",
    description:
      "Earthy olive green suit with striking geometric block print patterns and coordinated dupatta.",
    isFeatured: false,
    category: Category.Kurties,
    price: BigInt(1900),
  },
  {
    id: BigInt(18),
    name: "Rust Mandala Suit",
    description:
      "Warm rust brown bandhani suit with large mandala motif prints — a festive essential.",
    isFeatured: true,
    category: Category.Kurties,
    price: BigInt(2500),
  },
  {
    id: BigInt(19),
    name: "Rust Bandhani Suit",
    description:
      "Rich rust bandhani suit with classic circular motifs and delicate mirror work on the dupatta.",
    isFeatured: false,
    category: Category.Kurties,
    price: BigInt(2300),
  },
  {
    id: BigInt(20),
    name: "Magenta Chikankari Suit",
    description:
      "Bright magenta suit with chikankari embroidery on the yoke and a bold floral printed dupatta.",
    isFeatured: false,
    category: Category.Kurties,
    price: BigInt(2100),
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
            From elegant suite sets to kurti sets and festive coord sets — find
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
