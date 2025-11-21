import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../assets/url';
import './Profile.css';
import { userContext } from '../../context/UserContext';
import { useLang } from '../../context/LangContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const Profile = () => {
  const [orders, setOrders] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    name: '',
    phone: '',
    city: '',
    governorate: '',
    street: '',
    number: '',
    buildingNumber: '',
    isDefault: false,
  });
  const [editFormData, setEditFormData] = useState({
    username: '',
    phone: '',
    email: '',
    address: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const { user, setUser } = useContext(userContext);
  const navigate = useNavigate();
  const { lang, t } = useLang();

  const getOrders = async () => {
    if (!user) return;
    try {
      // Fetch actual orders (with orderNumber) using the new type parameter
      const res = await axios.get(`${BASE_URL}/cart/mycart`, {
        withCredentials: true,
        params: { page: 1, limit: 10, type: 'orders' }, // Fetch orders, not cart items
      });
      const ordersData = res.data.orders || res.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error("❌ Error fetching orders:", err.response?.data || err);
      setOrders([]);
    }
  };

  useEffect(() => {
    getOrders();
    if (user) {
      setEditFormData({
        username: user.username || '',
        phone: user.phone || '',
        email: user.email || '',
        address: user.address || '',
      });
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${BASE_URL}/delivery-address`, {
        withCredentials: true,
      });
      setAddresses(res.data.addresses || []);
    } catch (err) {
      console.error("❌ Error fetching addresses:", err);
      setAddresses([]);
    }
  };

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData({
      ...addressFormData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await axios.put(
          `${BASE_URL}/delivery-address/${editingAddress._id}`,
          addressFormData,
          { withCredentials: true }
        );
        toast.success('تم تحديث العنوان بنجاح');
      } else {
        await axios.post(
          `${BASE_URL}/delivery-address`,
          addressFormData,
          { withCredentials: true }
        );
        toast.success('تم إضافة العنوان بنجاح');
      }
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressFormData({
        name: '',
        phone: '',
        city: '',
        governorate: '',
        street: '',
        number: '',
        buildingNumber: '',
        isDefault: false,
      });
      fetchAddresses();
    } catch (err) {
      console.error('Error saving address:', err);
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء حفظ العنوان');
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressFormData({
      name: address.name || '',
      phone: address.phone || '',
      city: address.city || '',
      governorate: address.governorate || '',
      street: address.street || '',
      number: address.number || '',
      buildingNumber: address.buildingNumber || '',
      isDefault: address.isDefault || false,
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذا العنوان",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/delivery-address/${addressId}`, {
          withCredentials: true,
        });
        toast.success('تم حذف العنوان بنجاح');
        fetchAddresses();
      } catch (err) {
        console.error('Error deleting address:', err);
        toast.error('حدث خطأ أثناء حذف العنوان');
      }
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await axios.put(
        `${BASE_URL}/delivery-address/${addressId}/set-default`,
        {},
        { withCredentials: true }
      );
      toast.success('تم تعيين العنوان الافتراضي بنجاح');
      fetchAddresses();
    } catch (err) {
      console.error('Error setting default address:', err);
      toast.error('حدث خطأ أثناء تعيين العنوان الافتراضي');
    }
  };


  const handleEditProfile = () => {
    setShowEditForm(true);
  };

  const handleEditFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    if (!user?._id) {
      toast.error('المستخدم غير موجود');
      return;
    }

    try {
      const res = await axios.put(
        `${BASE_URL}/user/update-profile/${user._id}`,
        editFormData,
        { withCredentials: true }
      );
      
      toast.success('تم تحديث بياناتك بنجاح');
      setUser(res.data.info);
      setShowEditForm(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء تحديث البيانات');
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    try {
      const res = await axios.put(
        `${BASE_URL}/user/update-profile/${user._id}`,
        { password: passwordData.newPassword },
        { withCredentials: true }
      );
      
      toast.success('تم تغيير كلمة المرور بنجاح');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (err) {
      console.error('Error updating password:', err);
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const calculateTotal = (item) => {
    // Use backend-calculated totalPrice if available
    if (item.totalPrice !== undefined && item.totalPrice !== null && typeof item.totalPrice === 'number' && !isNaN(item.totalPrice)) {
      return item.totalPrice.toFixed(2);
    }
    
    // Handle new format with items array
    if (item.items && item.items.length > 0) {
      // Sum all items' finalPrice (which already includes item discounts AND coupon discounts)
      // Each item's finalPrice = unitPrice - discountApplied - couponDiscount (per unit)
      let subtotal = 0;
      item.items.forEach((orderItem) => {
        const finalPrice = parseFloat(orderItem.finalPrice || 0);
        const quantity = parseInt(orderItem.quantity || 1);
        subtotal += finalPrice * quantity;
      });
      
      // Add delivery fee (coupon discount is already applied per item, so don't subtract again)
      const deliveryFee = item.deliveryFee || 0;
      const total = subtotal + deliveryFee;
      return total.toFixed(2);
    }
    
    // Backward compatibility - single product
    const price = parseFloat(item.product?.price || item.price || 0);
    const quantity = parseInt(item.quantity || 1);
    let total = price * quantity;
    
    // For old format, apply discount if exists (backward compatibility)
    if (item.discount > 0) {
      total = total - (total * item.discount) / 100;
    }
    
    return total.toFixed(2);
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
    return statusMap[status] || status || (lang === "ar" ? "قيد الانتظار" : "Pending");
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

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error-message">
          {lang === "ar" ? "يرجى تسجيل الدخول لعرض الملف الشخصي" : "Please log in to view your profile"}
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">
          {lang === "ar" ? "ملفي الشخصي" : "My Profile"}
        </h1>
        <div className="profile-actions">
          <button onClick={handleEditProfile} className="edit-profile-btn">
            {lang === "ar" ? "تعديل البيانات" : "Edit Profile"}
          </button>
          <button onClick={() => setShowPasswordForm(true)} className="change-password-btn">
            {lang === "ar" ? "تغيير كلمة المرور" : "Change Password"}
          </button>
          <button onClick={() => navigate('/orders')} className="view-orders-btn">
            {lang === "ar" ? "عرض جميع الطلبات" : "View All Orders"}
          </button>
        </div>
      </div>

      {/* Profile Information Display */}
      <div className="profile-info-card">
        <h2>{lang === "ar" ? "المعلومات الشخصية" : "Personal Information"}</h2>
        <div className="profile-info-grid">
          <div className="profile-info-item">
            <span className="profile-info-label">
              {lang === "ar" ? "الاسم:" : "Name:"}
            </span>
            <span className="profile-info-value">{user.username || "—"}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">
              {lang === "ar" ? "البريد الإلكتروني:" : "Email:"}
            </span>
            <span className="profile-info-value">{user.email || "—"}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">
              {lang === "ar" ? "رقم الهاتف:" : "Phone:"}
            </span>
            <span className="profile-info-value">{user.phone || "—"}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">
              {lang === "ar" ? "العنوان:" : "Address:"}
            </span>
            <span className="profile-info-value">{user.address || "—"}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">
              {lang === "ar" ? "حالة الحساب:" : "Account Status:"}
            </span>
            <span className={`profile-status-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
              {user.role === 'admin' 
                ? (lang === "ar" ? 'مدير' : 'Admin')
                : (lang === "ar" ? 'مستخدم' : 'User')}
            </span>
          </div>
          {user.createdAt && (
            <div className="profile-info-item">
              <span className="profile-info-label">
                {lang === "ar" ? "تاريخ التسجيل:" : "Registration Date:"}
              </span>
              <span className="profile-info-value">{formatDate(user.createdAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Addresses Section */}
      <div className="profile-addresses-section">
        <div className="addresses-section-header">
          <h2>عناوين التوصيل</h2>
          <button onClick={() => {
            setShowAddressForm(true);
            setEditingAddress(null);
            setAddressFormData({
              name: '',
              phone: '',
              city: '',
              governorate: '',
              street: '',
              number: '',
              buildingNumber: '',
              isDefault: false,
            });
          }} className="add-address-btn">
            + إضافة عنوان جديد
          </button>
        </div>

        {showAddressForm && (
          <div className="address-form-card">
            <h3>{editingAddress ? 'تعديل العنوان' : 'إضافة عنوان جديد'}</h3>
            <form onSubmit={handleAddressSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>اسم المستلم *</label>
                  <input
                    type="text"
                    name="name"
                    value={addressFormData.name}
                    onChange={handleAddressFormChange}
                    required
                    placeholder="اسم المستلم"
                  />
                </div>
                <div className="form-group">
                  <label>رقم الهاتف *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={addressFormData.phone}
                    onChange={handleAddressFormChange}
                    required
                    placeholder="رقم الهاتف"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>المحافظة *</label>
                  <input
                    type="text"
                    name="governorate"
                    value={addressFormData.governorate}
                    onChange={handleAddressFormChange}
                    required
                    placeholder="المحافظة"
                  />
                </div>
                <div className="form-group">
                  <label>المدينة *</label>
                  <input
                    type="text"
                    name="city"
                    value={addressFormData.city}
                    onChange={handleAddressFormChange}
                    required
                    placeholder="المدينة"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>الشارع *</label>
                <input
                  type="text"
                  name="street"
                  value={addressFormData.street}
                  onChange={handleAddressFormChange}
                  required
                  placeholder="اسم الشارع"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>رقم الشارع</label>
                  <input
                    type="text"
                    name="number"
                    value={addressFormData.number}
                    onChange={handleAddressFormChange}
                    placeholder="رقم الشارع"
                  />
                </div>
                <div className="form-group">
                  <label>رقم المبنى</label>
                  <input
                    type="text"
                    name="buildingNumber"
                    value={addressFormData.buildingNumber}
                    onChange={handleAddressFormChange}
                    placeholder="رقم المبنى"
                  />
                </div>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={addressFormData.isDefault}
                    onChange={handleAddressFormChange}
                  />
                  تعيين كعنوان افتراضي
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editingAddress ? 'تحديث' : 'حفظ'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddressForm(false);
                    setEditingAddress(null);
                  }}
                  className="cancel-btn"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {addresses.length > 0 ? (
          <div className="addresses-grid">
            {addresses.map((address) => (
              <div key={address._id} className={`address-card ${address.isDefault ? 'default' : ''}`}>
                <div className="address-card-header">
                  <h4>{address.name}</h4>
                  {address.isDefault && (
                    <span className="default-badge">افتراضي</span>
                  )}
                </div>
                <div className="address-details">
                  <p><strong>الهاتف:</strong> {address.phone}</p>
                  <p><strong>العنوان:</strong> {address.governorate}، {address.city}</p>
                  <p>{address.street}</p>
                  {address.number && <p>رقم الشارع: {address.number}</p>}
                  {address.buildingNumber && <p>رقم المبنى: {address.buildingNumber}</p>}
                </div>
                <div className="address-actions">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefaultAddress(address._id)}
                      className="set-default-btn"
                    >
                      تعيين كافتراضي
                    </button>
                  )}
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="edit-address-btn"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address._id)}
                    className="delete-address-btn"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !showAddressForm && (
            <p className="no-addresses">لا توجد عناوين مسجلة. أضف عنوانًا جديدًا للبدء.</p>
          )
        )}
      </div>

      {showEditForm && (
        <div className="edit-profile-form">
          <h2>تعديل البيانات الشخصية</h2>
          <form onSubmit={handleEditFormSubmit}>
            <div className="form-group">
              <label>الاسم:</label>
              <input
                type="text"
                name="username"
                value={editFormData.username}
                onChange={handleEditFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>البريد الإلكتروني:</label>
              <input
                type="email"
                name="email"
                value={editFormData.email}
                onChange={handleEditFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>رقم الهاتف:</label>
              <input
                type="tel"
                name="phone"
                value={editFormData.phone}
                onChange={handleEditFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>العنوان:</label>
              <input
                type="text"
                name="address"
                value={editFormData.address}
                onChange={handleEditFormChange}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">حفظ التغييرات</button>
              <button type="button" onClick={() => setShowEditForm(false)} className="cancel-btn">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {showPasswordForm && (
        <div className="edit-profile-form">
          <h2>تغيير كلمة المرور</h2>
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>كلمة المرور الجديدة:</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                minLength={8}
              />
            </div>
            <div className="form-group">
              <label>تأكيد كلمة المرور:</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                minLength={8}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">تغيير كلمة المرور</button>
              <button type="button" onClick={() => setShowPasswordForm(false)} className="cancel-btn">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="profile-orders-section">
        <div className="orders-section-header">
          <h2 className="orders-title">
            {lang === "ar" ? "طلباتك الأخيرة" : "Recent Orders"}
          </h2>
          {orders.length > 0 && (
            <button onClick={() => navigate('/orders')} className="view-all-orders-btn">
              <span>{lang === "ar" ? "عرض جميع الطلبات →" : "View All Orders →"}</span>
            </button>
          )}
        </div>

        {orders.length > 0 ? (
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>{lang === "ar" ? "رقم الطلب" : "Order Number"}</th>
                  <th>{lang === "ar" ? "التاريخ" : "Date"}</th>
                  <th>{lang === "ar" ? "عدد المنتجات" : "Products"}</th>
                  <th>{lang === "ar" ? "المبلغ الإجمالي" : "Total Amount"}</th>
                  <th>{lang === "ar" ? "الحالة" : "Status"}</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => {
                  const itemsCount = order.items?.length || 0;
                  const firstProduct = order.items?.[0]?.product || order.product || null;
                  return (
                    <tr 
                      key={order._id}
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="order-row-clickable"
                    >
                      <td data-label={lang === "ar" ? "رقم الطلب" : "Order Number"}>
                        {order.orderNumber || `#${order._id.slice(-8)}`}
                      </td>
                      <td data-label={lang === "ar" ? "التاريخ" : "Date"}>
                        {formatDate(order.createdAt || order.updatedAt)}
                      </td>
                      <td data-label={lang === "ar" ? "عدد المنتجات" : "Products"}>
                        {itemsCount > 0 ? (
                          <span>{itemsCount} {lang === "ar" ? "منتج" : "product"}{itemsCount > 1 && lang === "en" ? "s" : ""}</span>
                        ) : (
                          <div className="order-product-info">
                            {firstProduct?.image && (
                              <img
                                src={firstProduct.image}
                                alt={firstProduct.title}
                                className="order-table-image"
                              />
                            )}
                            <span>{firstProduct?.title || '—'}</span>
                          </div>
                        )}
                      </td>
                      <td data-label={lang === "ar" ? "المبلغ الإجمالي" : "Total Amount"}>
                        <strong>{calculateTotal(order)} EGP</strong>
                      </td>
                      <td data-label={lang === "ar" ? "الحالة" : "Status"}>
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
        ) : (
          <div className="no-orders-container">
            <p className="no-orders">
              {lang === "ar" ? "لا توجد طلبات حتى الآن." : "No orders yet."}
            </p>
            <button onClick={() => navigate('/products')} className="shop-now-btn">
              {lang === "ar" ? "تسوق الآن" : "Shop Now"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
