import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { Category } from "../backend.d";
import type { Product } from "../backend.d";
import {
  getProductImage,
  useAllProducts,
  useFeaturedProducts,
} from "../hooks/useQueries";
import { ProductCard } from "./ProductCard";

// fallback static featured products for initial load
const FALLBACK_FEATURED: Product[] = [
  {
    id: BigInt(1),
    name: "Silk Magenta Saree",
    description:
      "Exquisite pure silk saree with intricate golden zari embroidery and traditional woven motifs.",
    isFeatured: true,
    category: Category.Sarees,
    price: BigInt(8500),
  },
  {
    id: BigInt(4),
    name: "Rose Pink Coord Set",
    description:
      "Elegant rose pink coordinate set with delicate floral embroidery and mirror work details.",
    isFeatured: true,
    category: Category.CoordSets,
    price: BigInt(3800),
  },
  {
    id: BigInt(7),
    name: "Teal Anarkali Kurti",
    description:
      "Flowing teal Anarkali kurti with golden thread embroidery and traditional Indian motifs.",
    isFeatured: true,
    category: Category.Kurties,
    price: BigInt(2200),
  },
];

function getCategoryProducts(
  allProducts: Product[],
  category: Category,
): Product[] {
  return allProducts.filter((p) => p.category === category);
}

export function FeaturedSection() {
  const { data: featured, isLoading } = useFeaturedProducts();
  const { data: allProducts } = useAllProducts();

  const products =
    featured && featured.length > 0 ? featured : FALLBACK_FEATURED;

  const getImage = (product: Product) => {
    const catProds = allProducts
      ? getCategoryProducts(allProducts, product.category)
      : getCategoryProducts(products, product.category);
    return getProductImage(product, catProds);
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
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
