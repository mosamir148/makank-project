import React, { useEffect } from "react";
import "./Sales.css";
import { useLang } from "../../../context/LangContext";

const Sales = () => {
    const { t } = useLang();

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const bestsellers = [
    {
      id: 1,
      rank: "#1",
      title: "Oud Imperial",
      desc: "عطر شرقي فاخر بلمسات العود الطبيعي",
      price: "1,800 ر.س",
      image:
        "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=500",
      delay: 0,
    },
    {
      id: 2,
      rank: "#2",
      title: "Chanel Prestige",
      desc: "أيقونة الأناقة الفرنسية",
      price: "2,200 ر.س",
      image:
        "https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=500",
      delay: 100,
    },
    {
      id: 3,
      rank: "#3",
      title: "Tobacco Vanille",
      desc: "عطر دافئ بلمسات التبغ والفانيليا",
      price: "1,650 ر.س",
      image:
        "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=500",
      delay: 200,
    },
  ];

  return (
    <section className="best-sellers" id="best-sellers">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t("bestseller")}</h2>
          <p className="section-subtitle">{t("bestsellerSub")}</p>
        </div>

        <div className="bestsellers-grid">
          {bestsellers.map((item) => (
            <div
              key={item.id}
              className="bestseller-item"
              data-aos="fade-right"
              data-aos-delay={item.delay}
            >
              <div className="bestseller-rank">{item.rank}</div>

              <div
                className="bestseller-image"
                style={{
                  background: `url(${item.image}) center/cover`,
                }}
              ></div>

              <div className="bestseller-content">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <span className="price">{item.price}</span>
                <a href={`/product-details.html?id=${item.id}`} className="btn btn-gold">
                  اشتري الآن
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Sales;

