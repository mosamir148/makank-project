import React, { useEffect } from "react";
import "./Special.css";

const Special = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const products = [
    {
      id: 1,
      badge: "New",
      image:
        "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400",
      name: "Noir Élégance",
      category: "Luxury Men's Perfume",
      price: "1,200 SAR",
      delay: 0,
    },
    {
      id: 2,
      badge: "Best Seller",
      image:
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400",
      name: "Rose Mystique",
      category: "Elegant Women's Perfume",
      price: "1,500 SAR",
      delay: 100,
    },
    {
      id: 3,
      badge: "Exclusive",
      image:
        "https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=400",
      name: "Oud Royal",
      category: "Authentic Oriental Perfume",
      price: "2,000 SAR",
      delay: 200,
    },
  ];

  return (
    <section  className="featured-products" id="featured-products">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Featured Products</h2>
          <p className="section-subtitle">
            Our special selection of the finest fragrances
          </p>
        </div>

        <div className="products-grid">
          {products.map((product) => (
            <div
              key={product.id}
              className="product-card"
              data-aos="zoom-in"
              data-aos-delay={product.delay}
            >
              <div className="product-badge">{product.badge}</div>
              <div
                className="product-image"
                style={{ backgroundImage: `url(${product.image})` }}
              ></div>
              <div className="product-content">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-category">{product.category}</p>
                <div className="product-rating">
                  {"★".repeat(5).split("").map((star, i) => (
                    <span key={i} className="star">
                      {star}
                    </span>
                  ))}
                </div>
                <div className="product-footer">
                  <span className="product-price">{product.price}</span>
                  <a href={`/product-details/${product.id}`} className="btn btn-secondary">
                    View Details
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Special;

