import './Why.css';

const features = [
  {
    icon: "🚚",
    title: "Free Shipping",
    desc: "Free delivery on all orders over $133", // بدل ر.س بالدولار لو حبيت
  },
  {
    icon: "🎁",
    title: "Luxury Packaging",
    desc: "Each product comes in premium gift-ready packaging",
  },
  {
    icon: "💬",
    title: "Customer Support",
    desc: "Dedicated team available 24/7 to assist you",
  },
  {
    icon: "✓",
    title: "Quality Guarantee",
    desc: "100% authentic products with return guarantee",
  },
];

const Why = () => {
  return (
    <section className="why-choose-us">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Why Choose Us</h2>
          <p className="section-subtitle">Features that make us the best choice</p>
        </div>

        <div className="features-grid">
          {features.map((item, index) => (
            <div
              key={index}
              className="feature-card"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="feature-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Why;
