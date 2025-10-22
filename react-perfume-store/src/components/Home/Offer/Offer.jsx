import "./Offer.css";

const offers = [
  {
    badge: "40% OFF",
    name: "Deal of the Week",
    description: "Buy 2 and get the 3rd one free",
    oldPrice: "$530",
    newPrice: "$320",
    img: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400",
    time: { days: 2, hours: 14, minutes: 32 },
    link: "/products",
  },
  {
    badge: "30% OFF",
    name: "Women's Perfume Offer",
    description: "Discounts on all women's fragrances",
    oldPrice: "$480",
    newPrice: "$336",
    img: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400",
    time: { days: 5, hours: 8, minutes: 45 },
    link: "/products",
  },
  {
    badge: "50% OFF",
    name: "End of Season Sale",
    description: "Massive discounts on selected collections",
    oldPrice: "$640",
    newPrice: "$320",
    img: "https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=400",
    time: { days: 1, hours: 6, minutes: 18 },
    link: "/products",
  },
];

const Offer = () => {
  return (
    <section className="special-offers" id="special-offers">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Special Offers</h2>
          <p className="section-subtitle">Exclusive deals for a limited time</p>
        </div>

        <div className="offers-grid">
          {offers.map((offer, index) => (
            <div
              key={index}
              className="offer-card"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="offer-badge">{offer.badge}</div>
              <div
                className="offer-image"
                style={{
                  background: `url('${offer.img}') center/cover`,
                }}
              ></div>

              <div className="offer-content">
                <h3 className="offer-name">{offer.name}</h3>
                <p className="offer-description">{offer.description}</p>

                <div className="offer-price">
                  <span className="old-price">{offer.oldPrice}</span>
                  <span className="new-price">{offer.newPrice}</span>
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
                    Offer ends in:
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "18px",
                    }}
                  >
                    <div>
                      <span style={{ color: "var(--primary-gold)" }}>
                        {offer.time.days}
                      </span>{" "}
                      Days
                    </div>
                    <div>
                      <span style={{ color: "var(--primary-gold)" }}>
                        {offer.time.hours}
                      </span>{" "}
                      Hours
                    </div>
                    <div>
                      <span style={{ color: "var(--primary-gold)" }}>
                        {offer.time.minutes}
                      </span>{" "}
                      Minutes
                    </div>
                  </div>
                </div>

                <a href={offer.link} className="btn btn-primary" style={{ width: "100%" }}>
                  Shop Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Offer;


