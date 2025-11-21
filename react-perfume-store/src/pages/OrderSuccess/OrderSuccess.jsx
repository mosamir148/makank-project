import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLang } from "../../context/LangContext";
import axios from "axios";
import { BASE_URL } from "../../assets/url";
import "./OrderSuccess.css";

const OrderSuccess = () => {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState(null);
  const [trackingLink, setTrackingLink] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const hasDataRef = useRef(false);
  const redirectTimerRef = useRef(null);

  const processOrderData = (data) => {
    if (!data) return false;
    
    // Mark that we have data to prevent redirect
    hasDataRef.current = true;
    setIsChecking(false);
    
    // Set order data immediately
    setOrderData(data);

    // Security: Set flag to prevent back navigation to checkout
    // Store order ID for page refresh detection
    sessionStorage.setItem("orderJustPlaced", "true");
    sessionStorage.setItem("orderId", data._id || data.trackingToken || "");

    // Generate tracking link based on user type
    if (data.trackingToken) {
      // Anonymous user - use tracking token
      const baseUrl = window.location.origin;
      setTrackingLink(`${baseUrl}/track-order/${data.trackingToken}`);
    } else if (data._id) {
      // Registered user - use order ID (private)
      const baseUrl = window.location.origin;
      setTrackingLink(`${baseUrl}/orders/${data._id}`);
    }
    
    return true;
  };

  const fetchOrderFromAPI = async (orderId) => {
    try {
      // Check if it's a tracking token (starts with TRK-) or order ID
      const isTrackingToken = orderId.startsWith("TRK-");
      
      let response;
      if (isTrackingToken) {
        // Fetch by tracking token (for anonymous users)
        response = await axios.get(`${BASE_URL}/cart/track/${orderId}`, {
          withCredentials: true
        });
      } else {
        // Fetch by order ID (for registered users)
        response = await axios.get(`${BASE_URL}/cart/myorder/${orderId}`, {
          withCredentials: true
        });
      }
      
      if (response.data && !hasDataRef.current) {
        console.log("✅ Order data fetched successfully from API");
        processOrderData(response.data);
      } else if (!hasDataRef.current) {
        throw new Error("No data in API response");
      }
    } catch (error) {
      console.error("❌ Error fetching order from API:", error);
      // If API fetch fails, still redirect to home
      setIsChecking(false);
      navigate("/", { replace: true });
    }
  };

  useEffect(() => {
    // Clear any existing redirect timer
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }

    // Get order data from location state first
    let data = location.state?.orderData;
    
    // If no order data in location state, try to get it from sessionStorage
    if (!data) {
      try {
        const storedOrderData = sessionStorage.getItem("orderData");
        if (storedOrderData) {
          data = JSON.parse(storedOrderData);
          console.log("✅ Order data loaded from sessionStorage");
        }
      } catch (error) {
        console.error("❌ Error parsing stored order data:", error);
      }
    } else {
      console.log("✅ Order data loaded from location.state");
    }
    
    // If we have data, process it immediately
    if (data) {
      processOrderData(data);
      
      // Handle browser back button
      const handlePopState = () => {
        setTimeout(() => {
          const currentPath = window.location.pathname;
          if (!currentPath.includes("/order-success")) {
            sessionStorage.removeItem("orderJustPlaced");
          }
        }, 100);
      };
      
      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
    
    // If no data found immediately, wait and check again
    // Only set timer if we haven't found data yet
    if (!hasDataRef.current) {
      console.log("⏳ No order data found immediately, waiting...");
      redirectTimerRef.current = setTimeout(() => {
        // Check one more time for data
        let finalData = location.state?.orderData;
        
        if (!finalData) {
          try {
            const stored = sessionStorage.getItem("orderData");
            if (stored) {
              finalData = JSON.parse(stored);
              console.log("✅ Order data found in delayed check (sessionStorage)");
            }
          } catch (e) {
            console.error("❌ Error parsing stored order data in delayed check:", e);
          }
        } else {
          console.log("✅ Order data found in delayed check (location.state)");
        }
        
        if (finalData && !hasDataRef.current) {
          // Data found! Process it
          processOrderData(finalData);
        } else if (!hasDataRef.current) {
          // Still no data - check for order ID and try to fetch from API
          const storedOrderId = sessionStorage.getItem("orderId");
          console.log("⚠️ No order data found after delay. OrderId:", storedOrderId);
          
          if (!storedOrderId) {
            // No order data and no stored order - redirect to home
            console.log("❌ Redirecting to home - no order data or ID");
            setIsChecking(false);
            navigate("/", { replace: true });
          } else {
            // We have an order ID but no data - try to fetch from API
            console.log("🔄 Attempting to fetch order from API using orderId:", storedOrderId);
            fetchOrderFromAPI(storedOrderId);
          }
        }
      }, 1000); // Increased delay to 1000ms (1 second) to give more time
    }
    
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, [location.state, navigate]);

  if (isChecking || !orderData) {
    return (
      <div className="order-success-page">
        <div className="order-success-container">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h2>{lang === "ar" ? "جاري التحميل..." : "Loading..."}</h2>
          </div>
        </div>
      </div>
    );
  }

  const isAnonymous = !!orderData.trackingToken;

  // Unified delivery address logic: use deliveryAddressInfo as snapshot (preserves address at order time)
  // Fall back to deliveryAddress if deliveryAddressInfo doesn't exist (for backward compatibility)
  const deliveryAddress = orderData.deliveryAddressInfo || orderData.deliveryAddress;
  
  // Handle both embedded object and populated reference structures with field name variations
  const addressName = deliveryAddress ? (deliveryAddress.name || deliveryAddress.recipientName || "—") : "—";
  const addressPhone = deliveryAddress ? (deliveryAddress.phone || deliveryAddress.phoneNumber || "—") : "—";
  const addressGovernorate = deliveryAddress ? (deliveryAddress.governorate || deliveryAddress.governorateName || null) : null;
  const addressCity = deliveryAddress ? (deliveryAddress.city || deliveryAddress.cityName || null) : null;
  const addressStreet = deliveryAddress ? (deliveryAddress.street || deliveryAddress.streetName || deliveryAddress.address || "—") : "—";
  const addressNumber = deliveryAddress ? (deliveryAddress.number || deliveryAddress.streetNumber || null) : null;
  const addressBuildingNumber = deliveryAddress ? (deliveryAddress.buildingNumber || deliveryAddress.building || null) : null;

  return (
    <div className="order-success-page">
      <div className="order-success-container">
        <div className="success-icon">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="success-check-icon"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path
              d="M8 12l2 2 4-4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="success-title">
          {lang === "ar" ? "✅ تم تأكيد طلبك بنجاح!" : "✅ Your Order Has Been Confirmed!"}
        </h1>

        <p className="success-message">
          {lang === "ar"
            ? "شكراً لك! تم استلام طلبك وسيتم التواصل معك قريباً."
            : "Thank you! Your order has been received and we'll contact you soon."}
        </p>

        {orderData.orderNumber && (
          <div className="order-number">
            <strong>{lang === "ar" ? "رقم الطلب:" : "Order Number:"}</strong>{" "}
            {orderData.orderNumber}
          </div>
        )}

        {/* Delivery Address Section 
        {deliveryAddress && (
          <div className="delivery-address-section">
            <h3>{t("deliveryAddress") || (lang === "ar" ? "عنوان التوصيل" : "Delivery Address")}</h3>
            <div className="delivery-address-info">
              <div className="address-item">
                <strong>{t("recipientName") || (lang === "ar" ? "اسم المستلم" : "Recipient Name")}:</strong> {addressName}
              </div>
              <div className="address-item">
                <strong>{t("phone") || (lang === "ar" ? "رقم الهاتف" : "Phone Number")}:</strong> {addressPhone}
              </div>
              {addressGovernorate && (
                <div className="address-item">
                  <strong>{t("governorate") || (lang === "ar" ? "المحافظة" : "Governorate")}:</strong> {addressGovernorate}
                </div>
              )}
              {addressCity && (
                <div className="address-item">
                  <strong>{t("city") || (lang === "ar" ? "المدينة" : "City")}:</strong> {addressCity}
                </div>
              )}
              <div className="address-item">
                <strong>{t("street") || (lang === "ar" ? "الشارع" : "Street")}:</strong> {addressStreet}
              </div>
              {addressNumber && (
                <div className="address-item">
                  <strong>{t("streetNumber") || (lang === "ar" ? "رقم الشارع" : "Street Number")}:</strong> {addressNumber}
                </div>
              )}
              {addressBuildingNumber && (
                <div className="address-item">
                  <strong>{t("buildingNumber") || (lang === "ar" ? "رقم المبنى" : "Building Number")}:</strong> {addressBuildingNumber}
                </div>
              )}
            </div>
          </div>
        )}
*/}
        <div className="success-actions">
          {isAnonymous ? (
            <div className="tracking-section anonymous">
              <h3>
                {lang === "ar"
                  ? "🔗 رابط تتبع الطلب"
                  : "🔗 Order Tracking Link"}
              </h3>
              <div className="tracking-link-container">
                <input
                  type="text"
                  value={trackingLink}
                  readOnly
                  className="tracking-link-input"
                  onClick={(e) => e.target.select()}
                />
                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(trackingLink);
                    alert(
                      lang === "ar"
                        ? "تم نسخ الرابط!"
                        : "Link copied!"
                    );
                  }}
                >
                  {lang === "ar" ? "نسخ" : "Copy"}
                </button>
              </div>
              <p className="save-link-warning">
                ⚠️{" "}
                {lang === "ar"
                  ? "يرجى حفظ هذا الرابط لتتمكن من تتبع حالة طلبك في أي وقت"
                  : "Please save this link to track your order status anytime"}
              </p>
            </div>
          ) : (
            <div className="tracking-section registered">
              <h3>
                {lang === "ar"
                  ? "📦 تتبع حالة طلبك"
                  : "📦 Track Your Order"}
              </h3>
              <p>
                {lang === "ar"
                  ? "يمكنك تتبع حالة طلبك من صفحة طلباتك الشخصية"
                  : "You can track your order status from your orders page"}
              </p>
            </div>
          )}

          <div className="action-buttons">
            <button
              className="btn-track"
              onClick={() => {
                if (isAnonymous) {
                  navigate(`/track-order/${orderData.trackingToken}`);
                } else {
                  navigate(`/orders/${orderData._id}`);
                }
              }}
            >
              {lang === "ar" ? "تتبع الطلب" : "Track Order"}
            </button>
            <button
              className="btn-continue"
              onClick={() => navigate("/products")}
            >
              {lang === "ar" ? "متابعة التسوق" : "Continue Shopping"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;

