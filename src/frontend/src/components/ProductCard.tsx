import { Button } from "@/components/ui/button";
import { Eye, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { CartProduct, ProductSize } from "../hooks/useCart";
import { useCart } from "../hooks/useCart";
import type { DisplayProduct } from "../hooks/useQueries";
import { isSizeOutOfStock, useStock } from "../hooks/useQueries";
import { SizeChartModal } from "./SizeChartModal";

interface ProductCardProps {
  product: DisplayProduct;
  image: string;
  index: number;
  ocidScope?: string;
  onQuickView?: (product: DisplayProduct, image: string) => void;
}

export function ProductCard({
  product,
  image,
  index,
  ocidScope = "shop",
  onQuickView,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizeError, setShowSizeError] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const { data: stockData } = useStock();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedSize) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 2000);
      return;
    }
    const cartProduct: CartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.categoryName,
    };
    addItem(cartProduct, image, selectedSize as ProductSize);
  };

  return (
    <>
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
          <div className="absolute top-3 left-3 pointer-events-none">
            <span className="text-xs font-medium px-2 py-1 rounded-full border backdrop-blur-sm bg-gold/10 text-gold-dark border-gold/30">
              {product.categoryName}
            </span>
          </div>
          {/* Hover overlay with Quick View */}
          <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end gap-2 p-4">
            <button
              type="button"
              data-ocid="product.quick_view_button"
              onClick={() => onQuickView?.(product, image)}
              className="w-full flex items-center justify-center gap-2 bg-ivory/90 text-charcoal font-semibold text-xs py-2 px-4 backdrop-blur-sm hover:bg-ivory transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              Quick View
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="p-4">
          <button
            type="button"
            className="w-full text-left font-display font-semibold text-card-foreground text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors cursor-pointer bg-transparent border-0 p-0"
            onClick={() => onQuickView?.(product, image)}
          >
            {product.name}
          </button>
          <p className="text-muted-foreground text-xs mb-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {Number(product.price) > 0 && (
            <p className="text-primary font-semibold text-sm mb-3">
              ₹{Number(product.price).toLocaleString("en-IN")}/-
            </p>
          )}

          {/* Size selector */}
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1.5 font-medium">
              Select Size
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {product.sizes.map((size) => {
                const outOfStock = isSizeOutOfStock(
                  stockData as
                    | Array<{
                        productId: string;
                        size: string;
                        quantity: bigint;
                      }>
                    | undefined,
                  product.id,
                  size,
                );
                return (
                  <button
                    key={size}
                    type="button"
                    data-ocid={`product.size_${size.toLowerCase()}_button`}
                    disabled={outOfStock}
                    onClick={() => {
                      if (outOfStock) return;
                      setSelectedSize(size);
                      setShowSizeError(false);
                    }}
                    className={`px-2.5 py-1 text-xs font-medium border transition-all duration-150 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                      outOfStock
                        ? "border-border/40 text-muted-foreground/40 line-through cursor-not-allowed pointer-events-none opacity-50"
                        : selectedSize === size
                          ? "gold-gradient text-charcoal border-transparent"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            {showSizeError && (
              <p className="text-xs text-destructive mt-1">
                Please select a size
              </p>
            )}
            <button
              type="button"
              data-ocid="product.sizechart.open_modal_button"
              onClick={() => setShowSizeChart(true)}
              className="text-xs text-primary underline underline-offset-2 hover:text-primary/80 transition-colors mt-1.5"
            >
              Size Chart
            </button>
          </div>

          <div className="flex items-center justify-end">
            <Button
              data-ocid="product.add_button"
              onClick={handleAddToCart}
              size="sm"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors rounded-none text-xs"
            >
              <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </motion.article>

      <SizeChartModal
        open={showSizeChart}
        onClose={() => setShowSizeChart(false)}
      />
    </>
  );
}
