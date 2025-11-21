import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../assets/url";
import Loading from "../../components/Loading/Loading";
import { useLang } from "../../context/LangContext";
import { useNavigate } from "react-router-dom";
import "./Offers.css";

const Offers = () => {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/offerProduct`);
      const allOffers = res.data.offers || [];
      
      // Filter offers: only show those with discount > 0 (direct discount type)
      // and that are currently valid (between startDate and endDate)
      const currentDate = new Date();
      const validDiscountOffers = allOffers.filter((offer) => {
        // Must have discount > 0 (direct discount, not coupon)
        if (!offer.discount || offer.discount <= 0) {
          return false;
        }
        
        // Must be within valid date range
        if (offer.startDate && offer.endDate) {
          const startDate = new Date(offer.startDate);
          const endDate = new Date(offer.endDate);
          return currentDate >= startDate && currentDate <= endDate;
        }
        
        // If no dates specified, include it
        return true;
      });
      
      setOffers(validDiscountOffers);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching offers:", err);
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="offers-page-container">
      <div className="offers-header">
        <h1>{t("offers") || "Offers"}</h1>
        <p>{t("offersSub") || t("specialOffersSub") || "Special offers and discounts"}</p>
      </div>

      {offers.length === 0 ? (
        <div className="no-offers-message">
          <p>{lang === "ar" ? "لا توجد عروض متاحة حالياً" : "No offers available at the moment"}</p>
        </div>
      ) : (
        <div className="offers-grid">
          {offers.map((offer, index) => (
            <div
              key={offer._id}
              className="offer-card"
              onClick={() => navigate(`/offerProduct/${offer._id}`)}
            >
              <div className="offer-image-container">
                <img
                  src={offer.image || "/assets/Logo3.png"}
                  alt={offer.title}
                  className="offer-image"
                />
                {offer.discount > 0 && (
                  <div className="offer-badge">
                    {offer.discount} {t("off") || "% OFF"}
                  </div>
                )}
              </div>
              <div className="offer-content">
                <h3 className="offer-title">{offer.title}</h3>
                <p className="offer-description">{offer.description}</p>
                <div className="offer-price-section">
                  <span className="old-price">{offer.price}</span>
                  <span className="new-price">
                    {(offer.price - offer.discount).toFixed(2)}
                  </span>
                </div>
                <button className="view-offer-btn">
                  {t("shopNow") || "Shop Now"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Offers;





