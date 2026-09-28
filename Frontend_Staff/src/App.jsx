import React, { useEffect } from "react";
import "./style/App.css";
import { Toaster } from "react-hot-toast";



// 🏠 HOME & MENU IMPORTS (Aapke original folders se)

// 👨‍💼 STAFF PANELS IMPORTS (Dynamically code-split via React.lazy for sub-500kB bundles)
const KitchenDashboard = React.lazy(() => import("./Feature/Kitchen/KitchenDashboard"));
const CashierPortal = React.lazy(() => import("./Feature/Cashier/CashierPortal"));
const AdminDashboard = React.lazy(() => import("./Feature/Admin/AdminDashboard"));
const LoginForm = React.lazy(() => import("./Feature/Auth/LoginForm"));
const RiderPortal = React.lazy(() => import("./Feature/Rider/RiderPortal"));
const DispatchPortal = React.lazy(() => import("./Feature/Dispatcher/DispatchPortal"));

// 🌟 Brand Loading Spinner for Suspense Fallback
const LoadingFallback = () => (
  <div
    className="w-full flex flex-col items-center justify-center"
    style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg-body, #0a0a0a)",
      color: "#ffffff",
    }}
  >
    <div className="relative flex items-center justify-center">
      {/* Outer pulsing halo */}
      <div
        className="absolute animate-ping rounded-full opacity-25"
        style={{
          width: "68px",
          height: "68px",
          backgroundColor: "#f97316",
        }}
      />
      {/* Spinning border ring */}
      <div
        className="animate-spin rounded-full border-4 border-solid border-t-transparent"
        style={{
          width: "52px",
          height: "52px",
          borderColor: "#f97316 transparent #ea580c transparent",
        }}
      />
      {/* Center glowing logo dot */}
      <div
        className="absolute rounded-full shadow-lg"
        style={{
          width: "18px",
          height: "18px",
          backgroundColor: "#ff7700",
          boxShadow: "0 0 16px rgba(255, 119, 0, 0.8)",
        }}
      />
    </div>
    <p
      className="mt-6 text-sm font-semibold tracking-wider uppercase text-gray-400 animate-pulse"
      style={{ letterSpacing: "0.15em" }}
    >
      BigBite Staff Portal...
    </p>
  </div>
);

// 🔥 NAYA: PROTECTED ROUTE IMPORT (Path apne hisaab se adjust kar lijiyega)
import ProtectedRoute from "./Components/ProtectedRoute";
import StaffPWAInstallBanner from "./Components/PWA/StaffPWAInstallBanner";
import useWakeLock from "./Hooks/useWakeLock";

// LIBRARIES
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

// ✅ CONTEXT IMPORTS (Aapke image k mutabiq capital 'C' wale folder se)
import { AuthProvider } from "./Context/AuthContext";
import { CartProvider, useCart } from "./Context/CartContext";
import { OrderProvider } from "./Context/OrderContext";

const MainContent = () => {
  const { toggleCart, cartItems, isCartOpen } = useCart();

  // Cart quantity calculation
  const totalQty = cartItems
    ? cartItems.reduce((total, item) => total + (item.qty || 1), 0)
    : 0;

  const location = useLocation();
  const currentPath = location.pathname;

  // Capture QR Code parameters (mode=dine_in&table=X)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get("mode");
    const table = params.get("table");
    
    if (mode === "dine_in") {
      sessionStorage.setItem("orderMode", "Dine-In");
      if (table) {
        sessionStorage.setItem("tableNumber", table);
      }
    }
  }, [location.search]);

  // Routes Logic (Taa ke staff pages par customer UI hide ho)
  const isKitchenPage = currentPath.startsWith("/kitchen");
  const isCashierPage = currentPath.startsWith("/cashier");
  const isAdminRoute = currentPath.startsWith("/admin");
  const isLoginPage = currentPath === "/login";

  // Cart aur Checkout page pe floating button chupane k liye logic
  const isOnlineCartFlow =
    currentPath === "/cart" || currentPath === "/checkout";

  // Helper boolean to hide operational UI
  const shouldHideUI =
    isKitchenPage || isCashierPage || isAdminRoute || isLoginPage;

  // Keep Kitchen/POS screens awake
  useWakeLock(!isLoginPage);

  return (
    <div
      className="App w-full overflow-x-hidden"
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-body, #0a0a0a)",
        transition: "0.3s",
      }}
    >
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerStyle={{
          zIndex: 99999999,
        }}
        toastOptions={{
          className:
            "!bg-white dark:!bg-[#18181b] !text-slate-900 dark:!text-white !border !border-slate-200 dark:!border-white/10 !rounded-2xl !shadow-xl !font-bold !text-xs sm:!text-sm !py-3 !px-4",
          duration: 3000,
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />

      {/* 📲 STAFF PWA DESKTOP/TABLET INSTALL BANNER */}
      <StaffPWAInstallBanner />

      <React.Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* 🔓 LOGIN ROUTE (Default) */}
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />

          {/* ==========================================
              🔒 PROTECTED STAFF ROUTES (Role-based access)
              ========================================== */}

          <Route
            path="/kitchen"
            element={
              <ProtectedRoute
                allowedRoles={["Chef", "Kitchen", "Cook", "Admin", "Manager", "Owner"]}
              >
                <KitchenDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cashier"
            element={
              <ProtectedRoute allowedRoles={["Cashier", "Pos", "Admin", "Manager", "Owner"]}>
                <CashierPortal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Manager", "Owner"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/rider"
            element={
              <ProtectedRoute allowedRoles={["Rider", "Delivery", "Admin", "Manager", "Owner"]}>
                <RiderPortal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dispatcher"
            element={
              <ProtectedRoute allowedRoles={["Dispatcher", "Dispatch", "Admin", "Manager", "Owner"]}>
                <DispatchPortal />
              </ProtectedRoute>
            }
          />
        </Routes>
      </React.Suspense>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <Router>
            <MainContent />
          </Router>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
