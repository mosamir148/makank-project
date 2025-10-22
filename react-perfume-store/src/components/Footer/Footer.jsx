import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>LUXE PARFUM</h3>
            <p>A world of luxury perfumes and elegant sophistication</p>
            <div className="social-links">
              <a href="#" className="social-link">📘</a>
              <a href="#" className="social-link">📷</a>
              <a href="#" className="social-link">🐦</a>
              <a href="#" className="social-link">📱</a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="index.html">Home</a></li>
              <li><a href="products.html">Products</a></li>
              <li><a href="about.html">About Us</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Customer Service</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms & Conditions</a></li>
              <li><a href="#">Return Policy</a></li>
              <li><a href="#">FAQs</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact Us</h4>
            <ul>
              <li>📞 +966 50 123 4567</li>
              <li>✉️ info@luxeparfum.com</li>
              <li>📍 Riyadh, Saudi Arabia</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 LUXE PARFUM. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
