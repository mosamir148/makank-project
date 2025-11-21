import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { RiDeleteBack2Fill } from "react-icons/ri";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import "./YourCart.css";
import { BASE_URL } from "../../assets/url";
import { userContext } from "../../context/UserContext";
import { useLang } from "../../context/LangContext";

const YourCart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const {setUser, user, loading: userLoading} = useContext(userContext);
  // Check if user is logged in - simplified and more reliable check
  // If user object exists and has properties, consider logged in (backend will validate)
  const isLoggedIn = user !== null && 
    user !== undefined &&
    typeof user === 'object' && 
    Object.keys(user).length > 0;
  const { t } = useLang()
  const [guestData, setGuestData] = useState({
    username: "",
    address: "",
    phone: "",
    phoneWhats: "",
    email: "",
  });

  // COUPON state - declared early so it can be used in useEffect
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponData, setCouponData] = useState(null); // Store coupon data including eligible products

  // LOGIN

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const handleChangeLogin = (e)=>{
      setLoginData({...loginData , [e.target.name]: e.target.value })
  }

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/user/login`, loginData, { withCredentials: true });
      setUser(res.data.info);
      await AddAllToCart({ userId: res.data.info._id }); 
      toast.success("تم تسجيل طلبك بنجاح وسيتم التواصل معك!")
      setShowLoginForm(false);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) toast.error("كلمة المرور أو البريد الإلكتروني غير صحيح");
        else if (err.response.status === 404) toast.error("البريد وكلمة المرور مطلوبان");
        else toast.error("فشل تسجيل الدخول");
      } else {
        toast.error("حدث خطأ غير متوقع");
      }
    }
  };


  // REGISTER
  const [registerData , setRegisterData] = useState({
        username:"",
        email:"",
        password:"",
        phone:""
    })
    const [image, setImage] = useState(null)

    const handleChangeRegister = (e)=>{
        setRegisterData({...registerData , [e.target.name]: e.target.value })
    }

    const handleSubmitRegister = async (e) => {
  e.preventDefault();

  // ✅ VALIDATIONS
  if (!registerData.username || !registerData.email || !registerData.password || !registerData.phone) {
    toast.error("يرجى إدخال جميع البيانات المطلوبة");
    return;
  }
  if (registerData.password.length < 8) {
    toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
    return;
  }
  if (registerData.username.length < 3) {
    toast.error("الاسم يجب أن يكون 3 أحرف على الأقل");
    return;
  }
  if (registerData.phone.length !== 11) {
    toast.error("رقم الهاتف يجب أن يكون 11 رقمًا");
    return;
  }

  try {
    // ✅ تجهيز البيانات للإرسال
    const formData = new FormData();
    formData.append("username", registerData.username);
    formData.append("email", registerData.email);
    formData.append("password", registerData.password);
    formData.append("phone", registerData.phone);
    if (image) formData.append("image", image);

    // ✅ تسجيل المستخدم
    const res = await axios.post(`${BASE_URL}/user/signUp`, formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });
    const newUser = res.data.User;
    setUser(newUser);
    await AddAllToCart({ userId: res.data.User._id });
 
    toast.success("✅ تم تسجيل طلبك بنجاح وسيتم التواصل معك قريبًا");
    setShowRegisterForm(false);

  } catch (err) {
    if (err.response) {
      if (err.response.status === 400) toast.error("البريد الإلكتروني موجود بالفعل");
      else toast.error(err.response.data.message || "فشل إنشاء الحساب");
    } else {
      toast.error("حدث خطأ غير متوقع");
    }
  }
};


  // MY CART
  const MyCart = async () => {
  try {
    let allItems = [];

    try {
      const res = await axios.get(`${BASE_URL}/wish/mywishlist`, { withCredentials: true });
      const dbArray = Array.isArray(res?.data) ? res.data : [];

      const dbItems = dbArray.map((item) => {
        let product = null;

        // Try to get product from populated fields
        if (item.product && item.product._id) {
          product = { ...item.product, type: "product" };
        } else if (item.featuredProduct && item.featuredProduct._id) {
          product = { ...item.featuredProduct, type: "featured" };
        } else if (item.onlineProduct && item.onlineProduct._id) {
          product = { ...item.onlineProduct, type: "online" };
        } else if (item.offerProduct && item.offerProduct._id) {
          product = { ...item.offerProduct, type: "offer" };
        }
        
        // If product is still null, try to use raw IDs to create a minimal product object
        if (!product) {
          const productId = item.rawProductId || item.rawFeaturedProductId || item.rawOnlineProductId || item.rawOfferProductId;
          if (productId) {
            console.warn("⚠️ Product populate failed for wishlist item:", item._id, "productId:", productId);
            // Create a minimal product object with the ID so the frontend can handle it
            product = { _id: productId, type: "product" };
          } else {
            // Last resort: use item itself
            product = { ...item, type: "product" };
          }
        }

        // Include finalPrice and offerInfo from wishlist item if available (from backend discount calculation)
        if (item.finalPrice !== undefined) {
          product.finalPrice = item.finalPrice;
          // Also set originalPrice if we have offerInfo
          if (item.offerInfo && item.offerInfo.originalPrice) {
            product.originalPrice = item.offerInfo.originalPrice;
          }
        }
        if (item.offerInfo) {
          product.offerInfo = item.offerInfo;
        }

        return {
          _id: item._id || product?._id,
          product: product || {},
          quantity: item.quantity || 1,
          from: "db",
        };
      });

      allItems = [...allItems, ...dbItems];
    } catch (err) {
      // DB Fetch Error - silently handled
    }


    let localWishlist = [];
    try {
      const local1 = JSON.parse(localStorage.getItem("localWish")) || [];
      const local2 = JSON.parse(localStorage.getItem("guestWishlist")) || [];
      localWishlist = [...local1, ...local2];
    } catch (err) {
      // LocalStorage Parse Error - silently handled
    }

    if (Array.isArray(localWishlist) && localWishlist.length > 0) {
      const localItems = localWishlist.map((p) => {
        let product = null;

        if (p.product) product = { ...p.product, type: "product" };
        else if (p.featuredProduct) product = { ...p.featuredProduct, type: "featured" };
        else if (p.onlineProduct) product = { ...p.onlineProduct, type: "online" };
        else if (p.offerProduct) product = { ...p.offerProduct, type: "offer" };
        else product = { ...p, type: "product" };

        return {
          _id: p._id,
          product,
          quantity: p.quantity || 1,
          from: "local",
        };
      });

      allItems = [...allItems, ...localItems];
    }

    setCart(allItems);
  } catch (err) {
    // MyCart Global Error - silently handled
  }
};



  useEffect(() => {
    MyCart();
  }, [isLoggedIn]);

  // Close popup if user logs in
  useEffect(() => {
    if (isLoggedIn && showPopup) {
      setShowPopup(false);
    }
  }, [isLoggedIn, showPopup]);

  const DeleteCart = async (id, from) => {
    try {
      const result = await Swal.fire({
        title: "هل أنت متأكد؟",
        text: "سيتم حذف هذا المنتج من السلة!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#D4AF37",
        cancelButtonColor: "#2a2a2a",
        confirmButtonText: "نعم، احذف!",
        cancelButtonText: "إلغاء",
      });

      if (!result.isConfirmed) return;

      if (from === "db") {
        await axios.delete(`${BASE_URL}/wish/${id}`, { withCredentials: true });
      } else {
        const keys = ["guestWishlist", "localWish"];
        keys.forEach((key) => {
          const stored = JSON.parse(localStorage.getItem(key)) || [];
          const updated = stored.filter((p) => p._id !== id);
          localStorage.setItem(key, JSON.stringify(updated));
        });
      }

      await MyCart();
      window.dispatchEvent(new Event("wishlistUpdated"));

      Swal.fire("تم الحذف!", "تم حذف المنتج من السلة.", "success");
    } catch (err) {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const handleIncrease = (index) => {
    setCart((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: (item.quantity || 1) + 1 } : item
      )
    );
  };

  const handleDecrease = (index) => {
    setCart((prev) =>
      prev.map((item, i) =>
        i === index && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  // Recalculate coupon discount when cart or couponData changes
  useEffect(() => {
    if (!couponData || cart.length === 0) return;

    const eligibleProductIds = couponData.products || [];
    const eligibleItems = [];

    cart.forEach((item) => {
      const productId = item.product?._id || item._id;
      if (productId && eligibleProductIds.includes(productId.toString())) {
        const product = item.product || item;
        const itemPrice = product.finalPrice || product.price || 0;
        const quantity = item.quantity || 1;
        eligibleItems.push({
          item,
          productId: productId.toString(),
          itemPrice,
          quantity,
          subtotal: itemPrice * quantity
        });
      }
    });

    if (eligibleItems.length === 0) {
      setDiscount(0);
      setCouponData(null);
      setCouponCode("");
      return;
    }

    // Select only ONE item based on couponApplyTo configuration
    const applyTo = couponData.couponApplyTo || "first"; // Default to "first"
    let selectedItem = null;

    if (applyTo === "first") {
      selectedItem = eligibleItems[0];
    } else if (applyTo === "lowest") {
      selectedItem = eligibleItems.reduce((lowest, current) => {
        return current.itemPrice < lowest.itemPrice ? current : lowest;
      });
    } else if (applyTo === "highest") {
      selectedItem = eligibleItems.reduce((highest, current) => {
        return current.itemPrice > highest.itemPrice ? current : highest;
      });
    }

    // Calculate coupon discount only for the selected item
    if (selectedItem) {
      const itemSubtotal = selectedItem.subtotal;
      let itemCouponDiscount = 0;

      if (couponData.discountType === "percent" || couponData.discountType === "percentage") {
        itemCouponDiscount = (itemSubtotal * couponData.discountValue) / 100;
      } else {
        itemCouponDiscount = Math.min(couponData.discountValue, itemSubtotal);
      }

      setDiscount(itemCouponDiscount);
    } else {
      setDiscount(0);
      setCouponData(null);
      setCouponCode("");
    }
  }, [cart, couponData]);


const AddAllToCart = async ({ userId, guestId }) => {
  try {
    for (const item of cart) {
      if (!item.product?._id) {
        continue;
      }

      const payload = {
        userId: userId || undefined,
        guestId: guestId || undefined,
        quantity: item.quantity || 1,
        couponCode: couponCode || null, 
        discount: discount || 0,  
      };

      // ✅ تحديد النوع الصحيح حسب الـ type
      switch (item.product.type) {
        case "product":
          payload.productId = item.product._id;
          break;
        case "featured":
          payload.featuredProductId = item.product._id;
          break;
        case "online":
          payload.onlineProductId = item.product._id;
          break;
        case "offer":
          payload.offerProductId = item.product._id;
          break;
        default:
          payload.productId = item.product._id;
      }

      await axios.post(`${BASE_URL}/cart/add`, payload, { withCredentials: true });
    }

    toast.success("✅ تم طلب المنتجات بنجاح وسيتم التواصل معك قريبًا");
  } catch (err) {
    toast.error("حدث خطأ أثناء تنفيذ الطلب");
  }
};


  const handleCheckout = async () => {
    // Wait for user context to load
    if (userLoading) {
      toast.info("جاري التحقق من تسجيل الدخول...");
      return;
    }

    if (cart.length === 0) {
      toast.error("السلة فارغة");
      return;
    }

    // Check authentication - prioritize user object, then check cookie as fallback
    const hasToken = document.cookie.split(';').some(cookie => cookie.trim().startsWith('token='));
    const authenticated = isLoggedIn || (hasToken && !userLoading);
    
    // Set flag to indicate legitimate navigation from cart
    sessionStorage.setItem("navigatingFromCart", "true");
    
    // Navigate to checkout page with cart data for review
    // Guest users will see the guest information form on checkout page
    navigate("/checkout", { 
      state: { 
        cart: cart,
        couponCode: couponCode,
        discount: discount,
        fromCart: true,
        isGuest: !authenticated
      } 
    });
  };

  const handleGuestContinue = async () => {
    setShowPopup(false);
    setShowGuestForm(true);
  };

  const handleLoginOpen = () => {
    setShowPopup(false);
    setShowLoginForm(true);
  };

  const handleRegisterOpen = () => {
    setShowPopup(false);
    setShowRegisterForm(true);
  };

// GUEST

 const handleChangeGuest = (e)=>{
        setGuestData({...guestData , [e.target.name]: e.target.value })
    }

const handleGuestSubmit = async (e) => {
  e.preventDefault();

  if (!guestData.username || !guestData.address || !guestData.phone) {
    toast.error("يرجى إدخال جميع البيانات المطلوبة");
    return;
  }

  try {
    for (const item of cart) {
      const product = item.product?._id ? item.product : item;
      if (!product._id) continue;
      
      
      const payload = {
        ...guestData,
        //  guestId, 
        productId: product._id,
        quantity: item.quantity || 1,
        couponCode: couponCode || null,
        discount: discount || 0,  
      };

      await axios.post(`${BASE_URL}/without/withoutOrder`, payload, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" }
      });
    }

    setShowGuestForm(false);
    setCart([]);
    localStorage.removeItem("guestWishlist");
    localStorage.removeItem("localWish");

    toast.success("✅ تم تسجيل طلبك بنجاح وسيتم التواصل معك قريبًا");

  } catch (err) {
    toast.error(err.response?.data?.message || "حدث خطأ أثناء تسجيل الطلب");
  }
};

  // Calculate total using finalPrice (after offer discount) if available, otherwise use price
  const totalAfterDiscount = cart.reduce(
    (acc, cur) => {
      const product = cur.product || {};
      // Use finalPrice if available (already has offer discount applied), otherwise use price
      const itemPrice = product.finalPrice || product.price || 0;
      return acc + itemPrice * (cur.quantity || 1);
    },
    0
  );
  // total is subtotal after item-level discounts, before coupon discount
  const total = totalAfterDiscount;

  // COUPON function
  const applyCoupon = async () => {
  if (!couponCode) return toast("من فضلك أدخل كود الكوبون");

  try {
    const res = await axios.post(`${BASE_URL}/coupon/validate`, { code: couponCode });
    const coupon = res.data.coupon;
    
    // Store coupon data including eligible product IDs
    setCouponData(coupon);

    // Find all eligible items (items whose products are in the coupon's products list)
    const eligibleProductIds = coupon.products || [];
    const eligibleItems = [];

    cart.forEach((item) => {
      const productId = item.product?._id || item._id;
      if (productId && eligibleProductIds.includes(productId.toString())) {
        const product = item.product || item;
        const itemPrice = product.finalPrice || product.price || 0;
        const quantity = item.quantity || 1;
        eligibleItems.push({
          item,
          productId: productId.toString(),
          itemPrice,
          quantity,
          subtotal: itemPrice * quantity
        });
      }
    });

    if (eligibleItems.length === 0) {
      toast.error("الكوبون غير صالح للمنتجات الموجودة في السلة");
      setDiscount(0);
      setCouponData(null);
      return;
    }

    // Select only ONE item based on couponApplyTo configuration
    const applyTo = coupon.couponApplyTo || "first"; // Default to "first"
    let selectedItem = null;

    if (applyTo === "first") {
      // Apply to the first eligible item
      selectedItem = eligibleItems[0];
    } else if (applyTo === "lowest") {
      // Apply to the eligible item with the lowest price
      selectedItem = eligibleItems.reduce((lowest, current) => {
        return current.itemPrice < lowest.itemPrice ? current : lowest;
      });
    } else if (applyTo === "highest") {
      // Apply to the eligible item with the highest price
      selectedItem = eligibleItems.reduce((highest, current) => {
        return current.itemPrice > highest.itemPrice ? current : highest;
      });
    }

    // Calculate coupon discount only for the selected item
    if (selectedItem) {
      const itemSubtotal = selectedItem.subtotal;
      let itemCouponDiscount = 0;

      if (coupon.discountType === "percent" || coupon.discountType === "percentage") {
        itemCouponDiscount = (itemSubtotal * coupon.discountValue) / 100;
      } else {
        // Fixed amount discount - don't exceed item subtotal
        itemCouponDiscount = Math.min(coupon.discountValue, itemSubtotal);
      }

      setDiscount(itemCouponDiscount);
      toast.success(`✅ تم تطبيق الكوبون (${coupon.code}) بنجاح!`);
    } else {
      toast.error("الكوبون غير صالح للمنتجات الموجودة في السلة");
      setDiscount(0);
      setCouponData(null);
    }
  } catch (err) {
    toast.error(err.response?.data?.message || "كود غير صالح");
    setDiscount(0);
    setCouponData(null);
  }
};

  
const [timers, setTimers] = useState({});

  useEffect(() => {
    const intervals = {};

    cart.forEach((cartItem, index) => {
      const product =
        cartItem?.product?.featuredProduct ||
        cartItem?.product?.onlineProduct ||
        cartItem?.product?.offerProduct ||
        cartItem?.product ||
        {};

      if (product.startDate && product.endDate) {
        const updateTimer = () => {
          const now = new Date().getTime();
          const start = new Date(product.startDate).getTime();
          const end = new Date(product.endDate).getTime();

          if (now < start) {
            const diff = start - now;
            setTimers((prev) => ({
              ...prev,
              [index]: formatTime(diff, "يبدأ بعد"),
            }));
          } else if (now >= start && now < end) {
            const diff = end - now;
            setTimers((prev) => ({
              ...prev,
              [index]: formatTime(diff, "ينتهي خلال"),
            }));
          } else {
            setTimers((prev) => ({ ...prev, [index]: "انتهى العرض" }));
            clearInterval(intervals[index]);
          }
        };

        updateTimer();
        intervals[index] = setInterval(updateTimer, 1000);
      }
    });

    return () => Object.values(intervals).forEach(clearInterval);
  }, [cart]);

  const formatTime = (ms, prefix) => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${prefix}: ${days}ي ${hours}س ${minutes}د ${seconds}ث`;
  };


  return (
    <section className="cart-section">
      <div className="cart-items">
        <div className="cart-title">
          <p>
            {t("Cart")} <span> {t("Your")} </span>
          </p>
          <div className="line"></div>
        </div>

        {cart.length === 0 ? (
          <p className="empty">🛒 {t("noProduct")}</p>
        ) : (
          cart.map((cartItem, index) => {
            // Product is already extracted in MyCart function and stored in cartItem.product
            // The structure is: { _id, product: {...product data...}, quantity, from }
            const product = cartItem?.product || {};

            return (  
              <div key={index} className="cart-card">
                <div className="cart-image">
                  <img
                    loading='lazy'
                    src={product.image || "default-image.jpg"}
                    alt={product.title || "منتج"}
                  />
                </div>
                <div className="cart-info">
                  <div className="cart-header">
                    <h3 className="cart-title-text">{product.title || "منتج بدون عنوان"}</h3>
                    <h4 className="cart-brand">{product.brand || "منتج بدون براند"}</h4>
                  </div>
                  
                  <div className="cart-price-section">
                    <div className="cart-price">
                      {product.finalPrice && product.finalPrice !== product.price ? (
                        <>
                          <span className="original-price">{product.price || product.originalPrice || 0} ج.م</span>
                          <span className="final-price">{product.finalPrice} ج.م</span>
                          {product.discountAmount && (
                            <span className="discount-badge">خصم {product.discountAmount} ج.م</span>
                          )}
                        </>
                      ) : (
                        <span className="final-price">{product.price || product.originalPrice || 0} ج.م</span>
                      )}
                    </div>
                  </div>
                      
                  {product.startDate && product.endDate && (
                    <div className="offer-timer">
                      <p>{timers[index]}</p>
                    </div>
                  )}

                  <div className="cart-actions">
                    <div className="quantity-controls">
                      <button className="qty-btn" onClick={() => handleDecrease(index)}>−</button>
                      <span className="qty-value">{cartItem.quantity || 1}</span>
                      <button className="qty-btn" onClick={() => handleIncrease(index)}>+</button>
                    </div>
                    <button
                      onClick={() => DeleteCart(cartItem._id, cartItem.from)}
                      className="delete-btn"
                      aria-label="حذف المنتج"
                    >
                      <RiDeleteBack2Fill size={22} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

        

      <div className="cart-summary">
              <h3>{t("summaryTitle")}</h3>

              <p className="summary-item">
                <span>{t("subtotal")} :</span>
                <span>{total.toFixed(2)}</span>
              </p>


              <div className="coupon-box">
                <input
                  type="text"
                  className="coupon-input"
                  placeholder={t("couponPlaceholder")}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button className="coupon-btn" onClick={applyCoupon}>
                   {t("applyCoupon")}
                </button>
              </div>

              {discount > 0 && (
                <p className="summary-item discount">
                  <span>{t("discount")}:</span>
                  <span>- {discount.toFixed(2)}</span>
                </p>
              )}


              <p className="summary-item total">
                <strong>{t("total")}:</strong>
                <strong>{Math.max(0, (total - discount)).toFixed(2)}</strong>
              </p>

              <button onClick={handleCheckout} className="checkout-btn">{t("checkout")}</button>
      </div>

      {showPopup && !isLoggedIn && (
        <div className="popup-overlay">
          <div className="popup">
            <h3> {t("title")} </h3>
            <button className="popup-btn login" onClick={handleLoginOpen}>
              {t("login")}
            </button>
            <button className="popup-btn register" onClick={handleRegisterOpen}>
              {t("register")}
            </button>
            <button className="popup-btn guest" onClick={handleGuestContinue}>
              {t("guest")}
            </button>
            <button className="close-btn" onClick={() => setShowPopup(false)}>
              {t("close")}
            </button>
          </div>
        </div>
      )}


      {showLoginForm && (
        <div className="popup-overlay">
          <div className="popup guest-form">
            <h3>{t("loginTitle")}</h3>
            <form onSubmit={handleSubmitLogin}>
              <input
                type="email"
                placeholder={t("email")}
                value={loginData.email}
                name="email"
                 onChange={handleChangeLogin }                
                required
              />
              <input
                type="password"
                placeholder={t("password")}
                value={loginData.password}
                name="password"
                onChange={handleChangeLogin }
                required
              />
              <button  type="submit" className="popup-btn login">
                {t("loginBtn")}
              </button>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowLoginForm(false)}
              >
                {t("close")}
              </button>
            </form>
          </div>
        </div>
      )}


      {showRegisterForm && (
        <div className="popup-overlay">
          <div className="popup guest-form">
            <h3>{t("registerTitle")}</h3>
            <form onSubmit={handleSubmitRegister}>
              <input
                type="text"
                placeholder={t("fullName")}
                name="username"
                value={registerData.name}
                onChange={handleChangeRegister}
                required
              />
              <input
                type="email"
                placeholder={t("email")}
                value={registerData.email}
                name="email"
                onChange={handleChangeRegister}
                required
              />
              <input
                type="tel"
                placeholder={t("phone")}
                name="phone"
                value={registerData.phone}
                onChange={handleChangeRegister}
                required
              />
              <input
                type="password"
                placeholder={t("password")}
                name="password"
                value={registerData.password}
                onChange={handleChangeRegister}
                required
              />
              <button  type="submit" className="popup-btn register">
                {t("registerBtn")}
              </button>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowRegisterForm(false)}
              >
                {t("close")}
              </button>
            </form>
          </div>
        </div>
      )}


      {showGuestForm && (
          <div className="popup-overlay">
            <div className="popup guest-form">
              <h3> {t("guestTitle")}</h3>
              <form onSubmit={handleGuestSubmit}>
                <input
                  type="text"
                  placeholder= {t("fullName")}
                  name="username"
                  value={guestData.username || ""}
                  onChange={handleChangeGuest}
                  required
                />
                <input
                  type="text"
                  placeholder= {t("address")}
                  name="address"
                  value={guestData.address || ""}
                  onChange={handleChangeGuest}
                  required
                />
                <input
                  type="email"
                  placeholder= {t("email")}
                  name="email"
                  value={guestData.email || ""}
                  onChange={handleChangeGuest}
                />
                <input
                  type="tel"
                  placeholder= {t("phone")}
                  name="phone"
                  value={guestData.phone || ""}
                  onChange={handleChangeGuest}
                  required
                />
                <input
                  type="tel"
                  placeholder= {t("whatsapp")}
                  name="phoneWhats"
                  value={guestData.phoneWhats || ""}
                  onChange={handleChangeGuest}
                />

                <button  type="submit" className="popup-btn login">
                  {t("guestBtn")}
                </button>
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setShowGuestForm(false)}
                >
                   {t("close")}
                </button>
              </form>
            </div>
          </div>
      )}

    </section>
  );
};

export default React.memo(YourCart);
