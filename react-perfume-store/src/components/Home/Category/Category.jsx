import "./Category.css";
import { useLang } from "../../../context/LangContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

const Category = () => {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [swiperKey, setSwiperKey] = useState(0);
  const swiperRef = useRef(null);

  useEffect(() => {
    // Force Swiper to re-initialize when language changes
    setSwiperKey(prev => prev + 1);
  }, [lang]);

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

      // Move continuously - 30 pixels per second for smooth movement
      const pixelsPerSecond = 30;
      const moveAmount = (pixelsPerSecond * deltaTime) / 1000;

      if (swiper.wrapperEl) {
        const currentTranslate = swiper.getTranslate();
        const wrapperWidth = swiper.wrapperEl.scrollWidth;
        const viewportWidth = swiper.width;
        
        // Calculate new position
        let newTranslate = currentTranslate - moveAmount;
        
        // Reset when we've scrolled past first set (seamless loop)
        // Since we duplicate slides, reset when we reach the duplicate point
        const singleSetWidth = wrapperWidth / 2; // Assuming we duplicate slides
        if (newTranslate <= -singleSetWidth) {
          newTranslate = 0; // Reset to start for seamless loop
        }
        
        // Apply smooth transform
        swiper.setTranslate(newTranslate);
      }

      animationFrameId = requestAnimationFrame(continuousScroll);
    };

    // Start continuous animation
    animationFrameId = requestAnimationFrame(continuousScroll);
    swiper.continuousScrollAnimationId = animationFrameId;

    // Store cleanup function
    swiper.stopContinuousScroll = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  };

  const categories = useMemo(() => [
    {
      title: lang === "ar" ? "فحم العود" : "Oud Charcoal",
      subtitle: lang === "ar" ? "فحم عود أصيل من أجود المصادر" : "Authentic oud charcoal from finest sources",
      image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600",
      link: "/products?category=oud-charcoal",
    },
    {
      title: lang === "ar" ? "البخور" : "Incense",
      subtitle: lang === "ar" ? "بخور شرقي بروائح أصيلة ومميزة" : "Eastern incense with authentic and unique fragrances",
      image: "/assets/البخور.jpg",
      link: "/products?category=incense",
    },
    {
      title: lang === "ar" ? "الإكسسوارات" : "Accessories",
      subtitle: lang === "ar" ? "إكسسوارات فاخرة للعطور والبخور" : "Luxurious accessories for perfumes and incense",
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600",
      link: "/products?category=accessories",
    },
    {
      title: lang === "ar" ? "العروض" : "Offers",
      subtitle: lang === "ar" ? "عروض حصرية وخصومات مميزة" : "Exclusive offers and special discounts",
      image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600",
      link: "/products?category=offers",
    },
    {
      title: lang === "ar" ? "العطور" : "Perfumes",
      subtitle: lang === "ar" ? "عطور شرقية فاخرة وأصيلة" : "Luxurious and authentic Eastern perfumes",
      image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600",
      link: "/products?category=perfumes",
    },
  ], [lang]);

  // Show slider only if there are more than 3 categories
  const shouldShowSlider = categories.length > 3;

  return (
    <section className="categories" id="categories">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t("exploreCategories")}</h2>
          <p className="section-subtitle">{t("exploreCategoriessub")}</p>
        </div>

        {shouldShowSlider ? (
          <Swiper
            key={`category-swiper-${lang}-${swiperKey}`}
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
            {/* Duplicate categories for seamless infinite loop */}
            {[...categories, ...categories].map((cat, index) => (
              <SwiperSlide key={`${cat.link}-${lang}-${index}`}>
                <div
                  className="category-card"
                  data-aos="fade-up"
                  data-aos-delay={(index % categories.length) * 100}
                >
                  <div
                    className="category-image"
                    style={{
                      background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url('${cat.image}') center/cover`,
                    }}
                  ></div>
                  <div className="category-content">
                    <h3>{cat.title}</h3>
                    <p>{cat.subtitle}</p>
                    <button
                      onClick={() => navigate(cat.link)}
                      className="category-link"
                    >
                      {t("shopNow")}
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
            <div className="custom-pagination"></div>
          </Swiper>
        ) : (
          <div className="categories-grid">
            {categories.map((cat, index) => (
              <div
                key={`${cat.link}-${lang}-${index}`}
                className="category-card"
                data-aos="fade-up"
                data-aos-delay={index * 100}
                onClick={() => navigate(cat.link)}
              >
                <div
                  className="category-image"
                  style={{
                    background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url('${cat.image}') center/cover`,
                  }}
                ></div>
                <div className="category-content">
                  <h3>{cat.title}</h3>
                  <p>{cat.subtitle}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(cat.link);
                    }}
                    className="category-link"
                  >
                    {t("shopNow")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Category;
