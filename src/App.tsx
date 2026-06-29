/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Calculator, TrendingUp, Sparkles } from "lucide-react";
import BillCalculator from "./components/BillCalculator";
import DailySales from "./components/DailySales";
import { BillItem, SalesEntry } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"bill" | "sales">("bill");

  // Shared state for the bill so switching tabs doesn't clear work-in-progress bills
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [clientName, setClientName] = useState("");
  const [discount, setDiscount] = useState<number>(0);

  // Safe local date key generator
  const getLocalDateKey = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `saloon_sales_${year}-${month}-${day}`;
  };

  const storageKey = getLocalDateKey();

  // Load daily sales from localStorage on mount
  const [sales, setSales] = useState<SalesEntry[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keep state updated in localStorage when sales change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(sales));
  }, [sales, storageKey]);

  // Handle adding sale entry automatically or manually
  const handleAddSaleEntry = (name: string, amount: number) => {
    const timeStr = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const newEntry: SalesEntry = {
      id: `sales-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      amount: amount,
      time: timeStr,
    };

    setSales((prev) => [newEntry, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800 antialiased selection:bg-blue-100">
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200" id="main-header">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-50 p-1.5 rounded-lg border border-blue-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-gray-900 leading-tight">
                Shruti Beauty Saloon & Academy
              </h1>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                Owner's Portal
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* STICKY TABS */}
      <nav className="sticky top-[58px] z-40 bg-white border-b border-gray-200" id="navigation-tabs">
        <div className="max-w-md mx-auto px-4 flex">
          <button
            onClick={() => setActiveTab("bill")}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "bill"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
            id="tab-bill-calculator"
          >
            <Calculator className="w-4 h-4" />
            <span>Bill Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab("sales")}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "sales"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
            id="tab-daily-sales"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Daily Sales</span>
          </button>
        </div>
      </nav>

      {/* MAIN VIEW */}
      <main className="flex-grow w-full">
        {activeTab === "bill" ? (
          <BillCalculator
            billItems={billItems}
            setBillItems={setBillItems}
            clientName={clientName}
            setClientName={setClientName}
            discount={discount}
            setDiscount={setDiscount}
            onAddSaleEntry={handleAddSaleEntry}
          />
        ) : (
          <DailySales sales={sales} setSales={setSales} />
        )}
      </main>
    </div>
  );
}
