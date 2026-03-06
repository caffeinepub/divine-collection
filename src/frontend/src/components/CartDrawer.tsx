import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { useCart } from "../hooks/useCart";
import { formatPrice } from "../hooks/useQueries";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    totalItems,
    totalPrice,
    increment,
    decrement,
    removeItem,
    clearCart,
  } = useCart();

  const handleCheckout = () => {
    clearCart();
    closeCart();
    toast.success(
      "Thank you for your order! We'll confirm your purchase shortly.",
      {
        duration: 5000,
      },
    );
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm"
            onClick={closeCart}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            data-ocid="cart.panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-card-foreground">
                  Your Bag
                </h2>
                {totalItems > 0 && (
                  <span className="gold-gradient text-charcoal text-xs font-bold rounded-full px-2.5 py-0.5">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                type="button"
                data-ocid="cart.close_button"
                onClick={closeCart}
                className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div
                data-ocid="cart.empty_state"
                className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8"
              >
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-foreground mb-1">
                    Your bag is empty
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Discover our beautiful collections and add something you
                    love.
                  </p>
                </div>
                <Button
                  onClick={closeCart}
                  className="gold-gradient text-charcoal font-semibold rounded-none mt-2"
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 px-5">
                  <div className="py-4 space-y-4">
                    {items.map((item, idx) => (
                      <motion.div
                        key={item.product.id.toString()}
                        data-ocid={`cart.item.${idx + 1}`}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex gap-3 py-3 border-b border-border last:border-0"
                      >
                        {/* Image */}
                        <div className="w-16 h-20 flex-shrink-0 rounded-sm overflow-hidden bg-secondary">
                          <img
                            src={item.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-card-foreground text-sm line-clamp-1 mb-0.5">
                            {item.product.name}
                          </p>
                          <p className="text-muted-foreground text-xs mb-3 capitalize">
                            {item.product.category}
                          </p>
                          <div className="flex items-center justify-between">
                            {/* Qty controls */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => decrement(item.product.id)}
                                className="w-7 h-7 flex items-center justify-center rounded border border-border hover:border-primary hover:text-primary transition-colors text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                                aria-label={`Decrease quantity of ${item.product.name}`}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold text-foreground">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => increment(item.product.id)}
                                className="w-7 h-7 flex items-center justify-center rounded border border-border hover:border-primary hover:text-primary transition-colors text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                                aria-label={`Increase quantity of ${item.product.name}`}
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            {/* Price */}
                            <p className="font-display font-bold text-primary text-sm">
                              {formatPrice(
                                item.product.price * BigInt(item.quantity),
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          data-ocid={`cart.delete_button.${idx + 1}`}
                          onClick={() => removeItem(item.product.id)}
                          className="flex-shrink-0 p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                          aria-label={`Remove ${item.product.name} from cart`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Footer */}
                <div className="p-5 border-t border-border space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-display font-bold text-foreground text-lg">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Shipping & taxes calculated at checkout
                  </p>
                  <Button
                    data-ocid="cart.checkout_button"
                    onClick={handleCheckout}
                    className="w-full gold-gradient text-charcoal font-bold rounded-none py-6 text-base hover:opacity-90 transition-opacity"
                  >
                    Proceed to Checkout
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={closeCart}
                    className="w-full text-muted-foreground hover:text-foreground rounded-none"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
