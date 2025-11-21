import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import "./DashboardLayout.css";
import Header from "../../components/Header/Header/Header";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // On desktop, always show sidebar
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    handleResize(); // run once
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleSidebarCollapse = () => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      // On mobile, toggle open/close
      setSidebarOpen(!sidebarOpen);
    } else {
      // On desktop, toggle collapse/expand
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="dashboard-section">
      <Header />

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <Sidebar 
        active={sidebarOpen} 
        onClose={closeSidebar}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      <div className="dashboard-main">
        <main className={`dashboard-content ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;