import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "./Cart.css"; 
import { BASE_URL } from "../../../assets/url";
import Swal from "sweetalert2";

const Cart = () => {
  const [order, setOrder] = useState([]);
  const [user, setUser] = useState([]);
  const [product, setProduct] = useState([]);
  const [selectUser, setSelectUser] = useState(false);
  const [selectProduct, setSelectProduct] = useState(false);

  // GET ORDERS
  const getOrders = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/cart/all`, { withCredentials: true });
      setOrder(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  // GET USER
  const getUser = async (id) => {
    try {
      const res = await axios.get(`${BASE_URL}/user/getUser/${id}`, { withCredentials: true });
      setUser(res.data.info);
      setSelectUser(true);
    } catch (err) {
      console.log(err);
    }
  };

  // GET PRODUCT
  const getProduct = async (id) => {
    if (!id) return console.log("Product ID missing");
    try {
      const res = await axios.get(`${BASE_URL}/product/${id}`);
      setProduct(res.data.product);
      setSelectProduct(true);
    } catch (err) {
      console.log(err);
    }
  };

  // UPDATE STATUS
  const handleStatusChange = async (cartId, newStatus) => {
    try {
      await axios.put(`${BASE_URL}/cart/${cartId}`, { status: newStatus }, { withCredentials: true });
      setOrder((prev) =>
        prev.map((o) => (o._id === cartId ? { ...o, status: newStatus } : o))
      );
      toast.success("Status updated!");
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // DELETE ORDER

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
      await axios.delete(`${BASE_URL}/cart/${id}`, { withCredentials: true });
      getOrders();
      Swal.fire({
        title: "تم الحذف!",
        text: "تم حذف الطلب بنجاح.",
        icon: "success",
        confirmButtonText: "حسناً",
      });
    } else {
      Swal.fire({
        title: "تم الإلغاء",
        text: "لم يتم حذف الطلب.",
        icon: "info",
        confirmButtonText: "تمام",
      });
    }
  } catch (err) {
    console.log(err);
    Swal.fire({
      title: "حدث خطأ!",
      text: "لم يتم حذف الطلب، حاول مرة أخرى.",
      icon: "error",
      confirmButtonText: "حسناً",
    });
  }
};
  return (
    <div className="orders-container">
      <h1 className="orders-title">Orders Dashboard</h1>

      {/* TABLE */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>User</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Action</th>
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
                      Show
                    </button>
                  </div>
                </td>
                <td>
                  <div className="cell-flex">
                    <span>{o.user?.email}</span>
                    <button onClick={() => getUser(o.user._id)} className="show-btn green">
                      Show
                    </button>
                  </div>
                </td>
                <td>{o.quantity}</td>
                <td>
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o._id, e.target.value)}
                    className={`status-select ${o.status.toLowerCase()}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Complete">Complete</option>
                    <option value="Failed">Failed</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => deleteOrder(o._id)} className="delete-btn">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* USER MODAL */}
      {selectUser && (
        <div className="modal">
          <div className="modal-header">
            <h3>User Details</h3>
            <button onClick={() => setSelectUser(false)}>✕</button>
          </div>
          <div className="modal-body">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleString()}</p>
            <p><strong>Updated:</strong> {new Date(user.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL */}
      {selectProduct && (
        <div className="modal">
          <div className="modal-header">
            <h3>Product Details</h3>
            <button onClick={() => setSelectProduct(false)}>✕</button>
          </div>
          <div className="modal-body">
            <img src={product.image} alt="product" crossOrigin="anonymous" />
            <p><strong>Title:</strong> {product.title}</p>
            <p><strong>Description:</strong> {product.description}</p>
            <p><strong>Price:</strong> ${product.price}</p>
            <p><strong>Discount:</strong> {product.discount}%</p>
            <p><strong>Created:</strong> {new Date(product.createdAt).toLocaleString()}</p>
            <p><strong>Updated:</strong> {new Date(product.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
