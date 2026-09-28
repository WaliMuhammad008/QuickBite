import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../../Components/Layout/Header";
import CartPopup from "./Components/CartPopup";
import Footer from "./Components/Footer";

const OnlineLayout = () => {

  return (
    <div className="bg-white dark:bg-[#0a0a0c] w-full min-h-screen text-zinc-900 dark:text-white flex flex-col justify-between font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif] relative transition-colors duration-300">
      {/* 1. Fixed Header Navbar */}
      <Header />

      {/* 2. Main Content Viewport with exact top offset matching header height */}
      <div className={`flex-1 w-full pt-14 sm:pt-16`}>
        <Outlet />
      </div>

      {/* 3. Cart Popup */}
      <CartPopup />

      {/* 4. Global Persistent Footer across all customer routes */}
      <Footer />
    </div>
  );
};

export default OnlineLayout;
