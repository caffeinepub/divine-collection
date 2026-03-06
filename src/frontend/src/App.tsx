import { Toaster } from "@/components/ui/sonner";
import { useCallback, useEffect, useState } from "react";
import { AboutSection } from "./components/AboutSection";
import { CartDrawer } from "./components/CartDrawer";
import { ContactSection } from "./components/ContactSection";
import { FeaturedSection } from "./components/FeaturedSection";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/HeroSection";
import { Navbar } from "./components/Navbar";
import { ShopSection } from "./components/ShopSection";
import { CartProvider } from "./hooks/useCart";
import { useInitBackend } from "./hooks/useQueries";

function AppContent() {
  const [activeSection, setActiveSection] = useState("home");
  useInitBackend();

  // Intersection Observer to track active section
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
      <Navbar activeSection={activeSection} onNavigate={navigateTo} />
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
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
