import React, { createContext, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "../config/api";

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const queryClient = useQueryClient();

  // 🔥 1. FETCH ORDERS FROM BACKEND (On-demand, polling disabled to eliminate guest overhead)
  const { data: orders = [], refetch: fetchOrders } = useQuery({
    queryKey: ['customer_orders'],
    queryFn: async () => {
      const token = sessionStorage.getItem("auth_token");
      if (!token) return [];

      const response = await fetch(`${API_BASE}/get_orders.php`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) return [];

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: false,
    refetchInterval: false,
  });

  // 🔥 2. PLACE NEW ORDER FUNCTION (Sends to Backend)
  // 🔥 2. PLACE NEW ORDER FUNCTION (Sends to Backend)
  const placeNewOrder = async (orderData) => {
    if (!orderData || !orderData.cart || !Array.isArray(orderData.cart)) {
      console.error("Order Error: Cart data sahi nahi hai!", orderData);
      return;
    }

    const incomingType =
      orderData.order_type ||
      orderData.orderType ||
      orderData.type ||
      "Delivery";

    const safeOrderData = {
      ...orderData,
      // Backend ko strictly 'order_type' chahiye
      order_type: incomingType,

      // Table number logic
      table_number:
        incomingType === "Dine-In" ? orderData.table_number || null : null,

      customer_name: orderData.customer_name || "Online Customer",
    };

    try {
      const response = await fetch(
        `${API_BASE}/create_order.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(safeOrderData),
        }
      );

      const result = await response.json();

      // Order place hone ke baad list ko dobara fresh karo
      fetchOrders();
    } catch (error) {
      console.error("Failed to place order:", error);
    }
  };
  // 🔥 3. UPDATE STATUS FUNCTION (Sends to Backend)
  const updateOrderStatus = async (orderId, newStatus) => {
    // UI mein foran update dikhane ke liye (Optimistic update)
    queryClient.setQueryData(['customer_orders'], (old = []) => 
      old.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    // Database mein update bhejna
    try {
      await fetch(`${API_BASE}/update_order_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      fetchOrders(); // Agar error aaye toh purana data wapis le aao
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        placeNewOrder,
        updateOrderStatus,
        refreshOrders: fetchOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
