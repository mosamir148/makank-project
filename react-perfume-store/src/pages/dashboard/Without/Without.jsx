import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Without.css";
import { BASE_URL } from "../../../assets/url";
import Loading from "../../../components/Loading/Loading";
import Swal from "sweetalert2";

const Without = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectUser, setSelectUser] = useState(false);
  const [selectProduct, setSelectProduct] = useState(false);
  const [user, setUser] = useState({});
  const [product, setProduct] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/without/getWithoutUsers`, { withCredentials: true });
        const data = Array.isArray(res.data) ? res.data : [];
        setUsers(data);

      } catch (error) {
        console.error("حدث خطأ أثناء جلب المستخدمين:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const getUser = (userId) => {
    const foundUser = users.find((u) => u._id === userId);
    if (foundUser) {
      setUser(foundUser);
      setSelectUser(true);
    }
  };

  const getProduct = (cart) => {
    setProduct(cart);
    setSelectProduct(true);
  };

  const handleProductStatusChange = async (cartId, newStatus) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/without/updateCartStatus/${cartId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      const updatedCart = res.data.cart;

      setUsers(prevUsers =>
        prevUsers.map(uItem => ({
          ...uItem,
          products: uItem.products.map(p =>
            p._id === updatedCart._id ? { ...p, status: updatedCart.status } : p
          )
        }))
      );
    } catch (error) {
      console.error("حدث خطأ أثناء تحديث حالة المنتج:", error);
    }
  };

const handleDeleteProduct = async (userId) => {
  try {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف كل منتجات هذا المستخدم!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      await axios.delete(`${BASE_URL}/without/deleteCartItem/${userId}`, { withCredentials: true });

      // إزالة المستخدم بعد حذف منتجاته
      setUsers(prevUsers => prevUsers.filter(u => u._id !== userId));

      Swal.fire("تم الحذف!", "تم حذف المستخدم وكل منتجاته بنجاح.", "success");
    }
  } catch (error) {
    console.error("حدث خطأ أثناء حذف المنتج:", error);
    Swal.fire("حدث خطأ!", "لم يتم الحذف، حاول مرة أخرى.", "error");
  }
};

  if (loading) return <Loading />;

  return (
    <div className="orders-container">
      <h1 className="orders-title">لوحة مستخدمي بدون حساب</h1>

      <div className="orders-table-container">
        <table className="orders-table">
         <thead>
            <tr>
              <th>#</th>
              <th>المستخدم</th>
              <th>المنتجات</th>
              <th>الهاتف</th>
              <th>البريد الإلكتروني</th>
              <th>إجراء</th> 
            </tr>
          </thead>
          <tbody>
            {users.map((u, index) => (
              <tr key={u._id}>
                <td>{index + 1}</td>
                <td>
                  <div className="cell-flex">
                    <span>{u.username}</span>
                    <button onClick={() => getUser(u._id)} className="show-btn green">
                      عرض
                    </button>
                  </div>
                </td>
                <td>
                  {u.products.map((c) => (
                    <div key={c._id} className="cell-flex">
                      <span>{c.product.name}</span>
                      <select
                        value={c.status || "Pending"}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          handleProductStatusChange(c._id, newStatus);
                        }}
                        className={`status-select ${c.status?.toLowerCase()}`}
                      >
                        <option value="Pending">قيد الانتظار</option>
                        <option value="Complete">مكتمل</option>
                        <option value="Failed">فشل</option>
                      </select>

                      <button onClick={() => getProduct(c)} className="show-btn blue">
                        عرض
                      </button>
                    </div>
                  ))}
                </td>
                <td>{u.phone}</td>
                <td>{u.email || "لا يوجد"}</td>
                <td>
                  {u.products.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => handleDeleteProduct( u._id)}
                      className="delete-btn"
                    >
                      حذف
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {selectUser && (
        <div className="modal">
          <div className="modal-header">
            <h3>تفاصيل المستخدم</h3>
            <button onClick={() => setSelectUser(false)}>✕</button>
          </div>
          <div className="modal-body">
            <p><strong>اسم المستخدم:</strong> {user.username}</p>
            <p><strong>العنوان:</strong> {user.address}</p>
            <p><strong>البريد الإلكتروني:</strong> {user.email || "لا يوجد"}</p>
            <p><strong>الهاتف:</strong> {user.phone}</p>
            <p><strong>واتساب:</strong> {user.phoneWhats || "لا يوجد"}</p>
            <p><strong>تاريخ الإنشاء:</strong> {new Date(user.createdAt).toLocaleString()}</p>
            <p><strong>آخر تعديل:</strong> {new Date(user.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      )}


      {selectProduct && (
        <div className="modal">
          <div className="modal-header">
            <h3>تفاصيل المنتج</h3>
            <button onClick={() => setSelectProduct(false)}>✕</button>
          </div>
          <div className="modal-body">
            <img src={product.product.image} alt={product.product.name} crossOrigin="anonymous" />
            <p><strong>الاسم:</strong> {product.product.title}</p>
            <p><strong>الوصف:</strong> {product.product.description}</p>
            <p><strong>السعر:</strong> ${product.product.price}</p>
            <p><strong>الخصم:</strong> {product.product.discount || 0}%</p>
            <p><strong>الكمية:</strong> {product.quantity}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Without;
