import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ShoppingBag, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Product } from "../backend.d";
import { Category } from "../backend.d";
import type { ProductSize } from "../hooks/useCart";
import { useCart } from "../hooks/useCart";
import { formatPrice } from "../hooks/useQueries";

interface ProductQuickViewProps {
  product: Product | null;
  image: string;
  open: boolean;
  onClose: () => void;
}

const SIZES: ProductSize[] = ["M", "L", "XL", "XXL"];

const categoryColors: Record<Category, string> = {
  [Category.Sarees]: "bg-magenta/10 text-magenta border-magenta/30",
  [Category.CoordSets]: "bg-gold/10 text-gold-dark border-gold/30",
  [Category.Kurties]: "bg-crimson/10 text-crimson border-crimson/30",
};

const categoryLabels: Record<Category, string> = {
  [Category.Sarees]: "Kurti Set",
  [Category.CoordSets]: "Co-ord Set",
  [Category.Kurties]: "Suit",
};

export function ProductQuickView({
  product,
  image,
  open,
  onClose,
}: ProductQuickViewProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [showSizeError, setShowSizeError] = useState(false);

  if (!product) return null;

  const categoryLabel =
    categoryLabels[product.category as Category] ?? product.category;
  const categoryColor =
    categoryColors[product.category as Category] ??
    "bg-primary/10 text-primary border-primary/30";

  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowSizeError(true);
      return;
    }
    addItem(product, image, selectedSize);
    setSelectedSize(null);
    setShowSizeError(false);
    onClose();
  };

  const handleClose = () => {
    setSelectedSize(null);
    setShowSizeError(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        data-ocid="product.quickview.dialog"
        showCloseButton={false}
        className="p-0 overflow-hidden border border-border rounded-none max-w-[calc(100%-2rem)] sm:max-w-3xl bg-card gap-0"
        aria-describedby={undefined}
      >
        {/* Visually hidden dialog title for accessibility */}
        <DialogTitle className="sr-only">
          {product.name} — Quick View
        </DialogTitle>

        {/* Close Button */}
        <button
          type="button"
          data-ocid="product.quickview.close_button"
          onClick={handleClose}
          aria-label="Close quick view"
          className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-charcoal/60 backdrop-blur-sm text-ivory hover:bg-charcoal/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col sm:flex-row min-h-0">
          {/* ── Image panel ── */}
          <motion.div
            className="relative w-full sm:w-[45%] shrink-0 aspect-[3/4] sm:aspect-auto sm:min-h-[480px] bg-secondary overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover object-top"
              loading="eager"
            />
            {/* Gold shimmer overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-charcoal/30 to-transparent pointer-events-none" />

            {/* Badges over image */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full border backdrop-blur-sm ${categoryColor}`}
              >
                {categoryLabel}
              </span>
              {product.isFeatured && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full border gold-gradient text-charcoal backdrop-blur-sm">
                  ✶ Featured
                </span>
              )}
            </div>
          </motion.div>

          {/* ── Details panel ── */}
          <motion.div
            className="flex flex-col flex-1 p-6 sm:p-8 justify-between overflow-y-auto max-h-[60vh] sm:max-h-none"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          >
            <div>
              {/* Decorative top rule */}
              <div className="section-divider mb-5" />

              {/* Eyebrow */}
              <p className="text-gold text-[10px] uppercase tracking-[0.35em] font-medium mb-2">
                Divine Collection
              </p>

              {/* Product name */}
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-card-foreground leading-tight mb-3">
                {product.name}
              </h2>

              {/* Category pill + Price row */}
              <div className="flex items-center gap-3 mb-5">
                <span
                  className={`inline-block text-xs font-medium px-3 py-1 rounded-full border ${categoryColor}`}
                >
                  {categoryLabel}
                </span>
                {Number(product.price) > 0 && (
                  <span className="text-primary font-bold text-lg">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Divider */}
              <div className="section-divider mb-5" />

              {/* Size selector */}
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-card-foreground mb-3">
                  Select Size
                </p>
                <div className="flex gap-2 flex-wrap">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      data-ocid={`product.quickview.size_${size.toLowerCase()}_button`}
                      onClick={() => {
                        setSelectedSize(size);
                        setShowSizeError(false);
                      }}
                      className={`w-14 py-2 text-sm font-medium border transition-all duration-150 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                        selectedSize === size
                          ? "gold-gradient text-charcoal border-transparent shadow-sm"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {showSizeError && (
                  <p className="text-xs text-destructive mt-2">
                    Please select a size before adding to cart
                  </p>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3">
              <Button
                data-ocid="product.quickview.add_button"
                onClick={handleAddToCart}
                className="w-full gold-gradient text-charcoal font-semibold rounded-none hover:opacity-90 transition-opacity py-5 text-sm tracking-wide"
                size="lg"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <button
                type="button"
                onClick={handleClose}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center underline underline-offset-2"
              >
                Continue Browsing
              </button>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
