import { useLang } from '../../../context/LangContext';
import './Newsletter.css';
import { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const { t } = useLang();
  const handleSubmit = (e) => {
    e.preventDefault();

    alert(`Subscribed with: ${email}`);
    setEmail('');
  };

  return (
    <section className="newsletter">
      <div className="container">
        <div className="newsletter-content" data-aos="zoom-in">
          <h2>{t("Newsletter")}</h2>
          <p>{t("NewsletterSub")}</p>
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">{t("SubscribeNow")}</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
