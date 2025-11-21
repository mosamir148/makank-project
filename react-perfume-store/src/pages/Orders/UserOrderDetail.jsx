import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import "./UserOrderDetail.css";
import { BASE_URL } from "../../assets/url";
import Loading from "../../components/Loading/Loading";
import { useLang } from "../../context/LangContext";

const UserOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      if (!id) {
        toast.error(t("invalidOrderId"));
        setLoading(false);
        return;
      }

      const res = await axios.get(`${BASE_URL}/cart/myorder/${id}`, { 
        withCredentials: true 
      });
      
      console.log("✅ Order response:", res.data);
      setOrder(res.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching order:", err.response?.data || err);
      
      // Don't show error toast for 401 - user will be redirected
      if (err.response?.status === 401) {
        setLoading(false);
        setOrder(null);
        return;
      }
      
      const errorMessage = err.response?.data?.message || t("failedToLoadOrder");
      toast.error(errorMessage);
      setLoading(false);
      setOrder(null);
    }
  };

  if (loading) return <Loading />;
  if (!order) return <div className="error-message">{t("orderNotFound")}</div>;

  const items = order.items || [];
  const hasItems = items.length > 0;
  
  // Calculate total quantity from items
  const totalQuantity = hasItems 
    ? items.reduce((sum, item) => sum + (item.quantity || 1), 0)
    : (order.quantity || 1);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (lang === "ar") {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    } else {
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }
  };

  // Check if order can be cancelled
  const canCancelOrder = (status) => {
    // Only allow cancellation for pending and processing orders, NOT delivered/completed
    const cancellableStatuses = ["Pending", "Accepted & Processed"];
    return cancellableStatuses.includes(status);
  };

  // Handle order cancellation
  const handleCancelOrder = async () => {
    // Refresh order status from server to prevent race conditions
    try {
      const res = await axios.get(`${BASE_URL}/cart/myorder/${id}`, {
        withCredentials: true
      });
      const currentOrder = res.data;
      
      // Check with fresh status from server
      if (!canCancelOrder(currentOrder.status)) {
        toast.error(t("cannotCancelOrder"));
        // Update local state with fresh status
        setOrder(currentOrder);
        return;
      }

      const result = await Swal.fire({
        title: t("areYouSure"),
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
          `${BASE_URL}/cart/${id}`,
          { status: "Cancelled" },
          { withCredentials: true }
        );
        setOrder({ ...order, status: "Cancelled" });
        toast.success(t("orderCancelledSuccessfully"));
      }
    } catch (err) {
      console.error("❌ Error cancelling order:", err);
      // If it's a validation error from backend, show that message
      if (err.response?.status === 400 || err.response?.status === 403) {
        toast.error(err.response?.data?.message || t("cannotCancelOrder"));
        // Refresh order to get updated status
        fetchOrder();
      } else {
        toast.error(err.response?.data?.message || t("failedToCancelOrder"));
      }
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      "Pending": t("pending"),
      "Accepted & Processed": t("accepted"),
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

  return (
    <div className="user-order-detail-page">
      <div className="user-order-detail-container">
        <div className="user-order-detail-header">
          <button className="back-btn" onClick={() => navigate("/orders")}>
            {t("backToOrders")}
          </button>
          <div className="header-title-actions">
            <h2>{t("orderDetailsHeader")} #{order.orderNumber || id.slice(-8)}</h2>
            {canCancelOrder(order.status) && (
              <button className="cancel-order-btn" onClick={handleCancelOrder}>
                {t("cancelOrder")}
              </button>
            )}
          </div>
        </div>

        <div className="user-order-detail-content">
          <div className="user-order-info-card">
            <h3>{t("orderInfo")}</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">{t("status")}:</span>
                <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">{t("totalQuantity")}:</span>
                <span className="info-value">{totalQuantity}</span>
              </div>
              {order.totalPrice && (
                <div className="info-item">
                  <span className="info-label">{t("finalPriceOrder")}:</span>
                  <span className="info-value price">{order.totalPrice.toFixed(2)} EGP</span>
                </div>
              )}
              {order.paymentMethod && (
                <div className="info-item">
                  <span className="info-label">{t("paymentMethod")}:</span>
                  <span className="info-value">{order.paymentMethod}</span>
                </div>
              )}
              {order.orderNumber && (
                <div className="info-item">
                  <span className="info-label">{t("orderNumber")}:</span>
                  <span className="info-value">{order.orderNumber}</span>
                </div>
              )}
              {order.couponCode && (
                <div className="info-item">
                  <span className="info-label">{t("couponCode")}:</span>
                  <span className="info-value">{order.couponCode}</span>
                </div>
              )}
              {order.discount && order.discount > 0 && (
                <div className="info-item">
                  <span className="info-label">{t("discountOrder")}:</span>
                  <span className="info-value">{order.discount}%</span>
                </div>
              )}
              {order.createdAt && (
                <div className="info-item">
                  <span className="info-label">{t("orderCreatedAt")}:</span>
                  <span className="info-value">{formatDate(order.createdAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Show items list if order has items array */}
          {hasItems && (
            <div className="user-order-items-card">
              <h3>{t("orderProductsCount")} ({items.length} {t("product")})</h3>
              <div className="user-order-items-list">
                {items.map((item, index) => {
                  // Handle all product types
                  const itemProduct = item.product || item.featuredProduct || item.onlineProduct || item.offerProduct || null;
                  const hasProduct = itemProduct && itemProduct._id;
                  const itemPrice = hasProduct ? (itemProduct.price || 0) : 0;
                  const itemQuantity = item.quantity || 1;
                  const itemTotal = itemPrice * itemQuantity;
                  
                  // Determine product type and navigation path (only if product exists)
                  let productPath = null;
                  if (hasProduct) {
                    productPath = `/product/${itemProduct._id}`;
                    if (item.featuredProduct) {
                      productPath = `/featuredProduct/${itemProduct._id}`;
                    } else if (item.onlineProduct) {
                      productPath = `/onlineProduct/${itemProduct._id}`;
                    } else if (item.offerProduct) {
                      productPath = `/offerProduct/${itemProduct._id}`;
                    }
                  }
                  
                  const handleItemClick = () => {
                    if (hasProduct && productPath) {
                      navigate(productPath);
                    }
                  };
                  
                  return (
                    <div 
                      key={index} 
                      className="user-order-item-row"
                      onClick={handleItemClick}
                      style={{ cursor: hasProduct ? 'pointer' : 'default', opacity: hasProduct ? 1 : 0.6 }}
                    >
                      <div className="user-order-item-image">
                        <img 
                          src={hasProduct ? (itemProduct.image || "/assets/Logo3.png") : "/assets/Logo3.png"} 
                          alt={hasProduct ? (itemProduct.title || t("product")) : t("productUnavailable")} 
                        />
                      </div>
                      <div className="user-order-item-info">
                        <h4>{hasProduct ? (itemProduct.title || t("product")) : t("productUnavailable")}</h4>
                        <div className="user-order-item-details">
                          <span className="user-order-item-quantity">{t("quantity")}: {itemQuantity}</span>
                          {hasProduct ? (
                            <>
                              <span className="user-order-item-price">{t("price")}: {itemPrice.toFixed(2)} EGP</span>
                              <span className="user-order-item-total">{t("itemTotal")}: {itemTotal.toFixed(2)} EGP</span>
                            </>
                          ) : (
                            <span className="user-order-item-price" style={{ color: '#999' }}>{t("productUnavailableText")}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="user-order-items-summary">
                <div className="summary-row">
                  <span>{t("productsCountSummary")}:</span>
                  <strong>{items.length}</strong>
                </div>
                <div className="summary-row">
                  <span>{t("totalQuantitySummary")}:</span>
                  <strong>{totalQuantity}</strong>
                </div>
                {order.totalPrice && (
                  <div className="summary-row total">
                    <span>{t("totalAmount")}:</span>
                    <strong>{order.totalPrice.toFixed(2)} EGP</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Show single product if no items array (backward compatibility) */}
          {!hasItems && order.product && (
            <div className="user-order-product-card">
              <h3>{t("productInfo")}</h3>
              <div className="user-order-product-detail-flex">
                {order.product.image && (
                  <img src={order.product.image} alt={order.product.title} className="user-order-product-image" />
                )}
                <div className="user-order-product-details">
                  <div className="info-item">
                    <span className="info-label">{t("productNameLabel")}:</span>
                    <span className="info-value">{order.product.title}</span>
                  </div>
                  {order.product.description && (
                    <div className="info-item">
                      <span className="info-label">{t("productDescriptionLabel")}:</span>
                      <span className="info-value">{order.product.description}</span>
                    </div>
                  )}
                  {order.product.price && (
                    <div className="info-item">
                      <span className="info-label">{t("price")}:</span>
                      <span className="info-value">{order.product.price} EGP</span>
                    </div>
                  )}
                  {order.product.category && (
                    <div className="info-item">
                      <span className="info-label">{t("productCategoryLabel")}:</span>
                      <span className="info-value category-badge">{order.product.category}</span>
                    </div>
                  )}
                  {order.product.brand && (
                    <div className="info-item">
                      <span className="info-label">{t("productBrandLabel")}:</span>
                      <span className="info-value">{order.product.brand}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOrderDetail;

