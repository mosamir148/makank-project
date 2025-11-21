import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./OrderDetail.css";
import { BASE_URL } from "../../../assets/url";
import Loading from "../../../components/Loading/Loading";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      if (!id) {
        toast.error("معرف الطلب غير صحيح");
        setLoading(false);
        return;
      }

      console.log("🔍 Fetching order with ID:", id);
      const res = await axios.get(`${BASE_URL}/cart/${id}`, { 
        withCredentials: true 
      });
      
      console.log("✅ Order response:", res.data);
      // Backend returns cartData directly, not wrapped in cart property
      setOrder(res.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching order:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || "فشل في تحميل بيانات الطلب";
      toast.error(errorMessage);
      setLoading(false);
      // Set order to null to show error message
      setOrder(null);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put(
        `${BASE_URL}/cart/${id}`,
        { status: newStatus },
        { withCredentials: true }
      );
      setOrder({ ...order, status: newStatus });
      toast.success("تم تحديث الحالة بنجاح!");
    } catch (err) {
      console.error("❌ خطأ أثناء تحديث الحالة:", err);
      toast.error("حدث خطأ أثناء التحديث!");
    }
  };

  if (loading) return <Loading />;
  if (!order) return <div className="error-message">الطلب غير موجود</div>;

  const user = order.user || order.guest;
  const product = order.product;

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <button className="back-btn" onClick={() => navigate("/dashboard/carts")}>
          ← العودة
        </button>
        <h2>تفاصيل الطلب #{id.slice(-8)}</h2>
      </div>

      <div className="order-detail-content">
        <div className="order-info-card">
          <h3>معلومات الطلب</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">الحالة:</span>
              <select
                value={order.status || "Pending"}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`status-select ${(order.status || "Pending").toLowerCase()}`}
              >
                <option value="Pending">قيد الانتظار</option>
                <option value="Complete">مكتمل</option>
                <option value="Failed">فشل</option>
              </select>
            </div>
            <div className="info-item">
              <span className="info-label">الكمية:</span>
              <span className="info-value">{order.quantity || 1}</span>
            </div>
            {order.finalPrice && (
              <div className="info-item">
                <span className="info-label">السعر النهائي:</span>
                <span className="info-value price">${order.finalPrice}</span>
              </div>
            )}
            {order.couponCode && (
              <div className="info-item">
                <span className="info-label">كود الخصم:</span>
                <span className="info-value">{order.couponCode}</span>
              </div>
            )}
            {order.discount && (
              <div className="info-item">
                <span className="info-label">الخصم:</span>
                <span className="info-value">${order.discount}</span>
              </div>
            )}
            {order.createdAt && (
              <div className="info-item">
                <span className="info-label">تاريخ الطلب:</span>
                <span className="info-value">
                  {new Date(order.createdAt).toLocaleString("ar-SA")}
                </span>
              </div>
            )}
          </div>
        </div>

        {user && (
          <div className="user-info-card">
            <h3>معلومات المستخدم</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">الاسم:</span>
                <span className="info-value">{user.username || "—"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">البريد الإلكتروني:</span>
                <span className="info-value">{user.email || "—"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">الهاتف:</span>
                <span className="info-value">{user.phone || "—"}</span>
              </div>
              {user.address && (
                <div className="info-item">
                  <span className="info-label">العنوان:</span>
                  <span className="info-value">{user.address}</span>
                </div>
              )}
              <div className="info-item">
                <span className="info-label">النوع:</span>
                <span className={`info-value role-badge ${order.user ? "registered" : "guest"}`}>
                  {order.user ? "مسجل" : "زائر"}
                </span>
              </div>
              {order.user && (
                <button
                  className="view-user-btn"
                  onClick={() => navigate(`/dashboard/user/${order.user._id}`)}
                >
                  عرض تفاصيل المستخدم
                </button>
              )}
            </div>
          </div>
        )}

        {product && (
          <div className="product-info-card">
            <h3>معلومات المنتج</h3>
            <div className="product-detail-flex">
              {product.image && (
                <img src={product.image} alt={product.title} className="product-image" />
              )}
              <div className="product-details">
                <div className="info-item">
                  <span className="info-label">اسم المنتج:</span>
                  <span className="info-value">{product.title}</span>
                </div>
                {product.description && (
                  <div className="info-item">
                    <span className="info-label">الوصف:</span>
                    <span className="info-value">{product.description}</span>
                  </div>
                )}
                {product.price && (
                  <div className="info-item">
                    <span className="info-label">السعر:</span>
                    <span className="info-value">${product.price}</span>
                  </div>
                )}
                {product.category && (
                  <div className="info-item">
                    <span className="info-label">الفئة:</span>
                    <span className="info-value category-badge">{product.category}</span>
                  </div>
                )}
                {product.brand && (
                  <div className="info-item">
                    <span className="info-label">الماركة:</span>
                    <span className="info-value">{product.brand}</span>
                  </div>
                )}
                <button
                  className="view-product-btn"
                  onClick={() => navigate(`/dashboard/products/${product._id}`)}
                >
                  عرض تفاصيل المنتج
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

