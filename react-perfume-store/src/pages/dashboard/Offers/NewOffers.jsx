import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../../assets/url";
import Loading from "../../../components/Loading/Loading";
import Swal from "sweetalert2";
import { useLang } from "../../../context/LangContext";
import "./NewOffers.css";

const NewOffers = () => {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/offer`, { withCredentials: true });
      setOffers(res.data.offers || []);
    } catch (err) {
      console.error(err);
      toast.error(t("failedToLoad") || "فشل في تحميل العروض");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: t("confirm") || "تأكيد",
      text: t("cannotUndo") || "لا يمكن التراجع عن هذا الإجراء",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("yesDelete") || "نعم، احذف",
      cancelButtonText: t("cancel") || "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/offer/${id}`, { withCredentials: true });
        toast.success(t("offerDeleted") || "تم حذف العرض بنجاح");
        fetchOffers();
      } catch (err) {
        console.error(err);
        toast.error(t("failedToDelete") || "فشل في حذف العرض");
      }
    }
  };

  const handleEdit = (offerId) => {
    navigate(`/dashboard/offers/edit/${offerId}`);
  };

  const handleAdd = () => {
    navigate("/dashboard/offers/add");
  };

  const getOfferStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start) return { status: t("upcoming") || "قادم", class: "status-upcoming" };
    if (now > end) return { status: t("expired") || "منتهي", class: "status-expired" };
    return { status: t("active") || "نشط", class: "status-active" };
  };

  if (loading && offers.length === 0) return <Loading />;

  return (
    <div className="new-offers-container">
      <div className="offers-header">
        <h2>{t("offersManagement") || "إدارة العروض"}</h2>
        <button className="add-offer-btn" onClick={handleAdd}>
          + {t("addNewOffer") || "إضافة عرض جديد"}
        </button>
      </div>

      <div className="offers-table-container">
        <table className="offers-table">
          <thead>
            <tr>
              <th>{t("offerName") || "اسم العرض"}</th>
              <th>{t("offerType") || "نوع العرض"}</th>
              <th>{t("discountType") || "نوع الخصم"}</th>
              <th>{t("discountValue") || "قيمة الخصم"}</th>
              <th>{t("numberOfProducts") || "عدد المنتجات"}</th>
              <th>{t("startDate") || "تاريخ البدء"}</th>
              <th>{t("endDate") || "تاريخ الانتهاء"}</th>
              <th>{t("status") || "الحالة"}</th>
              <th>{t("userActions") || "الإجراءات"}</th>
            </tr>
          </thead>
          <tbody>
            {offers.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-offers">
                  <div className="empty-state">
                    <p>{t("noOffers") || "لا توجد عروض"}</p>
                    <button onClick={handleAdd}>{t("addNewOffer") || "إضافة عرض جديد"}</button>
                  </div>
                </td>
              </tr>
            ) : (
              offers.map((offer) => {
                const status = getOfferStatus(offer.startDate, offer.endDate);
                return (
                  <tr key={offer._id}>
                    <td>{offer.name}</td>
                    <td>
                      <span className={`type-badge ${offer.type === "coupon" ? "coupon" : "discount"}`}>
                        {offer.type === "coupon" 
                          ? (offer.discountCode || offer.couponName || t("coupon") || "كوبون")
                          : t("directDiscount") || "خصم مباشر"}
                      </span>
                    </td>
                    <td>
                      <span className="discount-type-badge">
                        {offer.discountType === "percentage"
                          ? t("percentage") || "نسبة مئوية"
                          : t("fixedAmount") || "مبلغ ثابت"}
                      </span>
                    </td>
                    <td>
                      <strong className="discount-value">
                        {offer.discountType === "percentage"
                          ? `${offer.discountValue}%`
                          : `${offer.discountValue}`}
                      </strong>
                    </td>
                    <td>{offer.products?.length || 0}</td>
                    <td>
                      {(() => {
                        const date = new Date(offer.startDate);
                        // Always use Gregorian calendar format
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                      })()}
                    </td>
                    <td>
                      {(() => {
                        const date = new Date(offer.endDate);
                        // Always use Gregorian calendar format
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                      })()}
                    </td>
                    <td>
                      <span className={`status-badge ${status.class}`}>{status.status}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleEdit(offer._id)} className="edit-btn">
                          {t("edit") || "تعديل"}
                        </button>
                        <button onClick={() => handleDelete(offer._id)} className="delete-btn">
                          {t("delete") || "حذف"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NewOffers;
