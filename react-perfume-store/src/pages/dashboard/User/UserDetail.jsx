import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import "./UserDetail.css";
import { BASE_URL } from "../../../assets/url";
import Loading from "../../../components/Loading/Loading";
import Pagination from "../../../components/dashboard/Pagination/Pagination";
import { useLang } from "../../../context/LangContext";

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  
  // Debug: Log the received ID
  console.log('UserDetail component mounted with id:', id, 'Type:', typeof id);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeTab, setActiveTab] = useState("info"); // "info" or "orders"
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPageSize, setOrdersPageSize] = useState(10);
  const [ordersTotalItems, setOrdersTotalItems] = useState(0);

  // Helper function to validate ID
  const isValidId = (userId) => {
    return userId && typeof userId === 'string' && userId.trim().length > 0 && userId !== 'undefined' && userId !== 'null';
  };

  useEffect(() => {
    // Early return if id is not valid - don't make API call
    if (!isValidId(id)) {
      setLoading(false);
      return;
    }

    // Use the current id value directly in the function
    const currentId = id;
    
    const fetchUser = async () => {
      // Final validation check
      if (!isValidId(currentId)) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/user/getUser/${currentId}`, { 
          withCredentials: true 
        });
        setUser(res.data.info);
        setLoading(false);
      } catch (err) {
        console.log(err);
        toast.error(t("failedToLoad") + " " + t("userInfo"));
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, t]);

  useEffect(() => {
    // Early return if id is not valid - don't fetch orders
    if (!isValidId(id)) {
      setOrdersLoading(false);
      return;
    }

    // Use the current id value directly in the function
    const currentId = id;

    const fetchUserOrders = async () => {
      // Final validation check
      if (!isValidId(currentId)) {
        setOrdersLoading(false);
        return;
      }
      setOrdersLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/cart/user/${currentId}`, {
          withCredentials: true,
          params: { page: ordersPage, limit: ordersPageSize },
        });
        const allOrders = Array.isArray(res.data.orders) ? res.data.orders : res.data.orders || [];
        setOrders(allOrders);
        setOrdersTotalItems(res.data.totalCount || allOrders.length);
      } catch (err) {
        console.error("❌ Error fetching user orders:", err);
        toast.error(t("failedToLoad") + " " + t("adminOrders"));
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchUserOrders();
  }, [id, ordersPage, ordersPageSize, t]);

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
    };
    return classMap[status] || "";
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      toast.error(t("passwordMinLength"));
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error(t("passwordsDoNotMatch"));
      return;
    }

    const result = await Swal.fire({
      title: t("confirm"),
      text: t("passwordWillBeChanged"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#D4AF37",
      cancelButtonColor: "#d33",
      confirmButtonText: t("yesChangePassword"),
      cancelButtonText: t("cancel"),
    });

    if (result.isConfirmed) {
      try {
        await axios.put(
          `${BASE_URL}/user/update/${id}`,
          { password: newPassword },
          { withCredentials: true }
        );
        toast.success(t("passwordChangedSuccessfully"));
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordForm(false);
      } catch (err) {
        console.log(err);
        toast.error(t("failedToChangePassword"));
      }
    }
  };

  const DeleteUser = async () => {
    const result = await Swal.fire({
      title: t("confirm"),
      text: t("cannotUndo"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("yesDeleteUser"),
      cancelButtonText: t("cancel"),
    });
    
    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/user/delete/${id}`, { 
          withCredentials: true 
        });
        toast.success(t("userDeletedSuccessfully"));
        navigate("/dashboard/user");
      } catch (err) {
        console.log(err);
        toast.error(t("failedToDelete") + " " + t("user"));
      }
    }
  };

  // Show error if ID is invalid after component has mounted
  if (!isValidId(id) && !loading) {
    return (
      <section className="user-detail-section">
        <div className="user-detail-header">
          <button className="back-btn" onClick={() => navigate("/dashboard/user")}>
            ← {t("back")}
          </button>
          <h2>{t("userDetails")}</h2>
        </div>
        <div className="error-message" style={{ padding: "2rem", textAlign: "center" }}>
          <p>{t("invalidUserId") || "Invalid user ID"}</p>
          <button className="back-btn" onClick={() => navigate("/dashboard/user")} style={{ marginTop: "1rem" }}>
            {t("backToUserList") || "Back to User List"}
          </button>
        </div>
      </section>
    );
  }

  if (loading) return <Loading />;
  if (!user && isValidId(id)) return <div className="error-message">{t("userNotFound")}</div>;

  return (
    <section className="user-detail-section">
      <div className="user-detail-header">
        <button className="back-btn" onClick={() => navigate("/dashboard/user")}>
          ← {t("back")}
        </button>
        <h2>{t("userDetails")}</h2>
        <div className="header-actions">
          <button className="delete-btn" onClick={DeleteUser}>
            {t("deleteUser")}
          </button>
        </div>
      </div>

      <div className="user-detail-content">
        {/* Tabs */}
        <div className="user-tabs">
          <button
            className={`tab-btn ${activeTab === "info" ? "active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            {t("basicInfo")}
          </button>
          <button
            className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            {t("adminOrders")} ({ordersTotalItems})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "info" && (
          <>
            <div className="user-info-card">
              <h3>{t("basicInfo")}</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">{t("name")}:</span>
                  <span className="info-value">{user.username}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">{t("email")}:</span>
                  <span className="info-value">{user.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">{t("phone")}:</span>
                  <span className="info-value">{user.phone || t("notSpecified")}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">{t("role")}:</span>
                  <span className={`info-value role-badge ${user.role}`}>
                    {user.role === "admin" ? t("admin") : t("user")}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">{t("createdAt")}:</span>
                  <span className="info-value">
                    {new Date(user.createdAt).toLocaleString(lang === "ar" ? "ar-SA" : "en-US")}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">{t("lastModified")}:</span>
                  <span className="info-value">
                    {new Date(user.updatedAt).toLocaleString(lang === "ar" ? "ar-SA" : "en-US")}
                  </span>
                </div>
              </div>
            </div>

            <div className="password-change-card">
              <div className="card-header">
                <h3>{t("changePassword")}</h3>
                <button
                  className="toggle-btn"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                  {showPasswordForm ? t("cancel") : t("changePassword")}
                </button>
              </div>
              
              {showPasswordForm && (
                <form className="password-form" onSubmit={handlePasswordChange}>
                  <div className="form-group">
                    <label>{t("newPassword")}</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t("enterNewPassword")}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t("confirmPassword")}</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t("reEnterPassword")}
                      required
                      minLength={8}
                    />
                  </div>
                  <button type="submit" className="submit-btn">
                    {t("savePassword")}
                  </button>
                </form>
              )}
            </div>
          </>
        )}

        {activeTab === "orders" && (
          <div className="user-orders-section">
            {ordersLoading ? (
              <Loading />
            ) : orders.length === 0 ? (
              <div className="no-orders-message">
                <p>{t("noOrdersForUser")}</p>
              </div>
            ) : (
              <>
                <div className="orders-table-container">
                  <table className="user-orders-table">
                    <thead>
                      <tr>
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
                            onClick={() => navigate(`/dashboard/cart/${order._id}`)}
                            style={{ cursor: "pointer" }}
                          >
                            <td data-label="#">{(ordersPage - 1) * ordersPageSize + index + 1}</td>
                            <td data-label={t("orderNumber")}>{order.orderNumber || order._id.slice(-8)}</td>
                            <td data-label={t("orderDateCol")}>{formatDate(order.createdAt)}</td>
                            <td data-label={t("productsCount")}>{itemsCount} {t("product")}</td>
                            <td data-label={t("total")}>
                              <strong>{order.totalPrice?.toFixed(2) || "0.00"} EGP</strong>
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
                  currentPage={ordersPage}
                  totalPages={Math.ceil(ordersTotalItems / ordersPageSize)}
                  onPageChange={setOrdersPage}
                  pageSize={ordersPageSize}
                  onPageSizeChange={(size) => {
                    setOrdersPageSize(size);
                    setOrdersPage(1);
                  }}
                  totalItems={ordersTotalItems}
                />
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default UserDetail;

