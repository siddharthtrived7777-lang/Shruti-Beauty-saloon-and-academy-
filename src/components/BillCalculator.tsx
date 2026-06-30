import React, { useState, useMemo } from "react";
import { Search, User, Plus, Minus, Send, ArrowLeft, Trash2, Check, QrCode } from "lucide-react";
import { Service, BillItem } from "../types";
import { SERVICES, CATEGORIES } from "../data";

interface BillCalculatorProps {
  billItems: BillItem[];
  setBillItems: React.Dispatch<React.SetStateAction<BillItem[]>>;
  clientName: string;
  setClientName: (name: string) => void;
  discount: number;
  setDiscount: (discount: number) => void;
  onAddSaleEntry: (name: string, amount: number, items?: string[], clientName?: string, discount?: number) => void;
}

export default function BillCalculator({
  billItems,
  setBillItems,
  clientName,
  setClientName,
  discount,
  setDiscount,
  onAddSaleEntry,
}: BillCalculatorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isViewingBill, setIsViewingBill] = useState(false);
  const [showPaymentQr, setShowPaymentQr] = useState(false);

  // Filtered services based on search and category
  const filteredServices = useMemo(() => {
    return SERVICES.filter((service) => {
      const matchesCategory =
        selectedCategory === "All" || service.category === selectedCategory;
      const matchesSearch = service.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Helper to get selected quantity for a service
  const getServiceQuantity = (serviceId: string) => {
    const item = billItems.find((i) => i.service.id === serviceId);
    return item ? item.quantity : 0;
  };

  // Add item / increment quantity
  const handleAddService = (service: Service) => {
    setBillItems((prev) => {
      const existing = prev.find((item) => item.service.id === service.id);
      if (existing) {
        return prev.map((item) =>
          item.service.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { service, quantity: 1 }];
    });
  };

  // Decrement quantity
  const handleDecrementService = (serviceId: string) => {
    setBillItems((prev) => {
      const existing = prev.find((item) => item.service.id === serviceId);
      if (existing) {
        if (existing.quantity <= 1) {
          return prev.filter((item) => item.service.id !== serviceId);
        }
        return prev.map((item) =>
          item.service.id === serviceId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev;
    });
  };

  // Set specific quantity directly
  const handleRemoveService = (serviceId: string) => {
    setBillItems((prev) => prev.filter((item) => item.service.id !== serviceId));
  };

  // Calculations
  const subtotal = useMemo(() => {
    return billItems.reduce((acc, item) => acc + item.service.price * item.quantity, 0);
  }, [billItems]);

  const discountAmount = useMemo(() => {
    return Math.round((subtotal * discount) / 100);
  }, [subtotal, discount]);

  const grandTotal = subtotal - discountAmount;

  const totalItemCount = useMemo(() => {
    return billItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [billItems]);

  const handleClearBill = () => {
    if (window.confirm("Are you sure you want to clear the current bill?")) {
      setBillItems([]);
      setClientName("");
      setDiscount(0);
      setIsViewingBill(false);
    }
  };

  // Format with Indian number system
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // Share via WhatsApp - Opens modal
  const handleOpenShareModal = () => {
    setIsShareModalOpen(true);
  };

  const handleConfirmShareWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean number to keep only digits
    let cleanNumber = whatsappNumber.replace(/\D/g, "");
    
    if (cleanNumber.length === 10) {
      // Auto-prefix India country code for 10-digit numbers
      cleanNumber = "91" + cleanNumber;
    }
    
    if (!cleanNumber || cleanNumber.length < 7) {
      alert("Please enter a valid WhatsApp number.");
      return;
    }

    const dateStr = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    let message = `*Shruti Beauty Saloon & Academy*\n`;
    message += `==============================\n`;
    if (clientName.trim()) {
      message += `*Client:* ${clientName.trim()}\n`;
    }
    message += `*Date:* ${dateStr}\n`;
    message += `==============================\n\n`;

    billItems.forEach((item, index) => {
      const itemTotal = item.service.price * item.quantity;
      message += `${index + 1}. ${item.service.name} (${formatCurrency(item.service.price)} x ${item.quantity}) = ${formatCurrency(itemTotal)}\n`;
    });

    message += `\n------------------------------\n`;
    message += `*Subtotal:* ${formatCurrency(subtotal)}\n`;
    if (discount > 0) {
      message += `*Discount (${discount}%):* -${formatCurrency(discountAmount)}\n`;
    }
    message += `------------------------------\n`;
    message += `*Grand Total: ${formatCurrency(grandTotal)}*\n\n`;
    message += `Thank you for visiting! We look forward to seeing you again. ✨`;

    // Record into Daily Sales portal automatically
    const itemSummary = billItems.map((item) => `${item.service.name} x${item.quantity}`).join(", ");
    let saleName = clientName.trim()
      ? `Bill: ${clientName.trim()} (${itemSummary})`
      : `Bill: ${itemSummary}`;
    if (saleName.length > 50) {
      saleName = saleName.substring(0, 47) + "...";
    }
    const itemDetailsList = billItems.map(
      (item) => `${item.service.name} (${formatCurrency(item.service.price)} × ${item.quantity}) = ${formatCurrency(item.service.price * item.quantity)}`
    );
    onAddSaleEntry(saleName, grandTotal, itemDetailsList, clientName.trim() || undefined, discount);

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
    setIsShareModalOpen(false);
  };

  if (isViewingBill) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-130px)] bg-gray-50 pb-20">
        {/* Top Header Navigation */}
        <div className="sticky top-[110px] z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsViewingBill(false)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            id="back-to-services"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Services</span>
          </button>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Bill Details
          </span>
        </div>

        <div className="p-4 max-w-md mx-auto w-full flex-grow flex flex-col gap-4">
          {/* Client Info Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4" id="client-info-card">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Client Name (Optional)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter client name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                id="client-name-input"
              />
            </div>
          </div>

          {/* Bill Items Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex-grow" id="bill-items-card">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-3">
              <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Added Services</h3>
              <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
                {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
              </span>
            </div>

            {billItems.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No items added to the bill.
                <button
                  onClick={() => setIsViewingBill(false)}
                  className="block mx-auto mt-3 text-xs text-blue-600 font-semibold hover:underline"
                >
                  Browse Services
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[280px] overflow-y-auto pr-1">
                {billItems.map((item) => (
                  <div
                    key={item.service.id}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {item.service.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatCurrency(item.service.price)} each
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Controls */}
                      <div className="flex items-center border border-gray-200 rounded-md bg-white">
                        <button
                          onClick={() => handleDecrementService(item.service.id)}
                          className="p-1 hover:bg-gray-50 text-gray-500 rounded-l-md"
                          title="Decrease"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-gray-800 w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleAddService(item.service)}
                          className="p-1 hover:bg-gray-50 text-gray-500 rounded-r-md"
                          title="Increase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Total & Remove */}
                      <div className="flex items-center gap-2 min-w-[70px] justify-end">
                        <span className="text-xs font-semibold text-gray-800">
                          {formatCurrency(item.service.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => handleRemoveService(item.service.id)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Discount Selector */}
          <div className="bg-white rounded-lg border border-gray-200 p-4" id="discount-card">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Apply Discount
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[0, 5, 10, 15, 20].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setDiscount(pct)}
                  className={`py-2 text-xs font-semibold rounded-md border transition-all ${
                    discount === pct
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Summary Block (Blue Card) */}
          <div className="bg-blue-600 rounded-lg text-white p-4 shadow-sm" id="billing-total-card">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs text-blue-100 font-medium">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs text-blue-100 font-medium">
                  <span>Discount ({discount}%)</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="h-[1px] bg-blue-500 my-1" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold tracking-wider uppercase">Grand Total</span>
                <span className="text-2xl font-bold tracking-tight">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Payment QR Block */}
          {showPaymentQr ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col items-center justify-center text-center animate-fade-in" id="payment-qr-card">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Scan & Pay {formatCurrency(grandTotal)}
              </span>
              <div className="bg-white p-2 border border-gray-100 rounded-lg shadow-inner mb-3">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=8000167776@ybl&pn=Shruti Beauty Saloon&am=${grandTotal}&cu=INR&tn=Beauty Services`)}`}
                  alt="UPI QR Code"
                  className="w-[220px] h-[220px]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-sm font-bold text-gray-800">
                UPI: 8000167776@ybl
              </span>
              <span className="text-[10px] text-gray-400 mt-1 font-semibold tracking-wide uppercase">
                PhonePe • GPay • Paytm • Any UPI App
              </span>
              <button
                onClick={() => setShowPaymentQr(false)}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                id="hide-qr-button"
              >
                Hide QR
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowPaymentQr(true)}
              disabled={billItems.length === 0}
              className={`w-full py-2.5 px-4 bg-white font-semibold rounded-lg border text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                billItems.length === 0
                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                  : "border-blue-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50/50"
              }`}
              id="show-qr-button"
            >
              <QrCode className="w-4 h-4" />
              <span>Show Payment QR</span>
            </button>
          )}

          {/* Actions */}
          <div className="grid grid-cols-1 gap-2 mt-2">
            <button
              onClick={handleOpenShareModal}
              disabled={billItems.length === 0}
              className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer ${
                billItems.length === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              id="whatsapp-share-button"
            >
              <Send className="w-4 h-4" />
              <span>Share Bill via WhatsApp</span>
            </button>

            <button
              onClick={handleClearBill}
              className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 font-medium rounded-lg border border-gray-200 text-sm transition-colors cursor-pointer"
              id="clear-bill-button"
            >
              Clear Bill
            </button>
          </div>
        </div>

        {/* WhatsApp Share Modal */}
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fade-in" id="whatsapp-modal-overlay">
            <div className="bg-white rounded-lg border border-gray-200 p-5 w-full max-w-sm shadow-xl" id="whatsapp-modal-content">
              <h3 className="font-bold text-gray-900 text-base mb-1">Enter WhatsApp Number</h3>
              <p className="text-xs text-gray-500 mb-4">
                Enter the client's mobile number to send the formatted bill directly to their WhatsApp chat.
              </p>

              <form onSubmit={handleConfirmShareWhatsApp} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="whatsapp-input" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    WhatsApp Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-gray-400">
                      +
                    </span>
                    <input
                      id="whatsapp-input"
                      type="tel"
                      placeholder="91 98765 43210"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full pl-7 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white font-medium"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 leading-normal">
                    Tip: Enter a 10-digit number (e.g. 9876543210). India code (91) is automatically added if exactly 10 digits are typed.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(false)}
                    className="py-2 px-3 bg-white border border-gray-200 hover:bg-gray-50 rounded text-xs font-semibold text-gray-600 transition-colors cursor-pointer"
                    id="cancel-share-button"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    id="confirm-share-button"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Open Chat</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-130px)] bg-gray-50 pb-24">
      {/* Sticky Filters Block */}
      <div className="sticky top-[110px] z-20 bg-white border-b border-gray-200 py-3 px-4 flex flex-col gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search services or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-gray-50"
            id="service-search"
          />
        </div>

        {/* Categories Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="p-4 max-w-md mx-auto w-full flex-grow">
        {filteredServices.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No services found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3" id="services-grid">
            {filteredServices.map((service) => {
              const qty = getServiceQuantity(service.id);
              return (
                <div
                  key={service.id}
                  onClick={() => handleAddService(service)}
                  className={`relative bg-white rounded-lg p-3.5 border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[105px] select-none ${
                    qty > 0
                      ? "border-blue-600 ring-1 ring-blue-600"
                      : "border-gray-200 hover:border-blue-400"
                  }`}
                  id={`service-card-${service.id}`}
                >
                  {/* Quantity Badge */}
                  {qty > 0 && (
                    <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                      {qty}
                    </span>
                  )}

                  <div className="pr-5">
                    <span className="text-[10px] uppercase tracking-wider text-blue-600 font-semibold block mb-0.5">
                      {service.category}
                    </span>
                    <h4 className="text-sm font-semibold text-gray-800 leading-tight">
                      {service.name}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(service.price)}
                    </span>
                    {qty > 0 ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDecrementService(service.id);
                          }}
                          className="p-1 bg-gray-50 hover:bg-gray-100 rounded text-gray-600 border border-gray-200"
                          title="Reduce"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        Add +
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Bar */}
      {billItems.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3.5 px-4 shadow-lg z-30 flex items-center justify-between"
          id="bill-floating-bar"
        >
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {totalItemCount} {totalItemCount === 1 ? "Service" : "Services"}
            </span>
            <span className="text-lg font-bold text-gray-900 leading-none mt-0.5">
              {formatCurrency(subtotal)}
            </span>
          </div>

          <button
            onClick={() => setIsViewingBill(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            id="view-bill-trigger"
          >
            <span>View Bill</span>
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
}
