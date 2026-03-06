import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";

interface HeroSectionProps {
  onShopNow: () => void;
}

export function HeroSection({ onShopNow }: HeroSectionProps) {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-start overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/generated/hero-banner.dim_1200x500.jpg"
          alt="Divine Collection hero"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
        <div className="hero-overlay absolute inset-0" />
      </div>

      {/* Decorative pattern overlay */}
      <div
        className="absolute inset-0 z-[1] opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, oklch(0.74 0.12 76 / 0.4) 0%, transparent 50%), 
                           radial-gradient(circle at 80% 80%, oklch(0.55 0.22 350 / 0.3) 0%, transparent 50%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <motion.div
          className="max-w-2xl"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.18 } },
          }}
        >
          {/* Eyebrow */}
          <motion.p
            className="text-gold-light text-sm uppercase tracking-[0.35em] font-medium mb-4 ornament"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
          >
            Est. 2010 · Authentic Indian Craftsmanship
          </motion.p>

          {/* Main heading */}
          <motion.h1
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
            }}
          >
            Divine{" "}
            <span className="gold-text font-display italic">Collection</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="font-serif-alt text-xl sm:text-2xl text-white/85 mb-8 leading-relaxed italic"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
          >
            Embrace the Elegance of Indian Tradition
          </motion.p>

          {/* Description */}
          <motion.p
            className="text-white/70 text-base mb-10 max-w-md leading-relaxed"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
          >
            Discover our curated collection of handcrafted sarees, coord sets,
            and kurties — each piece a testament to India's timeless textile
            heritage.
          </motion.p>

          {/* CTA */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
          >
            <Button
              data-ocid="hero.primary_button"
              onClick={onShopNow}
              size="lg"
              className="gold-gradient text-charcoal font-semibold tracking-wide px-8 py-6 text-base rounded-none hover:opacity-90 transition-opacity shadow-lg"
            >
              Shop Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                document
                  .getElementById("about")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="border-white/50 text-white hover:bg-white/10 hover:text-white font-medium tracking-wide px-8 py-6 text-base rounded-none backdrop-blur-sm"
            >
              Our Story
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/60 flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <span className="text-xs uppercase tracking-[0.2em]">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
