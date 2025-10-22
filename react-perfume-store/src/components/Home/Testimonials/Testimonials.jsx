import { useState, useEffect } from 'react';
import './Testimonials.css';

const testimonials = [
  {
    text: "تجربة رائعة! العطور أصلية والتغليف فاخر جداً. خدمة العملاء ممتازة والتوصيل سريع.",
    name: "سارة أحمد",
    location: "الرياض، السعودية",
    img: "https://i.pravatar.cc/150?img=1",
    rating: 5,
  },
  {
    text: "أفضل متجر عطور تعاملت معه. التشكيلة واسعة والأسعار منافسة.",
    name: "محمد العتيبي",
    location: "جدة، السعودية",
    img: "https://i.pravatar.cc/150?img=12",
    rating: 5,
  },
  {
    text: "مجموعة العطور النسائية رائعة! Rose Mystique أصبح عطري المفضل.",
    name: "نورة السالم",
    location: "دبي، الإمارات",
    img: "https://i.pravatar.cc/150?img=5",
    rating: 5,
  },
];

const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  const nextTestimonial = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // التشغيل التلقائي
  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="testimonials">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">آراء العملاء</h2>
          <p className="section-subtitle">ما يقوله عملاؤنا عن تجربتهم</p>
        </div>

        <div className="testimonials-slider">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className={`testimonial-item ${index === current ? 'active' : ''}`}
            >
              <div className="testimonial-content">
                <div className="quote-icon">"</div>
                <p className="testimonial-text">{item.text}</p>
                <div className="testimonial-author">
                  <div
                    className="author-image"
                    style={{ background: `url('${item.img}') center/cover` }}
                  ></div>
                  <div className="author-info">
                    <h4>{item.name}</h4>
                    <p>{item.location}</p>
                    <div className="rating">{'★'.repeat(item.rating)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="testimonial-nav">
          <button className="testimonial-prev" onClick={prevTestimonial}>‹</button>
          <button className="testimonial-next" onClick={nextTestimonial}>›</button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
