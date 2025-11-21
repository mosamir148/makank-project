import React, { useContext, useEffect, useState } from "react";
import "./Online.css";
import axios from "axios";
import { BASE_URL } from "../../../assets/url";
import { productsContext } from "../../../context/GetProducts";
import { Link } from "react-router-dom";
import Loading from "../../Loading/Loading";
import toast from "react-hot-toast";
import { userContext } from "../../../context/UserContext";
import { useLang } from "../../../context/LangContext";

const Online = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
  const { user } = useContext(userContext);
  const { t } = useLang();

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/onlineProduct`);
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
        console.log("Adding online product ID:", product._id);
      if (user && user._id) {
        await axios.post(
          `${BASE_URL}/wish/add`,
          {
            userId: user._id,
            onlineProductId: product._id, 
        },
          { withCredentials: true }
        );
        toast.success("تمت إضافة المنتج إلى المفضلة بنجاح ✅");
        window.dispatchEvent(new Event("wishlistUpdated"));
      } else {
        let localWish = JSON.parse(localStorage.getItem("localWish")) || [];

        const exists = localWish.find((item) => item._id === product._id);
        if (exists) {
          toast("هذا المنتج موجود بالفعل في المفضلة ❤️");
          return;
        }

        localWish.push({
          _id: product._id,
          title: product.title || "منتج بدون عنوان",
          price: product.price || "غير محدد",
          image: product.image || "/placeholder.png",
          description: product.description || "منتج بدون وصف",
          brand: product.brand || "منتج بدون براند",
          category: product.category || "منتج بدون كاتيجوري",
          type: "online", // فرق نوع المنتج
          quantity: 1,
        });

        localStorage.setItem("localWish", JSON.stringify(localWish));
        toast.success("✅ تمت إضافة المنتج للمفضلة بنجاح");
        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } catch (err) {
      console.log(err);
      toast.error("حدث خطأ أثناء الإضافة إلى المفضلة");
    }
  };

  if (loading) return <Loading />;

  return (
   <section className="exclusive-online" id="exclusive-online">
  <div className="container">
    <div className="section-header">
      <h2 className="section-title">{t("onlineProduct")}</h2>
      <p className="section-subtitle">{t("elegancsdeCharm")}</p>
    </div>

    <div className="exclusive-grid">
      {data && data.length > 0 ? (
        data.map((product) => (
          <div key={product._id} className="exclusive-card">
            <div className="exclusive-badge">{t("exclusive")}</div>
            <img
              src={product.image}
              alt={product.title}
              crossOrigin="anonymous"
              loading="lazy"
              className="exclusive-image"
            />
            <div className="exclusive-content">
              <h3>{product.title}</h3>
              <div className="exclusive-features">
                <span>{t("price")}: {product.price}</span>
                <span>{t("category")}: {product.category}</span>
                <span>{t("description")}: {product.description}</span>
              </div>
              <div className="product-footer">
                <a
                  href={`/onlineProduct/${product._id}`}
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
        ))
      ) : (
        <div className="text-center text-gray-500 py-4">
          {t("noProducts")}
        </div>
      )}
    </div>
  </div>
</section>

  );
};

export default React.memo(Online);
