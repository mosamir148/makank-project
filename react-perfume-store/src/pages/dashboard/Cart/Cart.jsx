import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import Swal from "sweetalert2";
import "./Cart.css";
import { BASE_URL } from "../../../assets/url";

const Cart = () => {
const [orders, setOrders] = useState([]);
const [selectedUser, setSelectedUser] = useState(null);
const [selectedProduct, setSelectedProduct] = useState(null);

const getOrders = async () => {
  try {
  const res = await axios.get(`${BASE_URL}/cart/all`, { withCredentials: true });
  console.log(res.data)
  const allOrders = res.data || [];
  setOrders(allOrders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
  }
};

  useEffect(() => {
  getOrders();
  }, []);


  const handleStatusChange = async (cartId, newStatus) => {
  try {
  await axios.put(
  `${BASE_URL}/cart/${cartId}`,
  { status: newStatus },
  { withCredentials: true }
  );
  setOrders((prev) =>
  prev.map((o) => (o._id === cartId ? { ...o, status: newStatus } : o))
  );
  toast.success("تم تحديث الحالة بنجاح!");
  } catch (err) {
  console.error("❌ خطأ أثناء تحديث الحالة:", err);
  toast.error("حدث خطأ أثناء التحديث!");
  }
  };

return ( <div className="orders-container"> <h1 className="orders-title">لوحة الطلبات</h1>


  {/* جدول الطلبات */}
  <div className="orders-table-container">
    <table className="orders-table">
      <thead>
        <tr>
          <th>#</th>
          <th>المنتج</th>
          <th>المستخدم / الزائر</th>
          <th>الكمية</th>
          <th>الحالة</th>
        </tr>
      </thead>
      <tbody>
        {orders.length === 0 ? (
          <tr>
            <td colSpan="5" style={{ textAlign: "center" }}>
              لا توجد طلبات بعد
            </td>
          </tr>
        ) : (
          orders.map((o, index) => (
            <tr key={o._id}>
              <td>{index + 1}</td>
              <td>
                <div className="cell-flex">
                  <span>{o.product?.title || "—"}</span>
                  {o.product && (
                    <button
                      onClick={() => setSelectedProduct(o.product)}
                      className="show-btn blue"
                    >
                      عرض
                    </button>
                  )}
                </div>
              </td>
              <td>
               <div className="cell-flex" >

          <span>
            {o.user ? o.user.email : o.guest?.username || "زائر"}
          </span>


          <span style={{ fontSize: "12px", fontWeight: "bold", color: o.user ? "green" : "orange" }}>
            {o.user ? "مسجل" : "زائر"}
          </span>

          <button
            onClick={() =>
              setSelectedUser(
                o.user
                  ? o.user
                  : o.guest || {
                      username: "زائر",
                      phone: "—",
                      address: "—",
                      email: "—",
                    }
              )
            }
            className={`show-btn ${o.user ? "green" : "orange"}`}
          >
            عرض
          </button>
        </div>
              </td>

              <td>{o.quantity || 1}</td>


              <td>
                <select
                  value={o.status}
                  onChange={(e) =>
                    handleStatusChange(o._id, e.target.value)
                  }
                  className={`status-select ${o.status.toLowerCase()}`}
                >
                  <option value="Pending">قيد الانتظار</option>
                  <option value="Complete">مكتمل</option>
                  <option value="Failed">فشل</option>
                </select>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>

  {/* 🔵 نافذة المستخدم */}
  {selectedUser && (
    <div className="modal">
      <div className="modal-header">
        <h3>تفاصيل المستخدم</h3>
        <button onClick={() => setSelectedUser(null)}>✕</button>
      </div>
      <div className="modal-body">
        <p>
          <strong>الاسم:</strong> {selectedUser.username || "—"}
        </p>
        <p>
          <strong>الهاتف:</strong> {selectedUser.phone || "—"}
        </p>
        <p>
          <strong>العنوان:</strong> {selectedUser.address || "—"}
        </p>
        <p>
          <strong>البريد الإلكتروني:</strong> {selectedUser.email || "—"}
        </p>
        {selectedUser.createdAt && (
          <p>
            <strong>أنشئ في:</strong>{" "}
            {new Date(selectedUser.createdAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  )}

  {/* 🔵 نافذة المنتج */}
  {selectedProduct && (
    <div className="modal">
      <div className="modal-header">
        <h3>تفاصيل المنتج</h3>
        <button onClick={() => setSelectedProduct(null)}>✕</button>
      </div>
      <div className="modal-body">
        <img
          src={selectedProduct.image}
          alt="product"
          crossOrigin="anonymous"
        />
        <p>
          <strong>العنوان:</strong> {selectedProduct.title}
        </p>
        <p>
          <strong>الوصف:</strong> {selectedProduct.description}
        </p>
        <p>
          <strong>السعر:</strong> {selectedProduct.price} ج.م
        </p>
        {selectedProduct.discount && (
          <p>
            <strong>الخصم:</strong> {selectedProduct.discount}%
          </p>
        )}
        
      </div>
    </div>
  )}
</div>


);
};

export default Cart;
