import React, { createContext, useState, useContext, useEffect } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { io } from "socket.io-client";
import { API_BASE } from "../config/api";
import { getSocketUrl, getSocketOptions } from "../utils/urlHelper";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // --- 1. CART STATE (Local Storage) ---
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cartItems");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cart save karo jab bhi change ho
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // --- 2. ORDERS STATE (Order History) ---
  const [orders, setOrders] = useState(() => {
    try {
      const savedOrders = localStorage.getItem("myOrders");
      return savedOrders ? JSON.parse(savedOrders) : [];
    } catch (error) {
      return [];
    }
  });

  // Orders save karo jab bhi change ho
  useEffect(() => {
    localStorage.setItem("myOrders", JSON.stringify(orders));
  }, [orders]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  // --- 3. ADD TO CART FUNCTION ---
  const addToCart = (product) => {
    // 🔥 Smart Check: Agar DB se 'name' aaye ya purana 'title' aaye
    const productName = product.name || product.title || "Item";

    setCartItems((prevItems) => {
      // Check duplicate items (Name + Size + Note)
      const existingItemIndex = prevItems.findIndex((item) => {
        const itemName = item.name || item.title; // Purane items bhi check karega
        const isSameName = itemName === productName;
        const isSameSize =
          (item.size || "Regular") === (product.size || "Regular");
        const isSameNote =
          (item.note || "").trim() === (product.note || "").trim();
        return isSameName && isSameSize && isSameNote;
      });

      if (existingItemIndex !== -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          qty: (updatedItems[existingItemIndex].qty || 1) + (product.qty || 1),
        };
        return updatedItems;
      } else {
        return [
          ...prevItems,
          {
            ...product,
            name: productName, // 🔥 Ab DB wala name save hoga
            title: productName, // Fallback ke liye
            price: parseFloat(product.price),
            qty: product.qty || 1,
            cartId: Date.now() + Math.random(),
            size: product.size || "Regular",
            note: (product.note || "").trim(),
          },
        ];
      }
    });

    // 🔥 Ab "undefined" ki jagah Asli Naam aayega!
    toast.success(`${productName} added to cart!`, {
      style: {
        background: "#333",
        color: "#fff",
      },
    });
  };

  // --- 4. REMOVE ITEM ---
  const removeFromCart = (cartId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.cartId !== cartId),
    );
  };

  // --- 5. CLEAR CART ---
  const clearCart = () => {
    setCartItems([]);
  };

  // --- 6. UPDATE QUANTITY ---
  const updateQty = (cartId, amount) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.cartId === cartId) {
          const newQty = item.qty + amount;
          return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
      }),
    );
  };

  // --- 7. PLACE ORDER FUNCTION (UPDATED FOR DINE-IN, TAKEAWAY, DELIVERY) ---
  const placeOrder = async (customerDetails = {}) => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return null;
    }

    let loggedUser = null;
    try {
      const saved = localStorage.getItem("bigbite_customer_user") || localStorage.getItem("quickbite_customer_user");
      if (saved) loggedUser = JSON.parse(saved);
    } catch {}

    const customerId = customerDetails.customer_id || customerDetails.customerId || loggedUser?.id || null;
    const customerEmail = customerDetails.customer_email || customerDetails.customerEmail || customerDetails.email || loggedUser?.email || "";

    // Prepare Data for Backend
    const orderData = {
      customer_id: customerId,
      customerId: customerId,
      customer_email: customerEmail,
      customerEmail: customerEmail,
      email: customerEmail,
      order_type: customerDetails.orderType || customerDetails.order_type || "Takeaway",
      customer_name: customerDetails.customerName || customerDetails.customer_name || loggedUser?.full_name || "Walk-in",
      customer_mobile: customerDetails.customerMobile || customerDetails.customer_mobile || customerDetails.mobile || customerDetails.phone || loggedUser?.phone || "",
      customer_address: customerDetails.customerAddress || customerDetails.customer_address || customerDetails.address || "",
      table_number: customerDetails.tableNumber || customerDetails.table_number || "",
      
      // Address Breakdown & GPS
      house_no: customerDetails.house_no || null,
      street: customerDetails.street || null,
      area: customerDetails.area || null,
      customer_lat: customerDetails.customer_lat || customerDetails.lat || null,
      customer_lng: customerDetails.customer_lng || customerDetails.lng || null,

      // Promo & Tips
      delivery_fee: customerDetails.delivery_fee || customerDetails.deliveryFee || 0,
      rider_tip: customerDetails.rider_tip || customerDetails.riderTip || 0,
      coupon_code: customerDetails.coupon_code || customerDetails.couponCode || null,
      discount_amount: customerDetails.discount_amount || customerDetails.discountAmount || 0,

      // Payment Details
      payment_method: customerDetails.paymentMethod || customerDetails.payment_method || "Cash on Delivery",
      payment_status: customerDetails.paymentStatus || customerDetails.payment_status || "Pending",
      transaction_id: customerDetails.transaction_id || customerDetails.transactionId || customerDetails.txn_id || null,

      total:
        customerDetails.total !== undefined && customerDetails.total !== null
          ? Number(customerDetails.total)
          : cartItems.reduce(
              (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
              0
            ),
      cart: customerDetails.items || customerDetails.cart || cartItems,
      items: customerDetails.items || customerDetails.cart || cartItems,
    };

    const loadingToast = toast.loading("Placing your order...");

    try {
      const response = await fetch(
        `${API_BASE}/create_order.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        },
      );

      const result = await response.json();

      if (!result.success || !result.order_id) {
        toast.dismiss(loadingToast);
        if (result.code === "RESTAURANT_CLOSED") {
          Swal.fire({
            title: "Currently Closed",
            text: result.message,
            icon: "warning",
            confirmButtonColor: "#ef4444",
          });
        } else {
          const errMsg = result.message || result.error || "Failed to insert order into MySQL database";
          toast.error("Database Error: " + errMsg);
          Swal.fire({
            title: "Order Failed",
            text: errMsg,
            icon: "error",
            confirmButtonColor: "#ef4444",
          });
        }
        return null;
      }

      // Store ONLY the real backend order_id and order object
      const realOrderId = result.order_id;
      localStorage.setItem("activeOrderId", realOrderId.toString());

      const newLocalOrder = {
        ...orderData,
        id: realOrderId, // Real MySQL DB ID
        order_id: realOrderId,
        orderId: realOrderId,
        success: true,
        status: "Pending",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: new Date().toLocaleDateString(),
      };

      localStorage.setItem("latestOrder", JSON.stringify(newLocalOrder));

      // Orders history update karein
      setOrders([newLocalOrder, ...orders]);

      clearCart();
      setIsCartOpen(false);

      toast.success(`Order #${realOrderId} Placed Successfully!`, {
        id: loadingToast,
        duration: 4000,
        style: { background: "#10b981", color: "#fff" },
      });

      // 🔥 SOCKET EMIT: Node Server ko directly frontend se batao!
      try {
        const socket = io(getSocketUrl(), getSocketOptions());
        socket.emit("new_order_placed");
        setTimeout(() => socket.disconnect(), 1000);
      } catch (sockErr) {
        console.warn("Socket notification warning:", sockErr);
      }

      return newLocalOrder;
    } catch (error) {
      console.error("Order Insertion Error:", error);
      toast.dismiss(loadingToast);
      toast.error("Database Connection Error: " + error.message);
      Swal.fire({
        title: "Connection Error",
        text: "Could not reach database server: " + error.message,
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
      return null;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        toggleCart,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        orders,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);