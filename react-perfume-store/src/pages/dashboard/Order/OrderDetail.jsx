import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./OrderDetail.css";
import { BASE_URL } from "../../../assets/url";
import Loading from "../../../components/Loading/Loading";
import { useLang } from "../../../context/LangContext";
import { userContext } from "../../../context/UserContext";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const { user } = useContext(userContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Track dark mode changes for any dynamic styling needs
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.body.classList.contains('dark'));
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

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

      const res = await axios.get(`${BASE_URL}/cart/${id}`, { 
        withCredentials: true 
      });
      
      console.log("✅ Order response:", res.data);
      // Backend returns cartData directly, not wrapped in cart property
      setOrder(res.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching order:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || t("failedToLoad") + " " + t("orderDetail");
      toast.error(errorMessage);
      setLoading(false);
      // Set order to null to show error message
      setOrder(null);
    }
  };

  // Get status badge class (matching Cart.jsx)
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

  // Get status display text (matching Cart.jsx)
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

  if (loading) return <Loading />;
  if (!order) return <div className="error-message">{t("orderNotFound")}</div>;

  const customer = order.user || order.guest;
  const product = order.product;
  const items = order.items || [];
  const hasItems = items.length > 0;
  
  // Calculate total quantity from items
  const totalQuantity = hasItems 
    ? items.reduce((sum, item) => sum + (item.quantity || 1), 0)
    : (order.quantity || 1);

  // Calculate prices from order
  const calculateOrderPrices = (order) => {
    // Use backend-calculated values if available
    if (order.subtotal !== undefined && order.totalPrice !== undefined) {
      return {
        subtotal: order.subtotal,
        discount: order.totalDiscount || order.discount || 0,
        total: order.totalPrice
      };
    }
    
    // Fallback calculation if backend didn't provide subtotal
    const items = order.items || [];
    if (items.length === 0) {
      return { subtotal: 0, discount: 0, total: 0 };
    }
    
    // Sum all items' finalPrice (which already includes item discounts AND coupon discounts)
    // Each item's finalPrice = unitPrice - discountApplied - couponDiscount (per unit)
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = (item.finalPrice || 0) * (item.quantity || 1);
      return sum + itemTotal;
    }, 0);
    
    // Calculate total discount (item discounts + coupon discounts) for display
    let totalItemDiscount = 0;
    let totalCouponDiscount = 0;
    items.forEach(item => {
      const quantity = item.quantity || 1;
      totalItemDiscount += (item.discountApplied || 0) * quantity;
      totalCouponDiscount += (item.couponDiscount || 0) * quantity;
    });
    const totalDiscount = totalItemDiscount + totalCouponDiscount;
    
    // Add delivery fee (coupon discount is already applied per item, so don't subtract again)
    const deliveryFee = order.deliveryFee || 0;
    const total = Math.max(0, subtotal + deliveryFee);
    
    return { subtotal, discount: totalDiscount, total };
  };

  const { subtotal, discount, total: costOrder } = calculateOrderPrices(order);

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <button className="back-btn" onClick={() => navigate("/dashboard/carts")}>
          ← {t("back")}
        </button>
        <h2>{t("orderDetail")} #{id.slice(-8)}</h2>
      </div>

      <div className="order-detail-content">
        <div className="order-info-card">
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
            <div className="info-item">
              <span className="info-label">{t("finalPriceOrder")}:</span>
              <span className="info-value price">{costOrder.toFixed(2)} EGP</span>
            </div>
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
            {subtotal > 0 && (
              <div className="info-item">
                <span className="info-label">{t("subtotal") || "Subtotal"}:</span>
                <span className="info-value">{subtotal.toFixed(2)} EGP</span>
              </div>
            )}
            {discount > 0 && (
              <div className="info-item">
                <span className="info-label">
                  {order.couponCode ? (t("couponDiscount") || "Coupon Discount") : (t("discountOrder") || "Discount")}:
                </span>
                <span className="info-value discount-text">- {discount.toFixed(2)} EGP</span>
              </div>
            )}
            {order.createdAt && (
              <div className="info-item">
                <span className="info-label">{t("orderDate")}:</span>
                <span className="info-value">
                  {(() => {
                    const date = new Date(order.createdAt);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    const seconds = String(date.getSeconds()).padStart(2, '0');
                    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
                  })()}
                </span>
              </div>
            )}
          </div>
        </div>

        {customer && (
          <div 
            className={`user-info-card ${order.user ? "clickable-user-card" : ""}`}
            onClick={() => {
              if (order.user && order.user._id) {
                navigate(`/dashboard/user/${order.user._id}`);
              }
            }}
            style={{ cursor: order.user ? 'pointer' : 'default' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>{t("userInfo")}</h3>
              {/* Security Badge: Shows this is viewed by authenticated admin from token */}
              {(order?.viewedBy || user) && (
                <div className="security-badge">
                  <span>🔒</span>
                  <span>{t("verifiedByToken") || "Verified by Token"}</span>
                </div>
              )}
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">{t("name")}:</span>
                <span className="info-value">{customer.username || "—"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t("email")}:</span>
                <span className={`info-value ${!customer.email ? 'info-value-placeholder' : ''}`}>
                  {customer.email || "—"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">{t("phone")}:</span>
                <span className={`info-value ${!customer.phone ? 'info-value-placeholder' : ''}`}>
                  {customer.phone || "—"}
                </span>
              </div>
              {customer.address && (
                <div className="info-item">
                  <span className="info-label">{t("address")}:</span>
                  <span className="info-value">{customer.address}</span>
                </div>
              )}
              <div className="info-item">
                <span className="info-label">{t("customerType")}:</span>
                <span className={`info-value role-badge ${order.user ? "registered" : "guest"}`}>
                  {order.user ? t("registered") : t("guest")}
                </span>
              </div>
              {order.user && (
                <div className="info-item">
                  <span className="info-label">{t("clickToViewProfile")}</span>
                  <span className="info-value click-here-link">
                    {t("clickHere")}
                  </span>
                </div>
              )}
            </div>
            {/* Security Note: Information verified from authentication token */}
            {(order?.viewedBy || user) && (
              <div className="security-note">
                <span>🔐 </span>
                <span>{t("securityNoteUserInfo") || "This customer information is being viewed securely by an authenticated admin. Access verified from JWT token."}</span>
                <div>
                  {t("viewedBy") || "Viewed By"}: <strong>{order?.viewedBy?.username || user?.username || "—"}</strong> ({order?.viewedBy?.email || user?.email || "—"})
                </div>
              </div>
            )}
          </div>
        )}

        {/* Delivery Address Section */}
        {/* Unified delivery address logic: use deliveryAddressInfo as snapshot (preserves address at order time) */}
        {/* Fall back to deliveryAddress if deliveryAddressInfo doesn't exist (for backward compatibility) */}
        {(() => {
          // Priority: deliveryAddressInfo (embedded snapshot) > deliveryAddress (populated reference)
          const deliveryAddress = order.deliveryAddressInfo || order.deliveryAddress;
          if (!deliveryAddress) return null;
          
          // Handle both embedded object and populated reference structures
          const name = deliveryAddress.name || deliveryAddress.recipientName || "—";
          const phone = deliveryAddress.phone || deliveryAddress.phoneNumber || "—";
          const governorate = deliveryAddress.governorate || deliveryAddress.governorateName || null;
          const city = deliveryAddress.city || deliveryAddress.cityName || null;
          const street = deliveryAddress.street || deliveryAddress.streetName || deliveryAddress.address || "—";
          const number = deliveryAddress.number || deliveryAddress.streetNumber || null;
          const buildingNumber = deliveryAddress.buildingNumber || deliveryAddress.building || null;
          
          return (
            <div className="delivery-address-card">
              <h3>{t("deliveryAddress") || "Delivery Address"}</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">{t("recipientName") || "Recipient Name"}:</span>
                  <span className="info-value">{name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">{t("phone")}:</span>
                  <span className="info-value">{phone}</span>
                </div>
                {governorate && (
                  <div className="info-item">
                    <span className="info-label">{t("governorate") || "Governorate"}:</span>
                    <span className="info-value">{governorate}</span>
                  </div>
                )}
                {city && (
                  <div className="info-item">
                    <span className="info-label">{t("city")}:</span>
                    <span className="info-value">{city}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-label">{t("street") || "Street"}:</span>
                  <span className="info-value">{street}</span>
                </div>
                {number && (
                  <div className="info-item">
                    <span className="info-label">{t("streetNumber") || "Street Number"}:</span>
                    <span className="info-value">{number}</span>
                  </div>
                )}
                {buildingNumber && (
                  <div className="info-item">
                    <span className="info-label">{t("buildingNumber") || "Building Number"}:</span>
                    <span className="info-value">{buildingNumber}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Show items list if order has items array */}
        {hasItems && (
          <div className="order-items-card">
            <h3>{t("orderItems")} ({items.length} {items.length === 1 ? t("product") : t("products")})</h3>
            <div className="order-items-list">
              {items.map((item, index) => {
                // Handle all product types: product, featuredProduct, onlineProduct, offerProduct
                // Also check for productId fields in case products weren't populated
                const itemProduct = item.product || item.featuredProduct || item.onlineProduct || item.offerProduct || null;
                const hasProduct = itemProduct && (itemProduct._id || itemProduct.title);
                
                // Use stored prices from item (already calculated with discounts)
                const unitPrice = item.unitPrice || (hasProduct ? (itemProduct.price || 0) : 0);
                const discountApplied = item.discountApplied || 0;
                const finalPricePerUnit = item.finalPrice ? (item.finalPrice / (item.quantity || 1)) : (unitPrice - discountApplied);
                const itemQuantity = item.quantity || 1;
                const itemTotal = item.finalPrice || (finalPricePerUnit * itemQuantity);
                
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
                        alt={hasProduct ? (itemProduct.title || t("product")) : t("productUnavailable")} 
                      />
                    </div>
                    <div className="order-item-info">
                      <h4>{hasProduct ? (itemProduct.title || t("product")) : t("productUnavailable")}</h4>
                      <div className="order-item-details">
                        <span className="order-item-quantity">{t("quantity")}: {itemQuantity}</span>
                        {hasProduct ? (
                          <>
                            {unitPrice > finalPricePerUnit && (
                              <span className="order-item-unit-price unit-price-strikethrough">
                                {t("unitPrice") || "Unit Price"}: {unitPrice.toFixed(2)} EGP
                              </span>
                            )}
                            {discountApplied > 0 && (
                              <span className="order-item-discount discount-text" style={{ fontSize: '0.9em' }}>
                                {t("discount") || "Discount"}: -{discountApplied.toFixed(2)} EGP {itemQuantity > 1 && `× ${itemQuantity} = -${(discountApplied * itemQuantity).toFixed(2)} EGP`}
                              </span>
                            )}
                            <span className="order-item-price">
                              {t("price") || "Price per unit"}: {finalPricePerUnit.toFixed(2)} EGP {itemQuantity > 1 && `× ${itemQuantity}`}
                            </span>
                            <span className="order-item-total">
                              {t("itemTotal") || "Item Total"}: {itemTotal.toFixed(2)} EGP
                            </span>
                          </>
                        ) : (
                          <span className="order-item-price unavailable-text">{t("productUnavailable")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="order-items-summary">
              <div className="summary-row">
                <span>{t("productsCountSummary")}:</span>
                <strong>{items.length}</strong>
              </div>
              <div className="summary-row">
                <span>{t("totalQuantitySummary")}:</span>
                <strong>{totalQuantity}</strong>
              </div>
              {subtotal > 0 && (
                <div className="summary-row">
                  <span>{t("subtotal") || "Subtotal"}:</span>
                  <strong>{subtotal.toFixed(2)} EGP</strong>
                </div>
              )}
              {discount > 0 && (
                <div className="summary-row discount-text">
                  <span>
                    {order.couponCode ? (t("couponDiscount") || "Coupon Discount") : (t("discountOrder") || "Discount")}:
                  </span>
                  <strong>- {discount.toFixed(2)} EGP</strong>
                </div>
              )}
              <div className="summary-row total">
                <span>{t("totalAmount")}:</span>
                <strong>{costOrder.toFixed(2)} EGP</strong>
              </div>
            </div>
          </div>
        )}

        {/* Show single product if no items array (backward compatibility) */}
        {!hasItems && product && (
          <div className="product-info-card">
            <h3>{t("productDetails")}</h3>
            <div className="product-detail-flex">
              {product.image && (
                <img src={product.image} alt={product.title} className="product-image" />
              )}
              <div className="product-details">
                <div className="info-item">
                  <span className="info-label">{t("productTitle")}:</span>
                  <span className="info-value">{product.title}</span>
                </div>
                {product.description && (
                  <div className="info-item">
                    <span className="info-label">{t("description")}:</span>
                    <span className="info-value">{product.description}</span>
                  </div>
                )}
                {product.price && (
                  <div className="info-item">
                    <span className="info-label">{t("price")}:</span>
                    <span className="info-value">{product.price}</span>
                  </div>
                )}
                {product.category && (
                  <div className="info-item">
                    <span className="info-label">{t("category")}:</span>
                    <span className="info-value category-badge">{product.category}</span>
                  </div>
                )}
                {product.brand && (
                  <div className="info-item">
                    <span className="info-label">{t("brand")}:</span>
                    <span className="info-value">{product.brand}</span>
                  </div>
                )}
                <button
                  className="view-product-btn"
                  onClick={() => navigate(`/dashboard/products/${product._id}`)}
                >
                  {t("viewDetails")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;

