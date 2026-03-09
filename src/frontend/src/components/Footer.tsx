import { Heart } from "lucide-react";
import { SiFacebook, SiInstagram, SiX } from "react-icons/si";

interface FooterProps {
  onNavigate: (section: string) => void;
}

const categoryLinks = [
  { label: "All Collections", section: "shop" },
  { label: "Suit Sets", section: "shop" },
  { label: "Kurti Sets", section: "shop" },
  { label: "Co-ord Sets", section: "shop" },
];

const quickLinks = [
  { label: "Home", section: "home" },
  { label: "About Us", section: "about" },
  { label: "Shop", section: "shop" },
  { label: "Contact", section: "contact" },
];

export function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  return (
    <footer className="bg-charcoal text-white/80">
      {/* Decorative top border */}
      <div className="section-divider" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <img
              src="/assets/generated/divine-logo-transparent.dim_400x200.png"
              alt="Divine Collection"
              className="h-14 w-auto object-contain brightness-125"
            />
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Celebrating India's rich textile heritage through authentic
              handcrafted suit sets, co-ord sets, and kurti sets — draped in
              tradition, styled for today.
            </p>
            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-gold/20 hover:text-gold transition-colors flex items-center justify-center"
                aria-label="Facebook"
              >
                <SiFacebook className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-gold/20 hover:text-gold transition-colors flex items-center justify-center"
                aria-label="Instagram"
              >
                <SiInstagram className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-gold/20 hover:text-gold transition-colors flex items-center justify-center"
                aria-label="X (Twitter)"
              >
                <SiX className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5">
              {categoryLinks.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => onNavigate(link.section)}
                    className="text-white/60 hover:text-gold text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links + Contact */}
          <div className="space-y-6">
            <div>
              <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      type="button"
                      onClick={() => onNavigate(link.section)}
                      className="text-white/60 hover:text-gold text-sm transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-3">
                Contact
              </h4>
              <address className="not-italic text-white/60 text-sm space-y-1.5">
                <p>+91 72900 16528</p>
                <p>Greater Noida West</p>
              </address>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs text-center sm:text-left">
            © {currentYear} Divine Collection. All rights reserved.
          </p>
          <p className="text-white/40 text-xs flex items-center gap-1">
            Built with{" "}
            <Heart className="h-3 w-3 text-magenta inline fill-current" /> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
