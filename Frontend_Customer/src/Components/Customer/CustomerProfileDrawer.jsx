import React, { useState, useEffect, useCallback } from "react";
import {
  FaTimes,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaHome,
  FaBriefcase,
  FaBed,
  FaTrashAlt,
  FaPlus,
  FaBolt,
  FaReceipt,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronUp,
  FaSpinner,
  FaRegClock,
  FaCheckCircle,
  FaUtensils,
  FaMotorcycle,
  FaTimesCircle,
  FaStar,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { useAuth } from "../../Context/AuthContext";
import { useCart } from "../../Context/CartContext";
import { API_BASE } from "../../config/api";
import OrderReviewModal from "./OrderReviewModal";

export default function CustomerProfileDrawer() {
  const {
    customer,
    isAuthenticated,
    isProfileDrawerOpen,
    profileDrawerTab,
    setProfileDrawerTab,
    closeProfileDrawer,
    logout,
    savedAddresses,
    loadingAddresses,
    addAddress,
    deleteAddress,
    fetchAddresses,
  } = useAuth();

  const { addToCart, setIsCartOpen } = useCart();

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewedOrderIds, setReviewedOrderIds] = useState(() => {
    try {
      const saved = localStorage.getItem("bigbite_reviewed_orders") || localStorage.getItem("quickbite_reviewed_orders");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Add Address Form State
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newLabel, setNewLabel] = useState("Home");
  const [newAddressLine, setNewAddressLine] = useState("");
  const [newArea, setNewArea] = useState("");
  const [newLandmark, setNewLandmark] = useState("");
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // Fetch past orders for authenticated customer
  const fetchCustomerOrders = useCallback(async () => {
    if (!customer?.id && !customer?.phone && !customer?.email) {
      setOrders([]);
      return;
    }

    setLoadingOrders(true);
    try {
      const res = await fetch(`${API_BASE}/get_customer_orders.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customer.id || 0,
          phone: customer.phone || "",
          email: customer.email || "",
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching customer orders:", err);
      toast.error("Could not load past orders.");
    } finally {
      setLoadingOrders(false);
    }
  }, [customer?.id, customer?.phone, customer?.email]);

  useEffect(() => {
    if (isProfileDrawerOpen && isAuthenticated) {
      if (profileDrawerTab === "orders") {
        fetchCustomerOrders();
      } else if (profileDrawerTab === "addresses") {
        fetchAddresses(customer?.id);
      }
    }
  }, [isProfileDrawerOpen, isAuthenticated, profileDrawerTab, fetchCustomerOrders, fetchAddresses, customer?.id]);

  if (!isProfileDrawerOpen || !isAuthenticated) return null;

  // 1-Click Reorder Handler with Live Catalog Revalidation
  const handleReorder = async (order) => {
    if (!order.items || order.items.length === 0) {
      toast.error("This order has no item details to reorder.");
      return;
    }

    const reorderToast = toast.loading("Checking live menu prices & availability...");
    let liveMenuItems = [];

    try {
      const res = await fetch(`${API_BASE}/get_menu.php`);
      const data = await res.json();
      if (Array.isArray(data)) {
        liveMenuItems = data;
      } else if (data && Array.isArray(data.data)) {
        liveMenuItems = data.data;
      } else if (data && Array.isArray(data.menu)) {
        liveMenuItems = data.menu;
      }
    } catch (err) {
      console.warn("Could not fetch live menu for reorder, falling back to cached prices:", err);
    }

    toast.dismiss(reorderToast);

    let addedCount = 0;
    let skippedCount = 0;

    order.items.forEach((item) => {
      const itemId = item.menu_item_id || item.item_id || item.id;
      const itemName = item.title || item.name || item.item_name || "Food Item";

      // Match item against active live menu catalog
      const matchedItem = liveMenuItems.find(
        (m) =>
          String(m.id) === String(itemId) ||
          (m.name && itemName && m.name.trim().toLowerCase() === itemName.trim().toLowerCase())
      );

      // Check stock and active availability
      const isAvailable = matchedItem
        ? matchedItem.isAvailable !== false &&
          matchedItem.is_available !== 0 &&
          matchedItem.isAvailable !== 0 &&
          matchedItem.is_available !== "0" &&
          matchedItem.isAvailable !== "0" &&
          matchedItem.inStock !== false &&
          matchedItem.inStock !== 0 &&
          matchedItem.inStock !== "0"
        : true;

      if (!isAvailable) {
        skippedCount += 1;
        toast.error(`"${itemName}" is currently out of stock and was not reordered.`, {
          duration: 4500,
        });
        return;
      }

      // Check live price: variant price if available, else base price, fallback to historical
      let livePrice = matchedItem ? Number(matchedItem.price) : Number(item.price || 0);
      const itemSize = item.size || "Regular";

      if (matchedItem && Array.isArray(matchedItem.variants) && matchedItem.variants.length > 0) {
        const matchedVariant = matchedItem.variants.find(
          (v) => (v.size || v.name || v.size_name || "").trim().toLowerCase() === itemSize.trim().toLowerCase()
        );
        if (matchedVariant && matchedVariant.price) {
          livePrice = Number(matchedVariant.price);
        }
      }

      let parsedAddons = [];
      if (item.addons) {
        try {
          parsedAddons = typeof item.addons === "string" ? JSON.parse(item.addons) : item.addons;
        } catch {
          parsedAddons = [];
        }
      }

      addToCart({
        id: matchedItem ? matchedItem.id : itemId,
        menuItemId: matchedItem ? matchedItem.id : itemId,
        name: itemName,
        title: itemName,
        price: livePrice,
        qty: parseInt(item.qty || item.quantity || 1, 10),
        size: itemSize,
        note: item.note || "",
        selectedAddons: parsedAddons,
        img: matchedItem?.img || matchedItem?.image || item.img || item.image || "",
      });
      addedCount += 1;
    });

    closeProfileDrawer();
    if (addedCount > 0) {
      setIsCartOpen(true);
      toast.success(`⚡ Reorder successful! Added ${addedCount} items to your cart at current prices.`);
    } else if (skippedCount > 0) {
      toast.error("All items in this order are currently out of stock.");
    }
  };

  // Review submission callback
  const handleReviewSubmitted = (orderId, reviewData) => {
    setReviewedOrderIds((prev) => {
      const updated = { ...prev, [orderId]: reviewData };
      try {
        localStorage.setItem("bigbite_reviewed_orders", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Add Address Submit
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!newAddressLine.trim()) {
      toast.error("Please enter your complete address.");
      return;
    }

    setSavingAddress(true);
    const shouldBeDefault = newIsDefault || savedAddresses.length === 0;
    const res = await addAddress({
      label: newLabel,
      address_line: newAddressLine.trim(),
      area: newArea.trim(),
      landmark: newLandmark.trim(),
      is_default: shouldBeDefault ? 1 : 0,
    });
    setSavingAddress(false);

    if (res.success) {
      setShowAddAddressForm(false);
      setNewAddressLine("");
      setNewArea("");
      setNewLandmark("");
      setNewIsDefault(false);
    }
  };

  const getStatusBadge = (status = "") => {
    const s = status.toLowerCase();
    if (s.includes("delivered") || s.includes("completed")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
          <FaCheckCircle className="text-[9px]" /> Delivered
        </span>
      );
    }
    if (
      s.includes("dispatch") ||
      s.includes("way") ||
      s.includes("ready") ||
      s.includes("pickup") ||
      s.includes("out") ||
      s.includes("delivery") ||
      s.includes("rider")
    ) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
          <FaMotorcycle className="text-[9px]" /> {s.includes("pickup") ? "Ready for Pickup" : "Out for Delivery"}
        </span>
      );
    }
    if (s.includes("cook") || s.includes("prepar") || s.includes("kitchen")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 text-[10px] font-bold uppercase tracking-wider">
          <FaUtensils className="text-[9px]" /> In Kitchen
        </span>
      );
    }
    if (s.includes("cancel") || s.includes("decline")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider">
          <FaTimesCircle className="text-[9px]" /> Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
        <FaRegClock className="text-[9px]" /> Pending
      </span>
    );
  };

  const getAddressIcon = (label = "") => {
    switch (label.toLowerCase()) {
      case "home":
        return <FaHome className="text-amber-500" />;
      case "work":
      case "office":
        return <FaBriefcase className="text-blue-500" />;
      case "hostel":
        return <FaBed className="text-purple-500" />;
      default:
        return <FaMapMarkerAlt className="text-emerald-500" />;
    }
  };

  const initials = customer?.full_name
    ? customer.full_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "QB";

  return (
    <div className="fixed inset-0 z-[999] overflow-hidden animate-fadeIn">
      {/* Dark Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeProfileDrawer}
      />

      {/* Slide-over Right Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-white dark:bg-[#0e0e11] border-l border-zinc-200 dark:border-neutral-800 text-zinc-900 dark:text-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
          {/* ═══════════════════════════════════════
              DRAWER TOP PROFILE HEADER
              ═══════════════════════════════════════ */}
          <div className="p-5 sm:p-6 bg-gradient-to-b from-zinc-50 to-white dark:from-neutral-900 dark:via-neutral-950 dark:to-[#0e0e11] border-b border-zinc-200 dark:border-neutral-800/80 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                ⭐ BIGBITE VIP MEMBER
              </span>
              <button
                type="button"
                onClick={closeProfileDrawer}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-zinc-200 dark:border-neutral-700/60 text-zinc-500 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                aria-label="Close profile drawer"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5 shadow-lg shrink-0">
                <div className="w-full h-full rounded-[14px] bg-white dark:bg-neutral-950 flex items-center justify-center font-['Oswald',sans-serif] font-black text-lg text-amber-500 dark:text-amber-400 overflow-hidden">
                  {customer?.avatar_url || customer?.avatar ? (
                    <img
                      src={customer.avatar_url || customer.avatar}
                      alt={customer.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
              </div>

              {/* Identity Info */}
              <div className="min-w-0 flex-1">
                <h3 className="font-['Oswald',sans-serif] font-bold text-lg text-zinc-900 dark:text-white truncate m-0">
                  {customer?.full_name || "Foodie"}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-neutral-400 truncate mt-0.5">
                  {customer?.email || customer?.phone || "BigBite Gourmet"}
                </p>
                {customer?.phone && customer?.email && (
                  <p className="text-[11px] text-zinc-400 dark:text-neutral-500 font-mono truncate">
                    {customer.phone}
                  </p>
                )}
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => {
                  closeProfileDrawer();
                  logout();
                }}
                className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95"
                title="Sign out of account"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mt-5 p-1 rounded-xl bg-zinc-100 dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setProfileDrawerTab("orders")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-['Oswald',sans-serif] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border-none ${
                  profileDrawerTab === "orders"
                    ? "bg-amber-400 text-black shadow-sm font-black"
                    : "bg-transparent text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <FaShoppingBag className="text-xs" />
                <span>My Orders ({orders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileDrawerTab("addresses")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-['Oswald',sans-serif] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border-none ${
                  profileDrawerTab === "addresses"
                    ? "bg-amber-400 text-black shadow-sm font-black"
                    : "bg-transparent text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <FaMapMarkerAlt className="text-xs" />
                <span>Addresses ({savedAddresses.length})</span>
              </button>
            </div>
          </div>

          {/* ═══════════════════════════════════════
              DRAWER BODY CONTENT
              ═══════════════════════════════════════ */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-amber-500/30 hover:[&::-webkit-scrollbar-thumb]:bg-amber-500/60 [&::-webkit-scrollbar-thumb]:rounded-full">
            {/* ── TAB 1: MY ORDERS & 1-CLICK REORDER ── */}
            {profileDrawerTab === "orders" && (
              <div className="space-y-4">
                {loadingOrders ? (
                  <div className="py-20 text-center text-zinc-400 dark:text-neutral-500 flex flex-col items-center justify-center gap-3">
                    <FaSpinner className="text-2xl animate-spin text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Loading your order history...
                    </span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-16 text-center text-zinc-500 dark:text-neutral-500 border border-dashed border-zinc-200 dark:border-neutral-800 rounded-3xl p-8 bg-zinc-50/60 dark:bg-neutral-900/30">
                    <FaReceipt className="text-4xl text-zinc-400 dark:text-neutral-600 mx-auto mb-3" />
                    <h4 className="font-['Oswald',sans-serif] font-bold text-base text-zinc-900 dark:text-white uppercase">
                      No Orders Yet
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
                      You haven't placed any delicious meals yet. Browse our menu to enjoy your first feast!
                    </p>
                  </div>
                ) : (
                  orders.map((order) => {
                    const isExpanded = expandedOrderId === order.id;
                    const itemsCount = order.items ? order.items.length : 0;
                    const isDelivered =
                      order.status?.toLowerCase().includes("delivered") ||
                      order.status?.toLowerCase().includes("completed");
                    const formattedDate = order.created_at
                      ? new Date(order.created_at).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Recent Order";

                    return (
                      <div
                        key={order.id}
                        className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#141418] border border-zinc-200 dark:border-neutral-800 hover:border-zinc-300 dark:hover:border-neutral-700 transition-all shadow-xs space-y-3"
                      >
                        {/* Top Summary Bar */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-sm text-zinc-900 dark:text-white">
                                #{order.id}
                              </span>
                              <span className="text-[10px] text-zinc-600 dark:text-neutral-400 font-mono px-2 py-0.5 rounded-md bg-zinc-200/80 dark:bg-neutral-900 border border-zinc-300 dark:border-neutral-800 uppercase font-bold">
                                {order.order_type === "dine_in"
                                  ? `Dine-In ${order.table_number ? `(T-${order.table_number})` : ""}`
                                  : order.order_type === "takeaway"
                                  ? "Takeaway"
                                  : "Delivery"}
                              </span>
                            </div>
                            <span className="text-[11px] text-zinc-400 dark:text-neutral-500 font-mono block mt-1">
                              {formattedDate}
                            </span>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            {getStatusBadge(order.status)}
                            <span className="font-mono font-black text-sm text-amber-500 dark:text-amber-400">
                              Rs. {Number(order.total || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Items Preview & Action Line */}
                        <div className="pt-2 border-t border-zinc-200 dark:border-neutral-800/80 flex items-center justify-between text-xs gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedOrderId(isExpanded ? null : order.id)
                            }
                            className="text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5 font-semibold bg-transparent border-none cursor-pointer p-0"
                          >
                            <span>{itemsCount} {itemsCount === 1 ? "item" : "items"}</span>
                            {isExpanded ? <FaChevronUp className="text-[10px]" /> : <FaChevronDown className="text-[10px]" />}
                          </button>

                          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            {/* Rate This Order Button (Permanently Locked once reviewed) */}
                            {isDelivered && (
                              <button
                                type="button"
                                disabled={Boolean(reviewedOrderIds[order.id])}
                                onClick={() => !reviewedOrderIds[order.id] && setReviewOrder(order)}
                                className={`px-2.5 py-1.5 rounded-xl font-['Oswald',sans-serif] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all border ${
                                  reviewedOrderIds[order.id]
                                    ? "bg-zinc-100 dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 opacity-90 cursor-default"
                                    : "bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border-amber-500/30 cursor-pointer active:scale-95"
                                }`}
                              >
                                {reviewedOrderIds[order.id] ? (
                                  <>
                                    <FaCheckCircle className="text-[10px] text-emerald-500" />
                                    <span>Rated ({reviewedOrderIds[order.id].rating}/5)</span>
                                  </>
                                ) : (
                                  <>
                                    <FaStar className="text-[10px] text-amber-500" />
                                    <span>Rate Order</span>
                                  </>
                                )}
                              </button>
                            )}

                            {/* 1-Click Instant Reorder Button */}
                            <button
                              type="button"
                              onClick={() => handleReorder(order)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-['Oswald',sans-serif] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer border-none"
                            >
                              <FaBolt className="text-[10px]" />
                              <span>1-Click Reorder</span>
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Itemized Breakdown */}
                        {isExpanded && order.items && (
                          <div className="pt-2.5 mt-2 border-t border-zinc-200 dark:border-neutral-800/60 space-y-2 animate-fadeIn text-xs">
                            {order.items.map((item, idx) => {
                              return (
                                <div
                                  key={idx}
                                  className="flex items-start justify-between py-1.5 px-2.5 rounded-lg bg-white dark:bg-neutral-900/60 border border-zinc-200 dark:border-neutral-800/40"
                                >
                                  <div>
                                    <span className="font-bold text-zinc-900 dark:text-neutral-200">
                                      {item.qty || item.quantity || 1}x {item.title || item.name || item.item_name}
                                    </span>
                                    {item.size && item.size !== "Regular" && (
                                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono block">
                                        Variant: {item.size}
                                      </span>
                                    )}
                                    {item.note && (
                                      <span className="text-[10px] text-zinc-500 dark:text-neutral-500 italic block">
                                        "{item.note}"
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-mono font-bold text-zinc-900 dark:text-neutral-300">
                                    Rs. {Number(item.price || 0).toLocaleString()}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── TAB 2: SAVED ADDRESSES ── */}
            {profileDrawerTab === "addresses" && (
              <div className="space-y-4">
                {/* Add Address Trigger / Form Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-neutral-400 font-mono">
                    Delivery Address Book
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddAddressForm(!showAddAddressForm)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FaPlus className="text-[10px]" />
                    <span>{showAddAddressForm ? "Cancel" : "Add Address"}</span>
                  </button>
                </div>

                {/* Inline New Address Form */}
                {showAddAddressForm && (
                  <form
                    onSubmit={handleSaveAddress}
                    className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#141418] border border-amber-500/40 space-y-3 animate-fadeIn"
                  >
                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                      Add New Delivery Location
                    </div>

                    {/* Label Selector Chips */}
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 dark:text-neutral-400 uppercase mb-1.5">
                        Category Tag
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {["Home", "Work", "Hostel", "Other"].map((lbl) => (
                          <button
                            key={lbl}
                            type="button"
                            onClick={() => setNewLabel(lbl)}
                            className={`py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all border cursor-pointer ${
                              newLabel === lbl
                                ? "bg-amber-400 text-black border-amber-400"
                                : "bg-white dark:bg-neutral-900 text-zinc-600 dark:text-neutral-400 border-zinc-200 dark:border-neutral-800 hover:text-zinc-900 dark:hover:text-white"
                            }`}
                          >
                            {lbl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Address Line */}
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 dark:text-neutral-400 uppercase mb-1">
                        House / Flat / Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. House 42, Street 7, Block B"
                        value={newAddressLine}
                        onChange={(e) => setNewAddressLine(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-zinc-300 dark:border-neutral-700/80 focus:border-amber-500 rounded-xl text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    {/* Area & Landmark */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-500 dark:text-neutral-400 uppercase mb-1">
                          Area / Sector
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. DHA Phase 5"
                          value={newArea}
                          onChange={(e) => setNewArea(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-zinc-300 dark:border-neutral-700/80 focus:border-amber-500 rounded-xl text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-500 dark:text-neutral-400 uppercase mb-1">
                          Nearby Landmark
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Near City School"
                          value={newLandmark}
                          onChange={(e) => setNewLandmark(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-zinc-300 dark:border-neutral-700/80 focus:border-amber-500 rounded-xl text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    {/* Set as Default Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700 dark:text-neutral-300 pt-1">
                      <input
                        type="checkbox"
                        checked={newIsDefault}
                        onChange={(e) => setNewIsDefault(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span>Set as default delivery address</span>
                    </label>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-['Oswald',sans-serif] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer disabled:opacity-50 border-none shadow-md"
                    >
                      {savingAddress ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaCheckCircle />
                      )}
                      <span>
                        {savingAddress ? "Saving Address..." : "Save Address"}
                      </span>
                    </button>
                  </form>
                )}

                {/* Addresses List */}
                {loadingAddresses ? (
                  <div className="py-20 text-center text-zinc-400 dark:text-neutral-500 flex flex-col items-center justify-center gap-3">
                    <FaSpinner className="text-2xl animate-spin text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Loading saved locations...
                    </span>
                  </div>
                ) : savedAddresses.length === 0 ? (
                  <div className="py-16 text-center text-zinc-500 dark:text-neutral-500 border border-dashed border-zinc-200 dark:border-neutral-800 rounded-3xl p-8 bg-zinc-50/60 dark:bg-neutral-900/30">
                    <FaMapMarkerAlt className="text-4xl text-zinc-400 dark:text-neutral-600 mx-auto mb-3" />
                    <h4 className="font-['Oswald',sans-serif] font-bold text-base text-zinc-900 dark:text-white uppercase">
                      No Saved Addresses
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
                      Save your home, office, or hostel addresses for instant 1-click checkout next time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {savedAddresses.map((addr) => {
                      const displayLabel = addr.label || addr.address_type || "Address";
                      const displayDetails =
                        [addr.house_no, addr.street, addr.area].filter(Boolean).join(", ") ||
                        addr.address_line ||
                        addr.landmark ||
                        "";

                      return (
                        <div
                          key={addr.id}
                          className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#141418] border border-zinc-200 dark:border-neutral-800 hover:border-zinc-300 dark:hover:border-neutral-700 flex items-start justify-between gap-3 transition-all group shadow-xs"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 flex items-center justify-center text-sm shrink-0">
                              {getAddressIcon(displayLabel)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wide">
                                  {displayLabel}
                                </span>
                                {addr.is_default == 1 && (
                                  <span className="text-[9px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/30 uppercase">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-zinc-600 dark:text-neutral-300 mt-1 leading-relaxed">
                                {displayDetails}
                              </p>
                              {addr.landmark && (
                                <p className="text-[10px] text-zinc-400 dark:text-neutral-500 mt-0.5">
                                  📍 Landmark: {addr.landmark}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Delete Action Button */}
                          <button
                            type="button"
                            onClick={() => deleteAddress(addr.id)}
                            className="text-zinc-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer bg-transparent border-none shrink-0"
                            title="Delete address"
                          >
                            <FaTrashAlt className="text-xs" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ⭐ ORDER RATING & REVIEW MODAL */}
      <OrderReviewModal
        order={reviewOrder}
        isOpen={!!reviewOrder}
        onClose={() => setReviewOrder(null)}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}
