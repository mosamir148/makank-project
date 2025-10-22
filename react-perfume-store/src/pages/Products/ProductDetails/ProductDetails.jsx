import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaStar } from "react-icons/fa6";
import { CiStar } from "react-icons/ci";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import toast from "react-hot-toast";
import "./ProductDetails.css";
import { BASE_URL } from "../../../assets/url";
import { userContext } from "../../../context/UserContext";
import { productsContext } from "../../../context/GetProducts";

const ProductDetails = () => {
  const { id } = useParams();
  const { product } = useContext(productsContext);
  const [data, setData] = useState(null);
  const { user } = useContext(userContext);

  const getProduct = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/product/${id}`);
      setData(res.data.product);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getProduct();
  }, [id]);

  const AddToCart = async () => {
    try {
      if (!user) {
        toast.error("يجب أن تسجل الدخول أولاً");
        return;
      }
      await axios.post(
        `${BASE_URL}/cart/add`,
        {
          userId: user._id,
          productId: data._id,
        },
        { withCredentials: true }
      );
      toast.success("تمت إضافة المنتج إلى السلة بنجاح!");
    } catch (err) {
      console.log(err);
      toast.error("حدث خطأ أثناء إضافة المنتج إلى السلة");
    }
  };

  return (
    <section className="product-details-section">
      {data ? (
        <div className="product-details-container">
          {/* صور المنتج */}
          <div className="product-images">
            <ImageGallery
              items={[
                {
                  original: `${data.image}`,
                  thumbnail: `${data.image}`,
                },
                ...(data.images?.map((img) => ({
                  original: `${img}`,
                  thumbnail: `${img}`,
                })) || []),
              ]}
              showPlayButton={false}
              showFullscreenButton={false}
              showNav={false}
              autoPlay={false}
            />
          </div>

          {/* معلومات المنتج */}
          <div className="product-info">
            <h1>{data.title}</h1>

            <div className="rating">
              <p>4.5</p>
              <div className="stars">
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <CiStar />
              </div>
            </div>

            <p className="description">{data.description}</p>

            <p className="price">
              ${data.price}
              <span className="discount">${data.discount}</span>
            </p>

            <hr />

            <table className="product-table">
              <tbody>
                <tr>
                  <td>Brand</td>
                  <td>{data.brand}</td>
                </tr>
                <tr>
                  <td>Color</td>
                  <td>Multi</td>
                </tr>
                <tr>
                  <td>Category</td>
                  <td>{data.category}</td>
                </tr>
              </tbody>
            </table>

            <button onClick={AddToCart} className="add-to-cart-btn">
              Add to Cart
            </button>
          </div>
        </div>
      ) : (
        <p className="loading">Loading...</p>
      )}

      {/* المنتجات المشابهة */}
      {data && (
        <div className="related-products">
          <h2>
            Related <span>Products</span>
          </h2>

          <div className="related-grid">
            {product
              .filter((p) => p.category === data.category && p._id !== data._id)
              .map((d) => (
                <Link to={`/product/${d._id}`} key={d._id} className="related-card">
                  <div className="image-box">
                    <img src={d.image} alt={d.title} crossOrigin="anonymous" />
                  </div>
                  <p className="title">{d.title}</p>
                  <p className="desc">{d.description}</p>
                  <div className="stars">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <CiStar />
                  </div>
                  <div className="price-row">
                    <p>${d.price}</p>
                    <button className="buy-btn">Buy Now</button>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductDetails;
