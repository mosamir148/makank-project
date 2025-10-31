import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AllCoupon.css";
import { BASE_URL } from "../../../assets/url";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const AllCoupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percent",
    discountValue: "",
    expiryDate: "",
  });

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/coupon`);

      setCoupons(res.data.coupons);
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء جلب الكوبونات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await axios.put(`${BASE_URL}/coupon/${editingCoupon._id}`, formData);
        toast.success("تم تعديل الكوبون بنجاح ✅");
      } else {
        await axios.post(`${BASE_URL}/coupon`, formData);
        toast.success("تم إنشاء الكوبون بنجاح 🎉");
      }
      fetchCoupons();
      setShowModal(false);
      setEditingCoupon(null);
      setFormData({ code: "", discountType: "percent", discountValue: "", expiryDate: "" });
    } catch (err) {
      toast.error("حدث خطأ أثناء حفظ الكوبون ❌");
    }
  };

  const handleDelete = async (id) => {
      Swal.fire({
        title: "هل أنت متأكد؟",
        text: "لن تتمكن من استرجاع هذا الكوبون بعد الحذف!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "نعم، احذف!",
        cancelButtonText: "إلغاء",
      }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/coupon/${id}`);
        toast.success("تم حذف الكوبون 🗑️");
        fetchCoupons();

        Swal.fire({
          title: "تم الحذف!",
          text: "تم حذف الكوبون بنجاح.",
          icon: "success",
          confirmButtonText: "تمام",
        });
      } catch (err) {
        toast.error("حدث خطأ أثناء الحذف ❌");
      }
    }
  });
};

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      expiryDate: coupon.expiryDate.split("T")[0],
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingCoupon(null);
    setFormData({ code: "", discountType: "percent", discountValue: "", expiryDate: "" });
    setShowModal(true);
  };

  if (loading) return <div className="loading">جارِ التحميل...</div>;

  return (
    <div className="coupon-page">
      <div className="coupon-header">
        <h2>🎟️ إدارة الكوبونات</h2>
        <button className="add-btn" onClick={openAddModal}>
          + إضافة كوبون
        </button>
      </div>

      <div className="coupon-table-container">
        <table className="coupon-table">
          <thead>
            <tr>
              <th>الكود</th>
              <th>النوع</th>
              <th>القيمة</th>
              <th>تاريخ الانتهاء</th>
              <th>الحالة</th>
              <th>التحكم</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon._id}>
                <td>{coupon.code}</td>
                <td>{coupon.discountType === "percent" ? "نسبة %" : "مبلغ ثابت"}</td>
                <td>
                  {coupon.discountType === "percent"
                    ? `${coupon.discountValue}%`
                    : `${coupon.discountValue} EGP`}
                </td>
                <td>{new Date(coupon.expiryDate).toLocaleDateString("ar-EG")}</td>
                <td className={new Date(coupon.expiryDate) > new Date() ? "active" : "expired"}>
                  {new Date(coupon.expiryDate) > new Date() ? "ساري" : "منتهي"}
                </td>
                <td>
                  <button className="edit-btn" onClick={() => openEditModal(coupon)}>
                    تعديل
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(coupon._id)}>
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && <p className="no-coupons">لا توجد كوبونات حالياً</p>}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingCoupon ? "تعديل الكوبون" : "إضافة كوبون جديد"}</h3>
            <form onSubmit={handleSubmit}>
              <label>كود الكوبون:</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />

              <label>نوع الخصم:</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              >
                <option value="percent">نسبة مئوية</option>
                <option value="amount">مبلغ ثابت</option>
              </select>

              <label>قيمة الخصم:</label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                required
              />

              <label>تاريخ الانتهاء:</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                required
              />

              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  حفظ
                </button>
                <button onClick={() => setShowModal(false)} className="cancel-btn">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(AllCoupon);
