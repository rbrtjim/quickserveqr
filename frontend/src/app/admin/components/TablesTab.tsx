"use client";
import { useRef, useState } from "react";
import { RestaurantTable } from "@/types";
import { QrCode, Printer, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

function tableMenuUrl(qrCode: string) {
  const base = SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/menu?qr=${encodeURIComponent(qrCode)}`;
}

interface Props {
  tables: RestaurantTable[];
}

export default function TablesTab({ tables }: Props) {
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!qrRef.current || !selectedTable) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Table ${selectedTable.tableNumber}</title>
      <style>body{font-family:Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0}
      .c{text-align:center;padding:40px;border:3px solid #ea580c;border-radius:24px;max-width:360px}
      h1{font-size:28px;margin-bottom:4px;color:#ea580c}h2{font-size:48px;font-weight:bold;margin:8px 0}
      p{color:#666;margin:4px 0;font-size:14px}.qr{margin:24px 0}.s{font-size:18px;font-weight:bold;color:#333;margin-top:16px}
      .u{font-size:10px;color:#999;word-break:break-all;margin-top:12px}.f{font-size:11px;color:#999;margin-top:20px}</style></head>
      <body><div class="c"><h1>QuickServe QR</h1><h2>Table ${selectedTable.tableNumber}</h2>
      <p>${selectedTable.seats} seats</p><div class="qr">${qrRef.current.innerHTML}</div>
      <p class="s">📱 Scan to view menu & order</p>
      <p class="u">${tableMenuUrl(selectedTable.qrCode)}</p>
      <div class="f">Powered by QuickServe QR</div></div></body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <>
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <QrCode className="w-5 h-5 text-brand-500" /> Table QR Code
              </h2>
              <button onClick={() => setSelectedTable(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center space-y-1">
              <p className="text-5xl font-extrabold text-brand-600">Table {selectedTable.tableNumber}</p>
              <p className="text-sm text-gray-500">
                {selectedTable.seats} seats · {selectedTable.isOccupied ? "🔴 Occupied" : "🟢 Available"}
              </p>
            </div>
            <div className="flex justify-center py-4 bg-gray-50 rounded-2xl" ref={qrRef}>
              <QRCodeSVG value={tableMenuUrl(selectedTable.qrCode)} size={200} level="H" includeMargin bgColor="#FFFFFF" fgColor="#1a1a2e" />
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Menu URL:</p>
              <p className="text-xs font-mono text-brand-600 break-all">{tableMenuUrl(selectedTable.qrCode)}</p>
            </div>
            <div className="space-y-2">
              <button onClick={handlePrint} className="w-full btn-primary flex items-center justify-center gap-2">
                <Printer className="w-4 h-4" /> Print QR Code
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(tableMenuUrl(selectedTable.qrCode)); }}
                className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
              >
                📋 Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

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
            <span className={`badge mt-2 ${t.isOccupied ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
              {t.isOccupied ? "Occupied" : "Available"}
            </span>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-brand-500 font-medium">
              <QrCode className="w-3 h-3" /> View QR
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
