# Divine Collection

## Current State
The backend uses a fixed Category enum (Sarees, CoordSets, Kurties) and a static initial product list. Product overrides (price, description, image) can be set per product via `setProductOverride`. The admin Products tab supports image upload via blob-storage. There is no way to add/remove categories or products from the admin dashboard, and there is no display order control.

## Requested Changes (Diff)

### Add
- `DynamicCategory` type: id (Text), name (Text), displayOrder (Nat)
- `DynamicProduct` type: id (Text), categoryId (Text), name (Text), description (Text), price (Nat), sizes ([Text]), imageUrl (?Text), displayOrder (Nat), isActive (Bool)
- Backend methods: `addCategory`, `updateCategory`, `deleteCategory`, `getCategories`
- Backend methods: `addProduct`, `updateProduct`, `deleteProduct`, `getDynamicProducts`, `getDynamicProductsByCategory`
- Backend methods: `setCategoryOrder`, `setProductOrder` (reorder within category)
- Admin panel: "Categories" tab -- list categories with drag/reorder, add new category form, delete button
- Admin panel: "Products" tab enhanced -- add new product form (name, category, price, sizes, description, image upload), delete product button, drag/reorder within category
- Customer-facing: product grid and category pages dynamically driven from backend dynamic catalog

### Modify
- Customer-facing product display reads from `getDynamicProducts` / `getCategories` instead of static data
- Stock management uses dynamic product IDs from the new catalog
- Cost price management uses dynamic product IDs
- Sales logging references dynamic product IDs

### Remove
- Static initial product list and fixed `Category` enum from backend (keep for backward compatibility but no longer primary data source)
- Static product data hardcoded in frontend

## Implementation Plan
1. Add `DynamicCategory` and `DynamicProduct` types to backend with CRUD and reorder methods
2. Keep existing sales, stock, analytics, cost price, blob-storage mixin unchanged
3. Seed default categories (Suit Sets, Kurti Sets, Co-ord Sets) on first init if empty
4. Seed default products (6 Suit Sets, 3 Kurti Sets, 1 Co-ord Set) with existing image paths
5. Frontend admin: add Categories tab (add/rename/delete/reorder), extend Products tab (add new product, delete, reorder)
6. Frontend customer-facing: read categories and products from backend dynamic catalog, preserve all existing UI (zoom, quick-view, WhatsApp, size chart, stock strikethrough)
