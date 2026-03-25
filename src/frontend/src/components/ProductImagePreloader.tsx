/**
 * Hidden component that renders all product images as literal <img> src attributes.
 * This guarantees the Caffeine build scanner detects every image path in compiled JS
 * and preserves those files in the deployment bundle.
 */
export function ProductImagePreloader() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        width: 0,
        height: 0,
        overflow: "hidden",
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      {/* Suit Sets */}
      <img
        src="/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.46-PM-1--1.jpeg"
        alt=""
      />
      <img
        src="/assets/uploads/ChatGPT-Image-Mar-11-2026-05_41_46-PM-1.png"
        alt=""
      />
      <img
        src="/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.47-PM-1--3.jpeg"
        alt=""
      />
      <img
        src="/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.47-PM-4.jpeg"
        alt=""
      />
      <img
        src="/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.46-PM-2--5.jpeg"
        alt=""
      />
      <img
        src="/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.47-PM-3--6.jpeg"
        alt=""
      />
      {/* Kurti Sets */}
      <img
        src="/assets/uploads/ChatGPT-Image-Mar-17-2026-05_21_56-PM-1-1.png"
        alt=""
      />
      <img
        src="/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.45-PM-2--2.jpeg"
        alt=""
      />
      <img
        src="/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.45-PM-3--3.jpeg"
        alt=""
      />
      {/* Co-ord Set */}
      <img
        src="/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.45-PM-1--1.jpeg"
        alt=""
      />
      {/* Our Story / About section image */}
      <img
        src="/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.46-PM-1.jpeg"
        alt=""
      />
      {/* Contact Us section image */}
      <img
        src="/assets/uploads/WhatsApp-Image-2026-03-08-at-7.40.45-PM-1--1.jpeg"
        alt=""
      />
      {/* Size chart */}
      <img
        src="/assets/uploads/WhatsApp-Image-2026-03-09-at-10.34.16-PM-1.jpeg"
        alt=""
      />
      {/* Night Wear */}
      <img
        src="/assets/uploads/WhatsApp-Image-2026-03-22-at-4.47.00-PM-1.jpeg"
        alt=""
      />
      <img
        src="/assets/uploads/WhatsApp-Image-2026-03-22-at-7.50.49-PM-2.jpeg"
        alt=""
      />
      {/* Brand logo -- must appear here to prevent build pruning */}
      <img src="/assets/generated/brand-logo.dim_400x160.png" alt="" />
      {/* Hero banner -- must appear here to prevent build pruning */}
      <img src="/assets/generated/divine-hero-banner.dim_1920x900.jpg" alt="" />
    </div>
  );
}
