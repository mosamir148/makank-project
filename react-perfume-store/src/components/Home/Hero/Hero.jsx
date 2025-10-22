import { useState, useEffect } from "react";
import "./Hero.css";

const slides = [
  {
    title: "Luxury Perfumes from Paris",
    text: "Discover a world of elegance and sophistication",
    img: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920",
    btnText: "Shop Now",
  },
  {
    title: "Exclusive Tom Ford Collection",
    text: "Stand out with an unforgettable scent",
    img: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1920",
    btnText: "Discover More",
  },
  {
    title: "Authentic Oriental Scents",
    text: "A journey through captivating fragrances",
    img: "https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=1920",
    btnText: "Explore Now",
  },
];

const Hero = () => {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };


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
            style={{
              background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('${slide.img}') center/cover`,
            }}
          >
            <div className="slide-content">
              <h2 className="slide-title">{slide.title}</h2>
              <p className="slide-text">{slide.text}</p>
              <a href="/products" className="btn btn-primary">
                {slide.btnText}
              </a>
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
