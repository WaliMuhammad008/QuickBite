import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { staffSocket } from "../../utils/socket";
import OrderReceiptModal from "./Components/Orders/Components/OrderReceiptModal";
import DashboardWelcomeHero from "./Components/DashboardHome/DashboardWelcomeHero";
import DashboardKpiCards from "./Components/DashboardHome/DashboardKpiCards";
import DashboardLiveOrdersFeed from "./Components/DashboardHome/DashboardLiveOrdersFeed";

const DashboardHome = ({ setActiveTab }) => {
  const queryClient = useQueryClient();
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedOrderToView, setSelectedOrderToView] = useState(null);

  // Real-time socket sync for Admin Dashboard
  useEffect(() => {
    const handleRealtimeRefresh = () => {
      queryClient.invalidateQueries({ queryKey: ["admin_orders"] });
      queryClient.invalidateQueries({ queryKey: ["profit_stats"] });
    };

    staffSocket.on("refresh_kitchen", handleRealtimeRefresh);
    staffSocket.on("new_order_placed", handleRealtimeRefresh);
    staffSocket.on("order_status_updated", handleRealtimeRefresh);
    staffSocket.on("order_status_changed", handleRealtimeRefresh);
    staffSocket.on("payment_status_updated", handleRealtimeRefresh);
    staffSocket.on("refresh_orders", handleRealtimeRefresh);

    return () => {
      staffSocket.off("refresh_kitchen", handleRealtimeRefresh);
      staffSocket.off("new_order_placed", handleRealtimeRefresh);
      staffSocket.off("order_status_updated", handleRealtimeRefresh);
      staffSocket.off("order_status_changed", handleRealtimeRefresh);
      staffSocket.off("payment_status_updated", handleRealtimeRefresh);
      staffSocket.off("refresh_orders", handleRealtimeRefresh);
    };
  }, [queryClient]);

  const { data: allOrders = [] } = useQuery({
    queryKey: ["admin_orders", "all"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_orders.php?type=all`
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        return data.map((dbOrder) => {
          let itemsArray = [];
          if (dbOrder.items) {
            if (typeof dbOrder.items === "string") {
              try {
                itemsArray = JSON.parse(dbOrder.items);
              } catch (e) {}
            } else if (Array.isArray(dbOrder.items)) {
              itemsArray = dbOrder.items;
            }
          } else if (dbOrder.cart) {
            if (typeof dbOrder.cart === "string") {
              try {
                itemsArray = JSON.parse(dbOrder.cart);
              } catch (e) {}
            } else if (Array.isArray(dbOrder.cart)) {
              itemsArray = dbOrder.cart;
            }
          }

          const parsedItems = Array.isArray(itemsArray)
            ? itemsArray.map((i) => {
                let parsedAddons =
                  i.selected_addons ||
                  i.selectedAddons ||
                  i.addons ||
                  i.selected_addons_json ||
                  [];
                if (typeof parsedAddons === "string") {
                  try {
                    parsedAddons = JSON.parse(parsedAddons);
                  } catch {
                    parsedAddons = [];
                  }
                }
                if (!Array.isArray(parsedAddons)) parsedAddons = [];

                return {
                  ...i,
                  name: i ? (i.title || i.name || "") : "",
                  title: i ? (i.title || i.name || "") : "",
                  qty: i ? parseInt(i.qty || i.quantity || 1, 10) : 1,
                  price: i ? parseFloat(i.price || 0) : 0,
                  base_price: i && i.base_price !== undefined ? parseFloat(i.base_price) : undefined,
                  size: i?.size || "",
                  note: i?.note || "",
                  spice_level: i?.spice_level || "",
                  selected_addons: parsedAddons,
                  selectedAddons: parsedAddons,
                  addons: parsedAddons,
                  selected_addons_json: parsedAddons,
                };
              })
            : [];

          const rawType = dbOrder.order_type || dbOrder.order_mode || "DELIVERY";
          const formattedType = rawType.replace("_", " ").toUpperCase();

          return {
            ...dbOrder,
            id: `#${dbOrder.id}`,
            rawId: dbOrder.id,
            order_id: dbOrder.id,
            customerName: dbOrder.customer_name || dbOrder.customer || "Walk-in Customer",
            customer_name: dbOrder.customer_name || dbOrder.customer || "Walk-in Customer",
            customer_mobile: dbOrder.customer_mobile || "",
            customer_address: dbOrder.customer_address || "",
            table_number: dbOrder.table_number || "",
            type: formattedType,
            order_type: formattedType,
            order_mode: formattedType,
            payment_method: dbOrder.payment_method || "Cash",
            payment_status: dbOrder.payment_status || "Pending",
            transaction_id: dbOrder.transaction_id || "",
            subtotal: parseFloat(dbOrder.subtotal || 0),
            tax_amount: parseFloat(dbOrder.tax_amount || 0),
            delivery_fee: parseFloat(dbOrder.delivery_fee || 0),
            rider_tip: parseFloat(dbOrder.rider_tip || 0),
            discount_amount: parseFloat(dbOrder.discount_amount || 0),
            coupon_code: dbOrder.coupon_code || "",
            total: parseFloat(dbOrder.total || 0),
            status: (dbOrder.status || "").toLowerCase(),
            time: dbOrder.time,
            date: dbOrder.date,
            created_at: dbOrder.created_at || dbOrder.time,
            items: parsedItems,
            cart: parsedItems,
          };
        });
      }
      return [];
    },
    refetchInterval: 60000,
  });

  const { data: menuData = [] } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_menu.php`
      );
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: profitData = { revenue: 0, cogs: 0, gross_profit: 0 } } =
    useQuery({
      queryKey: ["profit_stats", "today"],
      queryFn: async () => {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/get_profit_stats.php?range=today`
        );
        const profitJson = await response.json();
        return profitJson.success && profitJson.data
          ? profitJson.data
          : { revenue: 0, cogs: 0, gross_profit: 0 };
      },
      refetchInterval: 60000,
    });

  const sortedOrders = useMemo(() => {
    return [...allOrders].sort((a, b) => b.rawId - a.rawId);
  }, [allOrders]);

  const recentOrders = sortedOrders.slice(0, 10);
  const totalCustomers = useMemo(
    () =>
      new Set(allOrders.map((o) => o.customerName.toLowerCase().trim())).size,
    [allOrders]
  );
  const menuItemsCount = menuData.length;

  const handleViewOrder = (order) => {
    setSelectedOrderToView(order);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="space-y-5 animate-slide-up">
      {/* 1. Modern Welcome Hero Card */}
      <DashboardWelcomeHero />

      {/* 2. Key Metric Cards */}
      <DashboardKpiCards
        profitData={profitData}
        totalOrdersCount={allOrders.length}
        menuItemsCount={menuItemsCount}
        totalCustomers={totalCustomers}
        setActiveTab={setActiveTab}
      />

      {/* 3. Recent Live Orders Table */}
      <DashboardLiveOrdersFeed
        recentOrders={recentOrders}
        onViewOrder={handleViewOrder}
      />

      {/* Order Receipt Modal */}
      <OrderReceiptModal
        isOpen={isReceiptModalOpen}
        order={selectedOrderToView}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
};

export default DashboardHome;
