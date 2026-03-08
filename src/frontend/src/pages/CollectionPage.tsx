import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { Category } from "../backend.d";
import type { Product } from "../backend.d";
import { Footer } from "../components/Footer";
import { ProductCard } from "../components/ProductCard";
import { getProductImage, useAllProducts } from "../hooks/useQueries";

// ── Fallback products ────────────────────────────────────────────────────────
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

// ── Per-collection metadata ──────────────────────────────────────────────────
const COLLECTION_META: Record<
  Category,
  {
    title: string;
    subtitle: string;
    description: string;
    heroImage: string;
    heroGradient: string;
  }
> = {
  [Category.Sarees]: {
    title: "Kurti Sets",
    subtitle: "Everyday Ethnic Comfort",
    description:
      "Beautifully coordinated kurti and pant sets crafted for effortless everyday wear — featuring soft fabrics, delicate embroidery, and prints inspired by traditional Indian textile arts.",
    heroImage: "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.46-PM-1.jpeg",
    heroGradient:
      "linear-gradient(135deg, oklch(0.18 0.05 200 / 0.88) 0%, oklch(0.28 0.08 170 / 0.70) 100%)",
  },
  [Category.CoordSets]: {
    title: "Coord Sets",
    subtitle: "Effortless Ethnic Chic",
    description:
      "Perfectly coordinated top-and-bottom pairings that blend traditional craftsmanship with contemporary silhouettes — dressed up or down for any occasion.",
    heroImage:
      "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.45-PM-1--1.jpeg",
    heroGradient:
      "linear-gradient(135deg, oklch(0.18 0.05 60 / 0.88) 0%, oklch(0.30 0.10 80 / 0.70) 100%)",
  },
  [Category.Kurties]: {
    title: "Suit Sets",
    subtitle: "Artisan Crafted Elegance",
    description:
      "From delicate chikankari to vibrant bandhani, our suit sets bring comfort and artistry to your wardrobe — each one handcrafted with care and adorned with traditional embellishments.",
    heroImage:
      "/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.46-PM-1--1.jpeg",
    heroGradient:
      "linear-gradient(135deg, oklch(0.18 0.06 25 / 0.88) 0%, oklch(0.28 0.08 45 / 0.70) 100%)",
  },
};

// ── Props ────────────────────────────────────────────────────────────────────
export interface CollectionPageProps {
  category: Category;
  onNavigateHome: (section?: string) => void;
}

// ── Page content (no CartProvider — expects it from App.tsx) ─────────────────
export function CollectionPageContent({
  category,
  onNavigateHome,
}: CollectionPageProps) {
  const { data: allProducts, isLoading } = useAllProducts();

  const products =
    allProducts && allProducts.length > 0 ? allProducts : FALLBACK_PRODUCTS;

  const categoryProducts = useMemo(
    () => products.filter((p) => p.category === category),
    [products, category],
  );

  const meta = COLLECTION_META[category];

  const getImage = (product: Product) =>
    getProductImage(product, categoryProducts);

  return (
    <>
      {/* ── Collection Hero ── */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <img
          src={meta.heroImage}
          alt={meta.title}
          className="w-full h-full object-cover object-top scale-110"
          loading="eager"
        />
        <div
          className="absolute inset-0"
          style={{ background: meta.heroGradient }}
        />
        {/* Decorative glow */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 30%, oklch(0.74 0.12 76 / 0.5) 0%, transparent 60%)",
          }}
        />

        <div className="absolute inset-0 flex flex-col justify-end pb-10 px-4 sm:px-8 lg:px-16">
          {/* Breadcrumb */}
          <motion.nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-white/60 text-xs mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              type="button"
              data-ocid="collection.breadcrumb.link"
              onClick={() => onNavigateHome()}
              className="hover:text-gold transition-colors"
            >
              Home
            </button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/40">Collections</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gold font-medium">{meta.title}</span>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-gold-light text-xs uppercase tracking-[0.3em] font-medium mb-2">
              The Divine Collection
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {meta.title}
            </h1>
            <p className="font-serif-alt text-white/75 italic text-lg sm:text-xl mt-1">
              {meta.subtitle}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Description + Back button row */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            <div className="section-divider max-w-[60px] mb-4" />
            <p className="text-muted-foreground text-base leading-relaxed">
              {meta.description}
            </p>
            <p className="text-muted-foreground/60 text-sm mt-3">
              {isLoading ? "—" : `${categoryProducts.length} styles available`}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button
              data-ocid="collection.back.button"
              variant="outline"
              onClick={() => onNavigateHome("shop")}
              className="border-border text-foreground hover:border-gold hover:text-primary rounded-none flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </Button>
          </motion.div>
        </div>

        {/* Product grid */}
        {isLoading ? (
          <div
            data-ocid="collection.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[1, 2, 3, 4, 5, 6].map((k) => (
              <div key={k} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-sm" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : categoryProducts.length === 0 ? (
          <div
            data-ocid="collection.empty_state"
            className="text-center py-24 text-muted-foreground"
          >
            <p className="text-lg">No products found in this collection.</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {categoryProducts.map((product, idx) => (
              <ProductCard
                key={product.id.toString()}
                product={product}
                image={getImage(product)}
                index={idx + 1}
                ocidScope="collection"
              />
            ))}
          </motion.div>
        )}
      </main>

      <Footer onNavigate={(section) => onNavigateHome(section)} />
    </>
  );
}
