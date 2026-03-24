import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "../hooks/useCart";
import { useDynamicCategories } from "../hooks/useQueries";

interface NavbarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  isCollectionPage?: boolean;
  onNavigateToCollection?: (slug: string) => void;
}

const navLinks = [
  { id: "home", label: "Home" },
  { id: "shop", label: "Shop" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

// Static fallback collections
const STATIC_COLLECTIONS = [
  { label: "Suit Sets", slug: "suit-sets" },
  { label: "Kurti Sets", slug: "kurti-sets" },
  { label: "Co-ord Sets", slug: "coord-sets" },
];

export function Navbar({
  activeSection,
  onNavigate,
  isCollectionPage = false,
  onNavigateToCollection,
}: NavbarProps) {
  const { totalItems, openCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: dynamicCategories } = useDynamicCategories();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setCollectionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNav = (section: string) => {
    onNavigate(section);
    setMobileMenuOpen(false);
    setCollectionsOpen(false);
  };

  const handleCollection = (slug: string) => {
    if (onNavigateToCollection) onNavigateToCollection(slug);
    setMobileMenuOpen(false);
    setCollectionsOpen(false);
  };

  // Use dynamic categories if available, else fall back to static
  const collections =
    dynamicCategories && dynamicCategories.length > 0
      ? dynamicCategories.map((c) => ({ label: c.name, slug: c.id }))
      : STATIC_COLLECTIONS;

  const textColor =
    isScrolled || isCollectionPage
      ? "text-charcoal hover:text-primary"
      : "text-ivory/90 hover:text-ivory";

  const activeLinkColor =
    isScrolled || isCollectionPage ? "text-primary" : "text-ivory";

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || isCollectionPage
            ? "bg-ivory/95 backdrop-blur-md shadow-md border-b border-border"
            : "bg-transparent"
        }`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <button
              type="button"
              data-ocid="nav.home_link"
              onClick={() => handleNav("home")}
              className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
            >
              <img
                src="/assets/generated/brand-logo.dim_400x160.png"
                alt="Divine Collection"
                className="h-10 lg:h-12 w-auto object-contain"
              />
            </button>

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
                    activeSection === link.id && !isCollectionPage
                      ? activeLinkColor
                      : textColor
                  }`}
                >
                  {link.label}
                  {activeSection === link.id && !isCollectionPage && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gold rounded-full"
                    />
                  )}
                </button>
              ))}

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  data-ocid="nav.collections_toggle"
                  onClick={() => setCollectionsOpen(!collectionsOpen)}
                  className={`relative flex items-center gap-1 px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    isCollectionPage ? activeLinkColor : textColor
                  }`}
                >
                  Collections
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${collectionsOpen ? "rotate-180" : ""}`}
                  />
                  {isCollectionPage && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gold rounded-full"
                    />
                  )}
                </button>

                <AnimatePresence>
                  {collectionsOpen && (
                    <motion.div
                      data-ocid="nav.collections_dropdown_menu"
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-48 bg-ivory border border-border shadow-lg overflow-hidden z-50"
                    >
                      {collections.map((col) => (
                        <button
                          key={col.slug}
                          type="button"
                          data-ocid={`nav.${col.slug.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_link`}
                          onClick={() => handleCollection(col.slug)}
                          className="w-full text-left px-4 py-3 text-sm text-charcoal hover:text-primary hover:bg-secondary transition-colors border-b border-border/50 last:border-0"
                        >
                          {col.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                data-ocid="nav.cart_button"
                onClick={openCart}
                className={`relative p-2 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  isScrolled || isCollectionPage
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

              <button
                type="button"
                className={`md:hidden p-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  isScrolled || isCollectionPage
                    ? "text-charcoal"
                    : "text-ivory"
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

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-ivory border-b border-border shadow-lg md:hidden max-h-[80vh] overflow-y-auto"
          >
            <nav className="flex flex-col py-4 px-4 gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  data-ocid={`nav.${link.id}_link`}
                  onClick={() => handleNav(link.id)}
                  className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    activeSection === link.id && !isCollectionPage
                      ? "text-primary bg-secondary"
                      : "text-charcoal hover:text-primary hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </button>
              ))}

              <div className="pt-2 pb-1">
                <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Collections
                </p>
                {collections.map((col) => (
                  <button
                    key={col.slug}
                    type="button"
                    data-ocid={`nav.${col.slug.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_link`}
                    onClick={() => handleCollection(col.slug)}
                    className="w-full text-left px-6 py-2.5 rounded-lg text-sm font-medium text-charcoal hover:text-primary hover:bg-secondary transition-colors"
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
