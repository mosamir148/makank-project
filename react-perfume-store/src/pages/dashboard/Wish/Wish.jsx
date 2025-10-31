import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "./Wish.css"; 
import { BASE_URL } from "../../../assets/url";
import Swal from "sweetalert2";
import Loading from "../../../components/Loading/Loading";

const Wish = () => {
  const [order, setOrder] = useState([]);
  const [user, setUser] = useState([]);
  const [product, setProduct] = useState([]);
  const [selectUser, setSelectUser] = useState(false);
  const [selectProduct, setSelectProduct] = useState(false);
  const [loading, setLoading] = useState(true);

  // جلب الطلبات
  const getOrders = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/wish/all`, { withCredentials: true });
      setLoading(false);
      setOrder(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  // جلب بيانات المستخدم
  const getUser = async (id) => {
    try {
      const res = await axios.get(`${BASE_URL}/user/getUser/${id}`, { withCredentials: true });
      setUser(res.data.info);
      setSelectUser(true);
    } catch (err) {
      console.log(err);
    }
  };

  // جلب بيانات المنتج
  const getProduct = async (id) => {
    if (!id) return console.log("معرّف المنتج مفقود");
    try {
      const res = await axios.get(`${BASE_URL}/product/${id}`);
      setProduct(res.data.product);
      setSelectProduct(true);
    } catch (err) {
      console.log(err);
    }
  };

  // تحديث حالة الطلب
  const handleStatusChange = async (cartId, newStatus) => {
    try {
      await axios.put(`${BASE_URL}/wish/${cartId}`, { status: newStatus }, { withCredentials: true });
      setOrder((prev) =>
        prev.map((o) => (o._id === cartId ? { ...o, status: newStatus } : o))
      );
      toast.success("تم تحديث الحالة!");
    } catch (err) {
      console.error("حدث خطأ أثناء تحديث الحالة:", err);
    }
  };

  // حذف الطلب
  const deleteOrder = async (id) => {
    try {
      const result = await Swal.fire({
        title: "هل أنت متأكد؟",
        text: "لن تتمكن من استعادة هذا الطلب بعد الحذف!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "نعم، احذفه!",
        cancelButtonText: "إلغاء",
      });

      if (result.isConfirmed) {
        await axios.delete(`${BASE_URL}/wish/${id}`, { withCredentials: true });
        getOrders();
        Swal.fire("تم الحذف!", "تم حذف الطلب بنجاح.", "success");
      } else {
        Swal.fire("تم الإلغاء", "لم يتم حذف الطلب.", "info");
      }
    } catch (err) {
      console.log(err);
      Swal.fire("حدث خطأ!", "لم يتم حذف الطلب، حاول مرة أخرى.", "error");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="orders-container">
      <h1 className="orders-title">لوحة الطلبات المفضلة</h1>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>#</th>
              <th>المنتج</th>
              <th>المستخدم</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            {order.map((o, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <div className="cell-flex">
                    <span>{o.product?.title}</span>
                    <button onClick={() => getProduct(o.product?._id)} className="show-btn blue">
                      عرض
                    </button>
                  </div>
                </td>
                <td>
                  <div className="cell-flex">
                    <span>{o.user?.email}</span>
                    <button onClick={() => getUser(o.user._id)} className="show-btn green">
                      عرض
                    </button>
                  </div>
                </td>
                <td>
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o._id, e.target.value)}
                    className={`status-select ${o.status?.toLowerCase()}`}
                  >
                    <option value="Pending">قيد الانتظار</option>
                    <option value="Complete">مكتمل</option>
                    <option value="Failed">فشل</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => deleteOrder(o._id)} className="delete-btn">
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* نافذة تفاصيل المستخدم */}
      {selectUser && (
        <div className="modal">
          <div className="modal-header">
            <h3>تفاصيل المستخدم</h3>
            <button onClick={() => setSelectUser(false)}>✕</button>
          </div>
          <div className="modal-body">
            <p><strong>اسم المستخدم:</strong> {user.username}</p>
            <p><strong>البريد الإلكتروني:</strong> {user.email}</p>
            <p><strong>الهاتف:</strong> {user.phone}</p>
            <p><strong>الدور:</strong> {user.role}</p>
            <p><strong>تاريخ الإنشاء:</strong> {new Date(user.createdAt).toLocaleString()}</p>
            <p><strong>آخر تعديل:</strong> {new Date(user.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* نافذة تفاصيل المنتج */}
      {selectProduct && (
        <div className="modal">
          <div className="modal-header">
            <h3>تفاصيل المنتج</h3>
            <button onClick={() => setSelectProduct(false)}>✕</button>
          </div>
          <div className="modal-body">
            <img src={product.image} alt="product" crossOrigin="anonymous" />
            <p><strong>الاسم:</strong> {product.title}</p>
            <p><strong>الوصف:</strong> {product.description}</p>
            <p><strong>السعر:</strong> ${product.price}</p>
            <p><strong>الخصم:</strong> {product.discount || 0}%</p>
            <p><strong>تاريخ الإنشاء:</strong> {new Date(product.createdAt).toLocaleString()}</p>
            <p><strong>آخر تعديل:</strong> {new Date(product.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Wish);
