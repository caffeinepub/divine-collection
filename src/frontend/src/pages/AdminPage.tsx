import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FolderPlus,
  Globe,
  ImageIcon,
  IndianRupee,
  Layers,
  Loader2,
  LogOut,
  Minus,
  PackagePlus,
  Plus,
  RefreshCw,
  ShoppingBag,
  Tag,
  Trash2,
  TrendingUp,
  Upload,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  SIZES,
  useAnalytics,
  useCostPrices,
  useInitStock,
  useResetAllStock,
  useSales,
  useSetCostPrice,
  useSetProductOverride,
  useSetStockEntry,
  useStock,
} from "../hooks/useAdminData";
import type { StockEntry } from "../hooks/useAdminData";
import {
  CATALOG_PRODUCTS,
  getProductImage,
  useAddDynamicCategory,
  useAddDynamicProduct,
  useDeleteDynamicCategory,
  useDeleteDynamicProduct,
  useDynamicCategories,
  useDynamicProducts,
  useImageOverrides,
  useProductOverrides,
  useSetCategoryOrder,
  useSetDynamicProductOrder,
  useUpdateDynamicCategory,
  useUpdateDynamicProduct,
} from "../hooks/useQueries";
import { useStorageUpload } from "../hooks/useStorageUpload";

const ADMIN_PASSWORD = "Divine@2024";
const SESSION_KEY = "dc_admin_auth";

const PAGE_NAMES = ["Home", "Suit Sets", "Kurti Sets", "Co-ord Sets"] as const;
type PageName = (typeof PAGE_NAMES)[number];

function isAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      onLogin();
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gold-gradient mb-4">
            <ShoppingBag className="h-8 w-8 text-charcoal" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            Divine Collection
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Admin Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="admin-password"
              className="text-sm font-semibold text-foreground"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="admin-password"
                data-ocid="admin.login.input"
                type={showPwd ? "text" : "password"}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                className="pr-10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {error && (
              <p
                data-ocid="admin.login.error_state"
                className="text-sm text-destructive"
              >
                {error}
              </p>
            )}
          </div>
          <Button
            type="submit"
            data-ocid="admin.login.submit_button"
            className="w-full gold-gradient text-charcoal font-bold"
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}

