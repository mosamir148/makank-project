import "./Sidebar.css";
import { useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa6";
import { Link } from "react-router-dom";

const Sidebar = ({ active }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [activeSubItem, setActiveSubItem] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
    setActiveSubItem(null);
  };

  const menus = [
    { name: "لوحة التحكم", key: "", subMenu: [] },
    { name: "المستخدمون", key: "user", subMenu: [] },
    { name: "المنتجات", key: "products", subMenu: ["إضافة منتج"] },
    { name: "الطلبات", key: "carts", subMenu: [] },
    { name: "بدون تسجيل", key: "without", subMenu: [] },
    { name: "سلة الرغبات", key: "wish", subMenu: [] },
  ];

  return (
    <div className={`sidebar ${active ? "active" : ""}`}>
      <ul>
        {menus.map((menu) => (
          <li key={menu.key}>
            <Link
              to={`${menu.key}`}
              onClick={() => toggleMenu(menu.key)}
              className={openMenu === menu.key ? "active" : ""}
            >
              <span>{menu.name}</span>
              {openMenu === menu.key ? <FaChevronDown /> : <FaChevronRight />}
            </Link>
            {openMenu === menu.key && (
              <ul className="sidebar-submenu">
                {menu.subMenu.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={`/dashboard/${menu.key}/${item
                        .replace(/\s+/g, "-")
                        .toLowerCase()}`}
                      onClick={() => setActiveSubItem(item)}
                      className={activeSubItem === item ? "active" : ""}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
