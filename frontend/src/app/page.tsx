"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getTables, getOrders } from "@/lib/api";
import { startConnection, joinKitchen } from "@/lib/signalr";
import {
  ScanLine,
  ChefHat,
  LayoutDashboard,
  QrCode,
  Printer,
  X,
  Link,
  Users,
  LogOut,
  RefreshCw,
  ClipboardList,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://10.191.28.1:3000";

function DashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [tables, setTables] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<any | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const qrRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      const [t, o] = await Promise.all([getTables(), getOrders()]);
      setTables(t);
      setOrders(o);
      setLastRefresh(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);

    (async () => {
      try {
        const conn = await startConnection();
        await joinKitchen();
        conn.off("NewOrder");
        conn.off("OrderStatusUpdated");
        conn.on("NewOrder", () => loadData());
        conn.on("OrderStatusUpdated", () => loadData());
      } catch (e) {
        console.error("SignalR:", e);
      }
    })();

    return () => clearInterval(interval);
  }, []);

  const getActiveOrdersForTable = (tableNumber: number) => {
    return orders.filter(
      (o) =>
        o.tableNumber === tableNumber &&
        o.status !== "Completed" &&
        o.status !== "Cancelled",
    );
  };

  const getAllOrdersForTable = (tableNumber: number) => {
    return orders.filter(
      (o) => o.tableNumber === tableNumber && o.status !== "Cancelled",
    );
  };

  const getTableMenuUrl = (qrCode: string) => {
    return `${SITE_URL}/menu?qr=${encodeURIComponent(qrCode)}`;
  };

  const handlePrintQr = () => {
    if (!qrRef.current || !selectedTable) return;
    const activeOrders = getActiveOrdersForTable(selectedTable.tableNumber);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document
      .write(`<html><head><title>Table ${selectedTable.tableNumber}</title>
      <style>body{font-family:Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0}
      .c{text-align:center;padding:40px;border:3px solid #ea580c;border-radius:24px;max-width:360px}
      h1{font-size:28px;margin-bottom:4px;color:#ea580c}h2{font-size:48px;font-weight:bold;margin:8px 0}
      p{color:#666;margin:4px 0;font-size:14px}.qr{margin:24px 0}.s{font-size:18px;font-weight:bold;color:#333;margin-top:16px}
      .u{font-size:10px;color:#999;word-break:break-all;margin-top:12px}.f{font-size:11px;color:#999;margin-top:20px}
      .status{font-size:12px;color:#ea580c;font-weight:bold;margin-top:8px}</style></head>
      <body><div class="c"><h1>QuickServe QR</h1><h2>Table ${selectedTable.tableNumber}</h2>
      <p>${selectedTable.seats} seats</p>
      ${activeOrders.length > 0 ? `<p class="status">⚡ ${activeOrders.length} active order(s)</p>` : ""}
      <div class="qr">${qrRef.current.innerHTML}</div>
      <p class="s">📱 Scan to view menu & order</p>
      <p class="u">${getTableMenuUrl(selectedTable.qrCode)}</p>
      <div class="f">Powered by QuickServe QR</div></div></body></html>`);
    w.document.close();
    w.print();
  };

  const handleCopyLink = () => {
    if (!selectedTable) return;
    navigator.clipboard.writeText(getTableMenuUrl(selectedTable.qrCode));
    alert("Link copied to clipboard!");
  };

  const handleOpenMenu = () => {
    if (!selectedTable) return;
    window.open(getTableMenuUrl(selectedTable.qrCode), "_blank");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getSectionInfo = (seats: number) => {
    if (seats <= 2)
      return {
        label: "Window Seats · 2 Pax",
        color:
          "from-green-50 to-emerald-100 border-green-200 hover:border-green-400",
        dot: "bg-green-400 border-green-500",
        badge: "bg-green-100 text-green-700",
      };
    if (seats <= 4)
      return {
        label: "Dining Area · 4 Pax",
        color:
          "from-blue-50 to-indigo-100 border-blue-200 hover:border-blue-400",
        dot: "bg-blue-400 border-blue-500",
        badge: "bg-blue-100 text-blue-700",
      };
    if (seats <= 6)
      return {
        label: "Family Area · 6 Pax",
        color:
          "from-purple-50 to-violet-100 border-purple-200 hover:border-purple-400",
        dot: "bg-purple-400 border-purple-500",
        badge: "bg-purple-100 text-purple-700",
      };
    return {
      label: "VIP / Party · 10 Pax",
      color:
        "from-amber-50 to-orange-100 border-amber-200 hover:border-amber-400",
      dot: "bg-amber-400 border-amber-500",
      badge: "bg-amber-100 text-amber-700",
    };
  };

  const sections = [
    { filter: (t: any) => t.seats <= 2, seats: 2 },
    { filter: (t: any) => t.seats > 2 && t.seats <= 4, seats: 4 },
    { filter: (t: any) => t.seats > 4 && t.seats <= 6, seats: 6 },
    { filter: (t: any) => t.seats > 6, seats: 10 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100">
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <QrCode className="w-5 h-5 text-brand-500" /> Table QR Code
              </h2>
              <button
                onClick={() => setSelectedTable(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div> 
            <div className="text-center space-y-1">
              <p className="text-4xl font-extrabold text-brand-600">
                Table {selectedTable.tableNumber}
              </p>
              <p className="text-sm text-gray-500">
                {selectedTable.seats} seats ·{" "}
                {selectedTable.isOccupied ? "🔴 Occupied" : "🟢 Available"}
              </p>
            </div>
            {(() => {
              const activeOrders = getActiveOrdersForTable(
                selectedTable.tableNumber,
              );
              const allOrders = getAllOrdersForTable(selectedTable.tableNumber);
              if (activeOrders.length > 0) {
                return (
                  <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="text-lg">📋</span>
                    <p className="text-sm font-medium text-brand-700">
                      This table has already placed an order
                    </p>
                  </div>
                );
              }
              if (allOrders.length > 0) {
                return (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="text-lg">✅</span>
                    <p className="text-sm text-gray-500">
                      Previous orders completed today
                    </p>
                  </div>
                );
              }
              return (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-lg">🟢</span>
                  <p className="text-sm text-green-600">
                    No orders yet — table is ready
                  </p>
                </div>
              );
            })()}
            <div
              className="flex justify-center py-3 bg-gray-50 rounded-2xl"
              ref={qrRef}
            >
              <QRCodeSVG
                value={getTableMenuUrl(selectedTable.qrCode)}
                size={180}
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
                onClick={handlePrintQr}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print QR Code
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopyLink}
                  className="btn-secondary text-sm flex items-center justify-center gap-2"
                >
                  <Link className="w-4 h-4" /> Copy Link
                </button>
                <button
                  onClick={handleOpenMenu}
                  className="bg-brand-100 hover:bg-brand-200 text-brand-700 font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2"
                >
                  <ScanLine className="w-4 h-4" /> Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow">
              <ScanLine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">
                Quick<span className="text-brand-500">Serve</span> QR
              </h1>
              <p className="text-xs text-gray-400">
                Select a table to generate QR code
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg hidden sm:block">
                👤 {user.fullName} ({user.role})
              </span>
            )}
            <button
              onClick={() => router.push("/kitchen")}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <ChefHat className="w-4 h-4" /> Kitchen
            </button>
            <button
              onClick={() => router.push("/admin")}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" /> Admin
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 rounded-xl text-red-400"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {!loading && (
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <div className="flex items-center gap-6 bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">
                {tables.length} Tables
              </span>
            </div>
            <div className="h-5 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-gray-600">
                {tables.filter((t) => !t.isOccupied).length} Available
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-gray-600">
                {tables.filter((t) => t.isOccupied).length} Occupied
              </span>
            </div>
            <div className="h-5 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {
                  orders.filter(
                    (o) => o.status !== "Completed" && o.status !== "Cancelled",
                  ).length
                }{" "}
                Active Orders
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[10px] text-gray-400">
                Updated {lastRefresh.toLocaleTimeString()}
              </span>
              <button
                onClick={loadData}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-10">
            {sections.map((section) => {
              const sectionTables = tables.filter(section.filter);
              if (sectionTables.length === 0) return null;
              const info = getSectionInfo(section.seats);

              return (
                <div key={section.seats}>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                    {info.label}
                  </h3>
                  <div className="flex flex-wrap gap-5">
                    {sectionTables.map((table) => {
                      const isOccupied = table.isOccupied;
                      const activeOrders = getActiveOrdersForTable(
                        table.tableNumber,
                      );
                      const hasOrders = activeOrders.length > 0;

                      return (
                        <button
                          key={table.id}
                          type="button"
                          onClick={() => setSelectedTable(table)}
                          className={`relative flex flex-col items-center justify-center rounded-2xl border-2 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 ${
                            section.seats <= 2
                              ? "w-28 h-28 rounded-full"
                              : section.seats <= 4
                                ? "w-32 h-32"
                                : section.seats <= 6
                                  ? "w-36 h-28"
                                  : "w-44 h-32 rounded-3xl"
                          } ${
                            isOccupied
                              ? "bg-gradient-to-br from-red-50 to-red-100 border-red-300 hover:border-red-400"
                              : `bg-gradient-to-br ${info.color}`
                          }`}
                        >
                          {hasOrders && (
                            <div className="absolute -top-3 -right-3 z-10">
                              <div className="relative">
                                <div className="w-7 h-7 bg-brand-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg animate-bounce">
                                  {activeOrders.length}
                                </div>
                                <div className="absolute inset-0 w-7 h-7 bg-brand-500 rounded-full animate-ping opacity-30" />
                              </div>
                            </div>
                          )}

                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-2">
                            {Array.from({
                              length: Math.min(Math.ceil(table.seats / 2), 3),
                            }).map((_, i) => (
                              <div
                                key={`t${i}`}
                                className={`w-4 h-4 rounded-full border-2 shadow-sm ${isOccupied ? "bg-red-300 border-red-400" : info.dot}`}
                              />
                            ))}
                          </div>

                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                            {Array.from({
                              length: Math.min(Math.floor(table.seats / 2), 3),
                            }).map((_, i) => (
                              <div
                                key={`b${i}`}
                                className={`w-4 h-4 rounded-full border-2 shadow-sm ${isOccupied ? "bg-red-300 border-red-400" : info.dot}`}
                              />
                            ))}
                          </div>

                          {table.seats > 4 && (
                            <>
                              <div
                                className={`absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 shadow-sm ${isOccupied ? "bg-red-300 border-red-400" : info.dot}`}
                              />
                              <div
                                className={`absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 shadow-sm ${isOccupied ? "bg-red-300 border-red-400" : info.dot}`}
                              />
                            </>
                          )}

                          <span className="text-2xl font-extrabold text-gray-700">
                            {table.tableNumber}
                          </span>
                          <span className="text-[10px] text-gray-500 mt-0.5">
                            {table.seats} pax
                          </span>

                          {hasOrders ? (
                            <div className="mt-1 flex flex-col items-center gap-0.5">
                              {(() => {
                                const latestOrder = activeOrders[0];
                                const statusConfig: Record<
                                  string,
                                  { bg: string; text: string; icon: string }
                                > = {
                                  Pending: {
                                    bg: "bg-yellow-100",
                                    text: "text-yellow-700",
                                    icon: "⏳",
                                  },
                                  Confirmed: {
                                    bg: "bg-blue-100",
                                    text: "text-blue-700",
                                    icon: "✔️",
                                  },
                                  Preparing: {
                                    bg: "bg-purple-100",
                                    text: "text-purple-700",
                                    icon: "👨‍🍳",
                                  },
                                  Ready: {
                                    bg: "bg-green-100",
                                    text: "text-green-700",
                                    icon: "🔔",
                                  },
                                  Served: {
                                    bg: "bg-gray-100",
                                    text: "text-gray-600",
                                    icon: "🍽️",
                                  },
                                };
                                const cfg =
                                  statusConfig[latestOrder.status] ||
                                  statusConfig.Pending;
                                return (
                                  <span
                                    className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}
                                  >
                                    {cfg.icon} {latestOrder.status}
                                  </span>
                                );
                              })()}
                              {activeOrders.length > 1 && (
                                <span className="text-[8px] text-gray-400">
                                  +{activeOrders.length - 1} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span
                              className={`mt-1 text-[9px] font-semibold px-2 py-0.5 rounded-full ${isOccupied ? "bg-red-200 text-red-700" : info.badge}`}
                            >
                              {isOccupied ? "Occupied" : "Available"}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <ProtectedRoute allowedRoles={["Admin", "Kitchen", "Waiter", "Cashier"]}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
