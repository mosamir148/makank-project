import { useLang } from '../../../context/LangContext';
import './Why.css';

const Why = () => {
  const { t } = useLang();

  const features = [
    {
      icon: "🚚",
      title: t("FreeShipping"),
      desc: t("FreeShippingSub"),
    },
    {
      icon: "🎁",
      title: t("LuxuryPackaging"),
      desc: t("LuxuryPackagingSub"),
    },
    {
      icon: "💬",
      title: t("CustomerSupport"),
      desc: t("CustomerSupportSub"),
    },
    {
      icon: "✓",
      title: t("QualityGuarantee"),
      desc: t("QualityGuaranteeSub"),
    },
  ];

  return (
    <section className="why-choose-us">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t("WhyChooseUs")}</h2>
          <p className="section-subtitle">{t("WhyChooseUsSub")}</p>
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
