import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Category } from "../backend.d";
import { addSaleRecord } from "../hooks/useAdminData";
import { useCart } from "../hooks/useCart";
import { formatPrice } from "../hooks/useQueries";

const WHATSAPP_NUMBER = "917290016528";

const CATEGORY_LABELS: Record<string, string> = {
  [Category.Kurties]: "Suit Set",
  [Category.Sarees]: "Kurti Set",
  [Category.CoordSets]: "Co-ord Set",
};

function getCategoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat;
}

interface CustomerDetails {
  name: string;
  address: string;
  mobile: string;
}

type CheckoutStep = "cart" | "details";

// Footer height constant (px) — used to add bottom padding to scroll areas
const FOOTER_H = 160;

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

  const [step, setStep] = useState<CheckoutStep>("cart");
  const [details, setDetails] = useState<CustomerDetails>({
    name: "",
    address: "",
    mobile: "",
  });
  const [errors, setErrors] = useState<Partial<CustomerDetails>>({});

  // Reset step when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setStep("cart");
      setErrors({});
    }
  }, [isOpen]);

  const handleClose = () => {
    closeCart();
  };

  const validate = (): boolean => {
    const newErrors: Partial<CustomerDetails> = {};
    if (!details.name.trim()) newErrors.name = "Name is required";
    if (!details.address.trim()) newErrors.address = "Address is required";
    if (!details.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(details.mobile.trim())) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildWhatsAppUrl = (): string => {
    const itemLines = items
      .map(
        (item) =>
          `  - ${item.product.name} (Size: ${item.size}) x${item.quantity} = ${formatPrice(item.product.price * BigInt(item.quantity))}`,
      )
      .join("%0A");

    const message = `*New Order - Divine Collection*%0A%0A*Customer Details*%0AName: ${encodeURIComponent(details.name.trim())}%0AMobile: ${encodeURIComponent(details.mobile.trim())}%0AAddress: ${encodeURIComponent(details.address.trim())}%0A%0A*Order Summary*%0A${itemLines}%0A%0A*Total: ${formatPrice(totalPrice)}*`;

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  };

  const handleProceedToCheckout = () => {
    setStep("details");
  };

  const handleSendWhatsApp = () => {
    if (!validate()) return;

    // Record the sale before navigating away
    addSaleRecord({
      customerName: details.name.trim(),
      mobile: details.mobile.trim(),
      address: details.address.trim(),
      items: items.map((item) => ({
        name: item.product.name,
        size: item.size,
        quantity: item.quantity,
        price: Number(item.product.price),
      })),
      total: Number(totalPrice),
    });

    const url = buildWhatsAppUrl();
    window.location.href = url;
    setTimeout(() => {
      clearCart();
      handleClose();
      toast.success("Order sent via WhatsApp! We\u2019ll confirm shortly.", {
        duration: 5000,
      });
    }, 500);
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
            className="fixed inset-0 z-40 bg-charcoal/50 backdrop-blur-sm"
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      {/* Drawer panel — no onClick on the panel itself */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            data-ocid="cart.panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 w-full max-w-md bg-card shadow-2xl flex flex-col"
            style={{
              bottom: 0,
              height: "100%",
              maxHeight: "-webkit-fill-available",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                {step === "details" && (
                  <button
                    type="button"
                    data-ocid="cart.back_button"
                    onClick={() => setStep("cart")}
                    className="p-1 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                    aria-label="Back to cart"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-card-foreground">
                  {step === "cart" ? "Your Bag" : "Your Details"}
                </h2>
                {step === "cart" && totalItems > 0 && (
                  <span className="gold-gradient text-charcoal text-xs font-bold rounded-full px-2.5 py-0.5">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                type="button"
                data-ocid="cart.close_button"
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ---- STEP: CART ---- */}
            {step === "cart" &&
              (items.length === 0 ? (
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
                    onClick={handleClose}
                    className="gold-gradient text-charcoal font-semibold rounded-none mt-2"
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <>
                  {/* Scrollable cart items — padded so content clears the fixed footer */}
                  <div
                    className="flex-1 overflow-y-auto overscroll-contain -webkit-overflow-scrolling-touch px-5"
                    style={{ paddingBottom: FOOTER_H }}
                  >
                    <div className="py-4 space-y-4">
                      {items.map((item, idx) => (
                        <motion.div
                          key={`${item.product.id.toString()}-${item.size}`}
                          data-ocid={`cart.item.${idx + 1}`}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex gap-3 py-3 border-b border-border last:border-0"
                        >
                          <div className="w-16 h-20 flex-shrink-0 rounded-sm overflow-hidden bg-secondary">
                            <img
                              src={item.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-card-foreground text-sm line-clamp-1 mb-0.5">
                              {item.product.name}
                            </p>
                            <p className="text-muted-foreground text-xs mb-1 capitalize">
                              {getCategoryLabel(item.product.category)}
                            </p>
                            <p className="text-xs font-medium text-primary mb-2">
                              Size: {item.size}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    decrement(item.product.id, item.size)
                                  }
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
                                  onClick={() =>
                                    increment(item.product.id, item.size)
                                  }
                                  className="w-7 h-7 flex items-center justify-center rounded border border-border hover:border-primary hover:text-primary transition-colors text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                                  aria-label={`Increase quantity of ${item.product.name}`}
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <p className="font-display font-bold text-primary text-sm">
                                {formatPrice(
                                  item.product.price * BigInt(item.quantity),
                                )}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            data-ocid={`cart.delete_button.${idx + 1}`}
                            onClick={() =>
                              removeItem(item.product.id, item.size)
                            }
                            className="flex-shrink-0 p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                            aria-label={`Remove ${item.product.name} from cart`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Cart footer — absolutely positioned to sit at the bottom of the drawer */}
                  <div
                    className="absolute bottom-0 left-0 right-0 p-5 border-t border-border space-y-4 bg-card"
                    style={{
                      paddingBottom:
                        "max(20px, env(safe-area-inset-bottom, 20px))",
                      zIndex: 10,
                    }}
                  >
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Subtotal ({totalItems} items)</span>
                      <span className="font-display font-bold text-foreground text-lg">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Shipping &amp; taxes calculated at checkout
                    </p>
                    <button
                      type="button"
                      data-ocid="cart.checkout_button"
                      onClick={handleProceedToCheckout}
                      style={{
                        touchAction: "manipulation",
                        WebkitTapHighlightColor: "transparent",
                        cursor: "pointer",
                        position: "relative",
                        zIndex: 20,
                      }}
                      className="w-full gold-gradient text-charcoal font-bold py-4 text-base hover:opacity-90 transition-opacity block text-center"
                    >
                      Proceed to Checkout
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      style={{ touchAction: "manipulation", cursor: "pointer" }}
                      className="w-full text-muted-foreground hover:text-foreground py-2 text-sm transition-colors block text-center"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </>
              ))}

            {/* ---- STEP: CUSTOMER DETAILS ---- */}
            {step === "details" && (
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                {/* Scrollable form area — padded so content clears the fixed footer */}
                <div
                  className="flex-1 overflow-y-auto overscroll-contain px-5 py-6"
                  style={{ paddingBottom: FOOTER_H }}
                >
                  <p className="text-sm text-muted-foreground mb-6">
                    Please fill in your details so we can process your order via
                    WhatsApp.
                  </p>

                  {/* Mini order summary */}
                  <div className="bg-secondary/50 rounded-sm p-4 mb-6 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Order Summary
                    </p>
                    {items.map((item) => (
                      <div
                        key={`${item.product.id.toString()}-${item.size}`}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-foreground">
                          {item.product.name} ({item.size}) x{item.quantity}
                        </span>
                        <span className="font-semibold text-primary">
                          {formatPrice(
                            item.product.price * BigInt(item.quantity),
                          )}
                        </span>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between text-sm font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="customer-name"
                        className="text-sm font-semibold"
                      >
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="customer-name"
                        data-ocid="cart.name.input"
                        placeholder="Enter your full name"
                        value={details.name}
                        onChange={(e) => {
                          setDetails((d) => ({ ...d, name: e.target.value }));
                          if (errors.name)
                            setErrors((er) => ({ ...er, name: undefined }));
                        }}
                        className={
                          errors.name
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                      />
                      {errors.name && (
                        <p
                          data-ocid="cart.name.error_state"
                          className="text-xs text-destructive"
                        >
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Mobile */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="customer-mobile"
                        className="text-sm font-semibold"
                      >
                        Mobile Number{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="customer-mobile"
                        data-ocid="cart.mobile.input"
                        placeholder="10-digit mobile number"
                        inputMode="numeric"
                        maxLength={10}
                        value={details.mobile}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setDetails((d) => ({ ...d, mobile: val }));
                          if (errors.mobile)
                            setErrors((er) => ({ ...er, mobile: undefined }));
                        }}
                        className={
                          errors.mobile
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                      />
                      {errors.mobile && (
                        <p
                          data-ocid="cart.mobile.error_state"
                          className="text-xs text-destructive"
                        >
                          {errors.mobile}
                        </p>
                      )}
                    </div>

                    {/* Address */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="customer-address"
                        className="text-sm font-semibold"
                      >
                        Delivery Address{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <textarea
                        id="customer-address"
                        data-ocid="cart.address.textarea"
                        placeholder="House no., Street, Area, City, Pincode"
                        rows={3}
                        value={details.address}
                        onChange={(e) => {
                          setDetails((d) => ({
                            ...d,
                            address: e.target.value,
                          }));
                          if (errors.address)
                            setErrors((er) => ({ ...er, address: undefined }));
                        }}
                        className={`w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none ${
                          errors.address
                            ? "border-destructive focus-visible:ring-destructive"
                            : "border-input"
                        }`}
                      />
                      {errors.address && (
                        <p
                          data-ocid="cart.address.error_state"
                          className="text-xs text-destructive"
                        >
                          {errors.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details footer — absolutely positioned */}
                <div
                  className="absolute bottom-0 left-0 right-0 p-5 border-t border-border space-y-3 bg-card"
                  style={{
                    paddingBottom:
                      "max(20px, env(safe-area-inset-bottom, 20px))",
                    zIndex: 10,
                  }}
                >
                  {/* WhatsApp button as plain button — no anchor tag to avoid iOS link-tap quirks */}
                  <button
                    type="button"
                    data-ocid="cart.whatsapp_submit_button"
                    onClick={handleSendWhatsApp}
                    style={{
                      touchAction: "manipulation",
                      WebkitTapHighlightColor: "transparent",
                      cursor: "pointer",
                      position: "relative",
                      zIndex: 20,
                    }}
                    className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-4 text-base transition-colors flex items-center justify-center gap-2 select-none rounded-none"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Send Order on WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("cart")}
                    style={{ touchAction: "manipulation", cursor: "pointer" }}
                    className="w-full text-muted-foreground hover:text-foreground py-2 text-sm transition-colors block text-center"
                  >
                    Back to Cart
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
