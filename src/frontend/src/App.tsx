import { Toaster } from "@/components/ui/sonner";
import { useCallback, useEffect, useState } from "react";
import { Category } from "./backend.d";
import { AboutSection } from "./components/AboutSection";
import { CartDrawer } from "./components/CartDrawer";
import { ContactSection } from "./components/ContactSection";
import { FeaturedSection } from "./components/FeaturedSection";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/HeroSection";
import { Navbar } from "./components/Navbar";
import { ProductImagePreloader } from "./components/ProductImagePreloader";
import { ShopSection } from "./components/ShopSection";
import { recordVisit } from "./hooks/useAdminData";
import { CartProvider } from "./hooks/useCart";
import { useInitBackend } from "./hooks/useQueries";
import { AdminPage } from "./pages/AdminPage";
import { CollectionPageContent } from "./pages/CollectionPage";

// ── Route types ────────────────────────────────────────────────────────────────────
type Route =
  | { page: "home" }
  | { page: "collection"; category: Category }
  | { page: "admin" };

const SLUG_TO_CATEGORY: Record<string, Category> = {
  "suit-sets": Category.Kurties,
  "kurti-sets": Category.Sarees,
  "coord-sets": Category.CoordSets,
};

const CATEGORY_TO_SLUG: Record<string, string> = {
  [Category.Sarees]: "kurti-sets",
  [Category.CoordSets]: "coord-sets",
  [Category.Kurties]: "suit-sets",
};

function resolveRoute(): Route {
  const path = window.location.pathname;
  if (path.startsWith("/admin")) return { page: "admin" };
  const match = path.match(/^\/collections\/([^/]+)/);
  if (match) {
    const category = SLUG_TO_CATEGORY[match[1]];
    if (category) return { page: "collection", category };
  }
  return { page: "home" };
}

// ── Home page content ──────────────────────────────────────────────────────────────────────────
function HomePage({
  onNavigateToCollection,
}: {
  onNavigateToCollection: (slug: string) => void;
}) {
  const [activeSection, setActiveSection] = useState("home");
  useInitBackend();

  useEffect(() => {
    const sections = ["home", "shop", "about", "contact"];
    const observers: IntersectionObserver[] = [];

    for (const id of sections) {
      const el = document.getElementById(id);
      if (!el) continue;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { threshold: 0.3, rootMargin: "-80px 0px -60% 0px" },
      );
      observer.observe(el);
      observers.push(observer);
    }

    return () => {
      for (const o of observers) o.disconnect();
    };
  }, []);

  const navigateTo = useCallback((section: string) => {
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setActiveSection(section);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        activeSection={activeSection}
        onNavigate={navigateTo}
        onNavigateToCollection={onNavigateToCollection}
      />
      <main>
        <HeroSection onShopNow={() => navigateTo("shop")} />

        {/* Featured Products */}
        <section id="featured" className="scroll-mt-16">
          <FeaturedSection />
        </section>

        {/* Shop Section */}
        <ShopSection />

        {/* About Section */}
        <AboutSection />

        {/* Contact Section */}
        <ContactSection />
      </main>
      <Footer onNavigate={navigateTo} />
      <CartDrawer />
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────────────────
function AppContent() {
  const [route, setRoute] = useState<Route>(resolveRoute);

  // Keep URL in sync with route state
  useEffect(() => {
    if (route.page === "home") {
      if (window.location.pathname !== "/") {
        window.history.pushState(null, "", "/");
      }
    } else if (route.page === "admin") {
      if (window.location.pathname !== "/admin") {
        window.history.pushState(null, "", "/admin");
      }
    } else {
      const slug = CATEGORY_TO_SLUG[route.category as string];
      const target = `/collections/${slug}`;
      if (window.location.pathname !== target) {
        window.history.pushState(null, "", target);
      }
    }
  }, [route]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePop = () => setRoute(resolveRoute());
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  // Scroll to top on route change
  // biome-ignore lint/correctness/useExhaustiveDependencies: route triggers scroll
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [route]);

  // Record visit on route change (skip admin)
  // biome-ignore lint/correctness/useExhaustiveDependencies: route triggers visit recording
  useEffect(() => {
    if (route.page === "admin") return;
    if (route.page === "home") {
      recordVisit("Home");
    } else if (route.page === "collection") {
      if (route.category === Category.Kurties) {
        recordVisit("Suit Sets");
      } else if (route.category === Category.Sarees) {
        recordVisit("Kurti Sets");
      } else if (route.category === Category.CoordSets) {
        recordVisit("Co-ord Sets");
      }
    }
  }, [route]);

  const navigateToCollection = useCallback((slug: string) => {
    const category = SLUG_TO_CATEGORY[slug];
    if (category) {
      setRoute({ page: "collection", category });
    }
  }, []);

  const navigateHome = useCallback((section?: string) => {
    setRoute({ page: "home" });
    if (section) {
      setTimeout(() => {
        const el = document.getElementById(section);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  }, []);

  if (route.page === "admin") {
    return <AdminPage />;
  }

  if (route.page === "collection") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar
          activeSection={`collection-${route.category}`}
          onNavigate={(section) => navigateHome(section)}
          isCollectionPage
          onNavigateToCollection={navigateToCollection}
        />
        {/* pt-16 to offset fixed navbar */}
        <div className="pt-16 lg:pt-20">
          <CollectionPageContent
            category={route.category}
            onNavigateHome={navigateHome}
          />
        </div>
        <CartDrawer />
      </div>
    );
  }

  return <HomePage onNavigateToCollection={navigateToCollection} />;
}

export default function App() {
  return (
    <CartProvider>
      {/* Hidden preloader — ensures build scanner finds all image paths */}
      <ProductImagePreloader />
      <AppContent />
      <Toaster position="top-right" richColors />
    </CartProvider>
  );
}
