import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import "./OrderTracking.css";
import { BASE_URL } from "../../assets/url";
import Loading from "../../components/Loading/Loading";
import { useLang } from "../../context/LangContext";

const OrderTracking = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { lang } = useLang();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchOrder();
    } else {
      toast.error(lang === "ar" ? "رمز التتبع غير صحيح" : "Invalid tracking token");
      setLoading(false);
    }
  }, [token, lang]);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/cart/track/${token}`);
      
      console.log("✅ Order tracking response:", res.data);
      setOrder(res.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching order:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || 
        (lang === "ar" ? "فشل في تحميل بيانات الطلب" : "Failed to load order data");
      toast.error(errorMessage);
      setLoading(false);
      setOrder(null);
    }
  };

  if (loading) return <Loading />;
  if (!order) {
    return (
      <div className="order-tracking-error">
        <h2>{lang === "ar" ? "الطلب غير موجود" : "Order not found"}</h2>
        <p>
          {lang === "ar"
            ? "رمز التتبع غير صحيح أو الطلب غير موجود"
            : "Invalid tracking token or order not found"}
        </p>
        <button onClick={() => navigate("/")} className="btn-home">
          {lang === "ar" ? "العودة للرئيسية" : "Back to Home"}
        </button>
      </div>
    );
  }

  const items = order.items || [];
  const hasItems = items.length > 0;
  
  const totalQuantity = hasItems 
    ? items.reduce((sum, item) => sum + (item.quantity || 1), 0)
    : 1;

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
      "Pending": lang === "ar" ? "قيد الانتظار" : "Pending",
      "Accepted & Processed": lang === "ar" ? "مقبول ومعالج" : "Accepted & Processed",
      "Delivered": lang === "ar" ? "تم التسليم" : "Delivered",
      "Completed": lang === "ar" ? "مكتمل" : "Completed",
      "Rejected": lang === "ar" ? "مرفوض" : "Rejected",
      "Cancelled": lang === "ar" ? "ملغي" : "Cancelled",
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
  const handleCancelOrder = async () => {
    if (!order || !order._id) {
      toast.error(lang === "ar" ? "خطأ: لا يمكن إلغاء الطلب" : "Error: Cannot cancel order");
      return;
    }

    // Refresh order status from server to prevent race conditions
    try {
      const res = await axios.get(`${BASE_URL}/cart/track/${token}`);
      const currentOrder = res.data;
      
      // Check with fresh status from server
      if (!canCancelOrder(currentOrder.status)) {
        toast.error(
          lang === "ar" 
            ? "لا يمكن إلغاء هذا الطلب. يمكن إلغاء الطلبات في حالة 'قيد الانتظار' أو 'مقبول ومعالج' فقط."
            : "Cannot cancel this order. Only orders with 'Pending' or 'Accepted & Processed' status can be cancelled."
        );
        // Update local state with fresh status
        setOrder(currentOrder);
        return;
      }

      const result = await Swal.fire({
        title: lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?",
        text: lang === "ar" 
          ? "هل تريد حقاً إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
          : "Do you really want to cancel this order? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: lang === "ar" ? "نعم، إلغاء الطلب" : "Yes, Cancel Order",
        cancelButtonText: lang === "ar" ? "إلغاء" : "Cancel",
      });

      if (result.isConfirmed) {
        // Use the cancel by token endpoint for guest orders (no auth required)
        await axios.put(
          `${BASE_URL}/cart/cancel/${token}`,
          {},
          { withCredentials: true }
        );
        setOrder({ ...order, status: "Cancelled" });
        toast.success(
          lang === "ar" 
            ? "تم إلغاء الطلب بنجاح" 
            : "Order cancelled successfully"
        );
      }
    } catch (err) {
      console.error("❌ Error cancelling order:", err);
      // If it's a validation error from backend, show that message
      if (err.response?.status === 400 || err.response?.status === 403) {
        toast.error(
          err.response?.data?.message || 
          (lang === "ar" ? "لا يمكن إلغاء هذا الطلب" : "Cannot cancel this order")
        );
        // Refresh order to get updated status
        fetchOrder();
      } else {
        toast.error(
          err.response?.data?.message || 
          (lang === "ar" ? "فشل في إلغاء الطلب" : "Failed to cancel order")
        );
      }
    }
  };

  return (
    <div className="order-tracking-page">
      <div className="order-tracking-container">
        <div className="order-tracking-header">
          <h2>
            {lang === "ar" ? "تتبع الطلب" : "Order Tracking"} #{order.orderNumber || order._id?.slice(-8)}
          </h2>
          <button className="btn-home" onClick={() => navigate("/")}>
            {lang === "ar" ? "العودة للرئيسية" : "Back to Home"}
          </button>
        </div>

        <div className="order-tracking-content">
          <div className="order-info-card">
            <h3>{lang === "ar" ? "معلومات الطلب" : "Order Information"}</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">
                  {lang === "ar" ? "الحالة:" : "Status:"}
                </span>
                <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  {lang === "ar" ? "الكمية الإجمالية:" : "Total Quantity:"}
                </span>
                <span className="info-value">{totalQuantity}</span>
              </div>
              {order.totalPrice && (
                <div className="info-item">
                  <span className="info-label">
                    {lang === "ar" ? "السعر النهائي:" : "Total Price:"}
                  </span>
                  <span className="info-value price">{order.totalPrice.toFixed(2)} EGP</span>
                </div>
              )}
              {order.paymentMethod && (
                <div className="info-item">
                  <span className="info-label">
                    {lang === "ar" ? "طريقة الدفع:" : "Payment Method:"}
                  </span>
                  <span className="info-value">{order.paymentMethod}</span>
                </div>
              )}
              {order.orderNumber && (
                <div className="info-item">
                  <span className="info-label">
                    {lang === "ar" ? "رقم الطلب:" : "Order Number:"}
                  </span>
                  <span className="info-value">{order.orderNumber}</span>
                </div>
              )}
              {order.couponCode && (
                <div className="info-item">
                  <span className="info-label">
                    {lang === "ar" ? "كود الخصم:" : "Coupon Code:"}
                  </span>
                  <span className="info-value">{order.couponCode}</span>
                </div>
              )}
              {order.discount && order.discount > 0 && (
                <div className="info-item">
                  <span className="info-label">
                    {lang === "ar" ? "الخصم:" : "Discount:"}
                  </span>
                  <span className="info-value">{order.discount}%</span>
                </div>
              )}
              {order.createdAt && (
                <div className="info-item">
                  <span className="info-label">
                    {lang === "ar" ? "تاريخ الطلب:" : "Order Date:"}
                  </span>
                  <span className="info-value">{formatDate(order.createdAt)}</span>
                </div>
              )}
              {order.guest && (
                <div className="info-item">
                  <span className="info-label">
                    {lang === "ar" ? "الاسم:" : "Name:"}
                  </span>
                  <span className="info-value">{order.guest.username || "—"}</span>
                </div>
              )}
              {(() => {
                // Unified delivery address logic: use deliveryAddressInfo as snapshot (preserves address at order time)
                // Fall back to deliveryAddress if deliveryAddressInfo doesn't exist (for backward compatibility)
                const deliveryAddress = order.deliveryAddressInfo || order.deliveryAddress;
                if (!deliveryAddress) return null;
                
                const addressParts = [];
                if (deliveryAddress.street) addressParts.push(deliveryAddress.street);
                if (deliveryAddress.city) addressParts.push(deliveryAddress.city);
                if (deliveryAddress.governorate) addressParts.push(deliveryAddress.governorate);
                const addressString = addressParts.length > 0 ? addressParts.join(", ") : "—";
                
                return (
                  <div className="info-item full-width">
                    <span className="info-label">
                      {lang === "ar" ? "عنوان التوصيل:" : "Delivery Address:"}
                    </span>
                    <span className="info-value">
                      {addressString}
                    </span>
                  </div>
                );
              })()}
            </div>
            {/* Cancel Order Button */}
            {canCancelOrder(order.status) && (
              <div className="order-actions">
                <button 
                  className="btn-cancel-order"
                  onClick={handleCancelOrder}
                >
                  {lang === "ar" ? "إلغاء الطلب" : "Cancel Order"}
                </button>
              </div>
            )}
          </div>

          {hasItems && (
            <div className="order-items-card">
              <h3>
                {lang === "ar" ? "منتجات الطلب" : "Order Items"} ({items.length} {lang === "ar" ? "منتج" : "items"})
              </h3>
              <div className="order-items-list">
                {items.map((item, index) => {
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
                      className="order-item-row"
                      onClick={handleItemClick}
                      style={{ cursor: hasProduct ? 'pointer' : 'default', opacity: hasProduct ? 1 : 0.6 }}
                    >
                      <div className="order-item-image">
                        <img 
                          src={hasProduct ? (itemProduct.image || "/assets/Logo3.png") : "/assets/Logo3.png"} 
                          alt={hasProduct ? (itemProduct.title || (lang === "ar" ? "منتج" : "Product")) : (lang === "ar" ? "منتج محذوف" : "Deleted Product")} 
                        />
                      </div>
                      <div className="order-item-info">
                        <h4>{hasProduct ? (itemProduct.title || (lang === "ar" ? "منتج" : "Product")) : (lang === "ar" ? "منتج غير متوفر (تم حذفه)" : "Product Unavailable (Deleted)")}</h4>
                        <div className="order-item-details">
                          <span className="order-item-quantity">
                            {lang === "ar" ? "الكمية:" : "Quantity:"} {itemQuantity}
                          </span>
                          {hasProduct ? (
                            <>
                              <span className="order-item-price">
                                {lang === "ar" ? "السعر:" : "Price:"} {itemPrice.toFixed(2)} EGP
                              </span>
                              <span className="order-item-total">
                                {lang === "ar" ? "المجموع:" : "Total:"} {itemTotal.toFixed(2)} EGP
                              </span>
                            </>
                          ) : (
                            <span className="order-item-price" style={{ color: '#999' }}>
                              {lang === "ar" ? "المنتج غير متوفر" : "Product Unavailable"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="order-items-summary">
                <div className="summary-row">
                  <span>{lang === "ar" ? "عدد المنتجات:" : "Number of Items:"}</span>
                  <strong>{items.length}</strong>
                </div>
                <div className="summary-row">
                  <span>{lang === "ar" ? "الكمية الإجمالية:" : "Total Quantity:"}</span>
                  <strong>{totalQuantity}</strong>
                </div>
                {order.totalPrice && (
                  <div className="summary-row total">
                    <span>{lang === "ar" ? "المجموع الكلي:" : "Grand Total:"}</span>
                    <strong>{order.totalPrice.toFixed(2)} EGP</strong>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;

