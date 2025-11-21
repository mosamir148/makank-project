import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import { BASE_URL } from "../../../assets/url";
import Pagination from "../../../components/dashboard/Pagination/Pagination";
import { useLang } from "../../../context/LangContext";
import { 
  FaShoppingCart, 
  FaSearch, 
  FaFilter, 
  FaTimes, 
  FaCheckCircle, 
  FaTruck, 
  FaCheckDouble,
  FaTimesCircle,
  FaBan,
  FaEye,
  FaBox,
  FaUser,
  FaCalendarAlt,
  FaDollarSign,
  FaSpinner,
  FaSyncAlt
} from "react-icons/fa";
import Loading from "../../../components/Loading/Loading";

// Calculate total price (costorder) from items
const calculateOrderTotal = (order) => {
  if (order.totalPrice !== undefined && order.totalPrice !== null) {
    return order.totalPrice;
  }
  
  const items = order.items || [];
  if (items.length === 0) {
    return 0;
  }
  
  // Sum all items' finalPrice (which already includes item discounts AND coupon discounts)
  // Each item's finalPrice = unitPrice - discountApplied - couponDiscount (per unit)
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = (item.finalPrice || 0) * (item.quantity || 1);
    return sum + itemTotal;
  }, 0);
  
  // Add delivery fee (coupon discount is already applied per item, so don't subtract again)
  const deliveryFee = order.deliveryFee || 0;
  return Math.max(0, subtotal + deliveryFee);
};

