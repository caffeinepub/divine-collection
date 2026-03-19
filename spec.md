# Divine Collection

## Current State

The site has an admin dashboard at `/admin` with Sales, Stock, Cost Prices, and Analytics tabs. All data (sales records, stock levels, cost prices, visit analytics) is stored in `localStorage` on the user's device. This causes two critical bugs:
1. When a customer places an order on their phone, the sale is saved to the customer's localStorage -- the admin on a different device never sees it.
2. When a sale is recorded, stock is never actually reduced.

## Requested Changes (Diff)

### Add
- Backend APIs for: recording a sale, fetching all sales, getting/setting stock, getting/setting cost prices, recording a visit, fetching analytics
- Stock deduction logic: when an order is placed, for each item (product + size + quantity), reduce stock accordingly
- Backend stores all sales, stock, cost prices, visit data so they are shared across all devices

### Modify
- `useAdminData.ts`: replace all localStorage reads/writes with backend actor calls
- `CartDrawer.tsx`: after recording the sale, also call backend to deduct stock for each ordered item
- `AdminPage.tsx`: load data from backend instead of localStorage
- Analytics tracking: send visit records to backend instead of localStorage

### Remove
- localStorage usage for sales, stock, cost prices, and visit analytics

## Implementation Plan
1. Update Motoko backend to add: SaleRecord type, StockEntry type, CostPrice type, VisitRecord type; stable storage vars for all; public APIs: addSale, getSales, getStock, setStockEntry, initStock, resetStock, getCostPrices, setCostPrice, recordVisit, getAnalytics
2. Update `useAdminData.ts` to export async functions that call the backend actor
3. Update `CartDrawer.tsx` to await addSale and deductStock after successful checkout
4. Update `AdminPage.tsx` to fetch data from backend on mount
5. Update visit tracking to call backend recordVisit
