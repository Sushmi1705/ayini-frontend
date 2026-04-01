import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthContext } from "@/context/useAuthContext";
import { buildApiUrl } from "@/services/apiClient";

const API_BASE_URL = buildApiUrl("/admin");

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("choose");
  const [method, setMethod] = useState("email");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [adminConfig, setAdminConfig] = useState({
    email: "ajithmano14@gmail.com",
    phone: "+919444488440",
  });
  const navigate = useNavigate();
  const { saveSession } = useAuthContext();
  const [searchParams] = useSearchParams();

  const redirectUser = () => {
    const redirectLink = searchParams.get("redirectTo") || searchParams.get("next");
    if (redirectLink) navigate(redirectLink);
    else navigate("/dashboard");
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/config`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setAdminConfig({
            email: data.email,
            phone: data.phone,
          });
          if (!identifier) {
            setIdentifier(data.email);
          }
        }
      })
      .catch(() => undefined);
  }, []);

  const chooseMethod = (selectedMethod) => {
    setMethod(selectedMethod);
    setIdentifier(selectedMethod === "email" ? adminConfig.email : adminConfig.phone);
    setOtp("");
    setError("");
    setSuccessMessage("");
    setStep("request");
  };

  const sendOtp = async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const endpoint = method === "email" ? "send-email-otp" : "send-phone-otp";
      const payload = method === "email" ? { email: identifier } : { phoneNumber: identifier };

      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to send OTP.");
      }

      setSuccessMessage(data.message || "OTP sent successfully.");
      setStep("verify");
    } catch (sendError) {
      setError(sendError.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const endpoint = method === "email" ? "verify-email-otp" : "verify-phone-otp";
      const payload = method === "email"
        ? { email: identifier, otp }
        : { phoneNumber: identifier, otp };

      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "OTP verification failed.");
      }

      saveSession({
        token: `admin-session-${Date.now()}`,
        ...data.user,
      });

      redirectUser();
    } catch (verifyError) {
      setError(verifyError.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    step,
    method,
    identifier,
    otp,
    error,
    successMessage,
    adminConfig,
    setIdentifier,
    setOtp,
    chooseMethod,
    sendOtp,
    verifyOtp,
    backToChoose: () => {
      setStep("choose");
      setOtp("");
      setError("");
      setSuccessMessage("");
    },
    backToRequest: () => {
      setStep("request");
      setOtp("");
      setError("");
      setSuccessMessage("");
    },
  };
};

export default useLogin;