// ── StockCell ──────────────────────────────────────────────────────────────────────
function StockCell({
  entry,
  onUpdate,
}: {
  entry: StockEntry;
  onUpdate: (productId: string, size: string, delta: number) => void;
}) {
  const qty = entry.quantity;
  const color =
    qty === 0
      ? "text-red-400"
      : qty === 1
        ? "text-yellow-400"
        : "text-green-400";
  return (
    <div className="flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onUpdate(entry.productId, entry.size, -1)}
        disabled={qty === 0}
        className="w-6 h-6 flex items-center justify-center rounded border border-border hover:border-primary transition-colors disabled:opacity-30 text-muted-foreground hover:text-foreground"
        aria-label="Decrease stock"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className={`w-8 text-center font-bold text-sm ${color}`}>
        {qty}
      </span>
      <button
        type="button"
        onClick={() => onUpdate(entry.productId, entry.size, 1)}
        className="w-6 h-6 flex items-center justify-center rounded border border-border hover:border-primary transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Increase stock"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}

// ── Analytics Tab ───────────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const { visits, isLoading } = useAnalytics();
  const totalVisits = visits.length;
  const pageBreakdown: Record<string, number> = {};
  for (const page of PAGE_NAMES) pageBreakdown[page] = 0;
  for (const v of visits) {
    if (v.page in pageBreakdown)
      pageBreakdown[v.page] = (pageBreakdown[v.page] ?? 0) + 1;
  }
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const dailyMap: Record<string, Record<PageName, number>> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyMap[key] = {
      Home: 0,
      "Suit Sets": 0,
      "Kurti Sets": 0,
      "Co-ord Sets": 0,
    };
  }
  for (const v of visits) {
    const key = v.timestamp.slice(0, 10);
    if (key in dailyMap && (PAGE_NAMES as readonly string[]).includes(v.page)) {
      dailyMap[key][v.page as PageName] += 1;
    }
  }
  const dailyRows = Object.entries(dailyMap)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, counts]) => ({
      date,
      ...counts,
      total:
        counts.Home +
        counts["Suit Sets"] +
        counts["Kurti Sets"] +
        counts["Co-ord Sets"],
    }))
    .filter((row) => row.total > 0);

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">
          Site Analytics
        </h2>
        <p className="text-muted-foreground text-sm">
          Track total visits and page-level traffic across your store
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Site Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <span className="font-display text-3xl font-bold text-foreground">
                {totalVisits.toLocaleString("en-IN")}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pages Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              <span className="font-display text-3xl font-bold text-foreground">
                4
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
          Visits by Page
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {PAGE_NAMES.map((page) => (
            <Card key={page}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {page}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="font-display text-2xl font-bold text-foreground">
                    {(pageBreakdown[page] ?? 0).toLocaleString("en-IN")}
                  </span>
                </div>
                {totalVisits > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(
                      ((pageBreakdown[page] ?? 0) / totalVisits) * 100,
                    )}
                    % of total
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
          Daily Breakdown (Last 30 Days)
        </h3>
        {dailyRows.length === 0 ? (
          <div
            data-ocid="admin.analytics.empty_state"
            className="border border-border rounded-sm p-12 text-center"
          >
            <BarChart2 className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="text-foreground font-semibold mb-2">
              No visit data yet
            </p>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Visit data will appear here as customers browse the store.
            </p>
          </div>
        ) : (
          <div
            data-ocid="admin.analytics.table"
            className="border border-border rounded-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Home</TableHead>
                    <TableHead className="text-center">Suit Sets</TableHead>
                    <TableHead className="text-center">Kurti Sets</TableHead>
                    <TableHead className="text-center">Co-ord Sets</TableHead>
                    <TableHead className="text-center font-bold">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyRows.map((row, idx) => (
                    <TableRow
                      key={row.date}
                      data-ocid={`admin.analytics.row.${idx + 1}`}
                    >
                      <TableCell className="text-sm font-medium whitespace-nowrap">
                        {new Date(row.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          timeZone: "UTC",
                        })}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {row.Home > 0 ? (
                          <span className="font-semibold text-foreground">
                            {row.Home}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {row["Suit Sets"] > 0 ? (
                          <span className="font-semibold text-foreground">
                            {row["Suit Sets"]}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {row["Kurti Sets"] > 0 ? (
                          <span className="font-semibold text-foreground">
                            {row["Kurti Sets"]}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {row["Co-ord Sets"] > 0 ? (
                          <span className="font-semibold text-foreground">
                            {row["Co-ord Sets"]}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-bold text-primary">
                          {row.total}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Categories Tab ───────────────────────────────────────────────────────────────────
function CategoriesTab() {
  const { data: categories, isLoading, refetch } = useDynamicCategories();
  const addCategory = useAddDynamicCategory();
  const updateCategory = useUpdateDynamicCategory();
  const deleteCategory = useDeleteDynamicCategory();
  const setCategoryOrder = useSetCategoryOrder();

  const [newCatName, setNewCatName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const cats = categories ?? [];

  const handleAdd = async () => {
    const name = newCatName.trim();
    if (!name) return;
    try {
      await addCategory.mutateAsync(name);
      setNewCatName("");
      toast.success(`Category "${name}" added`);
    } catch (e) {
      toast.error(
        `Failed to add category: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
    }
  };

  const handleRename = async (id: string) => {
    const name = editingName.trim();
    if (!name) return;
    try {
      await updateCategory.mutateAsync({ id, name });
      setEditingId(null);
      toast.success("Category renamed");
    } catch (e) {
      toast.error(
        `Failed to rename: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id);
      setDeletingId(null);
      toast.success("Category deleted");
    } catch (e) {
      toast.error(
        `Failed to delete: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
    }
  };

  const handleMoveUp = async (idx: number) => {
    if (idx === 0) return;
    const cat = cats[idx];
    const prev = cats[idx - 1];
    await Promise.all([
      setCategoryOrder.mutateAsync({ id: cat.id, newOrder: prev.displayOrder }),
      setCategoryOrder.mutateAsync({ id: prev.id, newOrder: cat.displayOrder }),
    ]);
    refetch();
  };

  const handleMoveDown = async (idx: number) => {
    if (idx >= cats.length - 1) return;
    const cat = cats[idx];
    const next = cats[idx + 1];
    await Promise.all([
      setCategoryOrder.mutateAsync({ id: cat.id, newOrder: next.displayOrder }),
      setCategoryOrder.mutateAsync({ id: next.id, newOrder: cat.displayOrder }),
    ]);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">
          Categories
        </h2>
        <p className="text-muted-foreground text-sm">
          Add, rename, delete, and reorder your product categories
        </p>
      </div>

      {/* Add new category */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
            <FolderPlus className="h-4 w-4 text-primary" /> Add New Category
          </h3>
          <div className="flex gap-2">
            <Input
              data-ocid="admin.categories.input"
              placeholder="Category name (e.g. Night Wear)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1"
            />
            <Button
              data-ocid="admin.categories.add_button"
              onClick={handleAdd}
              disabled={addCategory.isPending || !newCatName.trim()}
              className="gold-gradient text-charcoal font-bold gap-2"
            >
              {addCategory.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories list */}
      {isLoading ? (
        <div
          data-ocid="admin.categories.loading_state"
          className="flex items-center justify-center py-16"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : cats.length === 0 ? (
        <div
          data-ocid="admin.categories.empty_state"
          className="border border-border rounded-sm p-12 text-center"
        >
          <Layers className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-40" />
          <p className="text-foreground font-semibold mb-2">
            No categories yet
          </p>
          <p className="text-muted-foreground text-sm">
            Add your first category above. After adding, go to the Products tab
            to add items.
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Category Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cats.map((cat, idx) => (
                <TableRow
                  key={cat.id}
                  data-ocid={`admin.categories.row.${idx + 1}`}
                >
                  <TableCell className="text-center">
                    <span className="text-xs font-bold text-muted-foreground">
                      {idx + 1}
                    </span>
                  </TableCell>
                  <TableCell>
                    {editingId === cat.id ? (
                      <div className="flex gap-2 items-center">
                        <Input
                          data-ocid="admin.categories.edit.input"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRename(cat.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => handleRename(cat.id)}
                          disabled={updateCategory.isPending}
                          className="gold-gradient text-charcoal h-8 text-xs"
                        >
                          {updateCategory.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Save"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                          className="h-8 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <span className="font-medium text-foreground">
                        {cat.name}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {/* Reorder */}
                      <button
                        type="button"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className="w-7 h-7 flex items-center justify-center rounded border border-border hover:border-primary disabled:opacity-30 transition-colors"
                        title="Move Up"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx >= cats.length - 1}
                        className="w-7 h-7 flex items-center justify-center rounded border border-border hover:border-primary disabled:opacity-30 transition-colors"
                        title="Move Down"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      {/* Edit */}
                      <button
                        type="button"
                        data-ocid="admin.categories.edit_button"
                        onClick={() => {
                          setEditingId(cat.id);
                          setEditingName(cat.name);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded border border-border hover:border-primary hover:text-primary transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      {/* Delete */}
                      {deletingId === cat.id ? (
                        <div className="flex items-center gap-1 ml-1">
                          <span className="text-xs text-destructive font-medium">
                            Confirm?
                          </span>
                          <Button
                            size="sm"
                            variant="destructive"
                            data-ocid="admin.categories.confirm_button"
                            onClick={() => handleDelete(cat.id)}
                            disabled={deleteCategory.isPending}
                            className="h-7 text-xs px-2"
                          >
                            {deleteCategory.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Delete"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-ocid="admin.categories.cancel_button"
                            onClick={() => setDeletingId(null)}
                            className="h-7 text-xs px-2"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          data-ocid="admin.categories.delete_button"
                          onClick={() => setDeletingId(cat.id)}
                          className="w-7 h-7 flex items-center justify-center rounded border border-border hover:border-destructive hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {cats.length > 0 && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
          Deleting a category will not remove its products, but they will no
          longer be visible on the site.
        </p>
      )}
    </div>
  );
}

// ── Enhanced Products Tab ──────────────────────────────────────────────────────────────
const ALL_SIZES = ["M", "L", "XL", "XXL"];

function ProductsTab() {
  // Dynamic catalog
  const { data: dynamicCategories } = useDynamicCategories();
  const { data: dynamicProducts, refetch: refetchProducts } =
    useDynamicProducts();
  const addProduct = useAddDynamicProduct();
  const updateProduct = useUpdateDynamicProduct();
  const deleteProduct = useDeleteDynamicProduct();
  const setProductOrder = useSetDynamicProductOrder();

  // Static overrides (legacy)
  const { data: overrides } = useProductOverrides();
  const setOverride = useSetProductOverride();
  const { uploadImage, isUploading, uploadProgress } = useStorageUpload();
  const imageOverrides = useImageOverrides();

  // ── New product form state ──
  const [newForm, setNewForm] = useState({
    categoryId: "",
    name: "",
    description: "",
    price: "",
    sizes: ["M", "L", "XL", "XXL"] as string[],
    imageUrl: null as string | null,
  });
  const [newImageUploading, setNewImageUploading] = useState(false);
  const newFileRef = useRef<HTMLInputElement | null>(null);

  // ── Edit state for dynamic products ──
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    price: string;
    sizes: string[];
    imageUrl: string | null;
    isActive: boolean;
  }>({
    name: "",
    description: "",
    price: "",
    sizes: [],
    imageUrl: null,
    isActive: true,
  });
  const [editImageUploading, setEditImageUploading] = useState(false);
  const editFileRef = useRef<HTMLInputElement | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null,
  );

  // ── Legacy static product edits ──
  const [legacyEdits, setLegacyEdits] = useState<
    Record<string, { price: string; description: string }>
  >({});
  const [legacyUploadingId, setLegacyUploadingId] = useState<string | null>(
    null,
  );
  const [legacySavedId, setLegacySavedId] = useState<string | null>(null);
  const legacyFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Sync legacy edits
  useEffect(() => {
    if (!overrides) return;
    const overrideMap: Record<
      string,
      { price?: bigint; description?: string }
    > = {};
    for (const o of overrides)
      overrideMap[o.productId] = {
        price: o.price ?? undefined,
        description: o.description ?? undefined,
      };
    const init: Record<string, { price: string; description: string }> = {};
    for (const p of CATALOG_PRODUCTS) {
      const key = p.id.toString();
      const ov = overrideMap[key];
      init[key] = {
        price:
          ov?.price !== undefined ? ov.price.toString() : p.price.toString(),
        description: ov?.description ?? p.description,
      };
    }
    setLegacyEdits(init);
  }, [overrides]);

  const cats = dynamicCategories ?? [];
  const dynProds = dynamicProducts ?? [];

  const handleAddProduct = async () => {
    if (!newForm.categoryId || !newForm.name.trim() || !newForm.price) {
      toast.error("Please fill in category, name, and price");
      return;
    }
    const price = Number.parseFloat(newForm.price);
    if (Number.isNaN(price) || price < 0) {
      toast.error("Invalid price");
      return;
    }
    if (newForm.sizes.length === 0) {
      toast.error("Select at least one size");
      return;
    }
    try {
      await addProduct.mutateAsync({
        categoryId: newForm.categoryId,
        name: newForm.name.trim(),
        description: newForm.description.trim(),
        price: BigInt(Math.round(price)),
        sizes: newForm.sizes,
        imageUrl: newForm.imageUrl,
      });
      setNewForm({
        categoryId: newForm.categoryId,
        name: "",
        description: "",
        price: "",
        sizes: ["M", "L", "XL", "XXL"],
        imageUrl: null,
      });
      toast.success("Product added successfully");
    } catch (e) {
      toast.error(
        `Failed to add product: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
    }
  };

  const startEditProduct = (id: string) => {
    const p = dynProds.find((x) => x.id === id);
    if (!p) return;
    setEditingProductId(id);
    setEditForm({
      name: p.name,
      description: p.description,
      price: p.price.toString(),
      sizes: [...p.sizes],
      imageUrl: p.imageUrl ?? null,
      isActive: p.isActive,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingProductId) return;
    const price = Number.parseFloat(editForm.price);
    if (Number.isNaN(price) || price < 0) {
      toast.error("Invalid price");
      return;
    }
    if (editForm.sizes.length === 0) {
      toast.error("Select at least one size");
      return;
    }
    try {
      await updateProduct.mutateAsync({
        id: editingProductId,
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        price: BigInt(Math.round(price)),
        sizes: editForm.sizes,
        imageUrl: editForm.imageUrl,
        isActive: editForm.isActive,
      });
      setEditingProductId(null);
      toast.success("Product updated");
    } catch (e) {
      toast.error(
        `Failed to update: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id);
      setDeletingProductId(null);
      toast.success("Product deleted");
    } catch (e) {
      toast.error(
        `Failed to delete: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
    }
  };

  const handleMoveProductUp = async (
    _catId: string,
    idx: number,
    catProds: typeof dynProds,
  ) => {
    if (idx === 0) return;
    const prod = catProds[idx];
    const prev = catProds[idx - 1];
    await Promise.all([
      setProductOrder.mutateAsync({ id: prod.id, newOrder: prev.displayOrder }),
      setProductOrder.mutateAsync({ id: prev.id, newOrder: prod.displayOrder }),
    ]);
    refetchProducts();
  };

  const handleMoveProductDown = async (
    _catId: string,
    idx: number,
    catProds: typeof dynProds,
  ) => {
    if (idx >= catProds.length - 1) return;
    const prod = catProds[idx];
    const next = catProds[idx + 1];
    await Promise.all([
      setProductOrder.mutateAsync({ id: prod.id, newOrder: next.displayOrder }),
      setProductOrder.mutateAsync({ id: next.id, newOrder: prod.displayOrder }),
    ]);
    refetchProducts();
  };

  const toggleNewSize = (size: string) => {
    setNewForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const toggleEditSize = (size: string) => {
    setEditForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  return (
    <div className="space-y-8">
      {/* ── Add New Product ── */}
      <div>
        <h2 className="font-display text-xl font-bold text-foreground mb-1">
          Dynamic Products
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          Add, edit, and reorder products by category. Changes go live
          instantly.
        </p>

        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <PackagePlus className="h-4 w-4 text-primary" /> Add New Product
            </h3>

            {/* Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Category *</Label>
                <Select
                  value={newForm.categoryId}
                  onValueChange={(v) =>
                    setNewForm((p) => ({ ...p, categoryId: v }))
                  }
                >
                  <SelectTrigger
                    data-ocid="admin.products.add.select"
                    className="h-9"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {cats.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {cats.length === 0 && (
                  <p className="text-xs text-yellow-600">
                    Add a category first in the Categories tab
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Product Name *</Label>
                <Input
                  data-ocid="admin.products.add.input"
                  placeholder="e.g. Suit 7"
                  value={newForm.name}
                  onChange={(e) =>
                    setNewForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="h-9"
                />
              </div>
            </div>

            {/* Description + Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Textarea
                  placeholder="Product description"
                  value={newForm.description}
                  onChange={(e) =>
                    setNewForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className="text-sm min-h-[72px] resize-none"
                  rows={2}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Price (₹) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 895"
                  value={newForm.price}
                  onChange={(e) =>
                    setNewForm((p) => ({ ...p, price: e.target.value }))
                  }
                  className="h-9"
                />
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-1.5">
              <Label className="text-xs">Sizes *</Label>
              <div className="flex gap-3 flex-wrap">
                {ALL_SIZES.map((size) => (
                  <div key={size} className="flex items-center gap-1.5">
                    <Checkbox
                      id={`new-size-${size}`}
                      checked={newForm.sizes.includes(size)}
                      onCheckedChange={() => toggleNewSize(size)}
                    />
                    <Label
                      htmlFor={`new-size-${size}`}
                      className="text-sm cursor-pointer"
                    >
                      {size}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-1.5">
              <Label className="text-xs">Product Image</Label>
              <div className="flex items-center gap-3">
                {newForm.imageUrl && (
                  <img
                    src={newForm.imageUrl}
                    alt=""
                    className="w-16 h-16 object-cover rounded-sm border border-border"
                  />
                )}
                <input
                  ref={newFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setNewImageUploading(true);
                    try {
                      const url = await uploadImage(file);
                      setNewForm((p) => ({ ...p, imageUrl: url }));
                      toast.success("Image uploaded");
                    } catch (err) {
                      toast.error(
                        `Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`,
                      );
                    } finally {
                      setNewImageUploading(false);
                      e.target.value = "";
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-ocid="admin.products.add.upload_button"
                  disabled={newImageUploading || isUploading}
                  onClick={() => newFileRef.current?.click()}
                >
                  {newImageUploading ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Upload className="h-3 w-3 mr-1" />
                  )}
                  {newForm.imageUrl ? "Change Image" : "Upload Image"}
                </Button>
                {newImageUploading && (
                  <span className="text-xs text-muted-foreground">
                    {uploadProgress}%
                  </span>
                )}
              </div>
            </div>

            <Button
              data-ocid="admin.products.add.submit_button"
              onClick={handleAddProduct}
              disabled={
                addProduct.isPending ||
                !newForm.categoryId ||
                !newForm.name.trim() ||
                !newForm.price
              }
              className="gold-gradient text-charcoal font-bold gap-2"
            >
              {addProduct.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add Product
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Dynamic Products by Category ── */}
      {cats.length > 0 && (
        <div className="space-y-6">
          <h3 className="font-semibold text-base text-foreground">
            Manage Products by Category
          </h3>
          {cats.map((cat) => {
            const catProds = dynProds.filter((p) => p.categoryId === cat.id);
            return (
              <div key={cat.id}>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    {cat.name}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {catProds.length} items
                  </Badge>
                </div>
                {catProds.length === 0 ? (
                  <div
                    data-ocid={`admin.products.${cat.id}.empty_state`}
                    className="border border-dashed border-border rounded-sm p-6 text-center text-muted-foreground text-sm"
                  >
                    No products in this category. Add one above.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {catProds.map((prod, idx) => (
                      <Card
                        key={prod.id}
                        data-ocid={`admin.products.item.${idx + 1}`}
                        className={!prod.isActive ? "opacity-50" : ""}
                      >
                        <CardContent className="p-3">
                          {editingProductId === prod.id ? (
                            // ── Inline edit form ──
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs">Name</Label>
                                  <Input
                                    value={editForm.name}
                                    onChange={(e) =>
                                      setEditForm((p) => ({
                                        ...p,
                                        name: e.target.value,
                                      }))
                                    }
                                    className="h-8 text-sm"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Price (₹)</Label>
                                  <Input
                                    type="number"
                                    value={editForm.price}
                                    onChange={(e) =>
                                      setEditForm((p) => ({
                                        ...p,
                                        price: e.target.value,
                                      }))
                                    }
                                    className="h-8 text-sm"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Description</Label>
                                <Textarea
                                  value={editForm.description}
                                  onChange={(e) =>
                                    setEditForm((p) => ({
                                      ...p,
                                      description: e.target.value,
                                    }))
                                  }
                                  className="text-sm min-h-[60px] resize-none"
                                  rows={2}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs">Sizes</Label>
                                <div className="flex gap-3 flex-wrap">
                                  {ALL_SIZES.map((size) => (
                                    <div
                                      key={size}
                                      className="flex items-center gap-1.5"
                                    >
                                      <Checkbox
                                        id={`edit-size-${prod.id}-${size}`}
                                        checked={editForm.sizes.includes(size)}
                                        onCheckedChange={() =>
                                          toggleEditSize(size)
                                        }
                                      />
                                      <Label
                                        htmlFor={`edit-size-${prod.id}-${size}`}
                                        className="text-sm cursor-pointer"
                                      >
                                        {size}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {/* Image */}
                              <div className="flex items-center gap-3">
                                {editForm.imageUrl && (
                                  <img
                                    src={editForm.imageUrl}
                                    alt=""
                                    className="w-14 h-14 object-cover rounded-sm border border-border"
                                  />
                                )}
                                <input
                                  ref={editFileRef}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setEditImageUploading(true);
                                    try {
                                      const url = await uploadImage(file);
                                      setEditForm((p) => ({
                                        ...p,
                                        imageUrl: url,
                                      }));
                                      toast.success("Image uploaded");
                                    } catch (err) {
                                      toast.error(
                                        `Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`,
                                      );
                                    } finally {
                                      setEditImageUploading(false);
                                      e.target.value = "";
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  data-ocid="admin.products.edit.upload_button"
                                  disabled={editImageUploading || isUploading}
                                  onClick={() => editFileRef.current?.click()}
                                >
                                  {editImageUploading ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  ) : (
                                    <Upload className="h-3 w-3 mr-1" />
                                  )}
                                  {editForm.imageUrl
                                    ? "Change Image"
                                    : "Upload Image"}
                                </Button>
                                {editForm.imageUrl && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() =>
                                      setEditForm((p) => ({
                                        ...p,
                                        imageUrl: null,
                                      }))
                                    }
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Remove
                                  </Button>
                                )}
                              </div>
                              {/* Active toggle */}
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`edit-active-${prod.id}`}
                                  checked={editForm.isActive}
                                  onCheckedChange={(v) =>
                                    setEditForm((p) => ({
                                      ...p,
                                      isActive: !!v,
                                    }))
                                  }
                                />
                                <Label
                                  htmlFor={`edit-active-${prod.id}`}
                                  className="text-sm cursor-pointer"
                                >
                                  Active (visible on site)
                                </Label>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={handleSaveEdit}
                                  disabled={updateProduct.isPending}
                                  data-ocid="admin.products.edit.save_button"
                                  className="gold-gradient text-charcoal font-bold"
                                >
                                  {updateProduct.isPending ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    "Save"
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  data-ocid="admin.products.edit.cancel_button"
                                  onClick={() => setEditingProductId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // ── Product row ──
                            <div className="flex gap-3 items-center">
                              {prod.imageUrl ? (
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.name}
                                  className="w-14 h-14 object-cover rounded-sm border border-border flex-shrink-0"
                                />
                              ) : (
                                <div className="w-14 h-14 bg-secondary rounded-sm border border-border flex items-center justify-center flex-shrink-0">
                                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm text-foreground">
                                    {prod.name}
                                  </p>
                                  {!prod.isActive && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs text-muted-foreground"
                                    >
                                      Hidden
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-primary font-semibold">
                                  ₹{Number(prod.price).toLocaleString("en-IN")}
                                  /-
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {prod.sizes.join(", ")}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleMoveProductUp(cat.id, idx, catProds)
                                  }
                                  disabled={idx === 0}
                                  className="w-7 h-7 flex items-center justify-center rounded border border-border hover:border-primary disabled:opacity-30 transition-colors"
                                >
                                  <ChevronUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleMoveProductDown(cat.id, idx, catProds)
                                  }
                                  disabled={idx >= catProds.length - 1}
                                  className="w-7 h-7 flex items-center justify-center rounded border border-border hover:border-primary disabled:opacity-30 transition-colors"
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  data-ocid="admin.products.edit_button"
                                  onClick={() => startEditProduct(prod.id)}
                                  className="w-7 h-7 flex items-center justify-center rounded border border-border hover:border-primary hover:text-primary transition-colors"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                {deletingProductId === prod.id ? (
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      data-ocid="admin.products.confirm_button"
                                      onClick={() =>
                                        handleDeleteProduct(prod.id)
                                      }
                                      disabled={deleteProduct.isPending}
                                      className="h-7 text-xs px-2"
                                    >
                                      {deleteProduct.isPending ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        "Delete"
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      data-ocid="admin.products.cancel_button"
                                      onClick={() => setDeletingProductId(null)}
                                      className="h-7 text-xs px-2"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    data-ocid="admin.products.delete_button"
                                    onClick={() =>
                                      setDeletingProductId(prod.id)
                                    }
                                    className="w-7 h-7 flex items-center justify-center rounded border border-border hover:border-destructive hover:text-destructive transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Legacy static product overrides ── */}
      <div>
        <h3 className="font-semibold text-base text-foreground mb-1">
          Static Product Overrides
        </h3>
        <p className="text-muted-foreground text-sm mb-4">
          Update image, price, and description for the original built-in
          products
        </p>
        <div className="space-y-4">
          {CATALOG_PRODUCTS.map((product) => {
            const productId = product.id.toString();
            const currentImage =
              imageOverrides[productId] ?? getProductImage(product, []);
            const edit = legacyEdits[productId] ?? {
              price: product.price.toString(),
              description: product.description,
            };
            const categoryLabel =
              product.category === "Kurties"
                ? "Suit Set"
                : product.category === "Sarees"
                  ? "Kurti Set"
                  : "Co-ord Set";
            return (
              <Card key={productId} data-ocid={`products.item.${productId}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4 items-start">
                    <img
                      src={currentImage}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-sm border border-border flex-shrink-0"
                    />
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-semibold text-foreground">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {categoryLabel}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {legacyUploadingId === productId ? (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Uploading... {uploadProgress}%
                            </span>
                          ) : (
                            <>
                              <input
                                ref={(el) => {
                                  legacyFileRefs.current[productId] = el;
                                }}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                data-ocid="products.upload_button"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setLegacyUploadingId(productId);
                                  try {
                                    const url = await uploadImage(file);
                                    await setOverride.mutateAsync({
                                      productId,
                                      imageUrl: url,
                                    });
                                    toast.success("Image updated successfully");
                                  } catch (err) {
                                    toast.error(
                                      `Image upload failed: ${err instanceof Error ? err.message : "Unknown error"}`,
                                    );
                                  } finally {
                                    setLegacyUploadingId(null);
                                    e.target.value = "";
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isUploading}
                                onClick={() =>
                                  legacyFileRefs.current[productId]?.click()
                                }
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                Change Image
                              </Button>
                              {imageOverrides[productId] && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  data-ocid="products.delete_button"
                                  onClick={async () => {
                                    try {
                                      await setOverride.mutateAsync({
                                        productId,
                                        imageUrl: "",
                                      });
                                      toast.success("Image removed");
                                    } catch (_err) {
                                      toast.error("Failed to remove image");
                                    }
                                  }}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Remove
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <label
                          htmlFor={`price-${productId}`}
                          className="text-sm text-muted-foreground w-24 flex-shrink-0"
                        >
                          Price (₹)
                        </label>
                        <Input
                          id={`price-${productId}`}
                          type="number"
                          value={edit.price}
                          onChange={(e) =>
                            setLegacyEdits((prev) => ({
                              ...prev,
                              [productId]: { ...edit, price: e.target.value },
                            }))
                          }
                          className="w-32 h-8 text-sm"
                          data-ocid="products.price.input"
                        />
                      </div>
                      <div className="flex gap-3 items-start">
                        <label
                          htmlFor={`desc-${productId}`}
                          className="text-sm text-muted-foreground w-24 flex-shrink-0 pt-1"
                        >
                          Description
                        </label>
                        <Textarea
                          id={`desc-${productId}`}
                          value={edit.description}
                          onChange={(e) =>
                            setLegacyEdits((prev) => ({
                              ...prev,
                              [productId]: {
                                ...edit,
                                description: e.target.value,
                              },
                            }))
                          }
                          className="text-sm min-h-[60px] resize-none"
                          rows={2}
                          data-ocid="products.description.textarea"
                        />
                      </div>
                      <div className="flex items-center gap-3 justify-end">
                        {legacySavedId === productId && (
                          <span className="text-xs text-green-500 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Saved
                          </span>
                        )}
                        <Button
                          size="sm"
                          className="gold-gradient text-charcoal font-semibold"
                          data-ocid="products.save.button"
                          disabled={setOverride.isPending}
                          onClick={async () => {
                            const price = Number.parseFloat(edit.price);
                            if (!Number.isNaN(price)) {
                              await setOverride.mutateAsync({
                                productId,
                                price: Math.round(price),
                                description: edit.description,
                              });
                              setLegacySavedId(productId);
                              setTimeout(() => setLegacySavedId(null), 2000);
                            }
                          }}
                        >
                          {setOverride.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { sales, isLoading: salesLoading } = useSales();
  const { stock, isLoading: stockLoading, refetch: refetchStock } = useStock();
  const { costPrices, isLoading: costLoading } = useCostPrices();

  const setStockEntry = useSetStockEntry();
  const resetAllStock = useResetAllStock();
  const initStock = useInitStock();
  const setCostPrice = useSetCostPrice();

  const [localStock, setLocalStock] = useState<
    Record<string, Record<string, number>>
  >({});
  useEffect(() => {
    const map: Record<string, Record<string, number>> = {};
    for (const e of stock) {
      if (!map[e.productId]) map[e.productId] = {};
      map[e.productId][e.size] = e.quantity;
    }
    setLocalStock(map);
  }, [stock]);

  const [draftCostPrices, setDraftCostPrices] = useState<
    Record<string, string>
  >({});
  const [costSaved, setCostSaved] = useState(false);
  useEffect(() => {
    const draft: Record<string, string> = {};
    for (const p of CATALOG_PRODUCTS) {
      const id = p.id.toString();
      draft[id] = costPrices[id] !== undefined ? String(costPrices[id]) : "";
    }
    setDraftCostPrices(draft);
  }, [costPrices]);

  const nameToCostPrice: Record<string, number> = {};
  for (const p of CATALOG_PRODUCTS) {
    const id = p.id.toString();
    const cp = costPrices[id];
    if (cp !== undefined) nameToCostPrice[p.name] = cp;
  }

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalOrders = sales.length;
  const totalCost = sales.reduce((sum, s) => {
    return (
      sum +
      s.items.reduce((iSum, item) => {
        const cp = nameToCostPrice[item.name];
        return cp !== undefined ? iSum + cp * item.quantity : iSum;
      }, 0)
    );
  }, 0);
  const totalProfit = totalRevenue - totalCost;
  const hasCostData = Object.keys(costPrices).length > 0;

  const handleStockUpdate = (
    productId: string,
    size: string,
    delta: number,
  ) => {
    setLocalStock((prev) => {
      const prevQty = prev[productId]?.[size] ?? 0;
      const newQty = Math.max(0, prevQty + delta);
      return {
        ...prev,
        [productId]: { ...(prev[productId] ?? {}), [size]: newQty },
      };
    });
    const entry = stock.find(
      (e) => e.productId === productId && e.size === size,
    );
    if (entry)
      setStockEntry.mutate({
        ...entry,
        quantity: Math.max(0, entry.quantity + delta),
      });
  };

  const handleDownloadCSV = () => {
    if (sales.length === 0) return;
    const headers = [
      "Date",
      "Customer Name",
      "Mobile",
      "Address",
      "Items",
      "Total (₹)",
      "Cost Price Total (₹)",
      "Profit (₹)",
    ];
    const rows = sales.map((s) => {
      const rowCost = s.items.reduce((iSum, item) => {
        const cp = nameToCostPrice[item.name];
        return cp !== undefined ? iSum + cp * item.quantity : iSum;
      }, 0);
      const allHaveCost = s.items.every(
        (item) => nameToCostPrice[item.name] !== undefined,
      );
      const profit = s.total - rowCost;
      return [
        new Date(s.date).toLocaleString("en-IN"),
        s.customerName,
        s.mobile,
        s.address,
        s.items.map((i) => `${i.name} (${i.size}) x${i.quantity}`).join(" | "),
        s.total.toString(),
        allHaveCost ? rowCost.toString() : "",
        allHaveCost ? profit.toString() : "",
      ];
    });
    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `divine-collection-sales-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stockMap: Record<string, Record<string, StockEntry>> = {};
  for (const e of stock) {
    if (!stockMap[e.productId]) stockMap[e.productId] = {};
    stockMap[e.productId][e.size] = {
      ...e,
      quantity: localStock[e.productId]?.[e.size] ?? e.quantity,
    };
  }

  const categoryOrder = ["Suit Set", "Kurti Set", "Co-ord Set"];
  const categoryLabels: Record<string, string> = {
    "Suit Set": "Suit Sets",
    "Kurti Set": "Kurti Sets",
    "Co-ord Set": "Co-ord Sets",
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-charcoal" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground leading-none">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground text-xs">Divine Collection</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            data-ocid="admin.logout_button"
            onClick={onLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="sales">
          <TabsList className="mb-8 flex-wrap h-auto gap-1">
            <TabsTrigger
              value="sales"
              data-ocid="admin.sales.tab"
              className="gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              Sales
            </TabsTrigger>
            <TabsTrigger
              value="stock"
              data-ocid="admin.stock.tab"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Stock Tracker
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              data-ocid="admin.analytics.tab"
              className="gap-2"
            >
              <BarChart2 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="costprices"
              data-ocid="admin.costprices.tab"
              className="gap-2"
            >
              <Tag className="h-4 w-4" />
              Cost Prices
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              data-ocid="admin.categories.tab"
              className="gap-2"
            >
              <Layers className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger
              value="products"
              data-ocid="admin.products.tab"
              className="gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              Products
            </TabsTrigger>
          </TabsList>

          {/* SALES */}
          <TabsContent value="sales" className="space-y-6">
            {salesLoading ? (
              <div
                data-ocid="admin.sales.loading_state"
                className="flex items-center justify-center py-16"
              >
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Revenue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-1">
                        <IndianRupee className="h-5 w-5 text-primary" />
                        <span className="font-display text-3xl font-bold text-foreground">
                          {totalRevenue.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Orders
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-1">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                        <span className="font-display text-3xl font-bold text-foreground">
                          {totalOrders}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  {hasCostData && (
                    <>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Cost
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-baseline gap-1">
                            <IndianRupee className="h-5 w-5 text-orange-400" />
                            <span className="font-display text-3xl font-bold text-foreground">
                              {totalCost.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Profit
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-baseline gap-1">
                            <IndianRupee
                              className={`h-5 w-5 ${totalProfit >= 0 ? "text-green-500" : "text-red-400"}`}
                            />
                            <span
                              className={`font-display text-3xl font-bold ${totalProfit >= 0 ? "text-green-500" : "text-red-400"}`}
                            >
                              {totalProfit >= 0 ? "+" : ""}
                              {totalProfit.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">
                      Order History
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      All WhatsApp orders placed via the website
                    </p>
                  </div>
                  {sales.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      data-ocid="admin.sales.download_button"
                      onClick={handleDownloadCSV}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download CSV
                    </Button>
                  )}
                </div>
                {sales.length === 0 ? (
                  <div
                    data-ocid="admin.sales.empty_state"
                    className="border border-border rounded-sm p-12 text-center"
                  >
                    <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-40" />
                    <p className="text-foreground font-semibold mb-2">
                      No orders yet
                    </p>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                      Orders placed via WhatsApp checkout will appear here
                      automatically.
                    </p>
                  </div>
                ) : (
                  <div
                    data-ocid="admin.sales.table"
                    className="border border-border rounded-sm overflow-hidden"
                  >
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="whitespace-nowrap">
                              Date
                            </TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Mobile</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead className="text-right whitespace-nowrap">
                              Total
                            </TableHead>
                            {hasCostData && (
                              <TableHead className="text-right whitespace-nowrap">
                                Profit
                              </TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[...sales].reverse().map((sale, idx) => {
                            const rowCost = sale.items.reduce((iSum, item) => {
                              const cp = nameToCostPrice[item.name];
                              return cp !== undefined
                                ? iSum + cp * item.quantity
                                : iSum;
                            }, 0);
                            const allHaveCost = sale.items.every(
                              (item) =>
                                nameToCostPrice[item.name] !== undefined,
                            );
                            const profit = sale.total - rowCost;
                            return (
                              <TableRow
                                key={sale.id}
                                data-ocid={`admin.sales.row.${idx + 1}`}
                              >
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(sale.date).toLocaleString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </TableCell>
                                <TableCell className="font-medium whitespace-nowrap">
                                  {sale.customerName}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                  {sale.mobile}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                                  {sale.address}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    {sale.items.map((item) => (
                                      <div
                                        key={`${item.name}-${item.size}`}
                                        className="flex items-center gap-1 text-xs"
                                      >
                                        <span className="text-foreground">
                                          {item.name}
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className="text-xs px-1 h-5"
                                        >
                                          {item.size}
                                        </Badge>
                                        <span className="text-muted-foreground">
                                          x{item.quantity}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-bold text-primary whitespace-nowrap">
                                  ₹{sale.total.toLocaleString("en-IN")}/-
                                </TableCell>
                                {hasCostData && (
                                  <TableCell className="text-right whitespace-nowrap">
                                    {allHaveCost ? (
                                      <span
                                        className={`font-bold ${profit >= 0 ? "text-green-500" : "text-red-400"}`}
                                      >
                                        {profit >= 0 ? "+" : ""}₹
                                        {profit.toLocaleString("en-IN")}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground text-xs">
                                        —
                                      </span>
                                    )}
                                  </TableCell>
                                )}
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* STOCK */}
          <TabsContent value="stock" className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Stock Tracker
                </h2>
                <p className="text-muted-foreground text-sm">
                  Manage inventory per product and size
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  data-ocid="admin.stock.refresh_button"
                  onClick={() => refetchStock()}
                  disabled={stockLoading}
                  className="gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${stockLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  data-ocid="admin.stock.init_button"
                  onClick={() => initStock.mutate()}
                  disabled={initStock.isPending || resetAllStock.isPending}
                  className="gap-2"
                >
                  {initStock.isPending || resetAllStock.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Reset All to 1
                </Button>
              </div>
            </div>
            {stockLoading ? (
              <div
                data-ocid="admin.stock.loading_state"
                className="flex items-center justify-center py-16"
              >
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="flex gap-4 text-sm flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                    Out of stock (0)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
                    Low stock (1)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                    In stock (2+)
                  </span>
                </div>
                {stock.length === 0 ? (
                  <div
                    data-ocid="admin.stock.empty_state"
                    className="border border-border rounded-sm p-12 text-center"
                  >
                    <RefreshCw className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-40" />
                    <p className="text-foreground font-semibold mb-2">
                      Stock not initialized
                    </p>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
                      Click &quot;Reset All to 1&quot; to initialize stock.
                    </p>
                    <Button
                      data-ocid="admin.stock.init_button_empty"
                      onClick={() => initStock.mutate()}
                      disabled={initStock.isPending}
                      className="gold-gradient text-charcoal font-bold gap-2"
                    >
                      {initStock.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Initialize Stock
                    </Button>
                  </div>
                ) : (
                  <div data-ocid="admin.stock.table" className="space-y-6">
                    {categoryOrder.map((cat) => {
                      const products = CATALOG_PRODUCTS.filter((p) => {
                        const label =
                          p.category === "Kurties"
                            ? "Suit Set"
                            : p.category === "Sarees"
                              ? "Kurti Set"
                              : "Co-ord Set";
                        return label === cat;
                      });
                      if (products.length === 0) return null;
                      return (
                        <div key={cat}>
                          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                            {categoryLabels[cat]}
                          </h3>
                          <div className="border border-border rounded-sm overflow-hidden">
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-32">
                                      Product
                                    </TableHead>
                                    {SIZES.map((size) => (
                                      <TableHead
                                        key={size}
                                        className="text-center w-28"
                                      >
                                        {size}
                                      </TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {products.map((product, idx) => (
                                    <TableRow
                                      key={product.id.toString()}
                                      data-ocid={`admin.stock.row.${idx + 1}`}
                                    >
                                      <TableCell className="font-medium text-sm">
                                        {product.name}
                                      </TableCell>
                                      {SIZES.map((size) => {
                                        const entry =
                                          stockMap[product.id.toString()]?.[
                                            size
                                          ];
                                        if (!entry)
                                          return (
                                            <TableCell
                                              key={size}
                                              className="text-center"
                                            >
                                              <span className="text-muted-foreground text-xs">
                                                -
                                              </span>
                                            </TableCell>
                                          );
                                        return (
                                          <TableCell
                                            key={size}
                                            className="text-center"
                                          >
                                            <StockCell
                                              entry={entry}
                                              onUpdate={handleStockUpdate}
                                            />
                                          </TableCell>
                                        );
                                      })}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* ANALYTICS */}
          <TabsContent value="analytics">
            <AnalyticsTab />
          </TabsContent>

          {/* COST PRICES */}
          <TabsContent value="costprices" className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Cost Prices
                </h2>
                <p className="text-muted-foreground text-sm">
                  Set the cost price for each product to calculate P&amp;L in
                  your sales report
                </p>
              </div>
              <div className="flex items-center gap-3">
                {costSaved && (
                  <span
                    data-ocid="admin.costprices.success_state"
                    className="flex items-center gap-1.5 text-green-500 text-sm font-medium"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Saved!
                  </span>
                )}
                <Button
                  data-ocid="admin.costprices.save_button"
                  onClick={async () => {
                    const promises = Object.entries(draftCostPrices).map(
                      ([id, val]) => {
                        const num = Number.parseFloat(val);
                        if (!Number.isNaN(num) && num >= 0)
                          return setCostPrice.mutateAsync({
                            productId: id,
                            costPrice: num,
                          });
                        return Promise.resolve();
                      },
                    );
                    await Promise.all(promises);
                    setCostSaved(true);
                    setTimeout(() => setCostSaved(false), 3000);
                  }}
                  disabled={setCostPrice.isPending || costLoading}
                  className="gold-gradient text-charcoal font-bold gap-2"
                >
                  {setCostPrice.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Tag className="h-4 w-4" />
                  )}
                  Save Cost Prices
                </Button>
              </div>
            </div>
            {costLoading ? (
              <div
                data-ocid="admin.costprices.loading_state"
                className="flex items-center justify-center py-16"
              >
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="border border-border rounded-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">
                        Sale Price (₹)
                      </TableHead>
                      <TableHead className="text-right w-48">
                        Cost Price (₹)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {CATALOG_PRODUCTS.map((product, idx) => {
                      const id = product.id.toString();
                      const salePrice = Number(product.price);
                      const categoryLabel =
                        product.category === "Kurties"
                          ? "Suit Set"
                          : product.category === "Sarees"
                            ? "Kurti Set"
                            : "Co-ord Set";
                      return (
                        <TableRow
                          key={id}
                          data-ocid={`admin.costprices.row.${idx + 1}`}
                        >
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {categoryLabel}
                          </TableCell>
                          <TableCell className="text-right text-sm font-semibold text-primary">
                            ₹{salePrice.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-muted-foreground text-sm">
                                ₹
                              </span>
                              <Input
                                data-ocid={`admin.costprices.input.${idx + 1}`}
                                type="number"
                                min="0"
                                step="1"
                                placeholder="0"
                                value={draftCostPrices[id] ?? ""}
                                onChange={(e) =>
                                  setDraftCostPrices((prev) => ({
                                    ...prev,
                                    [id]: e.target.value,
                                  }))
                                }
                                className="w-32 text-right"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              * Cost prices are saved to the backend. After saving, go to the
              Sales tab to see P&amp;L per order.
            </p>
          </TabsContent>

          {/* CATEGORIES */}
          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>

          {/* PRODUCTS */}
          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ── Admin Page Root ──────────────────────────────────────────────────────────────────────
export function AdminPage() {
  const [authed, setAuthed] = useState(isAuthenticated);
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  return (
    <Dashboard
      onLogout={() => {
        sessionStorage.removeItem(SESSION_KEY);
        setAuthed(false);
      }}
    />
  );
}
