import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "./Checkout.css";
import { BASE_URL } from "../../assets/url";
import { userContext } from "../../context/UserContext";
import { useLang } from "../../context/LangContext";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: userLoading } = useContext(userContext);
  const { lang, t } = useLang();
  
  const [cart, setCart] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [deliveryAddresses, setDeliveryAddresses] = useState([]);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    city: "",
    governorate: "",
    street: "",
    number: "",
    buildingNumber: "",
    isDefault: false
  });
  
  // Guest information form state
  const [guestInfo, setGuestInfo] = useState({
    username: "",
    phone: "",
    governorate: "",
    city: "",
    street: "",
    email: ""
  });

  // Security: Prevent access if order was just placed
  // Only check this when component mounts or when explicitly navigating to checkout
  useEffect(() => {
    // Check if user is coming from cart page (legitimate checkout navigation)
    const hasCartData = !!location.state?.cart;
    const isFromCart = location.state?.fromCart === true || 
                       sessionStorage.getItem('navigatingFromCart') === 'true';
    
    // If user is legitimately navigating from cart with cart data, clear the order flag
    // This allows new checkout sessions after completing an order
    if (hasCartData || isFromCart) {
      // Clear the order flag to allow new checkout
      sessionStorage.removeItem("orderJustPlaced");
      sessionStorage.removeItem("orderId");
      sessionStorage.removeItem("orderData");
      sessionStorage.removeItem("navigatingFromCart");
      console.log("✅ Cleared order flags - legitimate checkout navigation");
    }
    
    // Check if order was just placed AND user is trying to go back (not from cart)
    const orderJustPlaced = sessionStorage.getItem("orderJustPlaced");
    const orderId = sessionStorage.getItem("orderId");
    
    // Only redirect if:
    // 1. Order was just placed
    // 2. User is NOT coming from cart (trying to go back after order)
    // 3. No cart data in location state (not a legitimate checkout)
    if (orderJustPlaced === "true" && orderId && !hasCartData && !isFromCart) {
      // Order was just placed and user is trying to go back to checkout
      // This prevents users from going back to checkout after order confirmation
      console.log("⚠️ Redirecting from checkout - order was just placed and no cart data");
      navigate("/", { replace: true });
      return;
    }
    
    // Also check if user tries to access checkout without cart data
    // This prevents direct URL access to checkout
    // Only check after a delay to allow cart to load from API
    if (!hasCartData) {
      const timer = setTimeout(() => {
        // If cart is still empty after timeout, redirect to cart page
        if (cart.length === 0) {
          console.log("⚠️ Redirecting to cart - no cart data");
          navigate("/cart", { replace: true });
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [navigate, location.state, cart.length]); // Include cart.length to detect when cart loads

  // Get cart data from location state or fetch from API
  useEffect(() => {
    const cartData = location.state?.cart;
    const couponData = location.state?.couponCode;
    const discountData = location.state?.discount;
    
    if (cartData) {
      setCart(cartData);
    } else {
      // Fetch cart from API if not passed via state
      fetchCart();
    }
    
    // Restore coupon data from cart page
    if (couponData) {
      setCouponCode(couponData);
    }
    if (discountData !== undefined) {
      setDiscount(discountData);
    }
  }, [location.state]);

  // Fetch user's default delivery address automatically
  useEffect(() => {
    if (user && !userLoading) {
      fetchDefaultAddress();
    }
  }, [user, userLoading]);

  const fetchCart = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/wish/mywishlist`, { withCredentials: true });
      const dbArray = Array.isArray(res?.data) ? res.data : [];
      const dbItems = dbArray.map((item) => {
        let product = null;
        if (item.product) product = { ...item.product, type: "product" };
        else if (item.featuredProduct) product = { ...item.featuredProduct, type: "featured" };
        else if (item.onlineProduct) product = { ...item.onlineProduct, type: "online" };
        else if (item.offerProduct) product = { ...item.offerProduct, type: "offer" };
        else product = { ...item, type: "product" };

        return {
          _id: item._id || product._id,
          product,
          quantity: item.quantity || 1,
          from: "db",
        };
      });
      setCart(dbItems);
    } catch (err) {
      // Handle error silently
    }
  };

  // Fetch user's delivery addresses
  const fetchDefaultAddress = async () => {
    if (!user) return;
    
    setLoadingAddress(true);
    try {
      const res = await axios.get(`${BASE_URL}/delivery-address`, { withCredentials: true });
      const addresses = res.data?.addresses || [];
      setDeliveryAddresses(addresses);
      // Find default address or use first address
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      if (defaultAddress) {
        setDeliveryAddress(defaultAddress);
      }
    } catch (err) {
      // If no addresses exist, that's okay - we'll use user's basic info
    } finally {
      setLoadingAddress(false);
    }
  };

  // Handle address selection
  const handleAddressSelect = (address) => {
    setDeliveryAddress(address);
    setShowNewAddressForm(false);
  };

  // Handle new address form submission
  const handleNewAddressSubmit = async (e) => {
    e.preventDefault();
    
    if (!newAddress.name || !newAddress.phone || !newAddress.city || !newAddress.governorate || !newAddress.street) {
      toast.error(lang === "ar" ? "يرجى إدخال جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/delivery-address`, newAddress, { withCredentials: true });
      const createdAddress = res.data.address;
      
      // Refresh addresses list
      await fetchDefaultAddress();
      
      // Select the newly created address
      setDeliveryAddress(createdAddress);
      setShowNewAddressForm(false);
      
      // Reset form
      setNewAddress({
        name: "",
        phone: "",
        city: "",
        governorate: "",
        street: "",
        number: "",
        buildingNumber: "",
        isDefault: false
      });
      
      toast.success(lang === "ar" ? "تم إضافة العنوان بنجاح" : "Address added successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || (lang === "ar" ? "حدث خطأ أثناء إضافة العنوان" : "Error adding address"));
    }
  };

  // Handle new address form change
  const handleNewAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle guest information form change
  const handleGuestInfoChange = (e) => {
    const { name, value } = e.target;
    setGuestInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate totals
  const total = cart.reduce(
    (acc, cur) => {
      const product = cur.product || {};
      const itemPrice = product.finalPrice || product.price || 0;
      return acc + itemPrice * (cur.quantity || 1);
    },
    0
  );
  const finalTotal = Math.max(0, total - discount);


  // Handle order submission
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (userLoading) {
      toast.info(t("checkingAuth") || "Checking authentication...");
      return;
    }

    if (cart.length === 0) {
      toast.error(t("emptyCart") || "Cart is empty");
      return;
    }

    setLoading(true);

    try {
      // Prepare items array for createOrder endpoint
      const items = cart.map(item => ({
        productId: item.product?._id,
        quantity: item.quantity || 1
      })).filter(item => item.productId);

      if (items.length === 0) {
        toast.error(t("noValidProducts") || "No valid products in cart");
        setLoading(false);
        return;
      }

      // Security: Only send necessary order data, never sensitive information
      // Automatically use user's information from their account
      // Include coupon data from cart page
      const orderData = {
        items: items,
        couponCode: couponCode?.trim() || null,
        discount: discount || 0,
        paymentMethod: paymentMethod
      };

      // Handle guest user information
      if (!user) {
        // Validate required guest fields
        if (!guestInfo.username || !guestInfo.phone || !guestInfo.governorate || !guestInfo.city || !guestInfo.street) {
          toast.error(lang === "ar" 
            ? "يرجى إدخال الاسم ورقم الهاتف والمحافظة والمدينة والشارع" 
            : "Please enter name, phone number, governorate, city, and street");
          setLoading(false);
          return;
        }

        // Add guest information to order data
        orderData.username = guestInfo.username;
        orderData.phone = guestInfo.phone;
        // Create a combined address string for backward compatibility
        orderData.address = `${guestInfo.city}, ${guestInfo.governorate}, ${guestInfo.street}`;
        if (guestInfo.email) {
          orderData.email = guestInfo.email;
        }

        // Create deliveryAddressInfo from guest information
        orderData.deliveryAddressInfo = {
          name: guestInfo.username,
          phone: guestInfo.phone,
          city: guestInfo.city,
          governorate: guestInfo.governorate,
          street: guestInfo.street,
          number: "",
          buildingNumber: ""
        };
      } else {
        // If user has a default delivery address, use it
        if (deliveryAddress && deliveryAddress._id) {
          orderData.deliveryAddressId = deliveryAddress._id;
        } else {
          // If no saved address, create deliveryAddressInfo from user's account information
          // Use user's information automatically - no need for them to enter it again
          orderData.deliveryAddressInfo = {
            name: user.username || "",
            phone: user.phone || "",
            city: user.address ? user.address.split(',')[0] : "",
            governorate: user.address ? user.address.split(',')[1] : "",
            street: user.address || "",
            number: "",
            buildingNumber: ""
          };
        }
      }

      const res = await axios.post(`${BASE_URL}/cart/createOrder`, orderData, {
        withCredentials: true
      });

      // Clear cart
      localStorage.removeItem("guestWishlist");
      localStorage.removeItem("localWish");
      
      // Dispatch event to notify Header component to refresh cart count
      window.dispatchEvent(new Event("wishlistUpdated"));
      
      // Store order data in sessionStorage as backup (in case location.state is lost)
      // Do this BEFORE navigation to ensure it's available
      const orderDataString = JSON.stringify(res.data);
      sessionStorage.setItem("orderData", orderDataString);
      sessionStorage.setItem("orderId", res.data._id || res.data.trackingToken || "");
      
      // Small delay to ensure sessionStorage is written before navigation
      // This helps prevent race conditions
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Navigate to order success page with replace to prevent back navigation
      // The order-success page will set the security flag
      navigate("/order-success", { state: { orderData: res.data }, replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || t("orderError") || "Error creating order");
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-empty">
            <h2>{t("loading") || "Loading..."}</h2>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-empty">
            <h2>{t("emptyCart") || "Your cart is empty"}</h2>
            <button className="btn-primary" onClick={() => navigate("/cart")}>
              {t("backToCart") || "Back to Cart"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
    <div className="checkout-container">
        <h1 className="checkout-title">
          {lang === "ar" ? "تأكيد الطلب" : "Order Confirmation"}
        </h1>

        <div className="checkout-content">
          {/* Left Column: User Information & Order Details */}
          <div className="checkout-form-section">
            <h2>{lang === "ar" ? "معلومات العميل" : "Customer Information"}</h2>
            
            {/* Guest Information Form */}
            {!user && (
              <div className="guest-info-form">
                <p style={{ 
                  fontSize: "0.9rem", 
                  color: "#666", 
                  marginBottom: "1rem",
                  fontStyle: "italic" 
                }}>
                  {lang === "ar" 
                    ? "يرجى إدخال معلوماتك لإتمام الطلب" 
                    : "Please enter your information to complete the order"}
                </p>
                <div className="form-group">
                  <label>{t("name") || "Name"} *</label>
                  <input
                    type="text"
                    name="username"
                    value={guestInfo.username}
                    onChange={handleGuestInfoChange}
                    required
                    placeholder={t("name") || "Name"}
                  />
                </div>
                <div className="form-group">
                  <label>{t("phone") || "Phone"} *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={guestInfo.phone}
                    onChange={handleGuestInfoChange}
                    required
                    placeholder={t("phone") || "Phone"}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{lang === "ar" ? "المحافظة / الولاية" : "Governorate / State"} *</label>
                    <input
                      type="text"
                      name="governorate"
                      value={guestInfo.governorate}
                      onChange={handleGuestInfoChange}
                      required
                      placeholder={lang === "ar" ? "المحافظة / الولاية" : "Governorate / State"}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t("city") || "City"} *</label>
                    <input
                      type="text"
                      name="city"
                      value={guestInfo.city}
                      onChange={handleGuestInfoChange}
                      required
                      placeholder={t("city") || "City"}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>{lang === "ar" ? "الشارع / العنوان" : "Street / Address Line"} *</label>
                  <input
                    type="text"
                    name="street"
                    value={guestInfo.street}
                    onChange={handleGuestInfoChange}
                    required
                    placeholder={lang === "ar" ? "الشارع / العنوان" : "Street / Address Line"}
                  />
                </div>
                <div className="form-group">
                  <label>{t("email") || "Email"}</label>
                  <input
                    type="email"
                    name="email"
                    value={guestInfo.email}
                    onChange={handleGuestInfoChange}
                    placeholder={t("email") || "Email (Optional)"}
                  />
                  <small style={{ color: "#666", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
                    {lang === "ar" ? "(اختياري)" : "(Optional)"}
                  </small>
                </div>
              </div>
            )}

            {/* User/Student Information Display - Automatically from account */}
            {user && (
              <div className="user-info-display">
                <div className="info-header">
                  <p style={{ 
                    fontSize: "0.9rem", 
                    color: "#666", 
                    marginBottom: "1rem",
                    fontStyle: "italic" 
                  }}>
                    {lang === "ar" 
                      ? "✓ المعلومات مأخوذة تلقائياً من حسابك" 
                      : "✓ Information automatically retrieved from your account"}
                  </p>
                </div>
                <div className="info-item">
                  <strong>{t("name") || "Name"}:</strong>
                  <span>{user.username || "—"}</span>
                </div>
                <div className="info-item">
                  <strong>{t("email") || "Email"}:</strong>
                  <span>{user.email || "—"}</span>
                </div>
                <div className="info-item">
                  <strong>{t("phone") || "Phone"}:</strong>
                  <span>{user.phone || "—"}</span>
                </div>
              </div>
            )}

            {/* Delivery Address Selection - Only for logged-in users */}
            {user && (
              <>
                <h2 style={{ marginTop: "2rem" }}>
                  {lang === "ar" ? "اختر عنوان التوصيل" : "Select Delivery Address"}
                </h2>

                {loadingAddress ? (
              <p style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                {lang === "ar" ? "جاري تحميل العناوين..." : "Loading addresses..."}
              </p>
            ) : (
              <>
                {/* Saved Addresses */}
                {deliveryAddresses.length > 0 && (
                  <div className="address-selection">
                    {deliveryAddresses.map((address) => (
                      <div
                        key={address._id}
                        className={`address-option ${deliveryAddress?._id === address._id ? 'selected' : ''}`}
                        onClick={() => handleAddressSelect(address)}
                      >
                        <div className="address-option-content">
                          <div className="address-option-header">
                            <strong>{address.name || user?.username}</strong>
                            {address.isDefault && (
                              <span className="default-badge">
                                {lang === "ar" ? "افتراضي" : "Default"}
                              </span>
                            )}
                          </div>
                          <p>{address.street}</p>
                          <p>
                            {address.city}, {address.governorate}
                            {address.number && `, ${lang === "ar" ? "رقم" : "No."} ${address.number}`}
                            {address.buildingNumber && `, ${lang === "ar" ? "مبنى" : "Building"} ${address.buildingNumber}`}
                          </p>
                          <p>{address.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Address Button */}
                <button
                  className="add-new-address-btn"
                  onClick={() => {
                    setShowNewAddressForm(!showNewAddressForm);
                    if (!showNewAddressForm) {
                      // Pre-fill with user info
                      setNewAddress(prev => ({
                        ...prev,
                        name: user?.username || "",
                        phone: user?.phone || ""
                      }));
                    }
                  }}
                >
                  {showNewAddressForm 
                    ? (lang === "ar" ? "إلغاء إضافة عنوان" : "Cancel")
                    : (lang === "ar" ? "+ إضافة عنوان جديد" : "+ Add New Address")
                  }
                </button>

                {/* New Address Form */}
                {showNewAddressForm && (
                  <div className="new-address-form">
                    <h3>{lang === "ar" ? "إضافة عنوان جديد" : "Add New Address"}</h3>
                    <form onSubmit={handleNewAddressSubmit}>
                      <div className="form-group">
                        <label>{lang === "ar" ? "اسم المستلم" : "Recipient Name"} *</label>
                        <input
                          type="text"
                          name="name"
                          value={newAddress.name}
                          onChange={handleNewAddressChange}
                          required
                          placeholder={lang === "ar" ? "اسم المستلم" : "Recipient Name"}
                        />
                      </div>
                      <div className="form-group">
                        <label>{t("phone") || "Phone"} *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={newAddress.phone}
                          onChange={handleNewAddressChange}
                          required
                          placeholder={t("phone") || "Phone"}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>{lang === "ar" ? "المحافظة" : "Governorate"} *</label>
                          <input
                            type="text"
                            name="governorate"
                            value={newAddress.governorate}
                            onChange={handleNewAddressChange}
                            required
                            placeholder={lang === "ar" ? "المحافظة" : "Governorate"}
                          />
                        </div>
                        <div className="form-group">
                          <label>{t("city") || "City"} *</label>
                          <input
                            type="text"
                            name="city"
                            value={newAddress.city}
                            onChange={handleNewAddressChange}
                            required
                            placeholder={t("city") || "City"}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>{t("street") || "Street"} *</label>
                        <input
                          type="text"
                          name="street"
                          value={newAddress.street}
                          onChange={handleNewAddressChange}
                          required
                          placeholder={t("street") || "Street"}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>{t("streetNumber") || "Street Number"}</label>
                          <input
                            type="text"
                            name="number"
                            value={newAddress.number}
                            onChange={handleNewAddressChange}
                            placeholder={t("streetNumber") || "Street Number"}
                          />
                        </div>
                        <div className="form-group">
                          <label>{t("buildingNumber") || "Building Number"}</label>
                          <input
                            type="text"
                            name="buildingNumber"
                            value={newAddress.buildingNumber}
                            onChange={handleNewAddressChange}
                            placeholder={t("buildingNumber") || "Building Number"}
                          />
                        </div>
                      </div>
                      <div className="checkbox-group">
                        <input
                          type="checkbox"
                          id="isDefault"
                          name="isDefault"
                          checked={newAddress.isDefault}
                          onChange={handleNewAddressChange}
                        />
                        <label htmlFor="isDefault">
                          {lang === "ar" ? "تعيين كعنوان افتراضي" : "Set as default address"}
                        </label>
                      </div>
                      <button type="submit" className="checkout-submit-btn" style={{ marginTop: "1rem" }}>
                        {lang === "ar" ? "حفظ العنوان" : "Save Address"}
                      </button>
                    </form>
                  </div>
                )}

              </>
            )}
              </>
            )}

            {/* Payment Method Selection */}
            <div className="form-group" style={{ marginTop: "2rem" }}>
              <label style={{ fontSize: "1.1rem", marginBottom: "1rem", display: "block" }}>
                {lang === "ar" ? "طريقة الدفع" : "Payment Method"}
              </label>
              <div className="payment-methods">
                <label className={`payment-option ${paymentMethod === "Cash" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash"
                    checked={paymentMethod === "Cash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-option-content">
                    <div className="payment-icon">💵</div>
                    <div className="payment-details">
                      <span className="payment-name">{lang === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery"}</span>
                      <span className="payment-desc">{lang === "ar" ? "ادفع نقداً عند استلام الطلب" : "Pay with cash when you receive your order"}</span>
                    </div>
                  </div>
                </label>
                
                <label className={`payment-option ${paymentMethod === "Visa" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Visa"
                    checked={paymentMethod === "Visa"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-option-content">
                    <div className="payment-icon visa-icon">💳</div>
                    <div className="payment-details">
                      <span className="payment-name">Visa</span>
                      <span className="payment-desc">{lang === "ar" ? "ادفع باستخدام بطاقة فيزا" : "Pay securely with your Visa card"}</span>
                    </div>
                  </div>
                </label>

                <label className={`payment-option ${paymentMethod === "Mastercard" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Mastercard"
                    checked={paymentMethod === "Mastercard"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-option-content">
                    <div className="payment-icon mastercard-icon">💳</div>
                    <div className="payment-details">
                      <span className="payment-name">Mastercard</span>
                      <span className="payment-desc">{lang === "ar" ? "ادفع باستخدام بطاقة ماستركارد" : "Pay securely with your Mastercard"}</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Details & Summary */}
          <div className="checkout-summary-section">
            {/* Order Details Section */}
            <h2>
              {lang === "ar" ? "تفاصيل الطلب" : "Order Details"}
            </h2>
            
            <div className="order-items">
              {cart.map((cartItem, index) => {
                // Security: Filter out sensitive fields like purchasePrice
                const product = 
                  cartItem?.product?.featuredProduct || 
                  cartItem?.product?.onlineProduct || 
                  cartItem?.product?.offerProduct || 
                  cartItem?.product || 
                  {};

                // Only use public price fields, never purchasePrice
                const itemPrice = product.finalPrice || product.price || 0;
                const itemTotal = itemPrice * (cartItem.quantity || 1);

                return (
                  <div key={index} className="order-item">
                    <div className="order-item-image">
                      <img
                        src={product.image || "default-image.jpg"}
                        alt={product.title || "Product"}
                        loading="lazy"
                      />
                    </div>
                    <div className="order-item-info">
                      <h4>{product.title || t("product") || "Product"}</h4>
                      {product.brand && <p className="product-brand">{product.brand}</p>}
                      {product.category && <p className="product-category">{product.category}</p>}
                      <p className="product-quantity">
                        {t("quantity") || "Quantity"}: <strong>{cartItem.quantity || 1}</strong>
                      </p>
                      <p className="order-item-price">
                        {itemTotal.toFixed(2)} {t("currency") || "EGP"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <h2 style={{ marginTop: "2rem" }}>
              {t("orderSummary") || "Order Summary"}
            </h2>

            {/* Order Totals */}
            <div className="order-totals">
              <div className="total-row">
                <span>{t("subtotal") || "Subtotal"}:</span>
                <span>{total.toFixed(2)} {t("currency") || "EGP"}</span>
              </div>
              
              {discount > 0 && couponCode && (
                <div className="total-row discount">
                  <span>{t("discount") || "Discount"} ({couponCode}):</span>
                  <span>- {discount.toFixed(2)} {t("currency") || "EGP"}</span>
                </div>
              )}

              <div className="total-row total">
                <strong>{t("total") || "Total"}:</strong>
                <strong>{finalTotal.toFixed(2)} {t("currency") || "EGP"}</strong>
              </div>
            </div>

            {/* Submit Button */}
            <form onSubmit={handleSubmitOrder}>
              <button
                type="submit"
                className="checkout-submit-btn"
                disabled={loading}
              >
                {loading 
                  ? (lang === "ar" ? "جاري المعالجة..." : "Processing...")
                  : (lang === "ar" ? "تأكيد الطلب" : "Confirm Order")
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
