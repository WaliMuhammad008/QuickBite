import toast from "react-hot-toast";

export function useCheckoutValidation() {
  const handleNameChange = (val, setCustomerName, setErrors) => {
    const raw =
      typeof val === "object" && val?.target ? val.target.value : String(val ?? "");
    const cleanVal = raw.replace(/[^a-zA-Z\s]/g, "");
    if (setCustomerName) setCustomerName(cleanVal);

    if (setErrors) {
      if (cleanVal.trim().length > 0 && cleanVal.trim().length < 3) {
        setErrors((prev) => ({
          ...prev,
          name: "Name must be at least 3 letters long.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, name: "" }));
      }
    }
    return cleanVal;
  };

  const handleMobileChange = (val, setCustomerMobile, setErrors) => {
    const raw =
      typeof val === "object" && val?.target ? val.target.value : String(val ?? "");
    const cleanDigits = raw.replace(/\D/g, "").slice(0, 11);
    if (setCustomerMobile) setCustomerMobile(cleanDigits);

    if (setErrors) {
      if (cleanDigits.length > 0) {
        if (!cleanDigits.startsWith("03")) {
          setErrors((prev) => ({
            ...prev,
            mobile: "Mobile number must start with 03 (e.g. 03001234567).",
          }));
        } else if (cleanDigits.length < 11) {
          setErrors((prev) => ({
            ...prev,
            mobile: `Please enter full 11 digits (${cleanDigits.length}/11 entered).`,
          }));
        } else {
          setErrors((prev) => ({ ...prev, mobile: "" }));
        }
      } else {
        setErrors((prev) => ({ ...prev, mobile: "" }));
      }
    }
    return cleanDigits;
  };

  const validateForm = ({
    customerName,
    customerMobile,
    orderType,
    houseNo,
    street,
    area,
    tableNumber,
    setErrors,
  }) => {
    const errs = {};

    const cleanName = (customerName || "").trim();
    if (!cleanName || cleanName.length < 3) {
      errs.name = "Please enter a valid full name (minimum 3 letters).";
    }

    const cleanMobile = (customerMobile || "").replace(/\D/g, "");
    if (!cleanMobile) {
      errs.mobile = "Mobile number is required.";
    } else if (!/^03\d{9}$/.test(cleanMobile)) {
      errs.mobile =
        "Please enter an 11-digit mobile number starting with 03 (e.g. 03001234567).";
    }

    if (orderType === "delivery") {
      if (!houseNo || !houseNo.trim())
        errs.houseNo = "Please provide your house/flat number.";
      if (!street || !street.trim())
        errs.street = "Street or Block name is required.";
      if (!area || !area.trim())
        errs.area = "Area or Landmark is required.";
    }

    if (orderType === "dine_in" && (!tableNumber || !tableNumber.trim())) {
      errs.tableNumber = "Table selection is required for Dine-in orders.";
    }

    if (setErrors) setErrors(errs);

    if (Object.keys(errs).length > 0) {
      const firstErrMsg = Object.values(errs)[0];
      toast.error(firstErrMsg, { id: "validation-toast", duration: 3500 });
      return false;
    }

    return true;
  };

  return {
    handleNameChange,
    handleMobileChange,
    validateForm,
  };
}
