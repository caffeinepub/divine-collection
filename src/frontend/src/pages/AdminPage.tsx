import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  BarChart2,
  CheckCircle2,
  Download,
  Edit3,
  Eye,
  EyeOff,
  Globe,
  ImageIcon,
  IndianRupee,
  Loader2,
  LogOut,
  Minus,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  Tag,
  TrendingUp,
  Upload,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { ExternalBlob } from "../backend";
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
  useImageOverrides,
} from "../hooks/useQueries";

const ADMIN_PASSWORD = "Divine@2024";
const SESSION_KEY = "dc_admin_auth";

const PAGE_NAMES = ["Home", "Suit Sets", "Kurti Sets", "Co-ord Sets"] as const;
type PageName = (typeof PAGE_NAMES)[number];

function isAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

// ── Login Screen ───────────────────────────────────────────────────────────────
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
        {/* Logo */}
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

// ── StockCell ─────────────────────────────────────────────────────────────────────
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

// ── Analytics Tab ─────────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const { visits, isLoading } = useAnalytics();

  const totalVisits = visits.length;

  // Per-page breakdown
  const pageBreakdown: Record<string, number> = {};
  for (const page of PAGE_NAMES) {
    pageBreakdown[page] = 0;
  }
  for (const v of visits) {
    if (v.page in pageBreakdown) {
      pageBreakdown[v.page] = (pageBreakdown[v.page] ?? 0) + 1;
    }
  }

  // Daily breakdown — last 30 days
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

  const pageIcons: Record<string, React.ReactNode> = {
    Home: <Globe className="h-5 w-5 text-primary" />,
    "Suit Sets": <TrendingUp className="h-5 w-5 text-primary" />,
    "Kurti Sets": <TrendingUp className="h-5 w-5 text-primary" />,
    "Co-ord Sets": <TrendingUp className="h-5 w-5 text-primary" />,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">
          Site Analytics
        </h2>
        <p className="text-muted-foreground text-sm">
          Track total visits and page-level traffic across your store
        </p>
      </div>

      {/* Top summary cards */}
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

      {/* Per-page breakdown 2x2 grid */}
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
                  {pageIcons[page]}
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

      {/* Daily breakdown table */}
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

// ── Dashboard ─────────────────────────────────────────────────────────────────────────

// ── Category helpers for products tab ───────────────────────────────────
const PRODUCT_CATEGORY_LABEL: Record<string, string> = {
  Kurties: "Suit Sets",
  Sarees: "Kurti Sets",
  CoordSets: "Co-ord Sets",
  NightWear: "Night Wear",
};

const PRODUCT_CATEGORY_ORDER = ["Kurties", "Sarees", "CoordSets", "NightWear"];

// ── ProductRow ──────────────────────────────────────────────────────────────
interface ProductRowProps {
  product: (typeof CATALOG_PRODUCTS)[0];
  currentImage: string;
  rowIndex: number;
}

function ProductRow({ product, currentImage, rowIndex }: ProductRowProps) {
  const setOverride = useSetProductOverride();

  const [draftPrice, setDraftPrice] = React.useState(
    Number(product.price).toString(),
  );
  const [draftDesc, setDraftDesc] = React.useState(product.description ?? "");
  const [imageUrl, setImageUrl] = React.useState("");
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError("");
    setUploadProgress(0);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });
      const url = blob.getDirectURL();
      setImageUrl(url);
    } catch (_err) {
      setError("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setError("");
    const priceNum = Number.parseFloat(draftPrice);
    const payload: {
      productId: string;
      price?: number;
      description?: string;
      imageUrl?: string;
    } = {
      productId: product.id.toString(),
    };
    if (!Number.isNaN(priceNum) && priceNum > 0) payload.price = priceNum;
    if (draftDesc.trim()) payload.description = draftDesc.trim();
    if (imageUrl) payload.imageUrl = imageUrl;

    try {
      await setOverride.mutateAsync(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (_err) {
      setError("Save failed. Please try again.");
    }
  };

  const previewImage = imageUrl || currentImage;

  return (
    <div
      data-ocid={`admin.products.item.${rowIndex}`}
      className="flex flex-col sm:flex-row gap-4 p-4 border border-border rounded-sm bg-card"
    >
      {/* Image preview */}
      <div className="flex-shrink-0 flex flex-col items-center gap-2">
        <div className="w-20 h-20 rounded-sm overflow-hidden border border-border bg-muted flex items-center justify-center">
          {previewImage ? (
            <img
              src={previewImage}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground opacity-40" />
          )}
        </div>
        <label
          data-ocid={`admin.products.upload_button.${rowIndex}`}
          className="flex items-center gap-1 text-xs text-primary cursor-pointer hover:underline"
          htmlFor={`file-upload-${rowIndex}`}
        >
          <Upload className="h-3 w-3" />
          {isUploading ? `${Math.round(uploadProgress)}%` : "Upload Image"}
          <input
            id={`file-upload-${rowIndex}`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
        {isUploading && (
          <div
            data-ocid={`admin.products.loading_state.${rowIndex}`}
            className="w-20"
          >
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
        {imageUrl && !isUploading && (
          <span className="text-xs text-green-500 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Ready
          </span>
        )}
      </div>

      {/* Fields */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-foreground">{product.name}</span>
          <Badge variant="outline" className="text-xs">
            {PRODUCT_CATEGORY_LABEL[product.category as string] ??
              (product.category as string)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label
              htmlFor={`price-${rowIndex}`}
              className="text-xs text-muted-foreground font-medium"
            >
              Price (₹)
            </label>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-sm">₹</span>
              <Input
                id={`price-${rowIndex}`}
                data-ocid={`admin.products.input.${rowIndex}`}
                type="number"
                min="0"
                step="1"
                value={draftPrice}
                onChange={(e) => setDraftPrice(e.target.value)}
                className="h-8 text-sm"
                placeholder={Number(product.price).toString()}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor={`desc-${rowIndex}`}
            className="text-xs text-muted-foreground font-medium"
          >
            Description
          </label>
          <Textarea
            id={`desc-${rowIndex}`}
            data-ocid={`admin.products.textarea.${rowIndex}`}
            value={draftDesc}
            onChange={(e) => setDraftDesc(e.target.value)}
            rows={2}
            className="text-sm resize-none"
            placeholder="Product description..."
          />
        </div>

        {error && (
          <p
            data-ocid={`admin.products.error_state.${rowIndex}`}
            className="text-xs text-destructive"
          >
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button
            data-ocid={`admin.products.save_button.${rowIndex}`}
            size="sm"
            onClick={handleSave}
            disabled={setOverride.isPending}
            className="gold-gradient text-charcoal font-bold gap-2"
          >
            {setOverride.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Edit3 className="h-3 w-3" />
            )}
            Save Changes
          </Button>
          {saved && (
            <span
              data-ocid={`admin.products.success_state.${rowIndex}`}
              className="flex items-center gap-1 text-green-500 text-xs font-medium"
            >
              <CheckCircle2 className="h-3 w-3" /> Saved!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── ProductsTab ─────────────────────────────────────────────────────────────
function ProductsTab() {
  const imageOverrides = useImageOverrides();

  let globalIdx = 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">
          Manage Products
        </h2>
        <p className="text-muted-foreground text-sm">
          Update images, prices, and descriptions for each product. Changes
          apply immediately without a rebuild.
        </p>
      </div>

      {PRODUCT_CATEGORY_ORDER.map((cat) => {
        const products = CATALOG_PRODUCTS.filter(
          (p) => (p.category as string) === cat,
        );
        if (products.length === 0) return null;
        return (
          <div key={cat} className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              {PRODUCT_CATEGORY_LABEL[cat] ?? cat}
            </h3>
            <div className="space-y-3">
              {products.map((product) => {
                globalIdx += 1;
                const currentImage =
                  imageOverrides[product.id.toString()] ??
                  getProductImage(product, []);
                return (
                  <ProductRow
                    key={product.id.toString()}
                    product={product}
                    currentImage={currentImage}
                    rowIndex={globalIdx}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { sales, isLoading: salesLoading } = useSales();
  const { stock, isLoading: stockLoading, refetch: refetchStock } = useStock();
  const { costPrices, isLoading: costLoading } = useCostPrices();

  const setStockEntry = useSetStockEntry();
  const resetAllStock = useResetAllStock();
  const initStock = useInitStock();
  const setCostPrice = useSetCostPrice();

  // Local draft for stock (optimistic UI while backend persists)
  const [localStock, setLocalStock] = useState<
    Record<string, Record<string, number>>
  >({});

  // Sync localStock from backend data
  useEffect(() => {
    const map: Record<string, Record<string, number>> = {};
    for (const e of stock) {
      if (!map[e.productId]) map[e.productId] = {};
      map[e.productId][e.size] = e.quantity;
    }
    setLocalStock(map);
  }, [stock]);

  // Local draft for cost prices tab (editable before saving)
  const [draftCostPrices, setDraftCostPrices] = useState<
    Record<string, string>
  >({});
  const [costSaved, setCostSaved] = useState(false);

  // Sync draft cost prices from backend
  useEffect(() => {
    const draft: Record<string, string> = {};
    for (const p of CATALOG_PRODUCTS) {
      const id = p.id.toString();
      draft[id] = costPrices[id] !== undefined ? String(costPrices[id]) : "";
    }
    setDraftCostPrices(draft);
  }, [costPrices]);

  // Build name -> cost price lookup for P&L calculations
  const nameToCostPrice: Record<string, number> = {};
  for (const p of CATALOG_PRODUCTS) {
    const id = p.id.toString();
    const cp = costPrices[id];
    if (cp !== undefined) {
      nameToCostPrice[p.name] = cp;
    }
  }

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalOrders = sales.length;

  // Compute total cost and profit across all sales
  const totalCost = sales.reduce((sum, s) => {
    const rowCost = s.items.reduce((iSum, item) => {
      const cp = nameToCostPrice[item.name];
      return cp !== undefined ? iSum + cp * item.quantity : iSum;
    }, 0);
    return sum + rowCost;
  }, 0);
  const totalProfit = totalRevenue - totalCost;
  const hasCostData = Object.keys(costPrices).length > 0;

  const handleStockUpdate = (
    productId: string,
    size: string,
    delta: number,
  ) => {
    // Optimistic update
    setLocalStock((prev) => {
      const prevQty = prev[productId]?.[size] ?? 0;
      const newQty = Math.max(0, prevQty + delta);
      return {
        ...prev,
        [productId]: { ...(prev[productId] ?? {}), [size]: newQty },
      };
    });

    // Find the stock entry
    const entry = stock.find(
      (e) => e.productId === productId && e.size === size,
    );
    if (entry) {
      const newQty = Math.max(0, entry.quantity + delta);
      setStockEntry.mutate({ ...entry, quantity: newQty });
    }
  };

  const handleInitStock = () => {
    initStock.mutate();
  };

  const handleSaveCostPrices = async () => {
    const promises: Promise<void>[] = [];
    for (const [id, val] of Object.entries(draftCostPrices)) {
      const num = Number.parseFloat(val);
      if (!Number.isNaN(num) && num >= 0) {
        promises.push(
          setCostPrice.mutateAsync({ productId: id, costPrice: num }),
        );
      }
    }
    await Promise.all(promises);
    setCostSaved(true);
    setTimeout(() => setCostSaved(false), 3000);
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

  // Build stock lookup: productId -> { size -> quantity } (use localStock for optimistic)
  const stockMap: Record<string, Record<string, StockEntry>> = {};
  for (const e of stock) {
    if (!stockMap[e.productId]) stockMap[e.productId] = {};
    // Override with local optimistic value if available
    stockMap[e.productId][e.size] = {
      ...e,
      quantity: localStock[e.productId]?.[e.size] ?? e.quantity,
    };
  }

  // Group products by category for display
  const categoryOrder = ["Suit Set", "Kurti Set", "Co-ord Set"];
  const categoryLabels: Record<string, string> = {
    "Suit Set": "Suit Sets",
    "Kurti Set": "Kurti Sets",
    "Co-ord Set": "Co-ord Sets",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              value="products"
              data-ocid="admin.products.tab"
              className="gap-2"
            >
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
          </TabsList>

          {/* ── SALES TAB ── */}
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
                {/* Summary cards */}
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
                              className={`h-5 w-5 ${
                                totalProfit >= 0
                                  ? "text-green-500"
                                  : "text-red-400"
                              }`}
                            />
                            <span
                              className={`font-display text-3xl font-bold ${
                                totalProfit >= 0
                                  ? "text-green-500"
                                  : "text-red-400"
                              }`}
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

                {/* Sales table */}
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
                                        className={`font-bold ${
                                          profit >= 0
                                            ? "text-green-500"
                                            : "text-red-400"
                                        }`}
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

          {/* ── STOCK TAB ── */}
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
                  onClick={handleInitStock}
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
                {/* Legend */}
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
                      Click &quot;Reset All to 1&quot; to initialize stock for
                      all products.
                    </p>
                    <Button
                      data-ocid="admin.stock.init_button_empty"
                      onClick={handleInitStock}
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

          {/* ── ANALYTICS TAB ── */}
          <TabsContent value="analytics">
            <AnalyticsTab />
          </TabsContent>

          {/* ── COST PRICES TAB ── */}
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
                  onClick={handleSaveCostPrices}
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
              Sales tab to see P&amp;L per order and updated summary cards.
            </p>
          </TabsContent>

          {/* ── PRODUCTS TAB ── */}
          <TabsContent value="products" className="space-y-6">
            <ProductsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ── Admin Page Root ─────────────────────────────────────────────────────────────────
export function AdminPage() {
  const [authed, setAuthed] = useState(isAuthenticated);

  if (!authed) {
    return <LoginScreen onLogin={() => setAuthed(true)} />;
  }

  return (
    <Dashboard
      onLogout={() => {
        sessionStorage.removeItem(SESSION_KEY);
        setAuthed(false);
      }}
    />
  );
}
