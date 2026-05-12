"use client";
import { useState } from "react";
import { Order, OrderStatus } from "@/types";
import {
  ArrowRight, XCircle, CheckCircle2,
  DollarSign, CreditCard,
} from "lucide-react";

const nextStatus: Record<string, OrderStatus> = {
  Pending: "Confirmed", Confirmed: "Preparing", Preparing: "Ready",
  Ready: "Served", Served: "Completed",
};
const nextLabel: Record<string, string> = {
  Pending: "Accept", Confirmed: "Prepare", Preparing: "Ready",
  Ready: "Served", Served: "Complete",
};
const statusColors: Record<string, string> = {
  Pending:   "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Preparing: "bg-purple-100 text-purple-700",
  Ready:     "bg-green-100 text-green-700",
  Served:    "bg-gray-100 text-gray-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-red-100 text-red-700",
};

interface Props {
  orders: Order[];
  onStatusUpdate: (id: string, status: OrderStatus) => Promise<void>;
  onPayment: (id: string, method: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

export default function OrdersTab({ orders, onStatusUpdate, onPayment, onCancel }: Props) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  if (orders.length === 0)
    return <p className="text-center text-gray-400 py-12">No orders</p>;

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <div key={o.id} className="card">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
          >
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-lg font-bold">#{o.orderNumber}</span>
              <span className="text-sm text-gray-500">Table {o.tableNumber}</span>
              <span className={`badge ${statusColors[o.status]}`}>{o.status}</span>
              <span className={`badge ${o.paymentStatus === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {o.paymentStatus === "Paid" ? "💰 Paid" : "⏳ Unpaid"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg">${o.total.toFixed(2)}</span>
              <ArrowRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedOrder === o.id ? "rotate-90" : ""}`} />
            </div>
          </div>

          {expandedOrder === o.id && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Items:</p>
                {o.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-1 text-sm">
                    <span>
                      <span className="font-medium text-brand-600">{item.quantity}x</span>{" "}
                      {item.menuItemName}
                      {item.specialInstructions && (
                        <span className="text-gray-400 text-xs ml-1">({item.specialInstructions})</span>
                      )}
                    </span>
                    <span className="font-medium">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 mt-2 border-t border-gray-50 text-sm text-gray-500">
                  <span>Subtotal</span><span>${o.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tax</span><span>${o.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1">
                  <span>Total</span>
                  <span className="text-brand-600">${o.total.toFixed(2)}</span>
                </div>
              </div>

              {o.status !== "Completed" && o.status !== "Cancelled" && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {nextStatus[o.status] && (
                    <button
                      onClick={() => onStatusUpdate(o.id, nextStatus[o.status])}
                      className="btn-primary text-sm py-2 flex items-center gap-1"
                    >
                      <ArrowRight className="w-4 h-4" /> {nextLabel[o.status]}
                    </button>
                  )}

                  {confirmCancelId === o.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Cancel order?</span>
                      <button
                        onClick={() => { onCancel(o.id); setConfirmCancelId(null); }}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-3 rounded-xl transition"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmCancelId(null)}
                        className="bg-gray-200 hover:bg-gray-300 text-sm font-semibold py-2 px-3 rounded-xl transition"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmCancelId(o.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-600 font-semibold py-2 px-4 rounded-xl text-sm flex items-center gap-1 transition"
                    >
                      <XCircle className="w-4 h-4" /> Cancel
                    </button>
                  )}
                </div>
              )}

              {o.paymentStatus === "Unpaid" && o.status !== "Cancelled" && (
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <p className="text-sm font-semibold text-gray-700">💳 Payment</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onPayment(o.id, "Cash")}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl text-sm flex items-center gap-1 transition"
                    >
                      <DollarSign className="w-4 h-4" /> Cash
                    </button>
                    <button
                      onClick={() => onPayment(o.id, "Card")}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl text-sm flex items-center gap-1 transition"
                    >
                      <CreditCard className="w-4 h-4" /> Card
                    </button>
                    <button
                      onClick={() => onPayment(o.id, "Digital")}
                      className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-xl text-sm flex items-center gap-1 transition"
                    >
                      💳 Digital
                    </button>
                  </div>
                </div>
              )}

              {o.paymentStatus === "Paid" && (
                <div className="flex items-center gap-2 text-green-600 font-medium pt-2 border-t border-gray-100">
                  <CheckCircle2 className="w-5 h-5" /> Paid via {o.paymentMethod}
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
      ))}
    </div>
  );
}
