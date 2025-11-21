import React, { useContext, useEffect, useState, useRef } from "react";
import { FaBars, FaLaptop, FaMoon, FaSun, FaTimes, FaUser, FaSignOutAlt } from "react-icons/fa";
import "./Header.css";
import { HashLink } from "react-router-hash-link";
const logo = "/assets/Logo3.png";
import {  NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../../assets/url";
import { userContext } from "../../../context/UserContext";
import { RiShoppingCart2Line } from "react-icons/ri";
import { useLang } from "../../../context/LangContext";
import NotificationBell from "../../Notification/NotificationBell";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const {user,setUser} = useContext(userContext)
  const [cartCount, setCartCount] = useState(0);
  const [popupOpen, setPopupOpen] = useState(false);
  const [themeMode, setThemeMode] = useState("system"); // light, dark, system
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const navRef = useRef(null);

  // LOGOUT
  const navigate = useNavigate()
   const handleLogOut = async ()=>{
        try{
            await axios.get(`${BASE_URL}/user/logout`)
            // Clear token and cart data from localStorage
            localStorage.removeItem('token')
            localStorage.removeItem('localWish')
            localStorage.removeItem('guestWishlist')
            setUser(null)
            navigate("/signin")
            toast.success("Logged Out Successfully")
        }catch(err){
            console.log(err)
            // Clear token and cart data even if logout request fails
            localStorage.removeItem('token')
            localStorage.removeItem('localWish')
            localStorage.removeItem('guestWishlist')
        }
    }
    
    // CART
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

      // Calculate total quantity from database items
      dbCount = wishlistData.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }

    // Get local wishlist items
    const localWish = JSON.parse(localStorage.getItem("localWish")) || [];
    const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist")) || [];
    const allLocalItems = [...localWish, ...guestWishlist];
    
    // Calculate total quantity from local items
    localCount = allLocalItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const total = dbCount + localCount;
    setCartCount(total);

  } catch (err) {
    console.log("❌ fetchCart error:", err);
    setCartCount(0);
  }
  };

 
  useEffect(() => {
    fetchCart();

    // Listen to custom wishlistUpdated event
    const handleWishlistUpdate = () => {
      fetchCart();
    };
    
    // Listen to storage changes (for cross-tab updates)
    const handleStorageChange = () => fetchCart();
    
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user]);

  // DARK LIGHT MODE
  const getSystemPreference = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

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

      setThemeMode("system");
      const isDark = getSystemPreference();
      if (isDark) {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
    }


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

  // LANG
  const { lang, setLang, t } = useLang();

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen]);

  // Close mobile menu when clicking outside or on overlay
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        navRef.current &&
        !navRef.current.contains(event.target) &&
        !event.target.closest('.menu-toggle')
      ) {
        setMenuOpen(false);
        setCategoriesOpen(false); // Reset categories dropdown when menu closes
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent body scroll when menu is open
    } else {
      document.body.style.overflow = '';
      setCategoriesOpen(false); // Reset categories dropdown when menu closes
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.username) return "U";
    const name = user.username.trim();
    if (name.length === 0) return "U";
    // Get first letter, handling Arabic and English
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="header" id="header">
      <div className="container">
        <div className="header-content">
          {/* الشعار */}
          <div className="logo">
                <img src={logo} alt="Makanak Logo" loading='lazy' className="logo-img" />
          </div>

          {/* القائمة */}
          {menuOpen && (
            <div 
              className="nav-overlay" 
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
          )}
          <nav 
            ref={navRef}
            className={`nav ${menuOpen ? "open" : ""}`} 
            id="nav"
          >
            <ul className="nav-list">
                
                <li>
                  <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {t("home")}
                </NavLink>
                </li>
                <li>
                  <NavLink
                  to="/products"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  onClick={() => setMenuOpen(false)}
                >
                   {t("products")}
                </NavLink>
                </li>
                {/* <li>
                  <HashLink
                   smooth to="/#offers"
                   className="nav-link"
                >
                  {t("offers") || t("specialOffers")}
                </HashLink>
                </li> */}
                {/* <li>
                  <HashLink
                   smooth to="/#categories"
                   className="nav-link"
                >
                  {t("category")}
                </HashLink>
                </li> */}
                
                <li className="nav-item-dropdown">
                  <span 
                    className="nav-link categories-link"
                    onClick={() => {
                      // Toggle on mobile, do nothing on desktop (hover handles it)
                      if (window.innerWidth <= 950) {
                        setCategoriesOpen(!categoriesOpen);
                      }
                    }}
                  >
                    {lang === "ar" ? "الفئات" : "Categories"}
                  </span>
                  <ul className={`categories-dropdown ${categoriesOpen ? 'mobile-open' : ''}`}>
                    <li>
                      <NavLink
                        to="/products?category=oud-charcoal"
                        className="dropdown-link"
                        onClick={() => {
                          setMenuOpen(false);
                          setCategoriesOpen(false);
                        }}
                      >
                        {lang === "ar" ? "فحم العود" : "Oud Charcoal"}
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/products?category=incense"
                        className="dropdown-link"
                        onClick={() => {
                          setMenuOpen(false);
                          setCategoriesOpen(false);
                        }}
                      >
                        {lang === "ar" ? "البخور" : "Incense"}
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/products?category=accessories"
                        className="dropdown-link"
                        onClick={() => {
                          setMenuOpen(false);
                          setCategoriesOpen(false);
                        }}
                      >
                        {lang === "ar" ? "الإكسسوارات" : "Accessories"}
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/offers"
                        className="dropdown-link"
                        onClick={() => {
                          setMenuOpen(false);
                          setCategoriesOpen(false);
                        }}
                      >
                        {lang === "ar" ? "العروض" : "Offers"}
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/products?category=perfumes"
                        className="dropdown-link"
                        onClick={() => {
                          setMenuOpen(false);
                          setCategoriesOpen(false);
                        }}
                      >
                        {lang === "ar" ? "العطور" : "Perfumes"}
                      </NavLink>
                    </li>
                  </ul>
                </li>
                <li>
                  <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {t("contact")}
                </NavLink>
                </li>
                <li>
                  <NavLink
                  to="/common-questions"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {lang === "ar" ? "الأسئلة الشائعة" : "FAQ"}
                </NavLink>
                </li>
                  {
                    user && user.role === "admin" &&
                        <li >
                      <NavLink to={"/dashboard"} 
                       className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                        onClick={() => setMenuOpen(false)}
                    >{t("dashboard")}</NavLink>                </li>
                }

                
                {!user && (
                  <li>
                    <NavLink
                      to="/signin"
                      className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      }
                      onClick={() => setMenuOpen(false)}
                    >
                      {t("login")}
                    </NavLink>
                  </li>
                )}

                 {user && (
                  <li className="notification-link">
                    <NotificationBell />
                  </li>
                 )}
                 <li className="cart-link">
                  <NavLink
                    to="/cart"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                    onClick={() => setMenuOpen(false)}
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
            <button onClick={()=>setLang(lang === "ar" ? "en": "ar")} className="lang-toggle" id="langToggle">
              {lang === "ar" ? "EN" : "AR"}
            </button>

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

            {/* User Profile Menu */}
            {user && (
              <div className="profile-menu-wrapper" ref={profileMenuRef}>
                <button
                  className="profile-avatar-btn"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  aria-label="User Profile Menu"
                >
                  <div className="profile-avatar">
                    {user.username ? getUserInitials() : <FaUser size={16} />}
                  </div>
                </button>

                {profileMenuOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-header">
                      <div className="profile-dropdown-avatar">
                        {user.username ? getUserInitials() : <FaUser size={20} />}
                      </div>
                      <div className="profile-dropdown-info">
                        <div className="profile-dropdown-name">{user.username || "User"}</div>
                        <div className="profile-dropdown-email">{user.email || ""}</div>
                      </div>
                    </div>
                    <div className="profile-dropdown-divider"></div>
                    <NavLink
                      to="/profile"
                      className="profile-dropdown-item"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setMenuOpen(false);
                      }}
                    >
                      <FaUser size={16} />
                      <span>{t("profile")}</span>
                    </NavLink>
                    <NavLink
                      to="/orders"
                      className="profile-dropdown-item"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setMenuOpen(false);
                      }}
                    >
                      <RiShoppingCart2Line size={16} />
                      <span>طلباتي</span>
                    </NavLink>
                    {user.role === "admin" && (
                      <NavLink
                        to="/dashboard"
                        className="profile-dropdown-item"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setMenuOpen(false);
                        }}
                      >
                        <FaBars size={16} />
                        <span>{t("dashboard")}</span>
                      </NavLink>
                    )}
                    <div className="profile-dropdown-divider"></div>
                    <button
                      className="profile-dropdown-item logout-item"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogOut();
                      }}
                    >
                      <FaSignOutAlt size={16} />
                      <span>{t("logout")}</span>
                    </button>
                  </div>
                )}
              </div>
            )}


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

export default React.memo(Header) 
