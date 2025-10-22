import { useContext, useEffect, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
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
      const res = await axios.get(`${BASE_URL}/cart/mycart`, {
        withCredentials: true,
      });
      setCartCount(res.data.length);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCart();
     const interval = setInterval(fetchCart, 100);
    return () => clearInterval(interval);
  }, []);

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
