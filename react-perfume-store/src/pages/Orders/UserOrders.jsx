import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../assets/url';
import './UserOrders.css';
import { userContext } from '../../context/UserContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import Loading from '../../components/Loading/Loading';
import Pagination from '../../components/dashboard/Pagination/Pagination';
import { useLang } from '../../context/LangContext';

const UserOrders = () => {
  const { user } = useContext(userContext);
  const navigate = useNavigate();
  const { t } = useLang();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/unauthenticated', { replace: true });
      return;
    }
    fetchOrders();
  }, [user, currentPage, pageSize, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch actual orders (with orderNumber) using the type parameter
      const res = await axios.get(`${BASE_URL}/cart/mycart`, {
        withCredentials: true,
        params: { page: currentPage, limit: pageSize, type: 'orders' }, // Fetch orders, not cart items
      });
      
      const ordersData = res.data.orders || res.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setTotalItems(res.data.totalCount || ordersData.length);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      toast.error(t("failedToLoad") + " " + t("adminOrders"));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price from order items
  const calculateOrderTotal = (order) => {
    // Use backend-calculated value if available and valid (check if it's a number)
    if (order.totalPrice !== undefined && order.totalPrice !== null && typeof order.totalPrice === 'number' && !isNaN(order.totalPrice)) {
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

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const getStatusText = (status) => {
    const statusMap = {
      "Pending": t("pending"),
      "Accepted & Processed": t("acceptedAndProcessed"),
      "Delivered": t("delivered"),
      "Completed": t("completed"),
      "Rejected": t("rejected"),
      "Cancelled": t("cancelled"),
    };
    return statusMap[status] || status;
  };

  const getStatusBadgeClass = (status) => {
    const classMap = {
      "Pending": "pending",
      "Accepted & Processed": "processing",
      "Delivered": "delivered",
      "Completed": "completed",
      "Rejected": "rejected",
      "Cancelled": "cancelled",
    };
    return classMap[status] || "";
  };

  // Check if order can be cancelled
  const canCancelOrder = (status) => {
    // Only allow cancellation for pending and processing orders, NOT delivered/completed
    const cancellableStatuses = ["Pending", "Accepted & Processed"];
    return cancellableStatuses.includes(status);
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId, e) => {
    e.stopPropagation(); // Prevent row click
    
    const order = orders.find(o => o._id === orderId);
    if (!order) {
      toast.error(t("cannotCancelOrder"));
      return;
    }

    // Refresh order status from server to prevent race conditions
    try {
      const res = await axios.get(`${BASE_URL}/cart/myorder/${orderId}`, {
        withCredentials: true
      });
      const currentOrder = res.data;
      
      // Check with fresh status from server
      if (!canCancelOrder(currentOrder.status)) {
        toast.error(t("cannotCancelOrder"));
        // Update local state with fresh status
        setOrders(prevOrders => 
          prevOrders.map(o => 
            o._id === orderId ? currentOrder : o
          )
        );
        return;
      }

      const result = await Swal.fire({
        title: t("confirm"),
        text: t("cancelOrderConfirmation"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: t("yesCancelOrder"),
        cancelButtonText: t("cancel"),
      });

      if (result.isConfirmed) {
        await axios.put(
          `${BASE_URL}/cart/${orderId}`,
          { status: "Cancelled" },
          { withCredentials: true }
        );
        
        // Update the order in the list
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: "Cancelled" }
              : order
          )
        );
        
        toast.success(t("orderCancelledSuccessfully"));
      }
    } catch (err) {
      console.error("❌ Error cancelling order:", err);
      // If it's a validation error from backend, show that message
      if (err.response?.status === 400 || err.response?.status === 403) {
        toast.error(err.response?.data?.message || t("cannotCancelOrder"));
        // Refresh orders to get updated status
        fetchOrders();
      } else {
        toast.error(err.response?.data?.message || t("failedToCancelOrder"));
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="user-orders-page">
      <div className="user-orders-container">
        <div className="user-orders-header">
          <h1>{t("myOrders")}</h1>
          <button className="back-to-profile-btn" onClick={() => navigate('/profile')}>
            ← {t("backToProfile")}
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="no-orders-container">
            <p className="no-orders-message">{t("noOrdersYet")}</p>
            <button className="shop-now-btn" onClick={() => navigate('/products')}>
              {t("shopNow")}
            </button>
          </div>
        ) : (
          <>
            <div className="orders-table-wrapper">
              <table className="user-orders-list-table">
                <thead>
                  <tr>
                    <th>{t("actions")}</th>
                    <th>#</th>
                    <th>{t("orderNumber")}</th>
                    <th>{t("orderDateCol")}</th>
                    <th>{t("productsCount")}</th>
                    <th>{t("total")}</th>
                    <th>{t("status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => {
                    const itemsCount = order.items?.length || 0;
                    return (
                      <tr
                        key={order._id}
                        onClick={() => navigate(`/orders/${order._id}`)}
                        className="order-row-clickable"
                      >
                        <td 
                          data-label={t("actions")}
                          className="actions-cell"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {canCancelOrder(order.status) && (
                            <button
                              className="cancel-order-btn-table"
                              onClick={(e) => handleCancelOrder(order._id, e)}
                              title={t("cancelOrder")}
                            >
                              {t("cancel")}
                            </button>
                          )}
                        </td>
                        <td data-label="#">{(currentPage - 1) * pageSize + index + 1}</td>
                        <td data-label={t("orderNumber")}>{order.orderNumber || order._id.slice(-8)}</td>
                        <td data-label={t("orderDateCol")}>{formatDate(order.createdAt)}</td>
                        <td data-label={t("productsCount")}>{itemsCount} {t("product")}</td>
                        <td data-label={t("total")}>
                          <strong>{calculateOrderTotal(order).toFixed(2)} EGP</strong>
                        </td>
                        <td data-label={t("status")}>
                          <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalItems / pageSize)}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              totalItems={totalItems}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default UserOrders;

