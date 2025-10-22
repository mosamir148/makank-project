import './Newsletter.css';
import { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // هنا ممكن تضيف إرسال البريد لمزود الخدمة أو API
    alert(`Subscribed with: ${email}`);
    setEmail('');
  };

  return (
    <section className="newsletter">
      <div className="container">
        <div className="newsletter-content" data-aos="zoom-in">
          <h2>Subscribe to Our Newsletter</h2>
          <p>Get the latest offers and new releases</p>
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Subscribe Now</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
