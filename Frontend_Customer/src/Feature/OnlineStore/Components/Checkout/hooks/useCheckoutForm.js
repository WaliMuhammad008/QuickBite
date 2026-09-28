import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useCart } from "../../../../../Context/CartContext";
import { useAuth } from "../../../../../Context/AuthContext";
import { useOrderSession } from "../../../../../Hooks/useOrderSession";
import { useCheckoutValidation } from "./useCheckoutValidation";
import { resolveAddressCoordinates } from "../../../../../utils/geocode";
import {
  getAccuratePosition,
  resolveCoordinatesToAddress,
} from "../../../../../utils/geoHydrator";
import { API_BASE } from "../../../../../config/api";

export const RESTAURANT_COORDS = { lat: 31.5204, lng: 74.3587 };
export const MAX_DELIVERY_RADIUS_KM = 10.0;

export function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const getCashMethodLabel = (type) => {
  if (type === "takeaway") return "Cash on Pickup";
  if (type === "dine_in") return "Cash";
  return "Cash on Delivery";
};

export function useCheckoutForm() {
  const navigate = useNavigate();
  const { cartItems, placeOrder } = useCart();
  const { customer, isAuthenticated, savedAddresses, openAuthModal } = useAuth();
  const { session, switchMode, clearDineIn } = useOrderSession();

  const [orderType, setOrderTypeState] = useState(session.mode || "delivery");
  const [customerName, setCustomerName] = useState(customer?.full_name || customer?.name || "");
  const [customerMobile, setCustomerMobile] = useState(customer?.phone || customer?.mobile || "");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [tableNumber, setTableNumber] = useState(session.tableNumber || "");
  const [paymentMethod, setPaymentMethod] = useState(() => getCashMethodLabel(session.mode || "delivery"));
  const [mapCoords, setMapCoords] = useState({
    lat: 31.5204,
    lng: 74.3587,
  });

  // Enterprise Promo & Rider Tip State
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [riderTip, setRiderTip] = useState(0);

  // Auto-fill from auth profile if customer logs in or changes
  useEffect(() => {
    if (customer) {
      if (!customerName && (customer.full_name || customer.name)) {
        setCustomerName(customer.full_name || customer.name);
      }
      if (!customerMobile && (customer.phone || customer.mobile)) {
        setCustomerMobile(customer.phone || customer.mobile);
      }
    }
  }, [customer]);

  // Synchronize dynamic cash label when orderType changes (Delivery -> Cash on Delivery, Takeaway -> Cash on Pickup, Dine-In -> Cash)
  useEffect(() => {
    setPaymentMethod((prev) => {
      const isCash =
        !prev ||
        prev === "Cash on Delivery" ||
        prev === "Cash on Pickup" ||
        prev === "Cash" ||
        prev.toLowerCase().includes("cash");
      if (isCash) {
        return getCashMethodLabel(orderType);
      }
      return prev;
    });
  }, [orderType]);

  // Guest Mobile Collision State & Debounced Backend Verification
  const [phoneCollision, setPhoneCollision] = useState({
    isColliding: false,
    existingName: "",
  });

  useEffect(() => {
    const clean = (customerMobile || "").replace(/\D/g, "");
    if (!isAuthenticated && clean.length === 11 && clean.startsWith("03")) {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`${API_BASE}/check_customer_phone.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: clean }),
          });
          const data = await res.json();
          if (data && data.exists) {
            setPhoneCollision({
              isColliding: true,
              existingName: data.name || "",
            });
          } else {
            setPhoneCollision({ isColliding: false, existingName: "" });
          }
        } catch (err) {
          setPhoneCollision({ isColliding: false, existingName: "" });
        }
      }, 400);

      return () => clearTimeout(timer);
    } else {
      setPhoneCollision({ isColliding: false, existingName: "" });
    }
  }, [customerMobile, isAuthenticated]);

  // Auto-fill default saved address if fields are empty
  useEffect(() => {
    if (savedAddresses && savedAddresses.length > 0 && !houseNo && !street && !area) {
      const defaultAddr = savedAddresses.find((a) => a.is_default == 1) || savedAddresses[0];
      if (defaultAddr) {
        const hNo = defaultAddr.house_no || defaultAddr.address_line || "";
        if (hNo) setHouseNo(hNo);
        if (defaultAddr.street) setStreet(defaultAddr.street);
        if (defaultAddr.area) setArea(defaultAddr.area);
        const lat = defaultAddr.latitude ?? defaultAddr.lat;
        const lng = defaultAddr.longitude ?? defaultAddr.lng;
        if (lat && lng) {
          setMapCoords({ lat: parseFloat(lat), lng: parseFloat(lng) });
        }
      }
    }
  }, [savedAddresses]);

  // Sync state when session changes
  useEffect(() => {
    setOrderTypeState(session.mode);
    if (session.tableNumber) {
      setTableNumber(session.tableNumber);
    }
  }, [session.mode, session.tableNumber]);

  const setOrderType = (newMode) => {
    setOrderTypeState(newMode);
    switchMode(newMode);
  };

  // GPS Auto-Detection State
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [exactGpsCoords, setExactGpsCoords] = useState(null);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sandboxModalOpen, setSandboxModalOpen] = useState(false);
  const [sandboxMethod, setSandboxMethod] = useState(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxInput1, setSandboxInput1] = useState("");
  const [sandboxInput2, setSandboxInput2] = useState("");

  const {
    handleNameChange: nameHandler,
    handleMobileChange: mobileHandler,
    validateForm: formValidator,
  } = useCheckoutValidation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: storeSettings = {} } = useQuery({
    queryKey: ["store_settings"],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${API_BASE}/get_settings.php`
        );
        const result = await response.json();
        return result && result.success ? result.data : {};
      } catch (err) {
        console.warn("Could not fetch store settings, using defaults:", err);
        return {};
      }
    },
    staleTime: 60000,
  });

  const { data: availableTables = [] } = useQuery({
    queryKey: ["available_tables"],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${API_BASE}/get_tables.php`
        );
        if (!response.ok) return [];
        const result = await response.json();
        return result.data || [];
      } catch (err) {
        console.warn("Could not fetch available tables, using defaults:", err);
        return [];
      }
    },
    staleTime: 60000,
  });

  const baseDeliveryFee = Number(storeSettings.default_delivery_fee || storeSettings.delivery_fee) || 150;
  const freeThreshold = Number(storeSettings.free_delivery_threshold) || 1500;
  const subTotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.qty),
    0
  );

  // Auto-invalidate coupon if subtotal drops below minimum spend requirement
  useEffect(() => {
    if (appliedCoupon && appliedCoupon.min_spend && subTotal < Number(appliedCoupon.min_spend)) {
      setAppliedCoupon(null);
      toast.error(`Coupon removed: Minimum spend of Rs ${appliedCoupon.min_spend} required.`);
    }
  }, [subTotal, appliedCoupon]);

  const isFreeDelivery = subTotal >= freeThreshold && subTotal > 0;
  const deliveryFee = orderType === "delivery" ? (isFreeDelivery ? 0 : baseDeliveryFee) : 0;
  const discountAmount = appliedCoupon ? parseFloat(appliedCoupon.discount_amount || 0) : 0;
  const effectiveTip = orderType === "delivery" ? (Number(riderTip) || 0) : 0;
  const total = Math.max(0, subTotal - discountAmount) + deliveryFee + effectiveTip;

  // Delivery Radius Boundary Guard (Haversine Formula) with dynamic store location
  const dynamicStoreLat = Number(storeSettings.store_lat || storeSettings.restaurant_lat) || RESTAURANT_COORDS.lat;
  const dynamicStoreLng = Number(storeSettings.store_lng || storeSettings.restaurant_lng) || RESTAURANT_COORDS.lng;
  const restaurantLat = dynamicStoreLat;
  const restaurantLng = dynamicStoreLng;
  const maxDeliveryRadiusKm = Number(storeSettings.delivery_radius) || MAX_DELIVERY_RADIUS_KM;

  const deliveryDistanceKm =
    orderType === "delivery" && mapCoords?.lat && mapCoords?.lng
      ? calculateHaversineDistanceKm(restaurantLat, restaurantLng, mapCoords.lat, mapCoords.lng)
      : 0;

  const isOutOfDeliveryRadius =
    orderType === "delivery" && deliveryDistanceKm > maxDeliveryRadiusKm;

  const estimatedPrepMinutes = 20;
  const estimatedDeliveryMinutes = 15;
  const deliveryTimeMinutes =
    orderType === "delivery"
      ? estimatedPrepMinutes + estimatedDeliveryMinutes
      : estimatedPrepMinutes;

  const expectedTimeStr = new Date(
    Date.now() + deliveryTimeMinutes * 60000
  ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleNameChange = (val) => {
    nameHandler(val, setCustomerName, setErrors);
  };

  const handleMobileChange = (val) => {
    mobileHandler(val, setCustomerMobile, setErrors);
  };

  const handleMapCoordinatesChange = ({
    lat,
    lng,
    street: detectedStreet,
    area: detectedArea,
    placeName,
  }) => {
    setMapCoords({ lat, lng });
    setExactGpsCoords({ lat, lng });

    if (detectedArea) {
      setArea(detectedArea);
      setErrors((prev) => ({ ...prev, area: "" }));
    }
    if (detectedStreet) {
      setStreet(detectedStreet);
      setErrors((prev) => ({ ...prev, street: "" }));
    } else if (placeName) {
      const parts = placeName.split(",").map((p) => p.trim());
      const areaCandidate = parts[0] || "";
      if (
        areaCandidate &&
        !["lahore", "pakistan", "punjab"].includes(areaCandidate.toLowerCase())
      ) {
        setArea(areaCandidate);
        setErrors((prev) => ({ ...prev, area: "" }));
      }
      if (
        parts[1] &&
        !["lahore", "pakistan", "punjab"].includes(parts[1].toLowerCase())
      ) {
        setStreet((prev) => prev || parts[1]);
        setErrors((prev) => ({ ...prev, street: "" }));
      }
    }
  };

  // ─── 📍 ONE-CLICK GPS LOCATION DETECTOR ───
  const handleUseCurrentLocation = () => {
    setIsDetectingGps(true);
    getAccuratePosition(
      async (pos) => {
        setIsDetectingGps(false);
        const { latitude, longitude } = pos.coords;
        setExactGpsCoords({ lat: latitude, lng: longitude });
        setMapCoords({ lat: latitude, lng: longitude });
        toast.success("📍 Exact GPS Coordinates Locked!", { duration: 3500 });

        // Reverse-geocode to auto-populate area and street
        const hydrated = await resolveCoordinatesToAddress(
          latitude,
          longitude,
          import.meta.env.VITE_MAPBOX_TOKEN
        );
        if (hydrated) {
          if (hydrated.area && hydrated.area !== "Lahore") {
            setArea(hydrated.area);
            setErrors((prev) => ({ ...prev, area: "" }));
          }
          if (hydrated.street && hydrated.street !== "Main Road") {
            setStreet(hydrated.street);
            setErrors((prev) => ({ ...prev, street: "" }));
          }
        }
      },
      (err) => {
        setIsDetectingGps(false);
        console.warn("GPS Geolocation notice:", err?.message || err);
        // Graceful fallback to BigBite Lahore HQ
        setMapCoords({ lat: 31.5204, lng: 74.3587 });
        toast("Could not detect exact GPS, please pick your location on the map.", {
          icon: "📍",
          duration: 4000,
        });
      }
    );
  };

  const handleApplyCoupon = async (code) => {
    const cleanCode = (code || "").trim().toUpperCase();
    if (!cleanCode) return { success: false, message: "Please enter a promo code." };

    if (!customer?.id) {
      return { success: false, message: "Please sign in or create an account to use promo codes." };
    }

    try {
      const response = await fetch(`${API_BASE}/validate_coupon.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cleanCode,
          subtotal: subTotal,
          customer_id: customer?.id || null,
          customer_mobile: customerMobile.trim(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAppliedCoupon(data);
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Invalid promo code" };
      }
    } catch (err) {
      return { success: false, message: "Network error validating promo code." };
    }
  };

  const handleProceedOrder = async () => {
    if (isSubmitting) return;

    const isValid = formValidator({
      customerName,
      customerMobile,
      orderType,
      houseNo,
      street,
      area,
      tableNumber,
      setErrors,
    });

    if (!isValid) {
      const firstError = Object.values(errors)[0] || "Please fill all required fields.";
      toast.error(firstError);
      return;
    }

    // Boundary check guard
    if (orderType === "delivery" && isOutOfDeliveryRadius) {
      toast.error(
        `Selected address is ${deliveryDistanceKm.toFixed(1)} km away. We only deliver within ${maxDeliveryRadiusKm} km. Please select Takeaway or choose a nearby address.`,
        { duration: 6000 }
      );
      return;
    }

    if (
      paymentMethod === "JazzCash" ||
      paymentMethod === "EasyPaisa" ||
      paymentMethod === "Credit / Debit Card"
    ) {
      setSandboxMethod(paymentMethod);
      setSandboxInput1("");
      setSandboxInput2("");
      setSandboxModalOpen(true);
      return;
    }

    const resolvedCashMethod = getCashMethodLabel(orderType);
    await submitFinalOrder(resolvedCashMethod, "Unpaid");
  };

  const submitFinalOrder = async (
    paymentMethodUsed,
    paymentStatus = "Unpaid",
    transactionId = null
  ) => {
    setIsSubmitting(true);
    try {
      let fullAddress = "";
      if (orderType === "delivery") {
        fullAddress = `${houseNo}, ${street}, ${area}`.trim();
      } else if (orderType === "dine_in") {
        fullAddress = `Dine-In: Table ${tableNumber}`;
      } else {
        fullAddress = "Takeaway - Store Counter Pickup";
      }

      let customerLat = dynamicStoreLat;
      let customerLng = dynamicStoreLng;

      if (orderType === "delivery") {
        if (exactGpsCoords?.lat && exactGpsCoords?.lng) {
          customerLat = exactGpsCoords.lat;
          customerLng = exactGpsCoords.lng;
          console.log("📍 Using Exact Device GPS Coordinates:", exactGpsCoords);
        } else if (fullAddress) {
          const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
          const resolvedGeo = await resolveAddressCoordinates(
            fullAddress,
            area,
            street,
            MAPBOX_TOKEN
          );
          if (resolvedGeo?.lat && resolvedGeo?.lng) {
            customerLat = resolvedGeo.lat;
            customerLng = resolvedGeo.lng;
          }
        }
      }

      const mappedItems = cartItems.map((i) => ({
        id: i.id,
        name: i.name || i.title,
        title: i.name || i.title,
        price: i.price,
        qty: i.qty || 1,
        size: i.size || "Regular",
        note: i.note || "",
        selectedAddons: i.selectedAddons || [],
        removedIngredients: i.removedIngredients || [],
        dealSelections: i.dealSelections || [],
      }));

      const orderPayload = {
        customer_id: customer?.id || null,
        customerId: customer?.id || null,
        customer_email: customer?.email || "",
        customerEmail: customer?.email || "",
        email: customer?.email || "",
        name: customerName.trim(),
        customer_name: customerName.trim(),
        customerName: customerName.trim(),
        mobile: customerMobile.trim(),
        customer_mobile: customerMobile.trim(),
        customerMobile: customerMobile.trim(),
        phone: customerMobile.trim(),
        address: fullAddress,
        customer_address: fullAddress,
        customerAddress: fullAddress,
        customer_lat: customerLat,
        customer_lng: customerLng,
        target_lat: customerLat,
        target_lng: customerLng,
        latitude: customerLat,
        longitude: customerLng,
        lat: customerLat,
        lng: customerLng,
        house_no: orderType === "delivery" ? houseNo.trim() : null,
        street: orderType === "delivery" ? street.trim() : null,
        area: orderType === "delivery" ? area.trim() : null,
        deliveryFee: deliveryFee,
        delivery_fee: deliveryFee,
        rider_tip: effectiveTip,
        riderTip: effectiveTip,
        coupon_code: appliedCoupon?.code || null,
        couponCode: appliedCoupon?.code || null,
        discount_amount: discountAmount,
        order_mode: orderType,
        orderMode: orderType,
        total: total,
        paymentMethod: paymentMethodUsed,
        payment_method: paymentMethodUsed,
        paymentStatus: paymentStatus,
        payment_status: paymentStatus,
        transaction_id: transactionId || null,
        transactionId: transactionId || null,
        orderType: orderType,
        order_type: orderType,
        tableNumber: orderType === "dine_in" ? tableNumber : null,
        table_number: orderType === "dine_in" ? tableNumber : null,
        items: mappedItems,
        cart: mappedItems,
      };

      const result = await placeOrder(orderPayload);

      if (result && (result.success || result.id || result.orderId || result.order_id)) {
        sessionStorage.removeItem("orderMode");
        sessionStorage.removeItem("tableNumber");
        clearDineIn();
        const orderId = result.orderId || result.order_id || result.id || "";
        if (orderId) {
          localStorage.setItem("activeOrderId", orderId.toString());
          const cleanMobile = (customerMobile || "").trim();
          if (cleanMobile) {
            localStorage.setItem("activeOrderPhone", cleanMobile);
          }
          navigate("/track-order", {
            state: { orderId: orderId.toString(), phone: cleanMobile },
          });
        } else {
          navigate("/track-order");
        }
      } else if (!result) {
        // Handled in CartContext (toast/modal already displayed)
      } else {
        toast.error(result?.message || "Failed to place order. Try again.");
      }
    } catch (err) {
      toast.error("Network error while submitting order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSandboxSuccess = async (txnRef, status = "success", errorMessage = "") => {
    setSandboxModalOpen(false);

    // 1. Processing Payment Screen (Matches Screenshot 1)
    Swal.fire({
      title: "Processing Payment...",
      text: "Connecting to Secure Gateway",
      allowOutsideClick: false,
      background: "#18181b",
      color: "#ffffff",
      didOpen: () => Swal.showLoading(),
    });

    await new Promise((r) => setTimeout(r, 1800));

    // 2. Insufficient Balance Screen
    if (status === "low_balance") {
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text: errorMessage || "Insufficient balance in your account. Transaction rejected.",
        background: "#18181b",
        color: "#ffffff",
        confirmButtonColor: "#f59e0b",
        confirmButtonText: "Try Again",
      }).then(() => {
        setSandboxModalOpen(true);
      });
      return;
    }

    // 3. Declined / Blocked Screen
    if (status === "declined") {
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text: errorMessage || "Transaction declined by banking gateway / card security check.",
        background: "#18181b",
        color: "#ffffff",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Try Again",
      }).then(() => {
        setSandboxModalOpen(true);
      });
      return;
    }

    // 4. Payment Successful Screen (Matches Screenshot 2)
    await Swal.fire({
      icon: "success",
      title: "Payment Successful",
      text: "Transaction Completed.",
      timer: 1600,
      showConfirmButton: false,
      background: "#18181b",
      color: "#ffffff",
    });

    const resolvedTxn =
      typeof txnRef === "string" && txnRef.trim()
        ? txnRef.trim()
        : `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    await submitFinalOrder(paymentMethod, "Paid Online (Sandbox)", resolvedTxn);
  };

  return {
    cartItems,
    orderType,
    setOrderType,
    session,
    clearDineIn,
    appliedCoupon,
    setAppliedCoupon,
    discountAmount,
    riderTip,
    setRiderTip,
    effectiveTip,
    customerName,
    customerMobile,
    houseNo,
    setHouseNo,
    street,
    setStreet,
    area,
    setArea,
    tableNumber,
    setTableNumber,
    paymentMethod,
    setPaymentMethod,
    errors,
    setErrors,
    isSubmitting,
    availableTables,
    baseDeliveryFee,
    freeThreshold,
    isFreeDelivery,
    deliveryFee,
    subTotal,
    total,
    expectedTimeStr,
    deliveryTimeMinutes,
    handleNameChange,
    handleMobileChange,
    handleProceedOrder,
    handleUseCurrentLocation,
    isDetectingGps,
    hasExactGps: Boolean(exactGpsCoords),
    mapCoords,
    setMapCoords,
    handleMapCoordinatesChange,
    sandboxModalOpen,
    setSandboxModalOpen,
    sandboxMethod,
    sandboxLoading,
    sandboxInput1,
    setSandboxInput1,
    sandboxInput2,
    setSandboxInput2,
    handleSandboxPay: handleSandboxSuccess,
    customer,
    handleApplyCoupon,
    phoneCollision,
    openAuthModal,
    deliveryDistanceKm,
    maxDeliveryRadiusKm,
    isOutOfDeliveryRadius,
    storeCoords: { lat: dynamicStoreLat, lng: dynamicStoreLng },
  };
}
