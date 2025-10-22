import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import "./DashboardLayout.css";
import DashboardNavbar from "../../components/Header/DashboardNavbar/DashboardNavbar";

const DashboardLayout = () => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (window.innerWidth > 500) {
      setActive(false);
    } else {
      setActive(true);
    }
  }, []);

  return (
    <div className="dashboard-section">
      <DashboardNavbar active={active} setActive={setActive} />
      <div className="dashboard-main">
        <Sidebar active={active} />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
