import React, { useState, useEffect } from "react";
import {
  FaBoxOpen,
  FaClock,
  FaCheckCircle,
  FaCircle,
  FaSearch,
  FaTimes,
  FaSync,
} from "react-icons/fa";
import toast from "react-hot-toast";
import "../styles/index.css";

const OrderTracker = () => {
  const [searchId, setSearchId] = useState("");
  const [liveOrders, setLiveOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLiveOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/track_public_orders.php`,
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        setLiveOrders(data);
      } else {
        setLiveOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch tracking details:", error);
      toast.error("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveOrders();

    const interval = setInterval(() => {
      fetchLiveOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Get my locally placed orders
  const mySavedOrders = JSON.parse(localStorage.getItem("myOrders") || "[]");
  const myOrderIds = mySavedOrders
    .map(o => o?.id?.toString())
    .filter(Boolean);

  const filteredOrders = liveOrders.filter((order) => {
    // If user is searching manually, show the searched order
    if (searchId.trim() !== "") {
      return order?.id?.toString().includes(searchId.replace("#", "").trim());
    }
    // Otherwise, only show their own orders saved in localStorage
    return myOrderIds.includes(order?.id?.toString());
  });

  const ProgressStep = ({ status, currentStatus, label, icon }) => {
    let mappedStatus = currentStatus;
    if (mappedStatus === "Completed" || mappedStatus === "Delivered") {
      mappedStatus = "Ready";
    }

    const steps = ["Pending", "Cooking", "Ready"];
    const currentIndex = steps.indexOf(mappedStatus);
    const stepIndex = steps.indexOf(status);

    const safeIndex = currentIndex === -1 ? 0 : currentIndex;

    const isActive = stepIndex <= safeIndex;
    const isCurrent = stepIndex === safeIndex;

    let colorClass = "";
    if (isActive) {
      if (status === "Pending") colorClass = "step-pending";
      if (status === "Cooking") colorClass = "step-cooking";
      if (status === "Ready") colorClass = "step-ready";
    }

    return (
      <div
        className={`otp-step-wrapper ${isActive ? "active" : ""} ${isCurrent ? "current" : ""} ${colorClass}`}
      >
        <div className="otp-step-icon">{icon}</div>
        <span className="otp-step-label">{label}</span>
      </div>
    );
  };

  return (
    <div className="otp-container">
      {/* HEADER & SEARCH SECTION */}
      <div className="otp-header-section">
        <h2 className="otp-title">
          <FaBoxOpen className="otp-icon-red" /> Track Order

          <button
            onClick={fetchLiveOrders}
            className="otp-refresh-btn"
            title="Refresh Status"
          >
            <FaSync className={isLoading ? "fa-spin" : ""} />
          </button>
        </h2>

        <div className="otp-search-form">
          <FaSearch className="otp-search-icon" />
          <input
            type="text"
            className="otp-search-input"
            placeholder="Type Order ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          {searchId && (
            <FaTimes
              className="otp-search-clear"
              onClick={() => setSearchId("")}
            />
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="otp-cards-container">
        {isLoading && liveOrders.length === 0 ? (
          <div className="otp-empty-state">
            <h3>Loading live status...</h3>
          </div>
        ) : !filteredOrders || filteredOrders.length === 0 ? (
          <div className="otp-empty-state">
            <div className="otp-empty-icon-wrapper">
              <FaBoxOpen />
            </div>
            <h3>{searchId ? "Order Not Found" : "No Active Orders"}</h3>
            <p>
              {searchId
                ? `We couldn't find any order matching #${searchId}.`
                : "Hungry? Head over to our menu and place an order!"}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            let currentStat = order.status;
            if (currentStat === "Completed" || currentStat === "Delivered")
              currentStat = "Ready";

            let barWidth = "15%";
            let barColor = "#f59e0b"; // Yellow
            let glowColor = "rgba(245, 158, 11, 0.4)";

            if (currentStat === "Cooking") {
                barWidth = "50%";
                barColor = "#ef4444"; // Red
                glowColor = "rgba(239, 68, 68, 0.4)";
            }
            if (currentStat === "Ready") {
                barWidth = "100%";
                barColor = "#10b981"; // Green
                glowColor = "rgba(16, 185, 129, 0.4)";
            }

            return (
              <div key={order.id} className="otp-premium-card">
                {/* CARD HEADER */}
                <div className="otp-card-header">
                  <div className="otp-order-info">
                    <span className="otp-order-id">ORDER #{order.id}</span>
                    <span className="otp-order-time">
                      <FaClock /> {order.time}
                    </span>
                    <span className="otp-order-type">
                      {order.order_type
                        ? order.order_type.replace("_", " ").toUpperCase()
                        : "N/A"}
                    </span>
                  </div>

                  <div
                    className={`otp-status-badge ${order.status.toLowerCase()}`}
                  >
                    <span className="otp-status-dot"></span>
                    {order.status}
                  </div>
                </div>

                {/* PROGRESS TRACKER */}
                <div className="otp-progress-section">
                  <div className="otp-progress-bar-container">
                    <div className="otp-progress-track">
                      <div
                        className="otp-progress-fill"
                        style={{ 
                          width: barWidth, 
                          background: barColor, 
                          boxShadow: `0 0 15px ${glowColor}` 
                        }}
                      ></div>
                    </div>
                    <div className="otp-progress-steps">
                      <ProgressStep
                        status="Pending"
                        currentStatus={currentStat}
                        label="Confirmed"
                        icon={<FaCheckCircle size={14} />}
                      />
                      <ProgressStep
                        status="Cooking"
                        currentStatus={currentStat}
                        label="Cooking"
                        icon={<FaCircle size={12} />}
                      />
                      <ProgressStep
                        status="Ready"
                        currentStatus={currentStat}
                        label="Ready"
                        icon={<FaCheckCircle size={14} />}
                      />
                    </div>
                  </div>
                </div>

                {/* RECEIPT / BILLING */}
                <div className="otp-receipt-section">
                  <h4 className="otp-receipt-title">Order Details</h4>
                  <div className="otp-items-list">
                    {order.cart &&
                      order.cart.map((i, idx) => {
                        let rawAddons =
                          i.selected_addons ||
                          i.selectedAddons ||
                          i.addons ||
                          i.selected_addons_json ||
                          [];
                        if (typeof rawAddons === "string") {
                          try {
                            rawAddons = JSON.parse(rawAddons);
                          } catch {
                            rawAddons = [];
                          }
                        }
                        const addons = Array.isArray(rawAddons) ? rawAddons : [];
                        const qty = parseInt(i.qty || 1, 10);
                        const addonsUnitTotal = addons.reduce(
                          (sum, a) => sum + parseFloat(a.price || a.addon_price || 0),
                          0
                        );
                        let basePrice =
                          i.base_price !== undefined && parseFloat(i.base_price) > 0
                            ? parseFloat(i.base_price)
                            : parseFloat(i.price || 0) > addonsUnitTotal
                            ? parseFloat(i.price || 0) - addonsUnitTotal
                            : parseFloat(i.price || 0);

                        return (
                          <div key={idx} className="otp-item-container" style={{ marginBottom: "6px" }}>
                            <div className="otp-item-row">
                              <div className="otp-item-left">
                                <span className="otp-item-qty">{qty}x</span>
                                <span className="otp-item-name">
                                  {i.name || i.title}
                                </span>
                              </div>
                              <span className="otp-item-price">
                                Rs. {basePrice * qty}
                              </span>
                            </div>
                            {addons.map((a, aIdx) => (
                              <div
                                key={aIdx}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  fontSize: "11px",
                                  opacity: 0.75,
                                  paddingLeft: "18px",
                                  marginTop: "2px",
                                }}
                              >
                                <span>+ {a.name || a.title || a.addon_name}</span>
                                <span>Rs. {parseFloat(a.price || a.addon_price || 0) * qty}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                  </div>

                  <div className="otp-total-row">
                    <span className="otp-total-text">Total Paid</span>
                    <span className="otp-total-amount">Rs. {order.total}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrderTracker;