import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { productsContext } from "../../../../context/GetProducts";
import { BASE_URL } from "../../../../assets/url";
import Loading from "../../../../components/Loading/Loading";

const OfferAllProduct = () => {
  const { product, setProducts } = useContext(productsContext);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // جلب المنتجات
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/offerProduct`);
      setProducts(res.data.offers);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();

    // تحديث الوقت كل ثانية
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const DelteProduct = async (id) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم، احذف المنتج!",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/offerProduct/${id}`, { withCredentials: true });
        setProducts(product.filter((item) => item._id !== id));
        toast.success("تم حذف المنتج بنجاح!");
        Swal.fire("تم الحذف!", "تم حذف المنتج بنجاح.", "success");
      } catch (err) {
        console.log(err);
        toast.error("فشل في حذف المنتج!");
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <section className="all-products-section">
      <div className="all-products-header">
        <h2>جميع المنتجات</h2>
      </div>

      <div className="all-products-table-container">
        <table className="all-products-table">
          <thead>
            <tr>
              <th>الصورة</th>
              <th>الاسم</th>
              <th>السعر</th>
              <th>الخصم</th>
              <th>القسم</th>
              <th>تاريخ البداية</th>
              <th>تاريخ النهاية</th>
              <th>الوقت المتبقي</th>
              <th className="text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {product && product.length > 0 ? (
              product.map((item) => {
                const end = new Date(item.endDate);
                let remaining = end - currentTime;

                // تعريف المتغيرات قبل استخدامهم
                let days = 0, hours = 0, minutes = 0, seconds = 0;

                if (remaining > 0) {
                  days = Math.floor(remaining / 1000 / 60 / 60 / 24);
                  hours = Math.floor((remaining / 1000 / 60 / 60) % 24);
                  minutes = Math.floor((remaining / 1000 / 60) % 60);
                  seconds = Math.floor((remaining / 1000) % 60);
                }

                return (
                  <tr key={item._id}>
                    <td>
                      <img
                        src={item.image}
                        alt={item.title}
                        crossOrigin="anonymous"
                        loading="lazy"
                        className="product-avatar"
                      />
                    </td>
                    <td>{item.title}</td>
                    <td>${item.price}</td>
                    <td>${item.discount}</td>
                    <td>{item.category}</td>
                    <td>{new Date(item.startDate).toLocaleDateString()}</td>
                    <td>{new Date(item.endDate).toLocaleDateString()}</td>
                    <td>
                      {remaining > 0 ? (
                        <>
                          <div>{days} يوم</div>
                          <div>{hours} ساعة</div>
                          <div>{minutes} دقيقة</div>
                          <div>{seconds} ثانية</div>
                        </>
                      ) : (
                        "انتهى"
                      )}
                    </td>
                    <td className="text-center">
                      <Link className="edit-btn" to={`update-product/${item._id}`}>
                        تعديل
                      </Link>
                      <button className="delete-btn" onClick={() => DelteProduct(item._id)}>
                        حذف
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="text-center text-gray-500 py-4">
                  لا توجد منتجات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default OfferAllProduct;
