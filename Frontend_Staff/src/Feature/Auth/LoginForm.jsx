import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaUserShield,
  FaLock,
  FaUser,
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaKey,
  FaPaperPlane,
  FaRedo,
  FaEdit,
  FaCheckCircle,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { useStaffAuth, getRoleDashboard } from "../../Context/AuthContext";

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useStaffAuth();

  // Screen View: "login" | "forgot"
  const [activeView, setActiveView] = useState("login");

  // Standard Login State
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password Flow State
  const [forgotStep, setForgotStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP + New Password
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSendingResetOtp, setIsSendingResetOtp] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const otpInputRef = useRef(null);

  // Auto-redirect if already logged in directly to designated role dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const destination = getRoleDashboard(user.role);
      navigate(destination, { replace: true, state: {} });
    }
  }, [isAuthenticated, user, navigate]);

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus OTP input on Step 2 of forgot password
  useEffect(() => {
    if (activeView === "forgot" && forgotStep === 2 && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [activeView, forgotStep]);

  const handleBackToStore = () => {
    const configuredUrl = import.meta.env.VITE_CUSTOMER_URL;
    if (configuredUrl) {
      window.open(configuredUrl, "_blank");
      return;
    }
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      const targetPort = window.location.port === "5173" ? "5174" : "5173";
      window.open(`http://${window.location.hostname}:${targetPort}`, "_blank");
    } else {
      window.open("/", "_blank");
    }
  };

  // 1. Standard Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();

    const cleanUsername = (loginId || "").trim();
    if (!cleanUsername || !password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Credentials",
        text: "Please enter your username/phone and password!",
        background: "#171717",
        color: "#fff",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/login.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: cleanUsername, password }),
        }
      );

      const result = await response.json();

      if (result.success && result.user && result.token) {
        login(result.user, result.token);

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: `Welcome back, ${result.user.name}!`,
          showConfirmButton: false,
          timer: 1500,
          background: "#171717",
          color: "#fff",
        });

        const targetRoute = getRoleDashboard(result.user.role);
        if (targetRoute && targetRoute !== "/login") {
          navigate(targetRoute, { replace: true, state: {} });
        } else {
          Swal.fire({
            icon: "error",
            title: "Role Unassigned",
            text: "Your role is not mapped to any staff portal. Please contact management.",
            background: "#171717",
            color: "#fff",
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: result.message || "Invalid username or password!",
          background: "#171717",
          color: "#fff",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Unable to reach the authentication server. Please check connection.",
        background: "#171717",
        color: "#fff",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Request Password Reset OTP Handler
  const handleRequestResetOtp = async (e) => {
    if (e) e.preventDefault();

    const cleanEmail = (resetEmail || "").trim();
    if (!cleanEmail) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter your registered staff email address.",
        background: "#171717",
        color: "#fff",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email Format",
        text: "Please enter a valid email address (e.g. staff@gmail.com).",
        background: "#171717",
        color: "#fff",
      });
      return;
    }

    setIsSendingResetOtp(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/staff_forgot_password.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "request",
            email: cleanEmail,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setForgotStep(2);
        setCooldown(result.cooldown || 60);
        setResetOtp("");
        setNewPassword("");
        setConfirmPassword("");

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Reset code sent to your Gmail!",
          showConfirmButton: false,
          timer: 3000,
          background: "#171717",
          color: "#fff",
        });
      } else {
        if (result.cooldown) {
          setCooldown(result.cooldown);
        }
        Swal.fire({
          icon: "error",
          title: "Request Failed",
          text: result.message || "Failed to dispatch password reset code.",
          background: "#171717",
          color: "#fff",
        });
      }
    } catch (error) {
      console.error("Forgot password request error:", error);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Failed to connect to the authentication server.",
        background: "#171717",
        color: "#fff",
      });
    } finally {
      setIsSendingResetOtp(false);
    }
  };

  // 3. Verify OTP and Set New Password Handler
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();

    const cleanOtp = (resetOtp || "").trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Code",
        text: "Please enter the complete 6-digit verification code.",
        background: "#171717",
        color: "#fff",
      });
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      Swal.fire({
        icon: "warning",
        title: "Password Too Short",
        text: "New password must be at least 8 characters long.",
        background: "#171717",
        color: "#fff",
      });
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      Swal.fire({
        icon: "warning",
        title: "Uppercase Letter Required",
        text: "New password must contain at least one uppercase letter (A-Z).",
        background: "#171717",
        color: "#fff",
      });
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      Swal.fire({
        icon: "warning",
        title: "Special Character Required",
        text: "New password must contain at least one special character (!@#$%^&* etc.).",
        background: "#171717",
        color: "#fff",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Passwords Do Not Match",
        text: "New password and confirm password do not match.",
        background: "#171717",
        color: "#fff",
      });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/staff_forgot_password.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "reset",
            email: resetEmail.trim(),
            otp: cleanOtp,
            new_password: newPassword,
            confirm_password: confirmPassword,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Password Updated!",
          text: result.message || "Your password has been changed successfully. You can now login.",
          background: "#171717",
          color: "#fff",
          confirmButtonColor: "#f59e0b",
        });

        // Pre-fill username/email in login form and switch to login view
        setLoginId(resetEmail);
        setPassword("");
        setActiveView("login");
        setForgotStep(1);
        setResetOtp("");
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: result.message || "Could not reset password. Please check the code and try again.",
          background: "#171717",
          color: "#fff",
        });
      }
    } catch (error) {
      console.error("Staff reset password submission error:", error);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Unable to update password. Please check your connection.",
        background: "#171717",
        color: "#fff",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-[#0E0E12] text-slate-900 dark:text-white transition-colors">
      {/* ═══════════════════════════════════════════════════════════
          LEFT SIDE: VISUAL HERO (Visible on lg+, hidden on mobile)
          ═══════════════════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex flex-col justify-between relative p-12 lg:p-16 overflow-hidden bg-neutral-950 text-white"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1600&auto=format&fit=crop')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-black/55 backdrop-blur-[1px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div>
              <h1 className="font-['Oswald',sans-serif] font-black text-lg tracking-wider text-white uppercase m-0 leading-none">
                Bigbite
              </h1>
            </div>
          </div>
        </div>

        <div className="relative z-10 my-auto py-10 space-y-6 max-w-lg">
          <div>
            <h2 className="font-['Oswald',sans-serif] font-black text-4xl lg:text-5xl text-white uppercase tracking-tight leading-tight drop-shadow-md">
              Streamlined Kitchen.{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Instant Dispatch.
              </span>
            </h2>
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-neutral-400 text-xs font-mono">
          <div className="flex items-center gap-2">
            <FaUserShield className="text-amber-400 text-sm" />
            <span>Encrypted Session</span>
          </div>
          <span className="text-[11px] text-neutral-400 font-sans">
            © {new Date().getFullYear()} BigBite
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          RIGHT SIDE: FORM PANEL
          ═══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-16 min-h-screen bg-white dark:bg-[#0E0E12] text-slate-900 dark:text-white transition-colors relative">
        {/* Top Bar: Back to Store */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackToStore}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-500 dark:text-neutral-400 dark:hover:text-amber-400 transition-colors cursor-pointer bg-transparent border-none p-0 group"
          >
            <FaArrowLeft className="text-xs transition-transform group-hover:-translate-x-1" />
            <span>Back to Store</span>
          </button>

          <div className="lg:hidden flex items-center gap-2">
            <span className="font-['Oswald',sans-serif] font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Staff Portal
            </span>
          </div>
        </div>

        {/* Centered Form Wrapper */}
        <div className="w-full max-w-md mx-auto my-auto py-6">
          {/* ══════════════════════════════════════════════════════════
              VIEW 1: STANDARD STAFF LOGIN
              ══════════════════════════════════════════════════════════ */}
          {activeView === "login" && (
            <div className="animate-fade-in space-y-6">
              {/* Header Card */}
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-black font-['Oswald',sans-serif] uppercase tracking-wide text-slate-900 dark:text-white m-0">
                  Staff Login
                </h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1.5">
                  Sign in with your staff credentials to access operational dashboards
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Username Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                    Username or Mobile
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-neutral-500">
                      <FaUser className="text-xs" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. admin, cashier1, 03001234567"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveView("forgot");
                        setForgotStep(1);
                        if (loginId.includes("@")) {
                          setResetEmail(loginId);
                        }
                      }}
                      className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors bg-transparent border-none cursor-pointer p-0"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-neutral-500">
                      <FaLock className="text-xs" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] text-neutral-950 font-['Oswald',sans-serif] font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all cursor-pointer border-none flex items-center justify-center gap-2.5 disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <FaUserShield className="text-sm" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              VIEW 2: FORGOT / RESET PASSWORD SCREEN
              ══════════════════════════════════════════════════════════ */}
          {activeView === "forgot" && (
            <div className="animate-fade-in space-y-6">
              {/* Header Card */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setActiveView("login")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-500 dark:text-neutral-400 dark:hover:text-amber-400 transition-colors cursor-pointer bg-transparent border-none mb-3 p-0"
                >
                  <FaArrowLeft className="text-[10px]" />
                  <span>Back to Login</span>
                </button>
                <h2 className="text-2xl sm:text-3xl font-black font-['Oswald',sans-serif] uppercase tracking-wide text-slate-900 dark:text-white m-0">
                  Reset Password
                </h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1.5">
                  {forgotStep === 1
                    ? "Enter your registered Gmail to receive a 6-digit verification code"
                    : "Enter the verification code and choose a new secure password"}
                </p>
              </div>

              {/* STEP 1: Enter Registered Email */}
              {forgotStep === 1 && (
                <form onSubmit={handleRequestResetOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                      Staff Registered Gmail
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-neutral-500">
                        <FaEnvelope className="text-xs" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="e.g. staff@gmail.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400 pt-0.5">
                      We will verify your staff account and send a 6-digit password reset code.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingResetOtp || cooldown > 0}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] text-neutral-950 font-['Oswald',sans-serif] font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all cursor-pointer border-none flex items-center justify-center gap-2.5 disabled:opacity-50"
                  >
                    {isSendingResetOtp ? (
                      <>
                        <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                        <span>Sending Reset Code...</span>
                      </>
                    ) : cooldown > 0 ? (
                      <span>Wait {cooldown}s to Resend</span>
                    ) : (
                      <>
                        <FaPaperPlane className="text-xs" />
                        <span>Send Verification Code</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: Enter OTP + New Password */}
              {forgotStep === 2 && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  {/* Sent badge */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs truncate">
                      <FaCheckCircle className="text-amber-500 shrink-0" />
                      <span className="text-slate-700 dark:text-neutral-300 truncate font-mono text-[11px]">
                        {resetEmail}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 shrink-0 ml-2"
                    >
                      <FaEdit className="text-[10px]" />
                      <span>Change</span>
                    </button>
                  </div>

                  {/* 6-Digit Code */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                        6-Digit Reset Code
                      </label>
                      <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                        Valid for 5 mins
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-neutral-500">
                        <FaKey className="text-xs" />
                      </div>
                      <input
                        ref={otpInputRef}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        required
                        placeholder="1 2 3 4 5 6"
                        value={resetOtp}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setResetOtp(val);
                        }}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-lg font-mono font-black text-center tracking-[0.4em] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-neutral-500">
                        <FaLock className="text-xs" />
                      </div>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-neutral-500">
                        <FaLock className="text-xs" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder="Repeat new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                      </button>
                    </div>
                  </div>

                  {/* Resend Action */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-slate-500 dark:text-neutral-400 text-[11px]">
                      Didn't get the code?
                    </span>
                    <button
                      type="button"
                      disabled={cooldown > 0 || isSendingResetOtp}
                      onClick={() => handleRequestResetOtp()}
                      className="font-bold text-amber-500 hover:text-amber-400 disabled:text-slate-400 dark:disabled:text-neutral-600 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 text-[11px]"
                    >
                      <FaRedo className={`text-[9px] ${isSendingResetOtp ? "animate-spin" : ""}`} />
                      <span>{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}</span>
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isUpdatingPassword || resetOtp.length !== 6}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] text-neutral-950 font-['Oswald',sans-serif] font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all cursor-pointer border-none flex items-center justify-center gap-2.5 disabled:opacity-50 mt-1"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <FaKey className="text-xs" />
                        <span>Reset Password & Sign In</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-slate-400 dark:text-neutral-600 pt-4">
          BigBite Staff Operations & Dispatch System
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
