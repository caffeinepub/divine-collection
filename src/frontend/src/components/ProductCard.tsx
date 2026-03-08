import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import type { Product } from "../backend.d";
import { Category } from "../backend.d";
import { useCart } from "../hooks/useCart";

interface ProductCardProps {
  product: Product;
  image: string;
  index: number;
  ocidScope?: string;
}

const categoryColors: Record<Category, string> = {
  [Category.Sarees]: "bg-magenta/10 text-magenta border-magenta/30",
  [Category.CoordSets]: "bg-gold/10 text-gold-dark border-gold/30",
  [Category.Kurties]: "bg-crimson/10 text-crimson border-crimson/30",
};

const categoryLabels: Record<Category, string> = {
  [Category.Sarees]: "Saree",
  [Category.CoordSets]: "Coord Set",
  [Category.Kurties]: "Suit",
};

export function ProductCard({
  product,
  image,
  index,
  ocidScope = "shop",
}: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <motion.article
      data-ocid={`${ocidScope}.item.${index}`}
      className="group bg-card rounded-sm overflow-hidden shadow-sm border border-border card-hover"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      {/* Image */}
      <div className="img-zoom aspect-[3/4] relative bg-secondary">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full border backdrop-blur-sm ${
              categoryColors[product.category as Category] ??
              "bg-white/80 text-charcoal border-border"
            }`}
          >
            {categoryLabels[product.category as Category] ?? product.category}
          </span>
        </div>
        {product.isFeatured && (
          <div className="absolute top-3 right-3">
            <span className="text-xs font-medium px-2 py-1 rounded-full border gold-gradient text-charcoal backdrop-blur-sm">
              Featured
            </span>
          </div>
        )}
        {/* Quick add overlay */}
        <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <Button
            data-ocid="product.add_button"
            onClick={() => addItem(product, image)}
            className="w-full gold-gradient text-charcoal font-semibold rounded-none hover:opacity-90 transition-opacity"
            size="sm"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Details */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-card-foreground text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-xs mb-3 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        <div className="flex items-center justify-end">
          <Button
            data-ocid="product.add_button"
            onClick={() => addItem(product, image)}
            size="sm"
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors rounded-none text-xs"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
