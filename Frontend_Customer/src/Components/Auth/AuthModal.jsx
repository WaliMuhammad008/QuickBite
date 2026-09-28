import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaTimes,
  FaSpinner,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTag,
  FaCopy,
  FaArrowRight,
  FaKey,
  FaShieldAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { useAuth } from "../../Context/AuthContext";

// Safe JWT Decoder for Google OAuth Credential
const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Failed to parse Google JWT credential:", err);
    return null;
  }
};

const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    login,
    googleLogin,
    register,
    requestPasswordReset,
    confirmPasswordReset,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPromo, setCopiedPromo] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regFullName, setRegFullName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  // Forgot Password state
  const [forgotStep, setForgotStep] = useState(1); // 1: Request code, 2: Reset password
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotEmailError, setForgotEmailError] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [formError, setFormError] = useState("");

  const tokenClientRef = useRef(null);

  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "1049603766930-trlpcl7it3m6u5q0a2nb4cg0csm4n4vn.apps.googleusercontent.com";

  // Google OAuth Response Handler (from Access Token -> UserInfo)
  const processGoogleAccessToken = useCallback(
    async (accessToken) => {
      setGoogleLoading(true);
      setFormError("");

      try {
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!userInfoRes.ok) {
          throw new Error("Failed to fetch Google profile info");
        }

        const payload = await userInfoRes.json();
        if (!payload || !payload.email || !payload.sub) {
          toast.error("Could not extract user details from Google.");
          setGoogleLoading(false);
          return;
        }

        const res = await googleLogin({
          email: payload.email,
          name: payload.name || payload.given_name || "Google User",
          google_id: payload.sub,
          avatar: payload.picture || "",
        });

        if (!res.success) {
          setFormError(res.message || "Failed to authenticate with Google.");
        }
      } catch (err) {
        console.error("Google login processing error:", err);
        setFormError("An unexpected error occurred during Google sign-in.");
      } finally {
        setGoogleLoading(false);
      }
    },
    [googleLogin]
  );

  // Initialize Google Token Client
  useEffect(() => {
    if (!isAuthModalOpen) return;

    const initTokenClient = () => {
      if (window.google?.accounts?.oauth2) {
        try {
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: "email profile openid",
            callback: (tokenResponse) => {
              if (tokenResponse?.error) {
                console.warn("Google OAuth popup closed or error:", tokenResponse);
                return;
              }
              if (tokenResponse?.access_token) {
                processGoogleAccessToken(tokenResponse.access_token);
              }
            },
          });
        } catch (e) {
          console.warn("Google OAuth token client init error:", e);
        }
      }
    };

    if (window.google?.accounts?.oauth2) {
      initTokenClient();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.oauth2) {
          initTokenClient();
          clearInterval(timer);
        }
      }, 250);
      return () => clearInterval(timer);
    }
  }, [isAuthModalOpen, clientId, processGoogleAccessToken]);

  if (!isAuthModalOpen) return null;

  // Direct Button Click Handler
  const handleGoogleSignInClick = () => {
    if (googleLoading) return;
    setFormError("");

    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken({ prompt: "select_account" });
      return;
    }

    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "email profile openid",
          callback: (tokenResponse) => {
            if (tokenResponse?.access_token) {
              processGoogleAccessToken(tokenResponse.access_token);
            }
          },
        });
        tokenClientRef.current = client;
        client.requestAccessToken({ prompt: "select_account" });
        return;
      } catch (err) {
        console.error("Google OAuth token client error:", err);
      }
    }

    toast.error("Google services are loading. Please try again in a moment.");
  };

  const handleCopyPromo = () => {
    navigator.clipboard.writeText("WELCOME50");
    setCopiedPromo(true);
    toast.success("Promo code WELCOME50 copied!");
    setTimeout(() => setCopiedPromo(false), 2500);
  };

  // Validation regex helpers
  const isValidPakMobile = (phone) => /^03\d{9}$/.test((phone || "").replace(/\D/g, ""));
  const isValidEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test((email || "").trim());

  // Input change handlers with formatting & restriction
  const handleLoginIdentifierChange = (e) => {
    const val = e.target.value;
    if (/^03\d*$/.test(val) && val.length > 11) {
      setLoginIdentifier(val.slice(0, 11));
    } else {
      setLoginIdentifier(val);
    }
    if (formError) setFormError("");
  };

  const handleRegPhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    setRegPhone(digits);
    if (formError) setFormError("");
  };

  const handleRegEmailChange = (e) => {
    setRegEmail(e.target.value);
    if (formError) setFormError("");
  };

  const handleForgotIdentifierChange = (e) => {
    setForgotIdentifier(e.target.value);
    if (forgotEmailError) setForgotEmailError("");
    if (formError) setFormError("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const idVal = loginIdentifier.trim();
    if (!idVal || !loginPassword) {
      setFormError("Please enter your phone number / email and password.");
      return;
    }

    if (idVal.includes("@")) {
      if (!isValidEmail(idVal)) {
        setFormError("Please enter a valid email address (e.g. user@gmail.com).");
        return;
      }
    } else {
      const cleanDigits = idVal.replace(/\D/g, "");
      if (!isValidPakMobile(cleanDigits)) {
        setFormError("Mobile number must start with 03 and be exactly 11 digits (e.g. 03001234567).");
        return;
      }
    }

    setLoading(true);
    const res = await login({
      identifier: idVal.includes("@") ? idVal : idVal.replace(/\D/g, ""),
      password: loginPassword,
    });
    setLoading(false);

    if (!res.success) {
      setFormError(res.message || "Invalid credentials.");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const cleanPhone = regPhone.replace(/\D/g, "");
    const cleanEmail = regEmail.trim();

    if (!regFullName.trim() || !cleanPhone || !regPassword) {
      setFormError("Full name, phone number, and password are required.");
      return;
    }

    if (!isValidPakMobile(cleanPhone)) {
      setFormError("Mobile number must start with 03 and be exactly 11 digits (e.g. 03001234567).");
      return;
    }

    if (cleanEmail && !isValidEmail(cleanEmail)) {
      setFormError("Please enter a valid email address format (e.g. user@gmail.com).");
      return;
    }

    if (regPassword.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await register({
      full_name: regFullName.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      password: regPassword,
    });
    setLoading(false);

    if (!res.success) {
      setFormError(res.message || "Failed to create account.");
    }
  };

  // Forgot Password Step 1
  const handleForgotRequest = async (e) => {
    e.preventDefault();
    setFormError("");
    setForgotEmailError("");

    const emailVal = forgotIdentifier.trim();
    if (!emailVal) {
      setForgotEmailError("Please enter your registered email address.");
      return;
    }

    if (!isValidEmail(emailVal)) {
      setForgotEmailError("Invalid email");
      return;
    }

    setLoading(true);
    const res = await requestPasswordReset(emailVal);
    setLoading(false);

    if (res.success) {
      setForgotStep(2);
    } else {
      if (res.error_type === "NOT_REGISTERED") {
        setForgotEmailError("Invalid email");
      } else {
        setFormError(res.message || "Could not process request.");
      }
    }
  };

  // Forgot Password Step 2
  const handleForgotConfirm = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!resetCode.trim() || !newPassword) {
      setFormError("Please enter reset code and your new password.");
      return;
    }

    if (newPassword.length < 6) {
      setFormError("New password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const res = await confirmPasswordReset({
      identifier: forgotIdentifier.trim(),
      reset_code: resetCode.trim(),
      new_password: newPassword,
    });
    setLoading(false);

    if (res.success) {
      setAuthModalTab("login");
      setForgotStep(1);
    } else {
      setFormError(res.message || "Failed to reset password.");
    }
  };

  const isRegister = authModalTab === "register";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* 2-Panel Split Sliding Modal Container */}
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-[#111114] border border-gray-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-900 dark:text-white max-h-[92vh] md:h-[680px] flex flex-col md:block transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Absolute Close Button (Always On Top) */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-gray-100/90 dark:bg-neutral-900/90 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-700/60 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg backdrop-blur-sm"
          aria-label="Close modal"
        >
          <FaTimes className="w-3.5 h-3.5" />
        </button>

        {/* ═══════════════════════════════════════════════════════════
            HIGH-RES ARTWORK & PROMO PANEL (Sliding Desktop Panel)
            ═══════════════════════════════════════════════════════════ */}
        <div
          className={`w-full md:w-1/2 md:h-full md:absolute md:top-0 md:left-0 z-30 transition-transform duration-[700ms] ease-in-out hidden md:flex flex-col justify-between p-8 lg:p-10 overflow-hidden ${
            isRegister
              ? "md:translate-x-full md:border-l border-gray-200 dark:border-neutral-800"
              : "md:translate-x-0 md:border-r border-gray-200 dark:border-neutral-800"
          }`}
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=900&auto=format&fit=crop")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark Glass Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60 pointer-events-none"></div>

          {/* Hero Heading & Description Block (Smoothly glides vertically) */}
          <div
            className={`relative z-10 transition-transform duration-700 ease-in-out transform ${
              isRegister ? "translate-y-0" : "translate-y-24 lg:translate-y-28"
            }`}
          >
            {/* Top Active Discount Tag (Smooth drop & fade) */}
            <div
              className={`transition-all duration-500 ease-in-out transform ${
                isRegister
                  ? "opacity-100 translate-y-0 max-h-12 mb-4"
                  : "opacity-0 -translate-y-4 max-h-0 mb-0 overflow-hidden pointer-events-none"
              }`}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[11px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>WELCOME DISCOUNT ACTIVE</span>
              </div>
            </div>

            <h2 className="font-['Oswald',sans-serif] font-black text-3xl text-white tracking-wide uppercase leading-tight drop-shadow-md">
              FEAST MORE,{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                PAY LESS.
              </span>
            </h2>
            <p className="text-xs text-neutral-300 mt-2 leading-relaxed drop-shadow-sm">
              Unlock member discounts, 1-click reorder pipelines, and live kitchen dispatch tracking.
            </p>
          </div>

          {/* Center Promo Voucher Box (Smooth float up & scale fade) */}
          <div
            className={`relative z-10 my-4 transition-all duration-700 ease-in-out transform ${
              isRegister
                ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                : "opacity-0 translate-y-12 scale-90 pointer-events-none"
            }`}
          >
            <div className="p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-amber-500/40 shadow-xl">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FaTag className="text-xs" /> FIRST ORDER PROMO
                </span>
                <span className="text-[10px] font-bold bg-amber-400 text-black px-2 py-0.5 rounded-full uppercase font-mono">
                  20% OFF
                </span>
              </div>
              <div className="flex items-center justify-between bg-neutral-900/90 border border-amber-500/50 rounded-xl px-3 py-2">
                <span className="font-mono font-black text-sm tracking-widest text-amber-300">
                  WELCOME50
                </span>
                <button
                  type="button"
                  onClick={handleCopyPromo}
                  className="flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase bg-transparent border-none cursor-pointer"
                >
                  {copiedPromo ? <FaCheckCircle className="text-emerald-400" /> : <FaCopy />}
                  <span>{copiedPromo ? "Copied" : "Copy Code"}</span>
                </button>
              </div>
              <p className="text-[10px] text-neutral-300 mt-2 leading-tight">
                Apply code at checkout for instant 20% discount on your entire cart.
              </p>
            </div>
          </div>

          {/* Bottom Switch Button Inside Artwork Panel */}
          <div className="relative z-10 pt-4 border-t border-white/15 text-center">
            <p className="text-xs text-neutral-200 font-medium mb-2.5 transition-all">
              {isRegister ? (
                <span>Already have an account? <strong className="text-white">Sign In Now</strong></span>
              ) : (
                <span>New to BigBite? <strong className="text-white">Create New Account</strong></span>
              )}
            </p>
            <button
              type="button"
              onClick={() => {
                setFormError("");
                setAuthModalTab(isRegister ? "login" : "register");
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-['Oswald',sans-serif] font-black text-xs uppercase tracking-wider backdrop-blur-md transition-all active:scale-98 cursor-pointer shadow-md"
            >
              {isRegister ? "Sign In to Account" : "Create New Account"}
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            FORM PANEL (Sliding Desktop / Full Mobile Column)
            ═══════════════════════════════════════════════════════════ */}
        <div
          className={`w-full md:w-1/2 md:h-full md:absolute md:top-0 md:left-1/2 z-20 transition-transform duration-[700ms] ease-in-out bg-white dark:bg-[#111114] p-6 sm:p-8 md:p-10 flex flex-col justify-center overflow-y-auto ${
            isRegister ? "md:-translate-x-full" : "md:translate-x-0"
          }`}
        >
          {/* Header */}
          <div className="mb-5">
            <div className="flex items-center gap-2.5 mb-2">
              
            </div>
 
            <h3 className="font-['Oswald',sans-serif] font-black text-2xl sm:text-3xl text-zinc-900 dark:text-white uppercase tracking-tight">
              {authModalTab === "login"
                ? "Welcome Back"
                : authModalTab === "register"
                ? "Create Account"
                : "Reset Password"}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-neutral-400 mt-1">
              {authModalTab === "login"
                ? "Access saved addresses, past orders, and instant 1-click reordering."
                : authModalTab === "register"
                ? "Sign up in seconds to claim your WELCOME50 voucher."
                : "Enter your phone or email to recover account access."}
            </p>
          </div>

          {/* Error Banner */}
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-xs flex items-center gap-2 animate-shake">
              <span className="font-bold">⚠️</span>
              <span>{formError}</span>
            </div>
          )}

          {/* Official Google OAuth Sign-In (Shown on Login & Register) */}
          {authModalTab !== "forgot" && (
            <div className="space-y-3 mb-5">
              <button
                type="button"
                onClick={handleGoogleSignInClick}
                disabled={googleLoading}
                className="w-full h-[44px] py-2.5 px-4 rounded-xl bg-gray-50 dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800/90 border border-gray-300 dark:border-neutral-700 hover:border-amber-500 dark:hover:border-[#F59E0B] text-zinc-800 dark:text-white font-semibold text-xs flex items-center justify-center gap-3 transition-all duration-200 active:scale-98 shadow-xs cursor-pointer disabled:opacity-50 group"
              >
                {googleLoading ? (
                  <FaSpinner className="animate-spin text-amber-500 dark:text-amber-400 text-sm" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span className="group-hover:text-amber-500 dark:group-hover:text-amber-300 transition-colors">
                  {authModalTab === "login" ? "Continue with Google" : "Sign Up with Google"}
                </span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-[1px] bg-gray-200 dark:bg-neutral-800"></div>
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-neutral-500 tracking-wider">
                  or with credentials
                </span>
                <div className="flex-1 h-[1px] bg-gray-200 dark:bg-neutral-800"></div>
              </div>
            </div>
          )}

          {/* ════ TAB 1: LOGIN FORM ════ */}
          {authModalTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="mb-3.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-neutral-400 mb-1.5">
                  Mobile Number or Email
                </label>
                <div className="relative"> 
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-neutral-500">
                    <FaUser className="text-xs" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="03XXXXXXXXX or email@gmail.com"
                    value={loginIdentifier}
                    onChange={handleLoginIdentifierChange}
                    className={`w-full pl-9 pr-9 py-2.5 bg-gray-50 dark:bg-neutral-900 border rounded-xl text-zinc-900 dark:text-white text-xs placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none transition-all ${
                      isValidPakMobile(loginIdentifier) || (loginIdentifier.includes("@") && isValidEmail(loginIdentifier))
                        ? "border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        : (/^\d+$/.test(loginIdentifier) && loginIdentifier.length >= 2 && !loginIdentifier.startsWith("03")) ||
                          (loginIdentifier.includes("@") && !isValidEmail(loginIdentifier))
                        ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-gray-300 dark:border-neutral-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    }`}
                  />
                  {(isValidPakMobile(loginIdentifier) || (loginIdentifier.includes("@") && isValidEmail(loginIdentifier))) && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-emerald-500 text-xs">
                      <FaCheckCircle />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-neutral-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFormError("");
                      setAuthModalTab("forgot");
                    }}
                    className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-neutral-500">
                    <FaLock className="text-xs" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700/80 focus:border-amber-500 rounded-xl text-zinc-900 dark:text-white text-md placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-white bg-transparent border-none cursor-pointer"
                  >
                    {showPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-['Oswald',sans-serif] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50 border-none"
              >
                {loading ? <FaSpinner className="animate-spin text-sm" /> : <FaArrowRight />}
                <span>{loading ? "Signing In..." : "Sign In to Account"}</span>
              </button>

              {/* Mobile Switch Link */}
              <div className="md:hidden pt-3 text-center border-t border-gray-200 dark:border-neutral-800/80 mt-4">
                <span className="text-xs text-zinc-600 dark:text-neutral-400">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setFormError("");
                    setAuthModalTab("register");
                  }}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline bg-transparent border-none cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          )}

          {/* ════ TAB 2: REGISTER FORM ════ */}
          {authModalTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-neutral-400 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-neutral-500">
                    <FaUser className="text-xs" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muneeb Hassan"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700/80 focus:border-amber-500 rounded-xl text-zinc-900 dark:text-white text-xs placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-neutral-400 mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-neutral-500">
                      <FaPhone className="text-xs" />
                    </div>
                    <input
                      type="tel"
                      required
                      maxLength={11}
                      placeholder="03XXXXXXXXX"
                      value={regPhone}
                      onChange={handleRegPhoneChange}
                      className={`w-full pl-9 pr-9 py-2.5 bg-gray-50 dark:bg-neutral-900 border rounded-xl text-zinc-900 dark:text-white text-xs placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none transition-all ${
                        isValidPakMobile(regPhone)
                          ? "border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          : regPhone.length >= 2 && !regPhone.startsWith("03")
                          ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-gray-300 dark:border-neutral-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      }`}
                    />
                    {isValidPakMobile(regPhone) && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-emerald-500 text-xs">
                        <FaCheckCircle />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-neutral-400 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-neutral-500">
                      <FaEnvelope className="text-xs" />
                    </div>
                    <input
                      type="email"
                      placeholder="you@email.com"
                      value={regEmail}
                      onChange={handleRegEmailChange}
                      className={`w-full pl-9 pr-9 py-2.5 bg-gray-50 dark:bg-neutral-900 border rounded-xl text-zinc-900 dark:text-white text-xs placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none transition-all ${
                        regEmail.trim().length > 0
                          ? isValidEmail(regEmail)
                            ? "border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            : "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-gray-300 dark:border-neutral-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      }`}
                    />
                    {regEmail.trim().length > 0 && isValidEmail(regEmail) && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-emerald-500 text-xs">
                        <FaCheckCircle />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-neutral-400 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-neutral-500">
                      <FaLock className="text-xs" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Min 6 chars"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700/80 focus:border-amber-500 rounded-xl text-zinc-900 dark:text-white text-xs placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-neutral-400 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-neutral-500">
                      <FaShieldAlt className="text-xs" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Repeat password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700/80 focus:border-amber-500 rounded-xl text-zinc-900 dark:text-white text-xs placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-['Oswald',sans-serif] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50 border-none"
              >
                {loading ? <FaSpinner className="animate-spin text-sm" /> : <FaArrowRight />}
                <span>{loading ? "Creating Account..." : "Create Free Account"}</span>
              </button>

              {/* Mobile Switch Link */}
              <div className="md:hidden pt-3 text-center border-t border-gray-200 dark:border-neutral-800/80 mt-3">
                <span className="text-xs text-zinc-600 dark:text-neutral-400">Already a member? </span>
                <button
                  type="button"
                  onClick={() => {
                    setFormError("");
                    setAuthModalTab("login");
                  }}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline bg-transparent border-none cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* ════ TAB 3: FORGOT PASSWORD FORM ════ */}
          {authModalTab === "forgot" && (
            <div className="space-y-4">
              {forgotStep === 1 ? (
                <form onSubmit={handleForgotRequest} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-neutral-400 mb-1">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-neutral-500">
                        <FaEnvelope className="text-xs" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="you@gmail.com"
                        value={forgotIdentifier}
                        onChange={handleForgotIdentifierChange}
                        className={`w-full pl-9 pr-9 py-2.5 bg-gray-50 dark:bg-neutral-900 border rounded-xl text-zinc-900 dark:text-white text-xs placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none transition-all ${
                          forgotEmailError
                            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            : isValidEmail(forgotIdentifier)
                            ? "border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            : "border-gray-300 dark:border-neutral-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                        }`}
                      />
                      {isValidEmail(forgotIdentifier) && !forgotEmailError && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-emerald-500 text-xs">
                          <FaCheckCircle />
                        </div>
                      )}
                    </div>
                    {forgotEmailError && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 font-medium flex items-center gap-1.5 animate-fade-in">
                        <span>⚠️</span> {forgotEmailError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-['Oswald',sans-serif] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer disabled:opacity-50 border-none"
                  >
                    {loading ? <FaSpinner className="animate-spin text-sm" /> : <FaKey />}
                    <span>{loading ? "Sending OTP..." : "Send Verification Code"}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleForgotConfirm} className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-zinc-800 dark:text-neutral-300 leading-relaxed">
                    6-digit verification code sent to <strong className="text-amber-600 dark:text-amber-400 font-semibold">{forgotIdentifier}</strong> (Valid for 2 minutes). Check your Gmail inbox or spam.
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-neutral-400 mb-1">
                      6-Digit Reset Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="123456"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700/80 focus:border-amber-500 rounded-xl text-zinc-900 dark:text-white text-center font-mono font-black text-base tracking-widest focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-neutral-400 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700/80 focus:border-amber-500 rounded-xl text-zinc-900 dark:text-white text-xs placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-['Oswald',sans-serif] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer disabled:opacity-50 border-none"
                  >
                    {loading ? <FaSpinner className="animate-spin text-sm" /> : <FaCheckCircle />}
                    <span>{loading ? "Resetting..." : "Confirm New Password"}</span>
                  </button>
                </form>
              )}

              <div className="pt-2 text-center border-t border-gray-200 dark:border-neutral-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setFormError("");
                    setForgotEmailError("");
                    setAuthModalTab("login");
                    setForgotStep(1);
                  }}
                  className="text-xs font-bold text-zinc-500 dark:text-neutral-400 hover:text-zinc-800 dark:hover:text-white bg-transparent border-none cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
