import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Calendar, AlertCircle, X, Receipt } from "lucide-react";
import { SalesEntry } from "../types";

interface DailySalesProps {
  sales: SalesEntry[];
  setSales: React.Dispatch<React.SetStateAction<SalesEntry[]>>;
}

export default function DailySales({ sales, setSales }: DailySalesProps) {
  // Form State
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  // Selected entry for viewing details
  const [selectedEntry, setSelectedEntry] = useState<SalesEntry | null>(null);

  // Confirmation state for clearing
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Today's date nicely formatted
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // Running Total
  const runningTotal = useMemo(() => {
    return sales.reduce((acc, entry) => acc + entry.amount, 0);
  }, [sales]);

  // Format with Indian numbering system
  const formatCurrency = (amt: number) => {
    return `₹${amt.toLocaleString("en-IN")}`;
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount.trim()) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const timeStr = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const newEntry: SalesEntry = {
      id: `sales-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      amount: parsedAmount,
      time: timeStr,
    };

    setSales((prev) => [newEntry, ...prev]);
    setName("");
    setAmount("");
  };

  const handleDeleteEntry = (id: string) => {
    setSales((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleClearData = () => {
    setSales([]);
    setShowClearConfirm(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto w-full flex flex-col gap-5 bg-gray-50 min-h-[calc(100vh-130px)] pb-12">
      {/* Date & Running Total Blue Card */}
      <div className="bg-blue-600 rounded-lg text-white p-5 shadow-sm" id="sales-running-total-card">
        <div className="flex items-center gap-2 text-blue-100 text-xs font-semibold tracking-wide uppercase">
          <Calendar className="w-4 h-4" />
          <span>{todayFormatted}</span>
        </div>
        <div className="mt-3 flex flex-col">
          <span className="text-xs text-blue-100 font-medium uppercase tracking-wider">
            Today's Running Total
          </span>
          <span className="text-3xl font-extrabold tracking-tight mt-1" id="running-total-amount">
            {formatCurrency(runningTotal)}
          </span>
        </div>
      </div>

      {/* Quick Entry Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-4" id="sales-quick-entry">
        <h3 className="font-semibold text-gray-800 text-xs uppercase tracking-wider mb-3">
          Quick Sales Entry
        </h3>
        <form onSubmit={handleAddEntry} className="flex flex-col gap-3">
          <div>
            <label htmlFor="service-name" className="block text-xs font-medium text-gray-500 mb-1">
              Service / Item Name
            </label>
            <input
              id="service-name"
              type="text"
              placeholder="e.g. Haircut or Product Sale"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
            />
          </div>

          <div>
            <label htmlFor="service-amount" className="block text-xs font-medium text-gray-500 mb-1">
              Amount (₹)
            </label>
            <input
              id="service-amount"
              type="number"
              inputMode="numeric"
              placeholder="e.g. 200"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            id="add-sale-button"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </form>
      </div>

      {/* Entries List Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex-grow flex flex-col" id="sales-entries-list">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-2">
          <h3 className="font-semibold text-gray-800 text-xs uppercase tracking-wider">
            Today's Entries
          </h3>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">
            {sales.length} entries
          </span>
        </div>

        {sales.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm my-auto">
            No entries recorded for today yet.
          </div>
        ) : (
          <div className="flex flex-col flex-grow">
            <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto pr-1">
              {sales.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className="flex items-center justify-between py-2.5 hover:bg-gray-50/80 px-2 -mx-2 rounded-md transition-all cursor-pointer group"
                  title="Click to view details"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                      {entry.name}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-gray-400">{entry.time}</span>
                      {entry.items && entry.items.length > 0 && (
                        <span className="text-[9px] bg-blue-50 text-blue-600 px-1 py-0.2 rounded font-semibold tracking-wide uppercase">
                          Bill Details
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="text-sm font-semibold text-[#059669]">
                      {formatCurrency(entry.amount)}
                    </span>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                      title="Delete entry"
                    >
                      <span className="text-lg font-light leading-none">×</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Footer inside the list card */}
            <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Grand Total
              </span>
              <span className="text-lg font-extrabold text-[#059669]" id="sales-grand-total">
                {formatCurrency(runningTotal)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Clear Action Button */}
      {sales.length > 0 && (
        <div className="mt-2" id="clear-today-container">
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 font-medium rounded-lg border border-gray-200 text-sm transition-all"
              id="clear-sales-trigger"
            >
              Clear Today's Data
            </button>
          ) : (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex flex-col gap-3 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-red-800">Confirm Deletion</span>
                  <p className="text-[11px] text-red-600 leading-normal">
                    This will permanently delete all sales logs for today. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="py-1.5 px-3 bg-white border border-gray-200 hover:bg-gray-50 rounded text-xs font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearData}
                  className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold"
                  id="confirm-clear-sales-button"
                >
                  Yes, Clear Data
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Entry Details Modal */}
      {selectedEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fade-in"
          id="entry-details-modal-overlay"
          onClick={() => setSelectedEntry(null)}
        >
          <div
            className="bg-white rounded-lg border border-gray-200 p-5 w-full max-w-sm shadow-xl flex flex-col gap-4"
            id="entry-details-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-4.5 h-4.5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-base">Sales Entry Detail</h3>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex flex-col gap-3">
              {/* Common Info */}
              <div className="grid grid-cols-2 gap-y-2 text-xs border-b border-gray-50 pb-3">
                <div className="text-gray-400 font-medium">Recorded Time</div>
                <div className="text-gray-800 font-semibold text-right">{selectedEntry.time}</div>

                <div className="text-gray-400 font-medium">Entry Total</div>
                <div className="text-[#059669] font-bold text-sm text-right">
                  {formatCurrency(selectedEntry.amount)}
                </div>
              </div>

              {/* Bill Details if exist */}
              {selectedEntry.items && selectedEntry.items.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {selectedEntry.clientName && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-medium">Client Name</span>
                      <span className="text-gray-800 font-semibold">{selectedEntry.clientName}</span>
                    </div>
                  )}

                  {selectedEntry.discount !== undefined && selectedEntry.discount > 0 && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-medium">Discount Code / Value</span>
                      <span className="text-blue-600 font-semibold">{selectedEntry.discount}% Off</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Included Items ({selectedEntry.items.length})
                    </span>
                    <div className="bg-gray-50 rounded-md border border-gray-100 p-2.5 max-h-[160px] overflow-y-auto flex flex-col gap-1.5">
                      {selectedEntry.items.map((item, idx) => (
                        <div key={idx} className="text-xs text-gray-700 leading-normal border-b border-gray-100/50 pb-1 last:border-0 last:pb-0">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Label</span>
                    <span className="text-gray-800 font-semibold">{selectedEntry.name}</span>
                  </div>
                  <div className="bg-gray-50 rounded-md border border-gray-100 p-2.5 text-xs text-gray-500 italic text-center">
                    This is a quick entry added directly to the daily sales.
                  </div>
                </div>
              )}
            </div>

            {/* Footer button */}
            <button
              onClick={() => setSelectedEntry(null)}
              className="w-full mt-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-md transition-colors cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
