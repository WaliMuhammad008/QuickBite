import React from "react";
import {
  FaUtensils,
  FaShoppingBag,
  FaMotorcycle,
  FaShoppingCart,
  FaTimes,
} from "react-icons/fa";
import CartCustomerInputs from "./CartCustomerInputs";
import CartItemRow from "./CartItemRow";
import CartTotalsSummary from "./CartTotalsSummary";

export default function PosCart({
  cart = [],
  updateQty,
  removeFromCart,
  orderType = "Dine-In",
  setOrderType,
  tableNo = "",
  setTableNo,
  customerName = "",
  setCustomerName,
  customerMobile = "",
  setCustomerMobile,
  paymentMethod = "Cash",
  setPaymentMethod,
  paymentStatus = "Paid",
  setPaymentStatus,
  transactionId = "",
  setTransactionId,
  subtotal = 0,
  gstRate = 0,
  taxAmount = 0,
  deliveryFee = 0,
  grandTotal = 0,
  handleCheckout,
  onCheckout,
  isMobileCartOpen = false,
  setIsMobileCartOpen,
}) {
  // Support both prop names: handleCheckout (from usePosCart spread) or onCheckout (explicit)
  const doCheckout = handleCheckout || onCheckout;
  const orderTypes = [
    { id: "Dine-In", label: "Dine-In", icon: FaUtensils },
    { id: "Takeaway", label: "Takeaway", icon: FaShoppingBag },
    { id: "Delivery", label: "Delivery", icon: FaMotorcycle },
  ];

  const totalItemsCount = cart.reduce(
    (t, i) => t + (Number(i.qty || i.quantity) || 1),
    0
  );

  const renderCartBody = () => (
    <div
      className="flex flex-col h-full bg-transparent"
      style={{ transform: "none", perspective: "none" }}
    >
      {/* 1. Order Type Switcher */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl mb-3 border border-zinc-200 dark:border-zinc-800 shrink-0">
        {orderTypes.map((type) => {
          const Icon = type.icon;
          const isActive = orderType === type.id;
          return (
            <button
              key={type.id}
              type="button"
              className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                isActive
                  ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20"
                  : "bg-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
              onClick={() => setOrderType(type.id)}
            >
              <Icon className="text-xs shrink-0" />
              <span className="truncate">{type.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Customer & Dynamic Inputs */}
      <CartCustomerInputs
        orderType={orderType}
        tableNo={tableNo}
        setTableNo={setTableNo}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerMobile={customerMobile}
        setCustomerMobile={setCustomerMobile}
      />

      {/* 3. Flat Scroll Container */}
      <div
        className="flex-1 overflow-y-auto space-y-2 p-2 min-h-[160px] max-h-[380px] bg-transparent w-full rounded-none"
        style={{
          borderRadius: "0px",
          transform: "none",
          perspective: "none",
          transformStyle: "flat",
          clipPath: "none",
          maskImage: "none",
          WebkitMaskImage: "none",
        }}
      >
        {cart.length > 0 ? (
          cart.map((item) => (
            <CartItemRow
              key={item.cartId || item.id}
              item={item}
              updateQty={updateQty}
              removeFromCart={removeFromCart}
            />
          ))
        ) : (
          <div className="text-center text-zinc-400 py-12 text-xs font-medium">
            <FaShoppingCart className="text-2xl opacity-30 mx-auto mb-2" />
            Cart is empty. Select items to start order.
          </div>
        )}
      </div>

      {/* 4. Financial Summary & Checkout Button */}
      <CartTotalsSummary
        subtotal={subtotal}
        gstRate={gstRate}
        taxAmount={taxAmount}
        orderType={orderType}
        deliveryFee={deliveryFee}
        grandTotal={grandTotal}
        cartLength={cart.length}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        paymentStatus={paymentStatus}
        setPaymentStatus={setPaymentStatus}
        transactionId={transactionId}
        setTransactionId={setTransactionId}
        onCheckout={doCheckout}
      />
    </div>
  );

  return (
    <>
      <aside
        className="hidden lg:flex flex-col w-[310px] xl:w-[350px] 2xl:w-[380px] shrink-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 xl:p-4 shadow-sm h-fit sticky top-4"
        style={{
          transform: "none",
          perspective: "none",
          clipPath: "none",
          maskImage: "none",
        }}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="m-0 font-bold text-base uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 font-mono">
            <FaShoppingCart className="text-amber-500 text-sm" /> Current Order
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold font-mono">
            {totalItemsCount} Items
          </span>
        </div>
        {renderCartBody()}
      </aside>

      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileCartOpen(false)}
          />
          <div className="relative w-full max-h-[85vh] bg-white dark:bg-zinc-900 rounded-t-3xl p-4 shadow-2xl z-10 flex flex-col border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between items-center pb-3 mb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="m-0 font-bold text-base uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 font-mono">
                <FaShoppingCart className="text-amber-500" /> Current Order
              </h3>
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center border-none cursor-pointer"
                onClick={() => setIsMobileCartOpen(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">{renderCartBody()}</div>
          </div>
        </div>
      )}
    </>
  );
}
