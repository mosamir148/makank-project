import "./Sidebar.css";
import React from "react";
import { 
  FaChartLine,
  FaUsers, 
  FaShoppingCart, 
  FaBox, 
  FaTag, 
  FaTimes,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useLang } from "../../context/LangContext";

const Sidebar = ({ active, onClose, collapsed, onToggleCollapse }) => {
  const location = useLocation();
  const { t } = useLang();
  const [isDesktop, setIsDesktop] = React.useState(window.innerWidth > 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menus = [
    { 
      name: t("adminDashboard"), 
      key: "", 
      icon: FaChartLine,
      path: "/dashboard"
    },
    { 
      name: t("adminUsers"), 
      key: "user", 
      icon: FaUsers,
      path: "/dashboard/user"
    },
    { 
      name: t("adminOrders"), 
      key: "carts", 
      icon: FaShoppingCart,
      path: "/dashboard/carts"
    },
    { 
      name: t("adminProducts"), 
      key: "products", 
      icon: FaBox,
      path: "/dashboard/products"
    },
    { 
      name: t("adminOffers"), 
      key: "offers", 
      icon: FaTag,
      path: "/dashboard/offers"
    },
  ];

  const isActiveRoute = (path, key) => {
    if (key === "" && location.pathname === "/dashboard") {
      return true;
    }
    return location.pathname.includes(key) && key !== "";
  };

  return (
    <div className={`sidebar ${active ? "active" : ""} ${collapsed ? "collapsed" : ""}`}>
      {onClose && (
        <button 
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close Sidebar"
        >
          <FaTimes size={18} />
        </button>
      )}
      
      {/* Collapse Toggle Button - Works on both Desktop and Mobile */}
      <button 
        className="sidebar-collapse-btn"
        onClick={onToggleCollapse}
        aria-label={
          isDesktop 
            ? (collapsed ? "Expand Sidebar" : "Collapse Sidebar")
            : (active ? "Close Sidebar" : "Open Sidebar")
        }
        title={
          isDesktop 
            ? (collapsed ? "Expand Sidebar" : "Collapse Sidebar")
            : (active ? "Close Sidebar" : "Open Sidebar")
        }
        type="button"
      >
        {isDesktop ? (
          collapsed ? <FaChevronRight size={16} /> : <FaChevronLeft size={16} />
        ) : (
          active ? <FaTimes size={16} /> : <FaChevronRight size={16} />
        )}
      </button>
      
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menus.map((menu) => {
            const IconComponent = menu.icon;
            const isActive = isActiveRoute(menu.path, menu.key);
            
            return (
              <li key={menu.key}>
                <Link
                  to={menu.path}
                  className={`sidebar-link ${isActive ? "active" : ""}`}
                  title={collapsed ? menu.name : menu.name}
                  onClick={() => {
                    // Close sidebar on mobile when link is clicked
                    if (window.innerWidth <= 768 && onClose) {
                      onClose();
                    }
                  }}
                >
                  <div className="menu-icon-wrapper">
                    <IconComponent className="menu-icon" />
                  </div>
                  {!collapsed && <span className="menu-text">{menu.name}</span>}
                  {isActive && !collapsed && <div className="active-indicator" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default React.memo(Sidebar);
