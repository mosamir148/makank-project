import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { RiDeleteBack2Fill } from "react-icons/ri";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import "./YourCart.css";
import { BASE_URL } from "../../assets/url";
import { userContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

const YourCart = () => {
  const [cart, setCart] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const isLoggedIn = document.cookie.includes("token");
  const {setUser,user} = useContext(userContext)

  const [guestData, setGuestData] = useState({
    username: "",
    address: "",
    phone: "",
    phoneWhats: "",
    email: "",
  });

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
    console.log("Full response:", res);
    const newUser = res.data.User;
    setUser(newUser);
    console.log("User registered:", newUser);

    // ✅ إضافة المنتجات في السلة بعد التسجيل
    for (const item of cart) {
      const payload = {
        userId: newUser._id,
        productId: item.product?._id,
        quantity: item.quantity || 1,
      };
      console.log("Adding to cart:", payload);
      await axios.post(`${BASE_URL}/cart/add`, payload, { withCredentials: true });
    }

    toast.success("✅ تم تسجيل طلبك بنجاح وسيتم التواصل معك قريبًا");
    setShowRegisterForm(false);

  } catch (err) {
    console.error("Register error:", err);
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
        const res = await axios.get(`${BASE_URL}/wish/mywishlist`, {
          withCredentials: true,
        });

        const dbArray = Array.isArray(res?.data) ? res.data : [];
        const dbItems = dbArray.map((item) => {
          const product = item?.product?._id ? item.product : item;

          return {
            _id: item?._id || product?._id,
            product: product,
            quantity: item?.quantity || 1,
            from: "db",
          };
        });

        allItems = [...allItems, ...dbItems];
      } catch (err) {
        console.log("❌ DB Fetch Error:", err?.response?.data || err?.message || err);
      }

      let localWishlist = [];
      try {
        const local1 = JSON.parse(localStorage.getItem("localWish")) || [];
        const local2 = JSON.parse(localStorage.getItem("guestWishlist")) || [];
        localWishlist = [...local1, ...local2];
      } catch (err) {
        console.log("⚠️ LocalStorage Parse Error:", err);
      }

      if (Array.isArray(localWishlist) && localWishlist.length > 0) {
        const localItems = localWishlist.map((p) => ({
          _id: p._id,
          product: p,
          quantity: p.quantity || 1,
          from: "local",
        }));
        allItems = [...allItems, ...localItems];
      }

      setCart(allItems);
    } catch (err) {
      console.log("❌ MyCart Global Error:", err?.message || err);
    }
  };

  useEffect(() => {
    MyCart();
  }, [isLoggedIn]);

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

