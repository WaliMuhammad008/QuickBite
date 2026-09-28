import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useTheme } from "../../Context/ThemeContext";
import { useStaffAuth } from "../../Context/AuthContext";

// Components Import
import AdminSidebar from "./Components/SharedComponents/AdminSidebar";
import AdminHeader from "./Components/SharedComponents/AdminHeader";
import DashboardHome from "./DashboardHome";
import OrdersManager from "./Components/Orders/OrdersManager";
import MenuManager from "./Components/Menu/MenuManager";
import InventoryDashboard from "./Components/Inventory/InventoryManager";
import StaffDashboard from "./Components/Staff/StaffDashboard";
import AnalyticsPanel from "./Components/Analytics/AnalyticsPanel";
import SettingsPanel from "./Components/Settings/SettingsPanel";
import DealsDashboard from "./Components/Deals/DealsDashboard";
import HomepageBuilder from "./Components/HomepageBuilder/HomepageBuilder";
import TableManager from "./Components/Tables/TableManager";
import ProductProfitTab from "./Components/ProductProfitTab/ProductProfitTab";
import CouponsManagement from "./Components/Coupons/CouponsManagement";
import CustomersCRM from "./Components/Customers/CustomersCRM";
import ReviewsManagement from "./Components/Reviews/ReviewsManagement";

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const navigate = useNavigate();
  const { logout } = useStaffAuth();

  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = sessionStorage.getItem("adminActiveTab");
    return savedTab ? savedTab : "dashboard";
  });

  useEffect(() => {
    sessionStorage.setItem("adminActiveTab", activeTab);
  }, [activeTab]);

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to end your executive session?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Sign Out",
      cancelButtonText: "Stay Logged In",
      customClass: {
        popup: "swal2-popup",
        confirmButton: "swal2-confirm",
        cancelButton: "swal2-cancel",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/login", { replace: true, state: {} });
      }
    });
  };

  // Content Switcher
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardHome setActiveTab={setActiveTab} />;
      case "orders":
        return <OrdersManager />;
      case "menu":
        return <MenuManager />;
      case "inventory":
        return <InventoryDashboard />;
      case "staff":
        return <StaffDashboard />;
      case "analytics":
        return <AnalyticsPanel />;
      case "settings":
        return <SettingsPanel />;
      case "profit":
        return <ProductProfitTab />;
      case "deals":
        return <DealsDashboard />;
      case "tables":
        return <TableManager />;
      case "coupons":
        return <CouponsManagement />;
      case "homepage_builder":
        return <HomepageBuilder />;
      case "customers":
        return <CustomersCRM />;
      case "reviews":
        return <ReviewsManagement />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="admin-scope h-screen w-full overflow-hidden flex bg-slate-50 dark:bg-[#0D0D0D] text-slate-900 dark:text-neutral-100 font-['Inter',sans-serif]">
      {/* 1. Fixed Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleLogout={handleLogout}
      />

      {/* 2. Main App-Shell Column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Fixed Top Header (Never Scrolls Away) */}
        <AdminHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setIsSidebarOpen={setIsSidebarOpen}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />

        {/* Independent Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5 xl:p-6 2xl:p-8">
          <div className="max-w-[1600px] mx-auto pb-12">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
