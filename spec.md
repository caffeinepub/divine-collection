# Divine Collection

## Current State

- E-commerce site for Indian traditional wear (Suit Sets, Kurti Sets, Co-ord Sets, Night Wear)
- Product catalog is fully hardcoded in `useQueries.ts` (CATALOG_PRODUCTS + image maps)
- Admin dashboard at `/admin` has tabs: Sales, Stock, Analytics, Cost Prices
- All product changes (images, prices, descriptions) currently require a code rebuild

## Requested Changes (Diff)

### Add
- `ProductOverride` backend type: `{ productId: Text; price: ?Nat; description: ?Text; imageUrl: ?Text; }`
- Backend functions: `setProductOverride(productId, price, description, imageUrl)` and `getProductOverrides()` 
- Blob-storage for admin to upload new product images
- Admin dashboard "Products" tab: edit price, description, and image for each product
- Frontend merges CATALOG_PRODUCTS with backend overrides at runtime (no rebuild needed)

### Modify
- `useAllProducts()` — now fetches overrides from backend and merges: override price/description/imageUrl take precedence over static defaults
- `getProductImage()` — checks override imageUrl first, falls back to static image map
- `AdminPage` — adds new "Products" tab with editable product cards

### Remove
- Nothing removed

## Implementation Plan

1. Add `ProductOverride` type and stable storage map to `main.mo`
2. Add `setProductOverride` and `getProductOverrides` functions to `main.mo`
3. Update `backend.d.ts` with `ProductOverride` type and two new interface methods
4. Select blob-storage component for image uploads
5. Update `useQueries.ts`: add `useProductOverrides()` hook, update `useAllProducts()` to merge overrides, update `getProductImage()` to use override imageUrl
6. Add "Products" tab to `AdminPage.tsx`:
   - List all 12 products (all 4 categories)
   - Each row/card: current image thumbnail, editable price field, editable description field, image upload button (via blob-storage)
   - "Save" button calls `setProductOverride` on the backend
7. On the customer-facing site, `useAllProducts()` returns products with override data applied transparently
