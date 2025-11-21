import "./Offer.css";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../assets/url"; // عدّل المسار حسب مشروعك
import Loading from "../../Loading/Loading";
import toast from "react-hot-toast";
import { userContext } from "../../../context/UserContext";
import { useLang } from "../../../context/LangContext";

const Offer = () => {
  const [productsWithOffers, setProductsWithOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const {user} = useContext(userContext)
  const { t, lang } = useLang();
  
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        // Fetch active offers
        const res = await axios.get(`${BASE_URL}/offer/active`);
        const allOffers = res.data.offers || [];
        
        // Filter for discount type offers only (not coupon)
        const discountOffers = allOffers.filter((offer) => offer.type === "discount");
        
        // Flatten products from all discount offers with offer details
        const products = [];
        discountOffers.forEach((offer) => {
          if (offer.products && offer.products.length > 0) {
            offer.products.forEach((product) => {
              // Calculate discount price
              const originalPrice = product.price || 0;
              let discountAmount = 0;
              let finalPrice = originalPrice;
              
              if (offer.discountType === "percentage") {
                discountAmount = (originalPrice * offer.discountValue) / 100;
                finalPrice = originalPrice - discountAmount;
              } else if (offer.discountType === "value") {
                discountAmount = offer.discountValue;
                finalPrice = originalPrice - discountAmount;
              }
              
              products.push({
                ...product,
                offerId: offer._id,
                offerName: offer.name,
                discountType: offer.discountType,
                discountValue: offer.discountValue,
                discountAmount,
                finalPrice,
                originalPrice,
                startDate: offer.startDate,
                endDate: offer.endDate,
              });
            });
          }
        });
        
        setProductsWithOffers(products); 
      } catch (err) {
        console.error("Error fetching offers:", err);
        setProductsWithOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

   const AddToWish = async (product) => {
  try {
    if (user && user._id) {
      await axios.post(
        `${BASE_URL}/wish/add`,
        {
          userId: user._id,
          productId: product._id, // Regular product, not offerProduct
        },
        { withCredentials: true }
      );
      toast.success(lang === "ar" ? "تمت إضافة المنتج إلى السلة بنجاح ✅" : "Product added to cart successfully ✅");
      window.dispatchEvent(new Event("wishlistUpdated"));
    } else {
      let localWish = JSON.parse(localStorage.getItem("localWish")) || [];

      const exists = localWish.find((item) => item._id === product._id);
      if (exists) {
        toast(lang === "ar" ? "هذا المنتج موجود بالفعل في السلة ❤️" : "This product is already in cart ❤️");
        return;
      }

      localWish.push({
        _id: product._id,
        title: product.title || (lang === "ar" ? "منتج بدون عنوان" : "Product without title"),
        price: product.finalPrice || product.originalPrice || 0,
        image: product.image || "/placeholder.png",
        type: "product",
        quantity: 1,
        // Store offer info for display
        offerInfo: {
          discountType: product.discountType,
          discountValue: product.discountValue,
          originalPrice: product.originalPrice,
          finalPrice: product.finalPrice,
          endDate: product.endDate,
        },
      });

      localStorage.setItem("localWish", JSON.stringify(localWish));
      toast.success(lang === "ar" ? "✅ تمت إضافة المنتج للسلة بنجاح" : "✅ Product added to cart successfully");
      window.dispatchEvent(new Event("wishlistUpdated"));
    }
  } catch (err) {
    console.log(err);
    toast.error(lang === "ar" ? "حدث خطأ أثناء الإضافة إلى السلة" : "Error adding to cart");
  }
};


  if (loading) return <Loading />
  
  // Hide section if no discount offers
  if (productsWithOffers.length === 0) return null;

  return (
     <section className="special-offers" id="special-offers">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t("offers") || "Offers"}</h2>
          <p className="section-subtitle">{t("offersSub") || t("specialOffersSub")}</p>
        </div>

        <div className="offers-grid">
          {productsWithOffers.map((product, index) => (
            <div
              key={`${product._id}-${index}`}
              className="offer-card"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="offer-badge">
                {product.discountType === "percentage"
                  ? `${product.discountValue}% ${t("off") || "OFF"}`
                  : `${product.discountValue} ${t("off") || "OFF"}`}
              </div>

              <div
                className="offer-image"
                style={{
                  background: `url('${
                    product.image || "/assets/Logo3.png"
                  }') center/cover`,
                }}
              ></div>

              <div className="offer-content">
                <h3 className="offer-name">{product.title}</h3>
                {product.description && (
                  <p className="offer-description">{product.description}</p>
                )}

                <div className="offer-price">
                  <span className="old-price">{product.originalPrice.toFixed(2)}</span>
                  <span className="new-price">
                    {product.finalPrice.toFixed(2)}
                  </span>
                </div>

                <div
                  className="offer-timer"
                  style={{
                    background: "rgba(212, 175, 55, 0.1)",
                    padding: "15px",
                    borderRadius: "10px",
                    margin: "15px 0",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      color: "var(--primary-gold)",
                      fontWeight: 700,
                      fontSize: "14px",
                      marginBottom: "5px",
                    }}
                  >
                    {t("offerEndsIn") || (lang === "ar" ? "ينتهي العرض في" : "Offer Ends In")}
                  </div>
                  <OfferCountdown endDate={product.endDate} />
                </div>

                <a
                  href={`/product/${product._id}`}
                  className="btn btn-primary offersbtn"
                >
                  {t("shopNow") || (lang === "ar" ? "تسوق الآن" : "Shop Now")}
                </a>

                <button
                  className="btn btn-primary offersbtn"
                  onClick={() => AddToWish(product)}
                >
                  {t("addToCart") || (lang === "ar" ? "أضف للسلة" : "Add to Cart")} ❤️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


const OfferCountdown = ({ endDate }) => {
  const { lang } = useLang();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 , seconds: 0});

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(endDate);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);
  
  return (
    <div className="offer-countdown-container">
      <div className="countdown-item">
        <span className="countdown-value">{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="countdown-label">{lang === "ar" ? "يوم" : "Days"}</span>
      </div>
      <span className="countdown-separator">:</span>
      <div className="countdown-item">
        <span className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="countdown-label">{lang === "ar" ? "ساعة" : "Hours"}</span>
      </div>
      <span className="countdown-separator">:</span>
      <div className="countdown-item">
        <span className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="countdown-label">{lang === "ar" ? "دقيقة" : "Mins"}</span>
      </div>
      <span className="countdown-separator">:</span>
      <div className="countdown-item">
        <span className="countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="countdown-label">{lang === "ar" ? "ثانية" : "Secs"}</span>
      </div>
    </div>
  );
};

export default React.memo(Offer);
