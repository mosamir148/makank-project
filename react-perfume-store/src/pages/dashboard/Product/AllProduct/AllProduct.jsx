import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import "./AllProduct.css";
import { productsContext } from "../../../../context/GetProducts";
import { BASE_URL } from "../../../../assets/url";
import Loading from "../../../../components/Loading/Loading";

const AllProduct = () => {
  const { product, setProducts } = useContext(productsContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (page = 1) => {
    try {
      const res = await axios.get(`${BASE_URL}/product?page=${page}&limit=10`);
      setLoading(false)
      setProducts(res.data.products);
      setTotalPages(Math.ceil(res.data.totalCount / 10));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

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
        await axios.delete(`${BASE_URL}/product/${id}`, { withCredentials: true });
        setProducts(product.filter((item) => item._id !== id));
        toast.success("تم حذف المنتج بنجاح!");
        Swal.fire("تم الحذف!", "تم حذف المنتج بنجاح.", "success");
      } catch (err) {
        console.log(err);
        toast.error("فشل في حذف المنتج!");
      }
    }
  };

  if( loading ) return <Loading />

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
              <th className="text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {product && product.length > 0 ? (
              product.map((item) => (
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
                  <td className="text-center">
                    <Link className="edit-btn" to={`update-product/${item._id}`}>
                      تعديل
                    </Link>
                    <button className="delete-btn" onClick={() => DelteProduct(item._id)}>
                      حذف
                    </button>
                    <Link className="show-btn" to={`/product/${item._id}`}>
                      عرض
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-4">
                  لا توجد منتجات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-controls">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          السابق
        </button>
        <span>
          الصفحة {currentPage} من {totalPages >= 1 ? totalPages : 0}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          التالي
        </button>
      </div>
    </section>
  );
};

export default AllProduct;
