import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { staffSocket } from "../../../utils/socket";

export default function usePosCart({
  gstRate = 0,
  deliveryFee = 0,
  onPlaceOrder,
  setIsMobileCartOpen,
  onCartCountChange,
}) {
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState("Dine-In");
  const [tableNo, setTableNo] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [transactionId, setTransactionId] = useState("");

  // Notify parent of total cart count changes
  useEffect(() => {
    if (onCartCountChange) {
      const count = cart.reduce(
        (total, item) => total + (Number(item.qty || item.quantity) || 1),
        0
      );
      onCartCountChange(count);
    }
  }, [cart, onCartCountChange]);

  const addItemToCart = (cartItem) => {
    const noteString = (cartItem.note || "").trim();
    const excludedArr = (cartItem.excluded_ingredients || []).slice().sort();
    const addonsArr = (cartItem.selected_addons || [])
      .map((a) => `${a.uid || a.id || a.name || a.title}_${a.price}`)
      .sort();
    const cartId = `${cartItem.id}-${cartItem.size || cartItem.variant || "Regular"}-${noteString}-${excludedArr.join("-")}-${addonsArr.join("-")}`;

    setCart((prev) => {
      const exist = prev.find((i) => i.cartId === cartId);
      if (exist) {
        return prev.map((i) =>
          i.cartId === cartId
            ? { ...i, qty: (Number(i.qty) || 1) + (Number(cartItem.qty) || 1) }
            : i
        );
      }

      return [
        ...prev,
        {
          ...cartItem,
          cartId,
          qty: Number(cartItem.qty || cartItem.quantity) || 1,
        },
      ];
    });
  };

  const updateQty = (cartIdOrId, deltaOrQty) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartId === cartIdOrId || item.id === cartIdOrId) {
          const currentQty = Number(item.qty || item.quantity) || 1;
          const newQty =
            typeof deltaOrQty === "number" &&
            (deltaOrQty === -1 || deltaOrQty === 1)
              ? Math.max(1, currentQty + deltaOrQty)
              : Math.max(1, deltaOrQty);
          return { ...item, qty: newQty, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartIdOrId) => {
    setCart((prev) =>
      prev.filter((i) => i.cartId !== cartIdOrId && i.id !== cartIdOrId)
    );
  };

  const clearCart = () => {
    setCart([]);
    setTableNo("");
    setCustomerName("");
    setCustomerMobile("");
    setOrderType("Dine-In");
    setPaymentMethod("Cash");
    setPaymentStatus("Paid");
    setTransactionId("");
  };

  // Safe Computations (Zero NaN)
  const subtotal = cart.reduce(
    (total, item) =>
      total + (Number(item.price) || 0) * (Number(item.qty || item.quantity) || 1),
    0
  );
  const taxAmount = (subtotal * (Number(gstRate) || 0)) / 100;
  const activeDeliveryFee = orderType === "Delivery" ? (Number(deliveryFee) || 0) : 0;
  const grandTotal = subtotal + taxAmount + activeDeliveryFee;

  // Checkout API trigger
  const handleCheckout = async () => {
    if (cart.length === 0) {
      return Swal.fire({
        icon: "error",
        title: "Empty Cart",
        text: "Please add items to cart first.",
      });
    }

    if (orderType === "Dine-In" && (!tableNo || tableNo.trim() === "")) {
      return Swal.fire({
        icon: "warning",
        title: "Table No Required",
        text: "Please enter or select a Table Number.",
      });
    }

    if (orderType === "Delivery") {
      if (!tableNo || tableNo.trim() === "") {
        return Swal.fire({
          icon: "warning",
          title: "Address Required",
          text: "Please enter a Delivery Address.",
        });
      }
      if (!customerMobile || customerMobile.trim() === "") {
        return Swal.fire({
          icon: "warning",
          title: "Mobile Required",
          text: "Please enter a Customer Mobile Number.",
        });
      }
    }

    const isDeliveryCod =
      orderType === "Delivery" &&
      (!paymentMethod || paymentMethod === "Cash" || paymentMethod === "COD" || paymentMethod === "Cash on Delivery");
    const effectivePaymentStatus = isDeliveryCod ? "Pending" : (paymentStatus || "Paid");

    const orderPayload = {
      order_type: orderType,
      order_mode: orderType.toUpperCase(),
      customer_name: (customerName || "").trim() || "Walk-in Customer",
      table_number: orderType === "Dine-In" ? tableNo : orderType,
      customer_mobile: orderType === "Delivery" ? customerMobile : null,
      customer_address: orderType === "Delivery" ? tableNo : "",
      subtotal: Number(subtotal.toFixed(2)),
      tax_amount: Number(taxAmount.toFixed(2)),
      delivery_fee: Number(activeDeliveryFee.toFixed(2)),
      total: Number(grandTotal.toFixed(2)),
      payment_method: paymentMethod || "Cash",
      payment_status: effectivePaymentStatus,
      transaction_id: transactionId || (paymentMethod !== "Cash" ? `POS-${Math.floor(100000 + Math.random() * 900000)}` : null),
      cart,
    };

    try {
      Swal.fire({
        title: "Sending to Kitchen...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/create_order.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        }
      );

      const rawText = await response.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        console.error("Non-JSON API response from create_order.php:", rawText);
        throw new Error("Server returned an invalid response. Please verify backend status.");
      }

      if (response.ok && data.success) {
        const orderId = data.order_id || Math.floor(1000 + Math.random() * 9000);
        const newOrderForPortal = {
          id: orderId,
          order_id: orderId,
          table: orderPayload.table_number,
          table_number: orderPayload.table_number,
          order_type: orderType,
          order_mode: orderType.toUpperCase(),
          customer: orderPayload.customer_name,
          customer_name: orderPayload.customer_name,
          customerName: orderPayload.customer_name,
          customer_mobile: orderPayload.customer_mobile,
          customer_address: orderPayload.customer_address,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          date: new Date().toISOString().split("T")[0],
          created_at: new Date().toLocaleString(),
          subtotal: Number(subtotal.toFixed(2)),
          tax_amount: Number(taxAmount.toFixed(2)),
          delivery_fee: Number(activeDeliveryFee.toFixed(2)),
          total: Number(grandTotal.toFixed(2)),
          status: "Pending",
          payment_method: data.payment_method || paymentMethod,
          payment_status: data.payment_status || paymentStatus,
          transaction_id: data.transaction_id || transactionId || null,
          items: cart,
          cart,
        };

        if (onPlaceOrder) onPlaceOrder(newOrderForPortal);

        // Real-Time Socket Signal
        try {
          staffSocket.emit("new_order_placed");
        } catch (socketErr) {
          console.warn("Socket emit failed (non-critical):", socketErr);
        }

        clearCart();
        if (setIsMobileCartOpen) setIsMobileCartOpen(false);

        Swal.fire({
          icon: "success",
          title: "Order Placed!",
          text: `Order #${orderId} sent to kitchen as ${orderType}`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error(data.message || "Failed to save order");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      Swal.fire({
        icon: "error",
        title: "Order Failed",
        text: error.message || "Could not connect to database.",
      });
    }
  };

  return {
    cart,
    orderType,
    setOrderType,
    tableNo,
    setTableNo,
    customerName,
    setCustomerName,
    customerMobile,
    setCustomerMobile,
    paymentMethod,
    setPaymentMethod,
    paymentStatus,
    setPaymentStatus,
    transactionId,
    setTransactionId,
    addItemToCart,
    updateQty,
    removeFromCart,
    clearCart,
    subtotal,
    taxAmount,
    deliveryFee: activeDeliveryFee,
    grandTotal,
    handleCheckout,
  };
}
