"use client";
import React from "react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import {
  getDashboardAnalytics,
  getOrders,
  getTables,
  getCategories,
  createCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateOrderStatus,
  updatePayment,
  uploadMenuItemImage,
  deleteMenuItemImage,
} from "@/lib/api";
import {
  DashboardAnalytics,
  Order,
  MenuItem as MenuItemType,
  Category,
  OrderStatus,
} from "@/types";
import { startConnection, joinKitchen } from "@/lib/signalr";
import {
  LayoutDashboard,
  ArrowLeft,
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  UtensilsCrossed,
  ChefHat,
  BarChart3,
  Plus,
  Trash2,
  CreditCard,
  X,
  CheckCircle2,
  XCircle,
  ArrowRight,
  QrCode,
  Printer,
  ImagePlus,
  Upload,
  LogOut,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

type Tab = "dashboard" | "orders" | "menu" | "tables";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5139";

const nextStatus: Record<string, OrderStatus> = {
  Pending: "Confirmed",
  Confirmed: "Preparing",
  Preparing: "Ready",
  Ready: "Served",
  Served: "Completed",
};
const nextLabel: Record<string, string> = {
  Pending: "Accept",
  Confirmed: "Prepare",
  Preparing: "Ready",
  Ready: "Served",
  Served: "Complete",
};

function getFullImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_URL}${imageUrl}`;
}

function AdminContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const handleLogout = () => {
    logout();
    router.push("/login?redirect=/admin");
  };
  const [tab, setTab] = useState<Tab>("dashboard");
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [menuForm, setMenuForm] = useState({
    categoryId: "",
    name: "",
    description: "",
    price: "",
    preparationTime: "15",
    calories: "",
  });
  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState({
    name: "",
    description: "",
    sortOrder: "0",
  });
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<any | null>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    (async () => {
      try {
        const conn = await startConnection();
        await joinKitchen();
        conn.off("NewOrder");
        conn.off("OrderStatusUpdated");
        conn.on("NewOrder", (newOrder: Order) => {
          setOrders((prev) => [newOrder, ...prev]);
          getDashboardAnalytics().then(setAnalytics).catch(console.error);
          getTables().then(setTables).catch(console.error);
        });
        conn.on(
          "OrderStatusUpdated",
          (update: { id: string; status: string }) => {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === update.id
                  ? { ...o, status: update.status as OrderStatus }
                  : o,
              ),
            );
            getDashboardAnalytics().then(setAnalytics).catch(console.error);
            getTables().then(setTables).catch(console.error);
          },
        );
      } catch (e) {
        console.error("SignalR error:", e);
      }
    })();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [a, o, t, c] = await Promise.all([
        getDashboardAnalytics(),
        getOrders(),
        getTables(),
        getCategories(),
      ]);
      setAnalytics(a);
      setOrders(o);
      setTables(t);
      setCategories(c);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCat = async () => {
    try {
      await createCategory({
        name: catForm.name,
        description: catForm.description || null,
        sortOrder: parseInt(catForm.sortOrder) || 0,
      });
      setShowCatForm(false);
      setCatForm({ name: "", description: "", sortOrder: "0" });
      loadData();
    } catch {
      alert("Failed");
    }
  };

  const handleCreateItem = async () => {
    try {
      await createMenuItem({
        categoryId: menuForm.categoryId,
        name: menuForm.name,
        description: menuForm.description || null,
        price: parseFloat(menuForm.price),
        preparationTime: parseInt(menuForm.preparationTime) || 15,
        calories: menuForm.calories ? parseInt(menuForm.calories) : null,
        tags: null,
      });
      setShowMenuForm(false);
      setMenuForm({
        categoryId: "",
        name: "",
        description: "",
        price: "",
        preparationTime: "15",
        calories: "",
      });
      loadData();
    } catch {
      alert("Failed");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Delete?")) return;
    try {
      await deleteMenuItem(id);
      loadData();
    } catch {
      alert("Failed");
    }
  };
  const handleToggle = async (item: MenuItemType) => {
    try {
      await updateMenuItem(item.id, { isAvailable: !item.isAvailable });
      loadData();
    } catch {
      alert("Failed");
    }
  };
  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      loadData();
    } catch {
      alert("Failed");
    }
  };
  const handlePay = async (id: string, method: string) => {
    try {
      await updatePayment(id, "Paid", method);
      loadData();
    } catch {
      alert("Failed");
    }
  };
  const handleCancel = async (id: string) => {
    if (!confirm("Cancel?")) return;
    try {
      await updateOrderStatus(id, "Cancelled");
      loadData();
    } catch {
      alert("Failed");
    }
  };

  const handleImageUpload = async (itemId: string, file: File) => {
    setUploadingImage(itemId);
    try {
      await uploadMenuItemImage(itemId, file);
      loadData();
    } catch (e) {
      alert("Failed to upload");
      console.error(e);
    } finally {
      setUploadingImage(null);
      setActiveUploadId(null);
    }
  };

  const handleImageDelete = async (itemId: string) => {
    if (!confirm("Remove image?")) return;
    try {
      await deleteMenuItemImage(itemId);
      loadData();
    } catch {
      alert("Failed");
    }
  };

  const triggerFileInput = (itemId: string) => {
    setActiveUploadId(itemId);
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUploadId) handleImageUpload(activeUploadId, file);
    e.target.value = "";
  };

  const getTableMenuUrl = (qrCode: string) => {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://10.191.28.1:3000";
    return `${siteUrl}/menu?qr=${encodeURIComponent(qrCode)}`;
  };

  const handlePrintTableQr = () => {
    if (!qrRef.current || !selectedTable) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document
      .write(`<html><head><title>Table ${selectedTable.tableNumber}</title>
      <style>body{font-family:Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0}
      .c{text-align:center;padding:40px;border:3px solid #ea580c;border-radius:24px;max-width:360px}
      h1{font-size:28px;margin-bottom:4px;color:#ea580c}h2{font-size:48px;font-weight:bold;margin:8px 0}
      p{color:#666;margin:4px 0;font-size:14px}.qr{margin:24px 0}.s{font-size:18px;font-weight:bold;color:#333;margin-top:16px}
      .u{font-size:10px;color:#999;word-break:break-all;margin-top:12px}.f{font-size:11px;color:#999;margin-top:20px}</style></head>
      <body><div class="c"><h1>QuickServe QR</h1><h2>Table ${selectedTable.tableNumber}</h2>
      <p>${selectedTable.seats} seats</p><div class="qr">${qrRef.current.innerHTML}</div>
      <p class="s">📱 Scan to view menu & order</p>
      <p class="u">${getTableMenuUrl(selectedTable.qrCode)}</p>
      <div class="f">Powered by QuickServe QR</div></div></body></html>`);
    w.document.close();
    w.print();
  };

  const sColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-blue-100 text-blue-700",
    Preparing: "bg-purple-100 text-purple-700",
    Ready: "bg-green-100 text-green-700",
    Served: "bg-gray-100 text-gray-700",
    Completed: "bg-emerald-100 text-emerald-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      key: "orders",
      label: "Orders",
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      key: "menu",
      label: "Menu",
      icon: <UtensilsCrossed className="w-4 h-4" />,
    },
    { key: "tables", label: "Tables", icon: <Users className="w-4 h-4" /> },
  ];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onFileSelected}
      />

      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <QrCode className="w-5 h-5 text-brand-500" /> Table QR Code
              </h2>
              <button
                onClick={() => setSelectedTable(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center space-y-1">
              <p className="text-5xl font-extrabold text-brand-600">
                Table {selectedTable.tableNumber}
              </p>
              <p className="text-sm text-gray-500">
                {selectedTable.seats} seats ·{" "}
                {selectedTable.isOccupied ? "🔴 Occupied" : "🟢 Available"}
              </p>
            </div>
            <div
              className="flex justify-center py-4 bg-gray-50 rounded-2xl"
              ref={qrRef}
            >
              <QRCodeSVG
                value={getTableMenuUrl(selectedTable.qrCode)}
                size={200}
                level="H"
                includeMargin
                bgColor="#FFFFFF"
                fgColor="#1a1a2e"
              />
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Menu URL:</p>
              <p className="text-xs font-mono text-brand-600 break-all">
                {getTableMenuUrl(selectedTable.qrCode)}
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={handlePrintTableQr}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print QR Code
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    getTableMenuUrl(selectedTable.qrCode),
                  );
                  alert("Copied!");
                }}
                className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
              >
                📋 Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <LayoutDashboard className="w-5 h-5 text-brand-500" />
            <h1 className="text-lg font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                👤 {user.fullName} ({user.role})
              </span>
            )}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 rounded-xl text-red-400"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${tab === t.key ? "border-brand-500 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {tab === "dashboard" && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Orders",
                  value: analytics.totalOrders,
                  icon: <ShoppingBag className="w-6 h-6" />,
                  color: "text-blue-500 bg-blue-50",
                },
                {
                  label: "Revenue",
                  value: `$${analytics.totalRevenue.toFixed(2)}`,
                  icon: <DollarSign className="w-6 h-6" />,
                  color: "text-green-500 bg-green-50",
                },
                {
                  label: "Active Orders",
                  value: analytics.activeOrders,
                  icon: <ChefHat className="w-6 h-6" />,
                  color: "text-purple-500 bg-purple-50",
                },
                {
                  label: "Avg Order",
                  value: `$${analytics.averageOrderValue.toFixed(2)}`,
                  icon: <TrendingUp className="w-6 h-6" />,
                  color: "text-brand-500 bg-brand-50",
                },
              ].map((s) => (
                <div key={s.label} className="card flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{s.label}</p>
                    <p className="text-2xl font-bold">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="font-bold mb-4">🔥 Top Selling</h3>
                {analytics.topSellingItems.length === 0 ? (
                  <p className="text-gray-400 text-sm">No data yet</p>
                ) : (
                  analytics.topSellingItems.map((item, i) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.quantity} sold</p>
                        <p className="text-xs text-gray-400">
                          ${item.revenue.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="card">
                <h3 className="font-bold mb-4">🪑 Tables</h3>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-brand-500">
                      {analytics.tablesOccupied}
                    </p>
                    <p className="text-xs text-gray-400">Occupied</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-500">
                      {analytics.totalTables - analytics.tablesOccupied}
                    </p>
                    <p className="text-xs text-gray-400">Available</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {analytics.totalTables}
                    </p>
                    <p className="text-xs text-gray-400">Total</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-center text-gray-400 py-12">No orders</p>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="card">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedOrder(expandedOrder === o.id ? null : o.id)
                    }
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-lg font-bold">
                        #{o.orderNumber}
                      </span>
                      <span className="text-sm text-gray-500">
                        Table {o.tableNumber}
                      </span>
                      <span className={`badge ${sColors[o.status]}`}>
                        {o.status}
                      </span>
                      <span
                        className={`badge ${o.paymentStatus === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                      >
                        {o.paymentStatus === "Paid" ? "💰 Paid" : "⏳ Unpaid"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">
                        ${o.total.toFixed(2)}
                      </span>
                      <ArrowRight
                        className={`w-4 h-4 text-gray-400 transition-transform ${expandedOrder === o.id ? "rotate-90" : ""}`}
                      />
                    </div>
                  </div>
                  {expandedOrder === o.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">
                          Items:
                        </p>
                        {o.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between py-1 text-sm"
                          >
                            <span>
                              <span className="font-medium text-brand-600">
                                {item.quantity}x
                              </span>{" "}
                              {item.menuItemName}
                            </span>
                            <span className="font-medium">
                              ${(item.unitPrice * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-2 mt-2 border-t border-gray-50 text-sm text-gray-500">
                          <span>Subtotal</span>
                          <span>${o.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Tax</span>
                          <span>${o.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-1">
                          <span>Total</span>
                          <span className="text-brand-600">
                            ${o.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      {o.status !== "Completed" && o.status !== "Cancelled" && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {nextStatus[o.status] && (
                            <button
                              onClick={() =>
                                handleStatusUpdate(o.id, nextStatus[o.status])
                              }
                              className="btn-primary text-sm py-2 flex items-center gap-1"
                            >
                              <ArrowRight className="w-4 h-4" />{" "}
                              {nextLabel[o.status]}
                            </button>
                          )}
                          <button
                            onClick={() => handleCancel(o.id)}
                            className="bg-red-100 hover:bg-red-200 text-red-600 font-semibold py-2 px-4 rounded-xl text-sm flex items-center gap-1 transition"
                          >
                            <XCircle className="w-4 h-4" /> Cancel
                          </button>
                        </div>
                      )}
                      {o.paymentStatus === "Unpaid" &&
                        o.status !== "Cancelled" && (
                          <div className="pt-3 border-t border-gray-100 space-y-3">
                            <p className="text-sm font-semibold text-gray-700">
                              💳 Payment
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handlePay(o.id, "Cash")}
                                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl text-sm flex items-center gap-1 transition"
                              >
                                <DollarSign className="w-4 h-4" /> Cash
                              </button>
                              <button
                                onClick={() => handlePay(o.id, "Card")}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl text-sm flex items-center gap-1 transition"
                              >
                                <CreditCard className="w-4 h-4" /> Card
                              </button>
                              <button
                                onClick={() => handlePay(o.id, "Digital")}
                                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-xl text-sm flex items-center gap-1 transition"
                              >
                                💳 Digital
                              </button>
                            </div>
                          </div>
                        )}
                      {o.paymentStatus === "Paid" && (
                        <div className="flex items-center gap-2 text-green-600 font-medium pt-2 border-t border-gray-100">
                          <CheckCircle2 className="w-5 h-5" /> Paid via{" "}
                          {o.paymentMethod}
                        </div>
                      )}
                      {o.status === "Completed" && (
                        <div className="flex items-center gap-2 text-green-600 font-medium">
                          <CheckCircle2 className="w-5 h-5" /> Order Completed
                        </div>
                      )}
                      {o.status === "Cancelled" && (
                        <div className="flex items-center gap-2 text-red-500 font-medium">
                          <XCircle className="w-5 h-5" /> Order Cancelled
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === "menu" && (
          <div className="space-y-6">
            <div className="flex gap-2">
              <button
                onClick={() => setShowCatForm(true)}
                className="btn-secondary text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
              <button
                onClick={() => setShowMenuForm(true)}
                className="btn-primary text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
            {showCatForm && (
              <div className="card border-brand-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">New Category</h3>
                  <button onClick={() => setShowCatForm(false)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    placeholder="Name"
                    value={catForm.name}
                    onChange={(e) =>
                      setCatForm({ ...catForm, name: e.target.value })
                    }
                    className="px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    placeholder="Description"
                    value={catForm.description}
                    onChange={(e) =>
                      setCatForm({ ...catForm, description: e.target.value })
                    }
                    className="px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    placeholder="Sort Order"
                    type="number"
                    value={catForm.sortOrder}
                    onChange={(e) =>
                      setCatForm({ ...catForm, sortOrder: e.target.value })
                    }
                    className="px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <button
                  onClick={handleCreateCat}
                  className="btn-primary text-sm mt-3"
                >
                  Create
                </button>
              </div>
            )}
            {showMenuForm && (
              <div className="card border-brand-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">New Menu Item</h3>
                  <button onClick={() => setShowMenuForm(false)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <select
                    value={menuForm.categoryId}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, categoryId: e.target.value })
                    }
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Name"
                    value={menuForm.name}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, name: e.target.value })
                    }
                    className="px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    placeholder="Price"
                    type="number"
                    step="0.01"
                    value={menuForm.price}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, price: e.target.value })
                    }
                    className="px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    placeholder="Description"
                    value={menuForm.description}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, description: e.target.value })
                    }
                    className="px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    placeholder="Prep Time (min)"
                    type="number"
                    value={menuForm.preparationTime}
                    onChange={(e) =>
                      setMenuForm({
                        ...menuForm,
                        preparationTime: e.target.value,
                      })
                    }
                    className="px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    placeholder="Calories"
                    type="number"
                    value={menuForm.calories}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, calories: e.target.value })
                    }
                    className="px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <button
                  onClick={handleCreateItem}
                  className="btn-primary text-sm mt-3"
                >
                  Create Item
                </button>
              </div>
            )}
            {categories.map((cat) => (
              <div key={cat.id} className="card">
                <h3 className="font-bold text-lg mb-1">{cat.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{cat.description}</p>
                <div className="space-y-3">
                  {cat.menuItems.map((item) => {
                    const imgSrc = getFullImageUrl(item.imageUrl);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 py-3 px-4 bg-gray-50 rounded-xl"
                      >
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 group/img">
                          {imgSrc ? (
                            <React.Fragment>
                              <img
                                src={imgSrc}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    triggerFileInput(item.id);
                                  }}
                                  className="p-1 bg-white rounded-md hover:bg-gray-100"
                                  title="Change"
                                >
                                  <Upload className="w-3 h-3 text-gray-700" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleImageDelete(item.id);
                                  }}
                                  className="p-1 bg-white rounded-md hover:bg-red-50"
                                  title="Remove"
                                >
                                  <Trash2 className="w-3 h-3 text-red-500" />
                                </button>
                              </div>
                            </React.Fragment>
                          ) : (
                            <button
                              onClick={() => triggerFileInput(item.id)}
                              className="w-full h-full bg-gray-200 hover:bg-gray-300 transition flex flex-col items-center justify-center gap-0.5"
                              title="Upload"
                            >
                              {uploadingImage === item.id ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500" />
                              ) : (
                                <React.Fragment>
                                  <ImagePlus className="w-5 h-5 text-gray-400" />
                                  <span className="text-[9px] text-gray-400">
                                    Upload
                                  </span>
                                </React.Fragment>
                              )}
                            </button>
                          )}
                          {uploadingImage === item.id && imgSrc && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{item.name}</span>
                            <span className="text-sm text-gray-400">
                              ${item.price.toFixed(2)}
                            </span>
                            {!item.isAvailable && (
                              <span className="badge bg-red-100 text-red-600">
                                Unavailable
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleToggle(item)}
                            className={`px-2 py-1 rounded-lg text-xs font-medium ${item.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}
                          >
                            {item.isAvailable ? "Available" : "Disabled"}
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {cat.menuItems.length === 0 && (
                    <p className="text-sm text-gray-300 py-2">No items</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "tables" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tables.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTable(t)}
                className={`card text-center cursor-pointer hover:shadow-md transition-shadow ${t.isOccupied ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
              >
                <p className="text-3xl mb-2">🪑</p>
                <p className="font-bold text-lg">Table {t.tableNumber}</p>
                <p className="text-sm text-gray-500">{t.seats} seats</p>
                <span
                  className={`badge mt-2 ${t.isOccupied ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                >
                  {t.isOccupied ? "Occupied" : "Available"}
                </span>
                <div className="mt-3 flex items-center justify-center gap-1 text-xs text-brand-500 font-medium">
                  <QrCode className="w-3 h-3" /> View QR
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AdminContent />
    </ProtectedRoute>
  );
}
