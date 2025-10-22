import React, { useEffect } from "react";
import "./Online.css";

const Online = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const products = [
    {
      id: 1,
      title: "Limited Edition Oud",
      desc: "إصدار محدود - 100 قطعة فقط",
      features: [
        "✓ تغليف فاخر حصري",
        "✓ شهادة أصالة مرقمة",
        "✓ توصيل مجاني",
      ],
      price: "2,500 ر.س",
      btnText: "اطلب الآن",
      image:
        "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400",
      delay: 0,
    },
    {
      id: 2,
      title: "Signature Collection",
      desc: "مجموعة التوقيع الخاصة",
      features: [
        "✓ 3 عطور فاخرة",
        "✓ علبة هدايا فخمة",
        "✓ بطاقة تهنئة مخصصة",
      ],
      price: "3,200 ر.س",
      btnText: "اطلب الآن",
      image:
        "https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=400",
      delay: 100,
    },
    {
      id: 3,
      title: "VIP Membership",
      desc: "عضوية VIP السنوية",
      features: [
        "✓ خصم 25% دائم",
        "✓ شحن مجاني دائماً",
        "✓ عروض حصرية",
      ],
      price: "1,500 ر.س/سنة",
      btnText: "اشترك الآن",
      image:
        "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=400",
      delay: 200,
    },
  ];

  return (
    <section className="exclusive-online" id="exclusive-online">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">حصري على المتجر الإلكتروني</h2>
          <p className="section-subtitle">منتجات متوفرة فقط على الموقع</p>
        </div>

        <div className="exclusive-grid">
          {products.map((item) => (
            <div
              key={item.id}
              className="exclusive-card"
              data-aos="zoom-in"
              data-aos-delay={item.delay}
            >
              <div className="exclusive-badge">حصري</div>
              <div
                className="exclusive-image"
                style={{
                  background: `url(${item.image}) center/cover`,
                }}
              ></div>

              <div className="exclusive-content">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>

                <div className="exclusive-features">
                  {item.features.map((f, i) => (
                    <span key={i}>{f}</span>
                  ))}
                </div>

                <div className="exclusive-footer">
                  <span className="exclusive-price">{item.price}</span>
                  <a href="product-details.html" className="btn btn-gold">
                    {item.btnText}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Online;
