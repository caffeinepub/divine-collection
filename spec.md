# Divine Collection

## Current State
Fully functional e-commerce site with frontend-driven product catalog (10 products: 6 Suit Sets, 3 Kurti Sets, 1 Co-ord Set), WhatsApp cart checkout, Instagram grid, QR code, size chart popup, and hover/quick-view effects. The admin dashboard and stock tracker have not yet been implemented.

## Requested Changes (Diff)

### Add
- `/admin` route handled in App.tsx routing logic
- `AdminPage.tsx` — password-protected admin dashboard with two tabs:
  - **Sales tab**: table of all orders auto-captured at checkout, with columns: Date, Customer Name, Mobile, Address, Items (product name + size + qty), Total. A "Download CSV" button exports all sales.
  - **Stock tab**: grid of all 10 products x 4 sizes (M, L, XL, XXL) with stock count per cell. Each cell shows current stock with +/- buttons to adjust. An "Initialize Stock" button sets all to 1.
- `hooks/useAdminData.ts` — localStorage-based hooks for sales and stock data
- Login screen with password `Divine@2024`, session stored in sessionStorage

### Modify
- `CartDrawer.tsx` — after successful WhatsApp send, call addSaleRecord() to save order to localStorage before clearing cart
- `App.tsx` — add `/admin` path detection to resolveRoute() and render AdminPage for that route

### Remove
- Nothing

## Implementation Plan
1. Create `src/frontend/src/hooks/useAdminData.ts` with sale/stock data types and localStorage helpers
2. Create `src/frontend/src/pages/AdminPage.tsx` with login screen, sales tab, stock tab
3. Modify `CartDrawer.tsx` to call addSaleRecord on checkout
4. Modify `App.tsx` to add admin route