const AddAllToCart = async ({ userId, guestId }) => {
  try {
    for (const item of cart) {
      // احصل على المنتج سواء كان من DB أو local
      const product = item.product?._id ? item.product : item;

      if (!product?._id) {
        console.warn("Skipping product without ID:", item);
        continue; // لو المنتج بدون _id تخطاه
      }

      const payload = {
        userId: userId || undefined,
        guest: guestId || undefined,
        productId: product._id,
        quantity: item.quantity || 1,
      };

      console.log("Adding to cart:", payload);
      await axios.post(`${BASE_URL}/cart/add`, payload, { withCredentials: true });
    }

    toast.success("✅ تم طلب المنتجات بنجاح وسيتم التواصل معك قريبًا");
  } catch (err) {
    console.error("AddAllToCart error:", err.response?.data || err);
    toast.error("حدث خطأ أثناء تنفيذ الطلب");
  }
};

  const handleCheckout = () => setShowPopup(true);

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
        productId: product._id,
        quantity: item.quantity || 1
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
    console.error("Guest submit error:", err.response?.data || err);
    toast.error(err.response?.data?.message || "حدث خطأ أثناء تسجيل الطلب");
  }
};


 

  const Subtotal = cart.reduce(
    (acc, cur) => acc + (cur.product?.price || 0) * (cur.quantity || 1),
    0
  );

  return (
    <section className="cart-section">
      <div className="cart-items">
        <div className="cart-title">
          <p>
            Your <span>Cart</span>
          </p>
          <div className="line"></div>
        </div>

        {cart.length === 0 ? (
          <p className="empty">🛒 لا توجد منتجات في السلة حاليًا</p>
        ) : (
          cart.map((cartItem, index) => {
            const product = cartItem.product?._id ? cartItem.product : cartItem;
            return (
              <div key={index} className="cart-card">
                <div className="cart-image">
                  <img
                    src={product.image || "https://via.placeholder.com/150"}
                    alt={product.title || "product"}
                  />
                </div>
                <div className="cart-info">
                  <h3>{product.title || "منتج بدون عنوان"}</h3>
                  <h3>{product.brand || "منتج بدون براند"}</h3>
                  <p className="cart-desc">{product.category || "منتج بدون كاتيجوري"}</p>
                  <p className="cart-desc">{product.description || "منتج بدون وصف"}</p>
                  <div className="quantity-controls">
                    <button className="qty-btn" onClick={() => handleDecrease(index)}>−</button>
                    <span className="qty-value">{cartItem.quantity || 1}</span>
                    <button className="qty-btn" onClick={() => handleIncrease(index)}>+</button>
                  </div>
                </div>
                <button
                  onClick={() => DeleteCart(cartItem._id, cartItem.from)}
                  className="delete-btn"
                >
                  <RiDeleteBack2Fill size={26} />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="cart-summary">
        <div className="cart-title">
          <p>
            CART <span>TOTALS</span>
          </p>
          <div className="line"></div>
        </div>

        <div className="summary-details">
          <div>
            <p>Total</p>
            <p>${Subtotal.toFixed(2)}</p>
          </div>
        </div>

        <button onClick={handleCheckout} className="checkout-btn">
          Proceed to Checkout
        </button>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>تسجيل الدخول أو المتابعة كضيف</h3>
            <button className="popup-btn login" onClick={handleLoginOpen}>
              تسجيل الدخول
            </button>
            <button className="popup-btn register" onClick={handleRegisterOpen}>
              إنشاء حساب جديد
            </button>
            <button className="popup-btn guest" onClick={handleGuestContinue}>
              الاستكمال بدون حساب
            </button>
            <button className="close-btn" onClick={() => setShowPopup(false)}>
              إغلاق
            </button>
          </div>
        </div>
      )}


      {showLoginForm && (
        <div className="popup-overlay">
          <div className="popup guest-form">
            <h3>تسجيل الدخول</h3>
            <form onSubmit={handleSubmitLogin}>
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={loginData.email}
                name="email"
                 onChange={handleChangeLogin }                
                required
              />
              <input
                type="password"
                placeholder="كلمة المرور"
                value={loginData.password}
                name="password"
                onChange={handleChangeLogin }
                required
              />
              <button  type="submit" className="popup-btn login">
                تسجيل الدخول
              </button>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowLoginForm(false)}
              >
                إغلاق
              </button>
            </form>
          </div>
        </div>
      )}


      {showRegisterForm && (
        <div className="popup-overlay">
          <div className="popup guest-form">
            <h3>إنشاء حساب جديد</h3>
            <form onSubmit={handleSubmitRegister}>
              <input
                type="text"
                placeholder="الاسم الكامل"
                name="username"
                value={registerData.name}
                onChange={handleChangeRegister}
                required
              />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={registerData.email}
                name="email"
                onChange={handleChangeRegister}
                required
              />
              <input
                type="tel"
                placeholder="رقم الهاتف"
                name="phone"
                value={registerData.phone}
                onChange={handleChangeRegister}
                required
              />
              <input
                type="password"
                placeholder="كلمة المرور"
                name="password"
                value={registerData.password}
                onChange={handleChangeRegister}
                required
              />
              <button  type="submit" className="popup-btn register">
                إنشاء حساب
              </button>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowRegisterForm(false)}
              >
                إغلاق
              </button>
            </form>
          </div>
        </div>
      )}


      {showGuestForm && (
          <div className="popup-overlay">
            <div className="popup guest-form">
              <h3>معلومات التواصل</h3>
              <form onSubmit={handleGuestSubmit}>
                <input
                  type="text"
                  placeholder="الاسم الكامل"
                  name="username"
                  value={guestData.username || ""}
                  onChange={handleChangeGuest}
                  required
                />
                <input
                  type="text"
                  placeholder="العنوان بالتفصيل"
                  name="address"
                  value={guestData.address || ""}
                  onChange={handleChangeGuest}
                  required
                />
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  name="email"
                  value={guestData.email || ""}
                  onChange={handleChangeGuest}
                />
                <input
                  type="tel"
                  placeholder="رقم الهاتف"
                  name="phone"
                  value={guestData.phone || ""}
                  onChange={handleChangeGuest}
                  required
                />
                <input
                  type="tel"
                  placeholder="رقم واتساب"
                  name="phoneWhats"
                  value={guestData.phoneWhats || ""}
                  onChange={handleChangeGuest}
                />

                <button  type="submit" className="popup-btn login">
                  تأكيد الطلب
                </button>
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setShowGuestForm(false)}
                >
                  إغلاق
                </button>
              </form>
            </div>
          </div>
      )}

    </section>
  );
};

export default YourCart;
