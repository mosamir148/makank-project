import { useContext, useEffect, useState } from "react";
import { FaBars, FaLaptop, FaMoon, FaSun, FaTimes } from "react-icons/fa";
import "./Header.css";
import { HashLink } from "react-router-hash-link";
import logo from "../../../assets/Logo.jpg";
import {  NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../../assets/url";
import { userContext } from "../../../context/UserContext";
import { RiShoppingCart2Line } from "react-icons/ri";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const {user,setUser} = useContext(userContext)
  const [cartCount, setCartCount] = useState(0);
  const [popupOpen, setPopupOpen] = useState(false);
  const [themeMode, setThemeMode] = useState("system"); // light, dark, system

  const navigate = useNavigate()
   const handleLogOut = async ()=>{
        try{
            await axios.get(`${BASE_URL}/user/logout`)
            setUser(null)
            navigate("/signin")
            toast.success("Logged Out Successfully")
        }catch(err){
            console.log(err)
        }
    }
    

 const fetchCart = async () => {
  try {
    let dbCount = 0;
    let localCount = 0;


    if (user && user._id) {
      const res = await axios.get(`${BASE_URL}/wish/mywishlist`, {
        withCredentials: true,
      });


      const wishlistData =
        Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.wishlist)
          ? res.data.wishlist
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];

      dbCount = wishlistData.length;
    }


    const localWish = JSON.parse(localStorage.getItem("localWish")) || [];
    localCount = localWish.length;


    const total = dbCount + localCount;
    setCartCount(total);


  } catch (err) {
    console.log("❌ fetchCart error:", err);
    setCartCount(0);
  }
};

 
  useEffect(() => {
    fetchCart();

    const handleStorageChange = () => fetchCart();
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user]);

  // لفحص تفضيل النظام (System preference)
  const getSystemPreference = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

  // تعيين الوضع بناءً على الوضع المحفوظ أو النظام
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");

    if (savedMode === "dark" || savedMode === "light") {
      setThemeMode(savedMode);
      if (savedMode === "dark") {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
    } else {
      // الوضع system افتراضي
      setThemeMode("system");
      const isDark = getSystemPreference();
      if (isDark) {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
    }

    // استماع تغير إعداد النظام فقط اذا الوضع system
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (localStorage.getItem("darkMode") === null) {
        if (themeMode === "system") {
          if (e.matches) {
            document.body.classList.add("dark");
          } else {
            document.body.classList.remove("dark");
          }
        }
      }
    };
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, [themeMode]);

  // تغيير الوضع بناء على اختيار المستخدم في البوب أب
  const changeTheme = (mode) => {
    setThemeMode(mode);
    setPopupOpen(false);
    if (mode === "dark") {
      localStorage.setItem("darkMode", "dark");
      document.body.classList.add("dark");
    } else if (mode === "light") {
      localStorage.setItem("darkMode", "light");
      document.body.classList.remove("dark");
    } else {
      // system
      localStorage.removeItem("darkMode");
      const isDark = getSystemPreference();
      if (isDark) {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
    }
  };
  return (
    <header className="header" id="header">
      <div className="container">
        <div className="header-content">
          {/* الشعار */}
          <div className="logo">
                <img src={logo} alt="Luxe Parfum Logo" className="logo-img" />
          </div>

          {/* القائمة */}
          <nav className={`nav ${menuOpen ? "open" : ""}`} id="nav">
            <ul className="nav-list">
                
                <li>
                  <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Home
                </NavLink>
                </li>
                <li>
                  <NavLink
                  to="/products"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Products
                </NavLink>
                </li>
                <li>
                  <HashLink
                   smooth to="/#special-offers"
                   className="nav-link"
                >
                  Special Offers
                </HashLink>
                </li>
                <li>
                  <HashLink
                   smooth to="/#categories"
                   className="nav-link"
                >
                  Category
                </HashLink>
                </li>
                
                <li>
                  <HashLink
                    smooth to="/#featured-products"
                   className="nav-link"
                >
                  Featured Products
                </HashLink>
                </li>
               
                <li>
                  <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  About Us
                </NavLink>
                </li>
                <li>
                  <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Contact
                </NavLink>
                </li>

                  {
                    user && user.role === "admin" &&
                        <li >
                      <NavLink to={"/dashboard"} 
                       className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                    >Dashboard</NavLink>                </li>
                }

                
                <li>
                  {
                    user ?
                  <NavLink
                  onClick={handleLogOut}
                  className={({ isActive }) =>
                    isActive ? "nav-link " : "nav-link"
                  }
                >
                  LogOut
                </NavLink>
                :
                <NavLink
                  to="/signin"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Login
                </NavLink>
                  }
                </li>

                 <li className="cart-link">
                  <NavLink
                    to="/cart"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    <RiShoppingCart2Line size={22} />
                     {cartCount > 0 && (
                      <span className="cartCount">{cartCount}</span>
                    )}
                  </NavLink>
                 </li>

            </ul>
          </nav>

          {/* الأزرار */}
          <div className="header-actions">
            <button className="lang-toggle" id="langToggle">AR</button>

            {/* DARK LIGHT SYSTEM MODE */}
            

            <div className="theme-popup-wrapper">
            <button
              className="theme-toggle-btn"
              onClick={() => setPopupOpen(!popupOpen)}
              aria-label="Toggle Dark Mode Options"
            >
              {themeMode === "dark" ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>

  {popupOpen && (
    <div className="theme-popup">
      <div
        className={`theme-option ${themeMode === "light" ? "active" : ""}`}
        onClick={() => changeTheme("light")}
      >
        Light {themeMode === "light" && <span className="check">✓</span>}
      </div>
      <div
        className={`theme-option ${themeMode === "dark" ? "active" : ""}`}
        onClick={() => changeTheme("dark")}
      >
        Dark {themeMode === "dark" && <span className="check">✓</span>}
      </div>
      <div
        className={`theme-option ${themeMode === "system" ? "active" : ""}`}
        onClick={() => changeTheme("system")}
      >
        System {themeMode === "system" && <span className="check">✓</span>}
      </div>
    </div>
  )}
</div>


                    {/*  BARS */}
            <button
              className="menu-toggle"
              id="menuToggle"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>


          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
