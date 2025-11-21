import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import "./CategoryProducts.css";
import axios from "axios";
import { BASE_URL } from "../../../assets/url";
import { userContext } from "../../../context/UserContext";
import { useLang } from "../../../context/LangContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Loading from "../../Loading/Loading";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const CategoryProducts = ({ categoryKey, titleAr, titleEn }) => {
  const { user } = useContext(userContext);
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swiperKey, setSwiperKey] = useState(0);
  const swiperRef = useRef(null);

  const fetchProducts = useCallback(async () => {
    try {
      let res;
      if (categoryKey === "offers") {
        // Fetch active offers
        res = await axios.get(`${BASE_URL}/offer/active`);
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
        
        setProducts(products.slice(0, 6)); // عرض 6 منتجات فقط
      } else {
        res = await axios.get(`${BASE_URL}/product`, {
          params: { limit: 20, page: 1, categories: categoryKey },
          withCredentials: true,
        });
        const allProducts = res.data.products || [];
        // Show up to 20 products, but display 6 at a time in the slider
        setProducts(allProducts.slice(0, 20));
      }
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [categoryKey]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      await fetchProducts();
      // Force Swiper to re-initialize when language or category changes
      setSwiperKey(prev => prev + 1);
    };
    loadProducts();
  }, [categoryKey, lang, fetchProducts]);

  const AddToCart = async (product) => {
      console.log('Product to be added to cart:', product);
      console.log('User:', user);
      console.log('CategoryKey:', categoryKey);
      
    try {
      if (!product || !product._id) {
        toast.error(lang === "ar" ? "خطأ: المنتج غير صحيح" : "Error: Invalid product");
        return;
      }

      // Check if product is out of stock
      if (product.stock !== undefined && product.stock <= 0) {
        toast.error(lang === "ar" ? "المنتج غير متوفر" : "Product is out of stock");
        return;
      }
      
      if (user && user._id) {
        // All products are regular products now, even if they have offers
        const payload = { 
          userId: user._id,
          productId: product._id
        };
        
        console.log('Sending payload to wishlist:', payload);
        
        const response = await axios.post(`${BASE_URL}/wish/add`, payload, { withCredentials: true });
        console.log('Wishlist add response:', response.data);
        
        // Check if product was already in wishlist
        if (response.data.message && response.data.message.includes("Already in wishlist")) {
          toast(lang === "ar" ? "هذا المنتج موجود بالفعل في السلة ❤️" : "This product is already in cart ❤️");
        } else {
          toast.success(lang === "ar" ? "✅ تمت الإضافة للسلة" : "✅ Added to cart");
        }
        window.dispatchEvent(new Event("wishlistUpdated"));
      } else {
        let localWish = JSON.parse(localStorage.getItem("localWish")) || [];
        const exists = localWish.find((item) => item._id === product._id);
        if (exists) {
          toast(lang === "ar" ? "موجود بالفعل ❤️" : "Already in cart ❤️");
          return;
        }
        
        // Store product with offer info if available
        localWish.push({ 
          ...product, 
          quantity: 1,
          type: "product",
          price: product.finalPrice || product.originalPrice || product.price || 0,
          // Store offer info for display
          offerInfo: categoryKey === "offers" && product.discountType ? {
            discountType: product.discountType,
            discountValue: product.discountValue,
            originalPrice: product.originalPrice,
            finalPrice: product.finalPrice,
            endDate: product.endDate,
          } : undefined,
        });
        localStorage.setItem("localWish", JSON.stringify(localWish));
        toast.success(lang === "ar" ? "تمت الإضافة ✅" : "Added ✅");
        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle "already in wishlist" as a success case
      const errorMessage = err.response?.data?.message || "";
      if (errorMessage.includes("already in the wishlist") || errorMessage.includes("Already in wishlist")) {
        toast(lang === "ar" ? "هذا المنتج موجود بالفعل في السلة ❤️" : "This product is already in cart ❤️");
        window.dispatchEvent(new Event("wishlistUpdated"));
        return;
      }
      
      // For other errors, show error message
      const finalErrorMessage = errorMessage || err.message || (lang === "ar" ? "خطأ أثناء الإضافة" : "Error adding");
      toast.error(finalErrorMessage);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // OfferCountdown component
  const OfferCountdown = ({ endDate }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
      const interval = setInterval(() => {
        const now = new Date();
        const end = new Date(endDate);
        const diff = end - now;

        if (diff <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
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

  // Function to start continuous scrolling
  const startContinuousScroll = (swiper) => {
    if (!swiper || swiper.destroyed) return;

    let animationFrameId;
    let lastTime = performance.now();

    const continuousScroll = (currentTime) => {
      if (!swiper || swiper.destroyed) {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        return;
      }

      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      const pixelsPerSecond = 30;
      const moveAmount = (pixelsPerSecond * deltaTime) / 1000;

      if (swiper.wrapperEl) {
        const currentTranslate = swiper.getTranslate();
        const wrapperWidth = swiper.wrapperEl.scrollWidth;
        const singleSetWidth = wrapperWidth / 2;
        let newTranslate = currentTranslate - moveAmount;
        
        if (newTranslate <= -singleSetWidth) {
          newTranslate = 0;
        }
        
        swiper.setTranslate(newTranslate);
      }

      animationFrameId = requestAnimationFrame(continuousScroll);
    };

    animationFrameId = requestAnimationFrame(continuousScroll);
    swiper.continuousScrollAnimationId = animationFrameId;

    swiper.stopContinuousScroll = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  };

  if (loading) {
    return (
      <section className="category-products-section">
        <div className="container">
          <div className="category-section-header">
            <h2 className="category-section-title">
              {lang === "ar" ? titleAr : titleEn}
            </h2>
          </div>
          <Loading />
        </div>
      </section>
    );
  }

  // Hide offers section if no discount offers
  if (categoryKey === "offers" && products.length === 0) {
    return null;
  }

  if (products.length === 0) {
    return (
      <section className="category-products-section">
        <div className="container">
          <div className="category-section-header">
            <h2 className="category-section-title">
              {lang === "ar" ? titleAr : titleEn}
            </h2>
          </div>
          <p className="no-products">
            {lang === "ar" ? "لا توجد منتجات حالياً" : "No products available"}
          </p>
        </div>
      </section>
    );
  }

  // Show slider only if there are more than 3 products
  const shouldShowSlider = products.length > 3;

  return (
    <section className="category-products-section">
      <div className="container">
        <div className="category-section-header">
          <h2 className="category-section-title">
            {lang === "ar" ? titleAr : titleEn}
          </h2>
          <button
            className="view-more-btn"
            onClick={() => navigate(`/products?category=${categoryKey}`)}
          >
            {lang === "ar" ? "عرض المزيد" : "View More"}
          </button>
        </div>

        {shouldShowSlider ? (
          <Swiper
            key={`swiper-${categoryKey}-${lang}-${swiperKey}-${products.length}`}
            modules={[Autoplay, Pagination]}
            spaceBetween={20}
            autoplay={false}
            pagination={{ clickable: true, dynamicBullets: true }}
            loop={false}
            watchSlidesProgress={true}
            allowTouchMove={true}
            freeMode={{
              enabled: true,
              momentum: false
            }}
            onSwiper={(swiper) => {
              // Store swiper instance in ref for continuous scroll
              swiperRef.current = swiper;
              // Start continuous smooth scrolling like a watch second hand
              startContinuousScroll(swiper);
            }}
            onBeforeDestroy={(swiper) => {
              // Clean up animation when swiper is destroyed
              if (swiper.stopContinuousScroll) {
                swiper.stopContinuousScroll();
              }
            }}
            breakpoints={{
              0: { 
                slidesPerView: 1,
                spaceBetween: 10
              },
              768: { 
                slidesPerView: 2,
                spaceBetween: 15
              },
              1024: { 
                slidesPerView: 3,
                spaceBetween: 20
              },
            }}
          >
            {/* Duplicate products for seamless infinite loop */}
            {[...products, ...products].map((product, index) => (
              <SwiperSlide key={`${product._id}-${index}`}>
                <div
                  className="category-card"
                  data-aos="fade-up"
                  data-aos-delay={(index % products.length) * 100}
                >
                  <div
                    className="category-image"
                    style={{
                      background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url('${
                        product.image || "/placeholder.png"
                      }') center/cover`,
                    }}
                  ></div>
                  <div className="category-content">
                    <h3>{product.title}</h3>
                    {product.description && (
                      <p>{product.description}</p>
                    )}
                    {categoryKey === "offers" && product.discountType ? (
                      <div className="category-price">
                        <span className="old-price">{product.originalPrice.toFixed(2)}</span>
                        <span className="new-price">
                          {product.finalPrice.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <div className="category-price">
                        <span className="regular-price">{product.price}</span>
                      </div>
                    )}
                    {categoryKey === "offers" && product.endDate && (
                      <div className="product-dates">
                        <div>
                          <strong>{lang === "ar" ? "الوقت المتبقي:" : "Time Left:"} </strong>
                          <span className="countdown">
                            <OfferCountdown endDate={product.endDate} />
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="product-actions-carousel">
                      <button
                        onClick={() => AddToCart(product)}
                        className="btn-add-to-cart"
                      >
                        {t("addToCart")}
                      </button>
                      <button
                        onClick={() => navigate(categoryKey === "offers" ? `/offerProduct/${product._id}` : `/product/${product._id}`)}
                        className=" btn-view-more"
                      >
                        {lang === "ar" ? "التفاصيل" : "Details"}
                      </button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
            <div className="custom-pagination"></div>
          </Swiper>
        ) : (
          <div className="categories-grid">
            {products.map((product, index) => (
              <div
                key={product._id}
                className="category-card"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div
                  className="category-image"
                  style={{
                    background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url('${
                      product.image || "/placeholder.png"
                    }') center/cover`,
                  }}
                ></div>
                <div className="category-content">
                  <h3>{product.title}</h3>
                  {product.description && (
                    <p>{product.description}</p>
                  )}
                  {categoryKey === "offers" && product.discountType ? (
                    <div className="category-price">
                      <span className="old-price">{product.originalPrice.toFixed(2)}</span>
                      <span className="new-price">
                        {product.finalPrice.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <div className="category-price">
                      <span className="regular-price">{product.price}</span>
                    </div>
                  )}
                  {categoryKey === "offers" && product.endDate && (
                    <div className="product-dates">
                      <div>
                        <strong>{lang === "ar" ? "الوقت المتبقي:" : "Time Left:"} </strong>
                        <span className="countdown">
                          <OfferCountdown endDate={product.endDate} />
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="product-actions-carousel">
                    <button
                      onClick={() => AddToCart(product)}
                      className="btn-add-to-cart"
                    >
                      {t("addToCart")}
                    </button>
                    <button
                      onClick={() => navigate(`/product/${product._id}`)}
                      className=" btn-view-more"
                    >
                      {lang === "ar" ? "التفاصيل" : "Details"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryProducts;
