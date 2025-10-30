import "./Offer.css";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../assets/url"; // عدّل المسار حسب مشروعك
import Loading from "../../Loading/Loading";
import toast from "react-hot-toast";
import { userContext } from "../../../context/UserContext";

const Offer = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const {user} = useContext(userContext)
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/offerProduct`);
        setOffers(res.data.offers); 
      } catch (err) {
        console.error("Error fetching offers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

   const AddToWish = async (product) => {
  try {
    console.log("Adding offer product ID:", product._id);
    if (user && user._id) {
      await axios.post(
        `${BASE_URL}/wish/add`,
        {
          userId: user._id,
          offerProductId: product._id, // ✅ خليه كده زي ما هو، السيرفر متعود على ده
        },
        { withCredentials: true }
      );
      toast.success("تمت إضافة المنتج إلى المفضلة بنجاح ✅");
    } else {
      let localWish = JSON.parse(localStorage.getItem("localWish")) || [];

      const exists = localWish.find((item) => item._id === product._id);
      if (exists) {
        toast("هذا المنتج موجود بالفعل في المفضلة ❤️");
        return;
      }

      localWish.push({
        _id: product._id,
        title: product.title || "منتج بدون عنوان",
        price: product.price || "غير محدد",
        image: product.image || "/placeholder.png",
        description: product.description || "منتج بدون وصف",
        brand: product.brand || "منتج بدون براند",
        category: product.category || "منتج بدون كاتيجوري",
        type: "offer", // 💡 عشان تميّزهم في localStorage
      });

      localStorage.setItem("localWish", JSON.stringify(localWish));
      toast.success("✅ تمت إضافة المنتج للمفضلة بنجاح");
    }
  } catch (err) {
    console.log(err);
    toast.error("حدث خطأ أثناء الإضافة إلى المفضلة");
  }
};


  if (loading) return <Loading />

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
              key={offer._id}
              className="offer-card"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="offer-badge">{offer.discount ? `${offer.discount}% OFF` : "Special Offer"}</div>
              <div
                className="offer-image"
                style={{
                  background: `url('${offer.image || "https://via.placeholder.com/400"}') center/cover`,
                }}
              ></div>

              <div className="offer-content">
                <h3 className="offer-name">{offer.title}</h3>
                <p className="offer-description">{offer.description}</p>
                <p className="offer-description">{offer.brand}</p>
                <p className="offer-description">{offer.category}</p>

                <div className="offer-price">
                  <span className="old-price">${offer.price}</span>
                  <span className="new-price">
                    ${offer.discount ? (offer.price - (offer.price * offer.discount) / 100).toFixed(2) : offer.price}
                  </span>
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
                  <OfferCountdown endDate={offer.endDate} />
                </div>

                <a href={`/offerProduct/${offer._id}`} className="btn btn-primary" style={{ width: "100%" }}>
                  Shop Now
                </a>
                <button
                    className="btn btn-primary"
                    onClick={() => AddToWish(offer)}
                  >
                    Add to Cart ❤️
                  </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


const OfferCountdown = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 , seconds: 0});

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(endDate);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <div style={{ display: "flex", gap: "10px", justifyContent: "center", fontWeight: 700, fontSize: "18px" }}>
      <div>
        <span style={{ color: "var(--primary-gold)" }}>{timeLeft.days}</span> Days
      </div>
      <div>
        <span style={{ color: "var(--primary-gold)" }}>{timeLeft.hours}</span> Hours
      </div>
      <div>
        <span style={{ color: "var(--primary-gold)" }}>{timeLeft.minutes}</span> Minutes
      </div>
      <div>
        <span style={{ color: "var(--primary-gold)" }}>{timeLeft.seconds}</span> Seconds
      </div>
    </div>
  );
};

export default Offer;
