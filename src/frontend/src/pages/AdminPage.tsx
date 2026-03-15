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
import {
  Download,
  Eye,
  EyeOff,
  IndianRupee,
  LogOut,
  Minus,
  Plus,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { useState } from "react";
import {
  SIZES,
  getStock,
  initializeStock,
  useSales,
  useStock,
} from "../hooks/useAdminData";
import type { StockEntry } from "../hooks/useAdminData";
import { CATALOG_PRODUCTS } from "../hooks/useQueries";

const ADMIN_PASSWORD = "Divine@2024";
const SESSION_KEY = "dc_admin_auth";

function isAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

// ── Login Screen ─────────────────────────────────────────────────────────────
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
            disabled={!password}
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}

// ── Stock Cell ────────────────────────────────────────────────────────────────
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

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [sales] = useSales();
  const [stock, setStock] = useStock();

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalOrders = sales.length;

  const handleStockUpdate = (
    productId: string,
    size: string,
    delta: number,
  ) => {
    setStock(
      stock.map((e) =>
        e.productId === productId && e.size === size
          ? { ...e, quantity: Math.max(0, e.quantity + delta) }
          : e,
      ),
    );
  };

  const handleInitStock = () => {
    initializeStock();
    setStock(getStock());
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
    ];
    const rows = sales.map((s) => [
      new Date(s.date).toLocaleString("en-IN"),
      s.customerName,
      s.mobile,
      s.address,
      s.items.map((i) => `${i.name} (${i.size}) x${i.quantity}`).join(" | "),
      s.total.toString(),
    ]);

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

  // Build stock lookup: productId -> { size -> StockEntry }
  const stockMap: Record<string, Record<string, StockEntry>> = {};
  for (const e of stock) {
    if (!stockMap[e.productId]) stockMap[e.productId] = {};
    stockMap[e.productId][e.size] = e;
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
          <TabsList className="mb-8">
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
          </TabsList>

          {/* ── SALES TAB ── */}
          <TabsContent value="sales" className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            {/* Sales table */}
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-foreground">
                Order History
              </h2>
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
                  Orders will appear here automatically when customers checkout
                  via WhatsApp.
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
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...sales].reverse().map((sale, idx) => (
                        <TableRow
                          key={sale.id}
                          data-ocid={`admin.sales.row.${idx + 1}`}
                        >
                          <TableCell className="text-sm whitespace-nowrap">
                            {new Date(sale.date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                            <br />
                            <span className="text-muted-foreground text-xs">
                              {new Date(sale.date).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">
                            {sale.customerName}
                          </TableCell>
                          <TableCell className="text-sm">
                            {sale.mobile}
                          </TableCell>
                          <TableCell className="text-sm max-w-[200px] truncate">
                            {sale.address}
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="space-y-1">
                              {sale.items.map((item) => (
                                <div
                                  key={`${item.name}-${item.size}`}
                                  className="flex gap-1 flex-wrap"
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
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
              <Button
                variant="outline"
                size="sm"
                data-ocid="admin.stock.init_button"
                onClick={handleInitStock}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset All to 1
              </Button>
            </div>

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
                              <TableHead className="w-32">Product</TableHead>
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
                                    stockMap[product.id.toString()]?.[size];
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ── Admin Page Root ───────────────────────────────────────────────────────────
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