const Cart = () => {
  const { t } = useLang();
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // Store all orders for filtering
  const [allOrdersForStats, setAllOrdersForStats] = useState([]); // All orders without pagination for stats
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchColumn, setSearchColumn] = useState("all"); // all, orderNumber, customer, products
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("all"); // all, registered, guest
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all orders for stats (without pagination)
  const getAllOrdersForStats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/cart/all`, {
        withCredentials: true,
        params: { page: 1, limit: 10000 }, // Large limit to get all orders
      });
      const fetchedOrders = Array.isArray(res.data) ? res.data : res.data.orders || [];
      const sortedOrders = [...fetchedOrders].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      setAllOrdersForStats(sortedOrders);
    } catch (err) {
      console.error("❌ Error fetching all orders for stats:", err);
    }
  };

  const getOrders = async () => {
    try {
      setLoading(true);
      // Fetch all orders (or a large number) for client-side filtering and pagination
      const res = await axios.get(`${BASE_URL}/cart/all`, {
        withCredentials: true,
        params: { page: 1, limit: 10000 }, // Fetch all orders for client-side pagination
      });
      const fetchedOrders = Array.isArray(res.data) ? res.data : res.data.orders || [];
      // Ensure orders are sorted by date descending (newest first)
      const sortedOrders = [...fetchedOrders].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      setAllOrders(sortedOrders);
      setOrders(sortedOrders);
      setTotalItems(sortedOrders.length);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      toast.error(t("failedToLoad") + " " + t("adminOrders"));
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllOrdersForStats(); // Fetch all orders for stats
    getOrders(); // Fetch all orders for table (client-side pagination)
  }, []); // Only fetch once on mount

  // Refresh orders when page regains focus (to catch updates from other tabs/pages)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, refresh orders
        getAllOrdersForStats();
        getOrders();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Also refresh when window regains focus
    const handleFocus = () => {
      getAllOrdersForStats();
      getOrders();
    };
    
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Manual refresh function
  const handleRefresh = async () => {
    toast.loading(t("refreshing") || "Refreshing...", { id: "refresh" });
    await getAllOrdersForStats();
    await getOrders();
    toast.success(t("refreshed") || "Refreshed successfully", { id: "refresh" });
  };

  // Filter and search logic
  const filteredOrders = useMemo(() => {
    let filtered = [...allOrders];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((order) => {
        switch (searchColumn) {
          case "orderNumber":
            return order.orderNumber?.toLowerCase().includes(query);
          case "customer":
            const customerName = order.user?.username || order.user?.email || order.guest?.username || order.guest?.email || "";
            return customerName.toLowerCase().includes(query);
          case "products":
            return order.items?.some((item) =>
              item.product?.title?.toLowerCase().includes(query)
            );
          default: // "all"
            const orderNum = order.orderNumber?.toLowerCase() || "";
            const customer = (order.user?.username || order.user?.email || order.guest?.username || order.guest?.email || "").toLowerCase();
            const products = order.items?.map((item) => item.product?.title?.toLowerCase()).join(" ") || "";
            return orderNum.includes(query) || customer.includes(query) || products.includes(query);
        }
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => {
        const status = (order.status || "Pending").toLowerCase();
        switch (statusFilter) {
          case "pending":
            return status.includes("pending");
          case "accepted":
            return status.includes("accepted") || status.includes("processed");
          case "delivered":
            return status.includes("delivered");
          case "completed":
            return status.includes("completed");
          case "rejected":
            return status.includes("rejected");
          case "cancelled":
            return status.includes("cancelled");
          default:
            return true;
        }
      });
    }

    // Customer type filter
    if (customerTypeFilter !== "all") {
      filtered = filtered.filter((order) => {
        if (customerTypeFilter === "registered") return !!order.user;
        if (customerTypeFilter === "guest") return !!order.guest;
        return true;
      });
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= fromDate;
      });
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate <= toDate;
      });
    }

    // Price range filter
    if (priceMin) {
      const min = parseFloat(priceMin);
      filtered = filtered.filter((order) => calculateOrderTotal(order) >= min);
    }

    if (priceMax) {
      const max = parseFloat(priceMax);
      filtered = filtered.filter((order) => calculateOrderTotal(order) <= max);
    }

    return filtered;
  }, [allOrders, searchQuery, searchColumn, statusFilter, customerTypeFilter, dateFrom, dateTo, priceMin, priceMax]);

  // Pagination for filtered results
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, pageSize]);

  const totalFilteredPages = Math.ceil(filteredOrders.length / pageSize);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedOrders([]);
  }, [searchQuery, searchColumn, statusFilter, customerTypeFilter, dateFrom, dateTo, priceMin, priceMax]);

  // Handle checkbox selection
  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Handle select all (for current page)
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(paginatedOrders.map((order) => order._id));
    } else {
      setSelectedOrders([]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSearchColumn("all");
    setStatusFilter("all");
    setCustomerTypeFilter("all");
    setDateFrom("");
    setDateTo("");
    setPriceMin("");
    setPriceMax("");
    setCurrentPage(1);
    setSelectedOrders([]);
  };

  // Update order status
  const updateOrderStatus = async (orderIds, newStatus) => {
    try {
      const updatePromises = orderIds.map((id) =>
        axios.put(
          `${BASE_URL}/cart/${id}`,
          { status: newStatus },
          { withCredentials: true }
        )
      );

      await Promise.all(updatePromises);
      setAllOrders((prev) =>
        prev.map((order) =>
          orderIds.includes(order._id)
            ? { ...order, status: newStatus }
            : order
        )
      );
      setSelectedOrders([]);
      return true;
    } catch (err) {
      console.error("❌ Error updating orders:", err);
      return false;
    }
  };

  // Business logic validation
  const canPerformAction = (action, order) => {
    const status = order.status || "Pending";

    // Cannot perform any action on cancelled orders
    if (status === "Cancelled") {
      return false;
    }

    switch (action) {
      case "accept":
        return status === "Pending";
      case "deliver":
        return status === "Accepted & Processed";
      case "delivered":
        return status === "Delivered";
      case "reject":
        return status !== "Delivered" && status !== "Completed";
      default:
        return false;
    }
  };

  // Handle action buttons
  const handleAction = async (action) => {
    if (selectedOrders.length === 0) {
      toast.error(t("selectAtLeastOneOrder"));
      return;
    }

    // Validate all selected orders can perform the action
    const selectedOrdersData = filteredOrders.filter((o) => selectedOrders.includes(o._id));
    const invalidOrders = selectedOrdersData.filter((order) => !canPerformAction(action, order));

    if (invalidOrders.length > 0) {
      const invalidStatus = invalidOrders[0].status || "Pending";
      const statusText = getStatusText(invalidStatus);
      toast.error(
        `${t("someOrdersInvalid")}: ${statusText}`
      );
      return;
    }

    let statusMap = {
      accept: "Accepted & Processed",
      deliver: "Delivered",
      delivered: "Completed",
      reject: "Rejected",
    };

    let actionNames = {
      accept: t("acceptAndProcess"),
      deliver: t("deliver"),
      delivered: t("delivered"),
      reject: t("reject"),
    };

    const newStatus = statusMap[action];
    const actionName = actionNames[action];

    const result = await Swal.fire({
      title: t("confirm"),
      text: `${t("wantToAction")} ${actionName} ${t("forSelectedOrders")} (${selectedOrders.length})?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#D4AF37",
      cancelButtonColor: "#d33",
      confirmButtonText: `${t("yesAction")}, ${actionName}`,
      cancelButtonText: t("cancel"),
    });

    if (result.isConfirmed) {
      const success = await updateOrderStatus(selectedOrders, newStatus);
      if (success) {
        toast.success(`${t("successMessage").replace("!", "")} ${actionName}!`);
        // Refresh stats and orders after status update
        getAllOrdersForStats();
        getOrders();
      } else {
        toast.error(`${t("failed")} ${actionName}`);
      }
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    const statusLower = (status || "Pending").toLowerCase();
    if (statusLower.includes("cancelled")) return "status-cancelled";
    if (statusLower.includes("pending")) return "status-pending";
    if (statusLower.includes("accepted") || statusLower.includes("processed")) return "status-processing";
    if (statusLower.includes("delivered")) return "status-delivered";
    if (statusLower.includes("completed")) return "status-completed";
    if (statusLower.includes("rejected")) return "status-rejected";
    return "status-pending";
  };

  // Get status display text
  const getStatusText = (status) => {
    const statusLower = (status || "Pending").toLowerCase();
    if (statusLower.includes("cancelled")) return t("cancelled");
    if (statusLower.includes("pending")) return t("pending");
    if (statusLower.includes("accepted") || statusLower.includes("processed")) return t("accepted");
    if (statusLower.includes("delivered")) return t("delivered");
    if (statusLower.includes("completed")) return t("completed");
    if (statusLower.includes("rejected")) return t("rejected");
    return t("pending");
  };

  // Get customer display text
  const getCustomerDisplay = (order) => {
    if (order.user) {
      return `${order.user.username || order.user.email} (${t("registered")})`;
    }
    if (order.guest) {
      return `${order.guest.username || order.guest.email || t("guest")} (${t("guest")})`;
    }
    return t("notSpecified");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || customerTypeFilter !== "all" || dateFrom || dateTo || priceMin || priceMax;

  // Calculate status counts from all orders (without pagination)
  const statusCounts = useMemo(() => {
    const counts = {
      all: allOrdersForStats.length,
      pending: 0,
      accepted: 0,
      delivered: 0,
      completed: 0,
      rejected: 0,
      cancelled: 0,
    };

    allOrdersForStats.forEach((order) => {
      const status = (order.status || "Pending").toLowerCase();
      if (status.includes("cancelled")) counts.cancelled++;
      else if (status.includes("pending")) counts.pending++;
      else if (status.includes("accepted") || status.includes("processed")) counts.accepted++;
      else if (status.includes("delivered")) counts.delivered++;
      else if (status.includes("completed")) counts.completed++;
      else if (status.includes("rejected")) counts.rejected++;
    });

    return counts;
  }, [allOrdersForStats]);

  if (loading) {
    return <Loading />;
  }

  return (
    <section className="all-orders-section">
      {/* Header Section */}
      <div className="all-orders-header">
        <div className="header-content">
          <div className="header-title">
            <FaShoppingCart className="header-icon" />
            <h2>{t("ordersManagement")}</h2>
          </div>
          <button 
            className="refresh-btn"
            onClick={handleRefresh}
            title={t("refresh") || "Refresh Orders"}
          >
            <FaSyncAlt />
            <span>{t("refresh") || "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="orders-stats-grid">
        <div 
          className={`stat-card stat-card-primary ${statusFilter === "all" ? "active" : ""}`} 
          onClick={() => setStatusFilter("all")}
        >
          <div className="stat-icon">
            <FaShoppingCart />
          </div>
          <div className="stat-content">
            <h3>{statusCounts.all}</h3>
            <p>{t("totalOrders")}</p>
          </div>
        </div>

        <div 
          className={`stat-card stat-card-warning ${statusFilter === "pending" ? "active" : ""}`} 
          onClick={() => setStatusFilter("pending")}
        >
          <div className="stat-icon">
            <FaSpinner />
          </div>
          <div className="stat-content">
            <h3>{statusCounts.pending}</h3>
            <p>{t("pending")}</p>
          </div>
        </div>

        <div 
          className={`stat-card stat-card-info ${statusFilter === "accepted" ? "active" : ""}`} 
          onClick={() => setStatusFilter("accepted")}
        >
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{statusCounts.accepted}</h3>
            <p>{t("accepted")}</p>
          </div>
        </div>

        <div 
          className={`stat-card stat-card-success ${statusFilter === "delivered" ? "active" : ""}`} 
          onClick={() => setStatusFilter("delivered")}
        >
          <div className="stat-icon">
            <FaTruck />
          </div>
          <div className="stat-content">
            <h3>{statusCounts.delivered}</h3>
            <p>{t("delivered")}</p>
          </div>
        </div>

        <div 
          className={`stat-card stat-card-success ${statusFilter === "completed" ? "active" : ""}`} 
          onClick={() => setStatusFilter("completed")}
        >
          <div className="stat-icon">
            <FaCheckDouble />
          </div>
          <div className="stat-content">
            <h3>{statusCounts.completed}</h3>
            <p>{t("completed")}</p>
          </div>
        </div>

        <div 
          className={`stat-card stat-card-danger ${statusFilter === "rejected" ? "active" : ""}`} 
          onClick={() => setStatusFilter("rejected")}
        >
          <div className="stat-icon">
            <FaTimesCircle />
          </div>
          <div className="stat-content">
            <h3>{statusCounts.rejected}</h3>
            <p>{t("rejected")}</p>
          </div>
        </div>

        <div 
          className={`stat-card stat-card-danger ${statusFilter === "cancelled" ? "active" : ""}`} 
          onClick={() => setStatusFilter("cancelled")}
        >
          <div className="stat-icon">
            <FaBan />
          </div>
          <div className="stat-content">
            <h3>{statusCounts.cancelled}</h3>
            <p>{t("cancelled")}</p>
          </div>
        </div>
      </div>

      {/* Filtered Results Info */}
      {hasActiveFilters && (
        <div className="filtered-results-info">
          <span className="filtered-count">
            {t("filteredResults")}: <strong>{filteredOrders.length}</strong> {t("of")} <strong>{statusCounts.all}</strong>
          </span>
        </div>
      )}

      {/* Filters and Search */}
      <div className="orders-filters">
        <div className="search-container">
          <select
            className="search-column-select"
            value={searchColumn}
            onChange={(e) => setSearchColumn(e.target.value)}
          >
            <option value="all">{t("searchAll")}</option>
            <option value="orderNumber">{t("orderNumber")}</option>
            <option value="customer">{t("customerUserGuest").split(" / ")[0]}</option>
            <option value="products">{t("products")}</option>
          </select>
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={
              searchColumn === "all"
                ? t("searchAll") + "..."
                : searchColumn === "orderNumber"
                ? t("searchByOrderNumber")
                : searchColumn === "customer"
                ? t("searchByCustomer")
                : t("searchByProducts")
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery("")}
              title={t("clearAllFilters")}
            >
              <FaTimes />
            </button>
          )}
        </div>
        <div className="filter-group">
          <FaFilter className="filter-icon" />
          <button
            className={`filter-toggle-btn ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? t("hideFilters") : t("showFilters")}
          </button>
          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <FaTimes />
              <span>{t("clearAllFilters")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label className="filter-label">{t("orderStatus")}:</label>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{t("allStatuses")}</option>
              <option value="pending">{t("pending")}</option>
              <option value="accepted">{t("accepted")}</option>
              <option value="delivered">{t("delivered")}</option>
              <option value="completed">{t("completed")}</option>
              <option value="rejected">{t("rejected")}</option>
              <option value="cancelled">{t("cancelled")}</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">{t("customerType")}:</label>
            <select
              className="filter-select"
              value={customerTypeFilter}
              onChange={(e) => setCustomerTypeFilter(e.target.value)}
            >
              <option value="all">{t("allTypes")}</option>
              <option value="registered">{t("registered")}</option>
              <option value="guest">{t("guest")}</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">{t("fromDate")}:</label>
            <input
              type="date"
              className="filter-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">{t("toDate")}:</label>
            <input
              type="date"
              className="filter-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">{t("minPrice")}:</label>
            <input
              type="number"
              className="filter-input"
              placeholder="0.00"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">{t("maxPrice")}:</label>
            <input
              type="number"
              className="filter-input"
              placeholder="999999.99"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="orders-actions-bar">
        <div className="actions-info">
          <span className="selected-count">
            {selectedOrders.length > 0
              ? `${selectedOrders.length} ${t("selectedOrders")}`
              : t("noOrdersSelected")}
          </span>
        </div>
        <div className="actions-buttons">
          <button
            className="action-btn accept-btn"
            onClick={() => handleAction("accept")}
            disabled={selectedOrders.length === 0}
            title={t("acceptAndProcess") + " " + t("forSelectedOrders")}
          >
            <span>{t("acceptAndProcess")}</span>
          </button>
          <button
            className="action-btn deliver-btn"
            onClick={() => handleAction("deliver")}
            disabled={selectedOrders.length === 0}
            title={t("deliver") + " " + t("forSelectedOrders")}
          >
            <span>{t("deliver")}</span>
          </button>
          <button
            className="action-btn delivered-btn"
            onClick={() => handleAction("delivered")}
            disabled={selectedOrders.length === 0}
            title={t("delivered") + " " + t("forSelectedOrders")}
          >
            <span>{t("delivered")}</span>
          </button>
          <button
            className="action-btn reject-btn"
            onClick={() => handleAction("reject")}
            disabled={selectedOrders.length === 0}
            title={t("reject") + " (" + t("cannotSelectCancelled") + ")"}
          >
            <span>{t("reject")}</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="all-orders-table-container">
        <table className="all-orders-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    paginatedOrders.length > 0 &&
                    paginatedOrders.every((order) => selectedOrders.includes(order._id))
                  }
                  onChange={handleSelectAll}
                  title={t("selectAll")}
                />
              </th>
              <th>#</th>
              <th>
                <FaBox className="th-icon" />
                {t("orderNumber")}
              </th>
              <th>
                <FaCalendarAlt className="th-icon" />
                {t("orderDateCol")}
              </th>
              <th>
                <FaUser className="th-icon" />
                {t("customerUserGuest")}
              </th>
              <th>
                <FaBox className="th-icon" />
                {t("products")}
              </th>
              <th>
                <FaDollarSign className="th-icon" />
                {t("total")}
              </th>
              <th>{t("status")}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-orders-cell">
                  <div className="empty-state">
                    <FaShoppingCart className="empty-icon" />
                    <p className="empty-text">
                      {hasActiveFilters ? t("noResults") : t("noOrdersYet")}
                    </p>
                    {hasActiveFilters && (
                      <button className="clear-filters-empty-btn" onClick={clearFilters}>
                        <FaTimes />
                        <span>{t("clearAllFilters")}</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
                paginatedOrders.map((order, index) => {
                  const items = order.items || [];
                  const itemsCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
                  const costOrder = calculateOrderTotal(order);
                  return (
                    <tr
                      key={order._id}
                      className={selectedOrders.includes(order._id) ? "row-selected" : ""}
                      onClick={() => navigate(`/dashboard/cart/${order._id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order._id)}
                          onChange={() => handleSelectOrder(order._id)}
                          onClick={(e) => e.stopPropagation()}
                          disabled={order.status === "Cancelled"}
                          title={order.status === "Cancelled" ? t("cannotSelectCancelled") : ""}
                        />
                      </td>
                      <td>
                        <div className="order-index-cell">
                          <span className="order-index">{(currentPage - 1) * pageSize + index + 1}</span>
                          {order.orderNumber && (
                            <span className="order-number-inline">#{order.orderNumber}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="order-number">{order.orderNumber || "—"}</span>
                      </td>
                      <td>
                        {order.createdAt
                          ? (() => {
                              const date = new Date(order.createdAt);
                              const day = String(date.getDate()).padStart(2, "0");
                              const month = String(date.getMonth() + 1).padStart(2, "0");
                              const year = date.getFullYear();
                              const hours = String(date.getHours()).padStart(2, "0");
                              const minutes = String(date.getMinutes()).padStart(2, "0");
                              return `${day}/${month}/${year} ${hours}:${minutes}`;
                            })()
                          : "—"}
                      </td>
                      <td>
                        <div className="customer-cell">
                          <span className="customer-name">{getCustomerDisplay(order)}</span>
                          {(order.user || order.guest) && (
                            <button
                              className="view-customer-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/cart/${order._id}`);
                              }}
                            >
                              <FaEye />
                              <span>{t("view")}</span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="order-items-preview">
                          {items.length > 0 ? (
                            <>
                              <span className="items-count">
                                {items.length} {t("product")} ({itemsCount} {t("pieces")})
                              </span>
                              <div className="items-list">
                                {items.slice(0, 3).map((item, idx) => {
                                  const product = item.product || {};
                                  return (
                                    <span key={idx} className="item-tag">
                                      {product.title || t("product")} × {item.quantity || 1}
                                    </span>
                                  );
                                })}
                                {items.length > 3 && (
                                  <span className="item-tag more">+{items.length - 3} {t("more")}</span>
                                )}
                              </div>
                            </>
                          ) : (
                            <span>{t("noProductsInOrder")}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <strong className="price-cell">
                          {costOrder.toFixed(2)} EGP
                        </strong>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                    </tr>
                  );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalFilteredPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
          setSelectedOrders([]);
        }}
        totalItems={filteredOrders.length}
      />
    </section>
  );
};

export default React.memo(Cart);
