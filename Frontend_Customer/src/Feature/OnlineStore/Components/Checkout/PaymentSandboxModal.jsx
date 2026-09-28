import React, { useState, useEffect } from "react";
import { LuX, LuSmartphone, LuCreditCard, LuShieldCheck, LuCircleAlert, LuPencil } from "react-icons/lu";
import { FaCheckCircle } from "react-icons/fa";
import toast from "react-hot-toast";

export default function PaymentSandboxModal({
  isOpen = false,
  onClose,
  sandboxMethod = "JazzCash",
  sandboxLoading = false,
  sandboxInput1 = "",
  setSandboxInput1,
  sandboxInput2 = "",
  setSandboxInput2,
  handleSandboxPay,
  total = 0,
}) {
  const [errors, setErrors] = useState({});
  const [hasInteracted, setHasInteracted] = useState(false);
  const [simulatedError, setSimulatedError] = useState("");
  const [isSimulatingCheck, setIsSimulatingCheck] = useState(false);

  // Card specific fields (Matching Screenshot 1)
  const [cardName, setCardName] = useState("TEST VISA USER");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [showSandboxData, setShowSandboxData] = useState(true);

  // Normalize method
  const methodStr = sandboxMethod || "JazzCash";
  const isWallet =
    methodStr.toLowerCase().includes("jazz") ||
    methodStr.toLowerCase().includes("easy") ||
    methodStr.toLowerCase().includes("wallet");

  const methodTitle = isWallet
    ? methodStr.toLowerCase().includes("jazz")
      ? "JazzCash"
      : "EasyPaisa"
    : "Card Payment";

  // Reset errors & defaults when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setHasInteracted(false);
      setSimulatedError("");
      setIsSimulatingCheck(false);
      if (!isWallet && !sandboxInput1) {
        setSandboxInput1("4242424242424242");
        setSandboxInput2("123");
        setCardName("TEST VISA USER");
        setCardExpiry("12/28");
      }
    }
  }, [isOpen, sandboxMethod, isWallet]);

  if (!isOpen) return null;

  // Validation rules
  const validate = () => {
    const newErrors = {};
    const clean1 = (sandboxInput1 || "").replace(/\D/g, "");
    const clean2 = (sandboxInput2 || "").replace(/\D/g, "");

    if (isWallet) {
      if (!clean1) {
        newErrors.input1 = "Please enter your 11-digit mobile account number.";
      } else if (!clean1.startsWith("03")) {
        newErrors.input1 = "Mobile account number must start with 03.";
      } else if (clean1.length !== 11) {
        newErrors.input1 = `Mobile number must be exactly 11 digits (${clean1.length}/11).`;
      }

      if (!clean2) {
        newErrors.input2 = "Please enter your 4-digit MPIN.";
      } else if (clean2.length !== 4) {
        newErrors.input2 = `MPIN must be exactly 4 digits (${clean2.length}/4).`;
      }
    } else {
      if (!clean1) {
        newErrors.input1 = "Please enter your 16-digit card number.";
      } else if (clean1.length !== 16) {
        newErrors.input1 = `Card number must be exactly 16 digits (${clean1.length}/16).`;
      }

      if (!cardName || !cardName.trim()) {
        newErrors.cardName = "Please enter cardholder name.";
      }

      if (!cardExpiry || cardExpiry.replace(/\D/g, "").length < 4) {
        newErrors.cardExpiry = "Please enter valid expiry date (MM/YY).";
      }

      if (!clean2) {
        newErrors.input2 = "Please enter 3-digit CVV.";
      } else if (clean2.length < 3) {
        newErrors.input2 = "CVV must be 3 digits.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = isWallet
    ? /^03[0-9]{9}$/.test(sandboxInput1.replace(/\D/g, "")) &&
      /^[0-9]{4}$/.test(sandboxInput2.replace(/\D/g, ""))
    : sandboxInput1.replace(/\D/g, "").length === 16 &&
      cardName.trim().length > 0 &&
      cardExpiry.replace(/\D/g, "").length >= 4 &&
      sandboxInput2.replace(/\D/g, "").length >= 3;

  const applyPreset = (type) => {
    setSimulatedError("");
    setErrors({});
    setHasInteracted(false);
    if (isWallet) {
      if (type === "success") {
        setSandboxInput1("03001234567");
        setSandboxInput2("1234");
      } else if (type === "low_balance") {
        setSandboxInput1("03009999001");
        setSandboxInput2("1234");
      } else if (type === "declined") {
        setSandboxInput1("03009999002");
        setSandboxInput2("1234");
      }
    } else {
      if (type === "success") {
        setSandboxInput1("4242424242424242");
        setCardName("TEST VISA USER");
        setCardExpiry("12/28");
        setSandboxInput2("123");
      } else if (type === "low_balance") {
        setSandboxInput1("4000000000000002");
        setCardName("LOW BALANCE USER");
        setCardExpiry("12/28");
        setSandboxInput2("123");
      } else if (type === "declined") {
        setSandboxInput1("4000000000000003");
        setCardName("DECLINED USER");
        setCardExpiry("12/28");
        setSandboxInput2("123");
      }
    }
  };

  const handleInput1Change = (e) => {
    if (simulatedError) setSimulatedError("");
    const clean = e.target.value.replace(/\D/g, "");
    const maxLen = isWallet ? 11 : 16;
    const truncated = clean.slice(0, maxLen);
    setSandboxInput1(truncated);

    if (hasInteracted) {
      if (isWallet) {
        if (truncated.length > 0 && !truncated.startsWith("03")) {
          setErrors((prev) => ({ ...prev, input1: "Mobile account number must start with 03." }));
        } else if (truncated.length === 11) {
          setErrors((prev) => ({ ...prev, input1: "" }));
        }
      } else if (truncated.length === 16) {
        setErrors((prev) => ({ ...prev, input1: "" }));
      }
    }
  };

  const handleInput2Change = (e) => {
    if (simulatedError) setSimulatedError("");
    const clean = e.target.value.replace(/\D/g, "");
    const maxLen = isWallet ? 4 : 4;
    const truncated = clean.slice(0, maxLen);
    setSandboxInput2(truncated);

    if (hasInteracted) {
      if (isWallet && truncated.length === 4) {
        setErrors((prev) => ({ ...prev, input2: "" }));
      } else if (!isWallet && truncated.length >= 3) {
        setErrors((prev) => ({ ...prev, input2: "" }));
      }
    }
  };

  const handleExpiryChange = (e) => {
    let clean = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (clean.length >= 3) {
      clean = clean.slice(0, 2) + "/" + clean.slice(2);
    }
    setCardExpiry(clean);
  };

  const formatCardNumber = (numStr) => {
    const clean = (numStr || "").replace(/\D/g, "").slice(0, 16);
    return clean.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setHasInteracted(true);
    setSimulatedError("");

    if (!validate()) {
      return;
    }

    const clean1 = (sandboxInput1 || "").replace(/\D/g, "");
    const clean2 = (sandboxInput2 || "").replace(/\D/g, "");

    // 🔴 Scenario 1: Insufficient Balance Simulation
    const isInsufficient = isWallet
      ? clean1 === "03009999001"
      : clean1 === "4000000000000002";

    if (isInsufficient) {
      const msg = isWallet
        ? `Insufficient balance in your ${methodTitle} account. (Required: Rs ${Number(total).toLocaleString()}). Please recharge and try again.`
        : `Insufficient funds on card. Transaction rejected by issuing bank.`;
      handleSandboxPay(null, "low_balance", msg);
      return;
    }

    // 🔴 Scenario 2: Declined / Failed Simulation
    const isDeclined = isWallet
      ? clean1 === "03009999002" || clean2 === "0000"
      : clean1 === "4000000000000003" || clean2 === "000";

    if (isDeclined) {
      const msg = isWallet
        ? `Transaction declined by ${methodTitle} gateway (M-PIN mismatch or account restricted).`
        : `Card declined by bank fraud prevention security check.`;
      handleSandboxPay(null, "declined", msg);
      return;
    }

    // 🟢 Scenario 3: Approved Success
    const txnRef = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(
      100000 + Math.random() * 900000
    )}`;

    handleSandboxPay(txnRef, "success");
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          disabled={sandboxLoading}
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 dark:hover:text-white border-none bg-transparent cursor-pointer p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
          aria-label="Close payment modal"
        >
          <LuX className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="p-2.5 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-xs">
            {isWallet ? (
              <LuSmartphone className="w-5 h-5 text-amber-500" />
            ) : (
              <LuCreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            )}
          </span>
          <div>
            <h3 className="font-['Oswald',sans-serif] font-bold text-lg uppercase tracking-wide text-neutral-900 dark:text-white m-0">
              {methodTitle}
            </h3>
          </div>
        </div>

        {/* Amount Card (Screenshot 1 matching) */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 mb-4 text-center">
          <div className="text-2xl sm:text-3xl font-black font-['Oswald',sans-serif] text-neutral-900 dark:text-white">
            Rs. {Number(total).toLocaleString()}
          </div>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            Amount to pay
          </span>
        </div>

        {/* Show Sandbox Test Data Toggle Button (Screenshot 1 matching) */}
        <button
          type="button"
          onClick={() => setShowSandboxData(!showSandboxData)}
          className="w-full mb-4 py-2 px-3 rounded-xl bg-amber-100/70 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-amber-100 transition-all"
        >
          <LuPencil className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>{showSandboxData ? "Hide Sandbox Test Data" : "Show Sandbox Test Data"}</span>
        </button>

        {/* Quick Sandbox Test Presets & Numbers Box */}
        {showSandboxData && (
          <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/60 text-xs mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 text-[11px] flex items-center gap-1.5">
                <span>🧪</span> Quick Test Autofill:
              </span>
              <span className="text-[10px] text-amber-500 dark:text-amber-400 font-semibold">
                Tap button to fill
              </span>
            </div>

            {/* Quick Autofill Buttons */}
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {/* 🟢 Success */}
              <button
                type="button"
                onClick={() => applyPreset("success")}
                className="p-1.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
              >
                <span className="font-bold text-[11px] flex items-center gap-1">
                  <span>✅</span> Success
                </span>
                <span className="text-[9px] opacity-75 font-mono mt-0.5 truncate">
                  {isWallet ? "03001234567" : "4242••••4242"}
                </span>
              </button>

              {/* 🟡 Low Balance */}
              <button
                type="button"
                onClick={() => applyPreset("low_balance")}
                className="p-1.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 border-amber-500/30 text-amber-700 dark:text-amber-400"
              >
                <span className="font-bold text-[11px] flex items-center gap-1">
                  <span>⚠️</span> Low Bal
                </span>
                <span className="text-[9px] opacity-75 font-mono mt-0.5 truncate">
                  {isWallet ? "03009999001" : "4000••••0002"}
                </span>
              </button>

              {/* 🔴 Declined */}
              <button
                type="button"
                onClick={() => applyPreset("declined")}
                className="p-1.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 border-rose-500/30 text-rose-700 dark:text-rose-400"
              >
                <span className="font-bold text-[11px] flex items-center gap-1">
                  <span>❌</span> Decline
                </span>
                <span className="text-[9px] opacity-75 font-mono mt-0.5 truncate">
                  {isWallet ? "03009999002" : "4000••••0003"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Payment Input Form */}
        <div className="space-y-3.5 mb-5">
          {/* ==============================================================
              CASE A: CREDIT / DEBIT CARD INPUTS (Screenshot 1 Layout)
              ============================================================== */}
          {!isWallet ? (
            <>
              {/* Field 1: Card Number */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  Card Number
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-neutral-400 pointer-events-none">
                    <LuCreditCard className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    disabled={sandboxLoading}
                    value={formatCardNumber(sandboxInput1)}
                    onChange={handleInput1Change}
                    placeholder="4242 4242 4242 4242"
                    className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white font-mono tracking-wider focus:outline-none focus:border-blue-500 transition-all"
                  />
                  <span className="absolute right-3 px-2 py-0.5 rounded bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black tracking-wider pointer-events-none">
                    VISA
                  </span>
                </div>
                {errors.input1 && (
                  <p className="text-xs text-red-500 mt-1 m-0">{errors.input1}</p>
                )}
              </div>

              {/* Field 2: Cardholder Name */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  disabled={sandboxLoading}
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="TEST VISA USER"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white uppercase tracking-wider focus:outline-none focus:border-blue-500 transition-all"
                />
                {errors.cardName && (
                  <p className="text-xs text-red-500 mt-1 m-0">{errors.cardName}</p>
                )}
              </div>

              {/* Field 3 & 4: Expiry Date & CVV (2 Columns) */}
              <div className="grid grid-cols-2 gap-3">
                {/* Expiry Date */}
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    disabled={sandboxLoading}
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    placeholder="12/28"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white font-mono tracking-wider focus:outline-none focus:border-blue-500 transition-all"
                  />
                  {errors.cardExpiry && (
                    <p className="text-xs text-red-500 mt-1 m-0">{errors.cardExpiry}</p>
                  )}
                </div>

                {/* CVV */}
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                    CVV
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      disabled={sandboxLoading}
                      value={sandboxInput2}
                      onChange={handleInput2Change}
                      placeholder="•••"
                      className="w-full px-3.5 pr-8 py-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white font-mono tracking-widest focus:outline-none focus:border-blue-500 transition-all"
                    />
                    <LuShieldCheck className="absolute right-2.5 text-neutral-400 w-4 h-4 pointer-events-none" />
                  </div>
                  {errors.input2 && (
                    <p className="text-xs text-red-500 mt-1 m-0">{errors.input2}</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* ==============================================================
               CASE B: MOBILE WALLET INPUTS (JazzCash / EasyPaisa)
               ============================================================== */
            <>
              {/* Field 1: Mobile Number */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                  Mobile Account Number *
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 text-xs font-mono font-bold">
                    🇵🇰 +92
                  </div>
                  <input
                    type="tel"
                    disabled={sandboxLoading}
                    value={sandboxInput1}
                    onChange={handleInput1Change}
                    placeholder="03XXXXXXXXX"
                    className="w-full pl-20 pr-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white font-mono tracking-wider focus:outline-none focus:border-amber-400 transition-all"
                  />
                  {isWallet && /^03[0-9]{9}$/.test(sandboxInput1) && (
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-400 text-sm">
                      <FaCheckCircle />
                    </div>
                  )}
                </div>
                {errors.input1 && (
                  <p className="text-xs text-red-500 mt-1 m-0">{errors.input1}</p>
                )}
              </div>

              {/* Field 2: MPIN */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                  4-Digit Security MPIN *
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  disabled={sandboxLoading}
                  value={sandboxInput2}
                  onChange={handleInput2Change}
                  placeholder="••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white font-mono tracking-widest focus:outline-none focus:border-amber-400 transition-all"
                />
                {errors.input2 && (
                  <p className="text-xs text-red-500 mt-1 m-0">{errors.input2}</p>
                )}
              </div>
            </>
          )}

          {/* Security Note (Screenshot 1 matching) */}
          <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 flex items-start gap-2 text-[11px] text-neutral-600 dark:text-neutral-400 leading-snug">
            <span className="text-emerald-500 text-xs mt-0.5">🛡️</span>
            <span>Your card information is encrypted and secure. Sandbox mode - no real charges.</span>
          </div>

          {/* Submit Action Button (Screenshot 1 matching: Navy/Blue for card, Amber for wallet) */}
          <button
            type="button"
            onClick={onSubmit}
            disabled={sandboxLoading || !isFormValid}
            className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 border-none cursor-pointer ${
              !isWallet
                ? "bg-[#1e2988] hover:bg-[#19226f] text-white active:scale-[0.98]"
                : "bg-amber-400 hover:bg-amber-500 text-neutral-950 active:scale-[0.98]"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {sandboxLoading ? (
              <span>Processing...</span>
            ) : !isWallet ? (
              <span>Pay Rs. {Number(total).toLocaleString()} via Card</span>
            ) : (
              <span>Pay Rs. {Number(total).toLocaleString()} via {methodTitle}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
