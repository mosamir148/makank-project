import "./Contact.css";
import React, { useState } from "react";
import { useLang } from "../../context/LangContext";

const Contact = () => {
  const { t, lang } = useLang(); // لتفعيل الترجمة
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: t("contactFaq1Q"),
      answer: t("contactFaq1A"),
    },
    {
      question: t("contactFaq2Q"),
      answer: t("contactFaq2A"),
    },
    {
      question: t("contactFaq3Q"),
      answer: t("contactFaq3A"),
    },
  ];

  return (
    <div className="contact">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <h1 data-aos="fade-up">{t("contactHeroTitle")}</h1>
          <p data-aos="fade-up" data-aos-delay="100">{t("contactHeroSubtitle")}</p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="contact-section">
        <div className="container">
          {/* Form */}
          <div>
            <h2>{t("contactFormTitle")}</h2>
            <form className="contact-form" id="contactForm">
              <div>
                <label>{t("contactFormName")}</label>
                <input type="text" name="name" required />
              </div>
              <div>
                <label>{t("contactFormEmail")}</label>
                <input type="email" name="email" required />
              </div>
              <div>
                <label>{t("contactFormPhone")}</label>
                <input type="tel" name="phone" />
              </div>
              <div>
                <label>{t("contactFormSubject")}</label>
                <select name="subject" required>
                  <option value="">{t("contactFormSubjectSelect")}</option>
                  <option value="general">{t("contactFormSubjectGeneral")}</option>
                  <option value="product">{t("contactFormSubjectProduct")}</option>
                  <option value="complaint">{t("contactFormSubjectComplaint")}</option>
                  <option value="suggestion">{t("contactFormSubjectSuggestion")}</option>
                  <option value="partnership">{t("contactFormSubjectPartnership")}</option>
                </select>
              </div>
              <div>
                <label>{t("contactFormMessage")}</label>
                <textarea name="message" rows="6" required></textarea>
              </div>
              <button type="submit" className="btn btn-primary">{t("contactFormSend")}</button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="contact-info">
            <h2>{t("contactInfoTitle")}</h2>

            <div className="info-box">
              <div>📍</div>
              <div>
                <h3>{t("contactInfoAddress")}</h3>
                <p>{t("contactInfoAddressDetails")}</p>
              </div>
            </div>

            <div className="info-box">
              <div>📞</div>
              <div>
                <h3>{t("contactInfoPhone")}</h3>
                <p>{t("contactInfoPhoneDetails")}</p>
              </div>
            </div>

            <div className="info-box">
              <div>✉️</div>
              <div>
                <h3>{t("contactInfoEmail")}</h3>
                <p>{t("contactInfoEmailDetails")}</p>
              </div>
            </div>

            <div className="info-box">
              <div>🕐</div>
              <div>
                <h3>{t("contactInfoHours")}</h3>
                <p>{t("contactInfoHoursDetails")}</p>
              </div>
            </div>

            <h3>{t("contactInfoFollow")}</h3>
            <div className="social-links">
              <a href="#">📘</a>
              <a href="#">📷</a>
              <a href="#">🐦</a>
              <a href="#">📱</a>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="contact-map">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3624.3984739105!2d46.67233931500181!3d24.713552584127!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f03890d489399%3A0xba974d1c98e79fd5!2z2KfZhNix2YrYp9i2INin2YTYs9i52YjYr9mK2Kk!5e0!3m2!1sar!2ssa!4v1234567890123!5m2!1sar!2ssa"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <div className="section-header">
            <h2>{t("FAQ")}</h2>
            <p>{t("FAQSub")}</p>
          </div>

          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            {faqs.map((item, index) => (
              <div className="accordion-item" key={index}>
                <button
                  className="accordion-header"
                  onClick={() => toggleAccordion(index)}
                >
                  <span>{item.question}</span>
                  <span className="accordion-icon">
                    {activeIndex === index ? "−" : "+"}
                  </span>
                </button>
                <div
                  className="accordion-content"
                  style={{
                    maxHeight: activeIndex === index ? "200px" : "0",
                  }}
                >
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
