import React, { useEffect, Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";

// 🛒 COMPONENTS & POPUPS
import CartPopup from "./Feature/OnlineStore/Components/CartPopup";

// 🌍 ONLINE STORE IMPORTS
import OnlineLayout from "./Feature/OnlineStore/OnlineLayout";

// 🏠 LAZY LOADED ROUTE IMPORTS (Code-split for maximum load speed)
import Home from "./Feature/Home/Home";
const CheckoutPage = lazy(() => import("./Feature/OnlineStore/CheckoutPage"));
const MenuPage = lazy(() => import("./Feature/Menu/MenuPage"));
const CategoryItemPage = lazy(() => import("./Feature/Menu/Components/CategoryItemPage"));
const OrderTracker = lazy(() => import("./Feature/Order/OrderTracker"));
const DealsPage = lazy(() => import("./Feature/Deals/DealsPage"));
const AboutUs = lazy(() => import("./Feature/Legal/AboutUs"));
const PrivacyPolicy = lazy(() => import("./Feature/Legal/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./Feature/Legal/TermsAndConditions"));
const NotFoundPage = lazy(() => import("./Components/Common/NotFoundPage"));

// Route Loading Spinner Fallback
const PageFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
    <div className="w-10 h-10 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
    <span className="text-xs text-neutral-400 font-medium tracking-wide">Loading...</span>
  </div>
);

// LIBRARIES
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// CONTEXT IMPORTS
import { CartProvider, useCart } from "./Context/CartContext";
import { OrderProvider } from "./Context/OrderContext";
import { MenuUIProvider } from "./Context/MenuUIContext";
import { AuthProvider, useAuth } from "./Context/AuthContext";
import { StoreStatusProvider } from "./Context/StoreStatusContext";
import AuthModal from "./Components/Auth/AuthModal";
import GooglePhoneModal from "./Components/Customer/GooglePhoneModal";
import CustomerProfileDrawer from "./Components/Customer/CustomerProfileDrawer";
import PWAInstallBanner from "./Components/UI/PWAInstallBanner";
import OfflineIndicator from "./Components/UI/OfflineIndicator";

const MainContent = () => {
  const { cartItems } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();

  const location = useLocation();
  const currentPath = location.pathname;

  // First Session Auto-Trigger: Welcome discount popup after 1.5s
  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem("qb_welcome_modal_shown");
    const isCheckout = location.pathname.toLowerCase().includes("/checkout");
    if (!isAuthenticated && !hasSeenWelcome && !isCheckout) {
      const timer = setTimeout(() => {
        openAuthModal("login");
        sessionStorage.setItem("qb_welcome_modal_shown", "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, openAuthModal, location.pathname]);

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

  // Route change listener: Guarantee scroll unlocking and scroll to top
  useEffect(() => {
    document.body.style.overflow = "auto";
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("padding-right");
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Hide Cart Drawer on direct Checkout page
  const isCheckoutPage = currentPath.toLowerCase().includes("/checkout");

  return (
    <div
      className="App w-full min-h-screen relative overflow-x-clip"
      style={{
        backgroundColor: "var(--bg-body, #0a0a0a)",
        transition: "0.3s",
      }}
    >
      <Toaster
        position="top-center"
        reverseOrder={false}
        containerStyle={{
          zIndex: 99999999,
        }}
      />

      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* ==========================================
              🛍️ CUSTOMER ROUTES
              ========================================== */}
          <Route element={<OnlineLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route
              path="/category/:categoryName"
              element={<CategoryItemPage />}
            />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/track-order" element={<OrderTracker />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>

      {/* 🛒 SLIDE-OUT CART POPUP (Available across store except checkout) */}
      {!isCheckoutPage && <CartPopup />}

      {/* 🔐 AUTHENTICATION MODAL */}
      <AuthModal />

      {/* 📱 GOOGLE LOGIN PHONE PROMPT MODAL */}
      <GooglePhoneModal />

      {/* 👤 CUSTOMER PROFILE & ORDER HISTORY DRAWER */}
      <CustomerProfileDrawer />

      {/* 📡 OFFLINE CONNECTIVITY INDICATOR */}
      <OfflineIndicator />

      {/* 📲 PWA IN-APP INSTALL PROMPT BANNER */}
      <PWAInstallBanner />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <MenuUIProvider>
            <Router>
              <StoreStatusProvider>
                <MainContent />
              </StoreStatusProvider>
            </Router>
          </MenuUIProvider>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
