import React, { useEffect } from "react";
import "./Arrival.css";

const Arrival = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const arrivals = [
    {
      id: 1,
      title: "Midnight Oud",
      price: "1,400 $",
      image:
        "https://images.unsplash.com/photo-1541643600914-78b084683601?w=350",
      delay: 0,
    },
    {
      id: 2,
      title: "Floral Paradise",
      price: "1,250 $",
      image:
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=350",
      delay: 100,
    },
    {
      id: 3,
      title: "Citrus Breeze",
      price: "1,150 $",
      image:
        "https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=350",
      delay: 200,
    },
    {
      id: 4,
      title: "Leather & Spice",
      price: "1,550 $",
      image:
        "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=350",
      delay: 300,
    },
  ];

  return (
    <section className="new-arrivals" id="new-arrivals">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">وصل حديثاً</h2>
          <p className="section-subtitle">أحدث إصداراتنا من العطور الفاخرة</p>
        </div>

        <div className="arrivals-grid">
          {arrivals.map((item) => (
            <div
              key={item.id}
              className="arrival-card"
              data-aos="flip-left"
              data-aos-delay={item.delay}
            >
              <div
                className="arrival-image"
                style={{
                  background: `url(${item.image}) center/cover`,
                }}
              >
                <span className="new-badge">جديد</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Arrival;
