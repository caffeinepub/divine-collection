import { Award, CheckCircle2, Gem, Globe, Package } from "lucide-react";
import { motion } from "motion/react";

const whyChooseUs = [
  {
    icon: Gem,
    title: "Authentic Fabrics",
    description:
      "We source only genuine silks, cotton, and handloom fabrics from master weavers.",
  },
  {
    icon: Award,
    title: "Handcrafted Designs",
    description:
      "Each garment is crafted by skilled artisans preserving centuries-old traditions.",
  },
  {
    icon: Globe,
    title: "Pan-India Delivery",
    description:
      "We deliver to all corners of India, bringing heritage fashion to your doorstep.",
  },
  {
    icon: Package,
    title: "Premium Quality",
    description:
      "Every piece undergoes rigorous quality checks to ensure lasting elegance.",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-20 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Brand Story */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-gold text-xs uppercase tracking-[0.35em] font-medium mb-3">
              Our Heritage
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              A Story Woven in{" "}
              <span className="font-display italic gold-text">Tradition</span>
            </h2>
            <div className="section-divider max-w-[80px] mb-8" />

            <div className="space-y-5 text-muted-foreground leading-relaxed">
              <p>
                Born from a deep reverence for India's textile heritage, Divine
                Collection was founded with a singular vision — to bring the
                timeless beauty of authentic Indian craftsmanship to every woman
                who desires to embrace her cultural roots while expressing her
                modern elegance.
              </p>
              <p>
                For over a decade, we have partnered with master artisans from
                Varanasi, Lucknow, Jaipur, and Surat — weavers and embroiderers
                whose families have practiced their craft for generations. Every
                thread, every motif, every weave carries the soul of these
                traditions.
              </p>
              <p>
                Our collection spans the full spectrum of Indian ethnic fashion
                — from opulent Banarasi silk sarees fit for the grandest
                celebrations, to elegant coord sets and kurties for the modern
                Indian woman who carries her heritage with pride in everyday
                life.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-border">
              {[
                { value: "5000+", label: "Happy Customers" },
                { value: "200+", label: "Unique Designs" },
                { value: "15+", label: "Years of Craft" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-display text-2xl font-bold gold-text mb-1">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Decorative + Why Choose Us */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="space-y-8"
          >
            {/* Decorative image collage */}
            <div className="relative h-64 lg:h-80 rounded-sm overflow-hidden">
              <img
                src="/assets/generated/saree-3.dim_600x800.jpg"
                alt="Red bridal saree"
                className="absolute inset-0 w-full h-full object-cover object-top"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-display italic text-white text-xl leading-snug">
                  "Every fabric tells a story of the hands that made it."
                </p>
              </div>
              {/* Floating badge */}
              <div className="absolute top-4 right-4 gold-gradient rounded-full px-4 py-1.5">
                <span className="text-charcoal text-xs font-bold uppercase tracking-wide">
                  Premium Craft
                </span>
              </div>
            </div>

            {/* Why Choose Us */}
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-6">
                Why Choose Us
              </h3>
              <div className="space-y-4">
                {whyChooseUs.map((item, idx) => (
                  <motion.div
                    key={item.title}
                    className="flex gap-4 items-start"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-charcoal" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm mb-1">
                        {item.title}
                      </h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
