import React, { useEffect, useState } from "react";
import "./Arrival.css";
import axios from "axios";
import { BASE_URL } from "../../../assets/url";
import { Link } from "react-router-dom";

const Arrival = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/product`, {withCredentials: true})
      setProducts((res.data.products).slice(-3).reverse())
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }
  useEffect(()=>{
    fetchProducts()
  },[])

  return (
    <section className="new-arrivals" id="new-arrivals">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">وصل حديثاً</h2>
          <p className="section-subtitle">أحدث إصداراتنا من العطور الفاخرة</p>
        </div>

 <div className="arrivals-grid">
            {products.map((p) => (
              <div key={p._id} className="arrival-card">
                <div
                  className="product-image arrival-image"
                  style={{ backgroundImage: `url(${p.image})` }}
                >
                  
                </div>
                <div className="product-content">
                  <span className="new-badge">جديد</span>
                  <h3 >{p.title}</h3>
                  <p className="product-category">{p.category}</p>
                  <p className="product-description">{p.description}</p>
                  <div className="product-footer">
                    <p className="product-price">${p.price}</p>
                    <Link to={`/product/${p._id}`} className="buy-btn">Buy Now</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>


      </div>
    </section>
  );
};

export default Arrival;
