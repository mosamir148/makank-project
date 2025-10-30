import './Footer.css';
import { useLang } from '../../context/LangContext';

const Footer = () => {
  const { t } = useLang();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          
          {/* --- القسم الأول --- */}
          <div className="footer-section">
            <h3>LUXE PARFUM</h3>
            <p>{t("hero1sub")}</p>
            <div className="social-links">
              <a href="#" className="social-link">📘</a>
              <a href="#" className="social-link">📷</a>
              <a href="#" className="social-link">🐦</a>
              <a href="#" className="social-link">📱</a>
            </div>
          </div>

          {/* --- القسم الثاني --- */}
          <div className="footer-section">
            <h4>{t("home")}</h4>
            <ul>
              <li><a href="/">{t("home")}</a></li>
              <li><a href="/products">{t("products")}</a></li>
              <li><a href="/about">{t("about")}</a></li>
              <li><a href="/contact">{t("contact")}</a></li>
            </ul>
          </div>

          {/* --- القسم الثالث --- */}
          <div className="footer-section">
            <h4>{t("CustomerService")}</h4>
            <ul>
              <li><a href="#">{t("PrivacyPolicy")}</a></li>
              <li><a href="#">{t("TermsConditions")}</a></li>
              <li><a href="#">{t("QualityGuarantee")}</a></li>
              <li><a href="#">{t("FAQ")}</a></li>
            </ul>
          </div>

          {/* --- القسم الرابع --- */}
          <div className="footer-section">
            <h4>{t("contact")}</h4>
            <ul>
              <li>📞 +966 50 123 4567</li>
              <li>✉️ info@luxeparfum.com</li>
              <li>📍 Riyadh, Saudi Arabia</li>
            </ul>
          </div>
        </div>

        {/* --- أسفل الفوتر --- */}
        <div className="footer-bottom">
          <p>{t("reserved")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
