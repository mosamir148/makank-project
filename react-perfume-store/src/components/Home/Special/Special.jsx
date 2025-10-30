import React, { useContext, useEffect, useState } from "react";
import "./Special.css";
import { BASE_URL } from "../../../assets/url";
import axios from "axios";
import Loading from "../../Loading/Loading";
import toast from "react-hot-toast";
import { userContext } from "../../../context/UserContext";
import { useLang } from "../../../context/LangContext";

const Special = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(userContext);
  const { t } = useLang();
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/featuredProduct`);
      setData(res.data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);


  const AddToWish = async (product) => {
    try {
      if (user && user._id) {
        await axios.post(
          `${BASE_URL}/wish/add`,
          {
            userId: user._id,
            featuredProductId: product._id, 
          },
          { withCredentials: true }
        );
        toast.success("تمت إضافة المنتج إلى المفضلة بنجاح ✅");
      } else {
        let localWish = JSON.parse(localStorage.getItem("localWish")) || [];

        const exists = localWish.find((item) => item._id === product._id);
        if (exists) {
          toast("هذا المنتج موجود بالفعل في المفضلة ❤️");
          return;
        }

     localWish.push({
        _id: product._id,
        title: product.title || "بدون عنوان",
        price: product.price || 0,
        image: product.image || "/placeholder.png",
        description: product.description || "",
        brand: product.brand || "",
        category: product.category || "",
        quantity: 1,
        from: "local",
        type: "featured",
      });


        localStorage.setItem("localWish", JSON.stringify(localWish));
        toast.success("✅ تمت إضافة المنتج للمفضلة بنجاح");
      }
    } catch (err) {
      console.log(err);
      toast.error("حدث خطأ أثناء الإضافة إلى المفضلة");
    }
  };

  if (loading) return <Loading />;

  return (
  <section className="featured-products" id="featured-products">
  <div className="container">
    <div className="section-header">
      <h2 className="section-title">{t("featuredProducts")}</h2>
      <p className="section-subtitle">{t("featuredProductsSub")}</p>
    </div>

    <div className="products-grid">
      {data.map((product) => (
        <div
          key={product._id}
          className="product-card"
          data-aos="zoom-in"
          data-aos-delay={product.delay}
        >
          <div className="product-badge">{product.discount} EGY</div>

          <div
            className="product-image"
            style={{ backgroundImage: `url(${product.image})` }}
          ></div>

          <div className="product-content">
            <h3 className="product-name">{product.title}</h3>
            <p className="product-category">{product.category}</p>

            <div>
              <p className="featured-product-description">
                {product.description}
              </p>
            </div>

            <div className="product-footer">
              <span className="product-price">{product.price}</span>
              <a
                href={`/featuredProduct/${product._id}`}
                className="btn btn-secondary"
              >
                {t("viewDetails")}
              </a>
              <button
                className="btn btn-secondary"
                onClick={() => AddToWish(product)}
              >
                {t("addToCart")}
              </button>
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
