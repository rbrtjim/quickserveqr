"use client";
import { DashboardAnalytics } from "@/types";
import { DollarSign, ShoppingBag, ChefHat, TrendingUp } from "lucide-react";

interface Props {
  analytics: DashboardAnalytics;
}

export default function DashboardTab({ analytics }: Props) {
  const stats = [
    { label: "Total Orders",  value: analytics.totalOrders,                         icon: <ShoppingBag className="w-6 h-6" />, color: "text-blue-500 bg-blue-50" },
    { label: "Revenue",       value: `$${analytics.totalRevenue.toFixed(2)}`,        icon: <DollarSign  className="w-6 h-6" />, color: "text-green-500 bg-green-50" },
    { label: "Active Orders", value: analytics.activeOrders,                         icon: <ChefHat     className="w-6 h-6" />, color: "text-purple-500 bg-purple-50" },
    { label: "Avg Order",     value: `$${analytics.averageOrderValue.toFixed(2)}`,   icon: <TrendingUp  className="w-6 h-6" />, color: "text-brand-500 bg-brand-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
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
              <div key={item.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{item.quantity} sold</p>
                  <p className="text-xs text-gray-400">${item.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <h3 className="font-bold mb-4">🪑 Tables</h3>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-brand-500">{analytics.tablesOccupied}</p>
              <p className="text-xs text-gray-400">Occupied</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{analytics.totalTables - analytics.tablesOccupied}</p>
              <p className="text-xs text-gray-400">Available</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{analytics.totalTables}</p>
              <p className="text-xs text-gray-400">Total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
