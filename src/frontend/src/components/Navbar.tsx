import { Button } from "@/components/ui/button";
import { Menu, ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useCart } from "../hooks/useCart";

interface NavbarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const navLinks = [
  { id: "home", label: "Home" },
  { id: "shop", label: "Shop" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

export function Navbar({ activeSection, onNavigate }: NavbarProps) {
  const { totalItems, openCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNav = (section: string) => {
    onNavigate(section);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-ivory/95 backdrop-blur-md shadow-md border-b border-border"
            : "bg-transparent"
        }`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <button
              type="button"
              onClick={() => handleNav("home")}
              className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
            >
              <img
                src="/assets/generated/divine-logo-transparent.dim_400x200.png"
                alt="Divine Collection"
                className="h-10 lg:h-12 w-auto object-contain"
              />
            </button>

            {/* Desktop Nav Links */}
            <nav
              className="hidden md:flex items-center gap-1"
              aria-label="Main navigation"
            >
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  data-ocid={`nav.${link.id}_link`}
                  onClick={() => handleNav(link.id)}
                  className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    activeSection === link.id
                      ? "text-primary"
                      : isScrolled
                        ? "text-charcoal hover:text-primary"
                        : "text-ivory/90 hover:text-ivory"
                  }`}
                >
                  {link.label}
                  {activeSection === link.id && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gold rounded-full"
                    />
                  )}
                </button>
              ))}
            </nav>

            {/* Cart + Mobile Menu */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-ocid="nav.cart_button"
                onClick={openCart}
                className={`relative p-2 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  isScrolled
                    ? "text-charcoal hover:text-primary hover:bg-secondary"
                    : "text-ivory hover:text-ivory/80"
                }`}
                aria-label={`Shopping cart, ${totalItems} items`}
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-magenta text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {totalItems > 9 ? "9+" : totalItems}
                  </motion.span>
                )}
              </button>

              {/* Mobile hamburger */}
              <button
                type="button"
                className={`md:hidden p-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  isScrolled ? "text-charcoal" : "text-ivory"
                }`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-ivory border-b border-border shadow-lg md:hidden"
          >
            <nav className="flex flex-col py-4 px-4 gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  data-ocid={`nav.${link.id}_link`}
                  onClick={() => handleNav(link.id)}
                  className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    activeSection === link.id
                      ? "text-primary bg-secondary"
                      : "text-charcoal hover:text-primary hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
