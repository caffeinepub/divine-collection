import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Category } from "../backend.d";
import { Footer } from "../components/Footer";
import { ProductCard } from "../components/ProductCard";
import { ProductQuickView } from "../components/ProductQuickView";
import type { DisplayProduct } from "../hooks/useQueries";
import {
  coord1Img,
  getProductImage,
  kurtiHeroImg,
  suit1Img,
  toDisplayProduct,
  useAllProducts,
  useImageOverrides,
  useProductOverrides,
} from "../hooks/useQueries";

const COLLECTION_META: Record<
  string,
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
    heroImage: kurtiHeroImg,
    heroGradient:
      "linear-gradient(135deg, oklch(0.18 0.05 200 / 0.88) 0%, oklch(0.28 0.08 170 / 0.70) 100%)",
  },
  [Category.CoordSets]: {
    title: "Co-ord Sets",
    subtitle: "Effortless Ethnic Chic",
    description:
      "Perfectly coordinated top-and-bottom pairings that blend traditional craftsmanship with contemporary silhouettes — dressed up or down for any occasion.",
    heroImage: coord1Img,
    heroGradient:
      "linear-gradient(135deg, oklch(0.18 0.05 60 / 0.88) 0%, oklch(0.30 0.10 80 / 0.70) 100%)",
  },
  [Category.Kurties]: {
    title: "Suit Sets",
    subtitle: "Artisan Crafted Elegance",
    description:
      "From delicate chikankari to vibrant bandhani, our suit sets bring comfort and artistry to your wardrobe — each one handcrafted with care and adorned with traditional embellishments.",
    heroImage: suit1Img,
    heroGradient:
      "linear-gradient(135deg, oklch(0.18 0.06 25 / 0.88) 0%, oklch(0.28 0.08 45 / 0.70) 100%)",
  },
};

export interface CollectionPageProps {
  category: Category;
  onNavigateHome: (section?: string) => void;
}

export function CollectionPageContent({
  category,
  onNavigateHome,
}: CollectionPageProps) {
  const { data: allProducts, isLoading } = useAllProducts();
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

  const categoryProducts = useMemo(() => {
    return (allProducts ?? []).filter((p) => p.category === category);
  }, [allProducts, category]);

  const displayProducts = useMemo(() => {
    return categoryProducts.map((p) => {
      const ov = overrideMap[p.id.toString()];
      return toDisplayProduct(
        p,
        ov?.imageUrl ||
          imageOverrides[p.id.toString()] ||
          getProductImage(p, categoryProducts),
        ov?.price,
        ov?.description,
      );
    });
  }, [categoryProducts, overrideMap, imageOverrides]);

  const meta = COLLECTION_META[category as string] ?? {
    title: "Collection",
    subtitle: "",
    description: "",
    heroImage: suit1Img,
    heroGradient:
      "linear-gradient(135deg, oklch(0.18 0.06 25 / 0.88) 0%, oklch(0.28 0.08 45 / 0.70) 100%)",
  };

  const handleQuickView = (product: DisplayProduct, image: string) => {
    setQuickViewProduct(product);
    setQuickViewImage(image);
  };

  const handleCloseQuickView = () => {
    setQuickViewProduct(null);
    setQuickViewImage("");
  };

  return (
    <>
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
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 30%, oklch(0.74 0.12 76 / 0.5) 0%, transparent 60%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-end pb-10 px-4 sm:px-8 lg:px-16">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            {displayProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                image={product.imageUrl ?? suit1Img}
                index={idx + 1}
                ocidScope="collection"
                onQuickView={handleQuickView}
              />
            ))}
          </motion.div>
        )}
      </main>

      <Footer onNavigate={(section) => onNavigateHome(section)} />

      <ProductQuickView
        product={quickViewProduct}
        image={quickViewImage}
        open={quickViewProduct !== null}
        onClose={handleCloseQuickView}
      />
    </>
  );
}
