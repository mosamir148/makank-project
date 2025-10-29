import React, { useContext, useEffect, useState } from "react";
import "./Online.css";
import axios from "axios";
import { BASE_URL } from "../../../assets/url";
import { productsContext } from "../../../context/GetProducts";
import { Link } from "react-router-dom";

const Online = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);
  const { product, setProducts } = useContext(productsContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
    const fetchProducts = async (page = 1) => {
    try {
      const res = await axios.get(`${BASE_URL}/onlineProduct?page=${page}&limit=10`);
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


  return (
    <section className="exclusive-online" id="exclusive-online">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">حصري على المتجر الإلكتروني</h2>
          <p className="section-subtitle">منتجات متوفرة فقط على الموقع</p>
        </div>

        <div className="exclusive-grid">
          {product && product.length > 0 ? (
            product.map((item) => (
              <div key={item._id} className="exclusive-card">
                <div className="exclusive-badge">حصري</div>
                <img
                  src={item.image}
                  alt={item.title}
                  crossOrigin="anonymous"
                  loading="lazy"
                  className="exclusive-image"
                />
                <div className="exclusive-content">
                  <h3>{item.title}</h3>
                  <div className="exclusive-features">
                    <span>السعر: ${item.price}</span>
                    <span>الخصم: ${item.discount}</span>
                    <span>التصنيف: {item.category}</span>
                    <span>الوصف: {item.description}</span>
                  </div>
                  <div className="product-footer">
                  <a
                    href={`/onlineProduct/${item._id}`}
                    className="btn btn-secondary"
                  >
                    View Details
                  </a>
                  <button
                    className="btn btn-secondary"
                    onClick={() => AddToWish(item)}
                  >
                    Add to Wish ❤️
                  </button>
                </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              لا توجد منتجات
            </div>
          )}
        </div>
       

      </div>
    </section>
  );
};

export default Online;
