import { useState, useEffect } from "react";
import { useLang } from "../../../context/LangContext";
import "./Hero.css";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const { t, lang } = useLang();
  const navigate = useNavigate();

  const slides = [
    {
      title: lang === "ar" ? "فحم العود" : "Oud Charcoal",
      text: lang === "ar" ? "فحم العود الأصيل من أفضل المصادر الشرقية" : "Authentic oud charcoal from the finest Eastern sources",
      img: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=1920",
      btnText: t("shopNow"),
      link: "/products?category=oud-charcoal",
    },
    {
      title: lang === "ar" ? "البخور" : "Incense",
      text: lang === "ar" ? "أجود أنواع البخور بروائح شرقية أصيلة" : "Premium incense with authentic Eastern fragrances",
      img: "/assets/البخور.jpg",
      btnText: t("shopNow"),
      link: "/products?category=incense",
    },
    {
      title: lang === "ar" ? "الإكسسوارات" : "Accessories",
      text: lang === "ar" ? "إكسسوارات أنيقة ومميزة للعطور والبخور" : "Elegant and unique accessories for perfumes and incense",
      img: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920",
      btnText: t("shopNow"),
      link: "/products?category=accessories",
    },
    {
      title: lang === "ar" ? "العروض" : "Offers",
      text: lang === "ar" ? "عروض حصرية وخصومات مميزة على منتجاتنا" : "Exclusive offers and special discounts on our products",
      img: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1920",
      btnText: t("shopNow"),
      link: "/products?category=offers",
    },
    {
      title: lang === "ar" ? "العطور" : "Perfumes",
      text: lang === "ar" ? "مجموعة فاخرة من العطور الشرقية والأصيلة" : "A luxurious collection of authentic Eastern perfumes",
      img: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=1920",
      btnText: t("shopNow"),
      link: "/products?category=perfumes",
    },
  ];

  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-slider" id="heroSlider">
      <div className="slider-container">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${index === current ? "active" : ""}`}
            loading='lazy'
            style={{
              background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('${slide.img}') center/cover no-repeat`,
              backgroundSize: '100% 100%',
            }}
          >
            <div className="slide-content">
              <h2 className="slide-title">{slide.title}</h2>
              <p className="slide-text">{slide.text}</p>
              <button 
                onClick={() => navigate(slide.link)} 
                className="btn btn-primary"
              >
                {slide.btnText}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="slider-btn prev" onClick={prevSlide}>
        ‹
      </button>
      <button className="slider-btn next" onClick={nextSlide}>
        ›
      </button>

      <div className="slider-dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === current ? "active" : ""}`}
            onClick={() => setCurrent(index)}
          ></span>
        ))}
      </div>
    </section>
  );
};

export default Hero;
