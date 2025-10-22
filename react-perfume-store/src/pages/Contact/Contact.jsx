import  "./Contact.css";
import React, { useState } from "react";

const Contact = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="contact">
      {/* Hero Section */}

      <section className="contact-hero">
        <div className="container">
          <h1 data-aos="fade-up">Contact Us</h1>
          <p data-aos="fade-up" data-aos-delay="100">
            We're here to help you with any inquiry
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}

      <section className="contact-section">
        <div className="container">
          {/* Form */}
          <div >
            <h2>Send Us a Message</h2>
            <form className="contact-form" id="contactForm">
              <div>
                <label>Full Name *</label>
                <input type="text" name="name" required />
              </div>
              <div>
                <label>Email *</label>
                <input type="email" name="email" required />
              </div>
              <div>
                <label>Phone</label>
                <input type="tel" name="phone" />
              </div>
              <div>
                <label>Subject *</label>
                <select name="subject" required>
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="product">Product Inquiry</option>
                  <option value="complaint">Complaint</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="partnership">Partnership Request</option>
                </select>
              </div>
              <div>
                <label>Message *</label>
                <textarea name="message" rows="6" required></textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="contact-info" >
            <h2>Contact Information</h2>

            <div className="info-box">
              <div>📍</div>
              <div>
                <h3>Address</h3>
                <p>
                  King Fahd Road, Al Olaya<br />
                  Riyadh 12211<br />
                  Saudi Arabia
                </p>
              </div>
            </div>

            <div className="info-box">
              <div>📞</div>
              <div>
                <h3>Phone</h3>
                <p>
                  +966 50 123 4567<br />
                  +966 11 234 5678
                </p>
              </div>
            </div>

            <div className="info-box">
              <div>✉️</div>
              <div>
                <h3>Email</h3>
                <p>
                  info@luxeparfum.com<br />
                  support@luxeparfum.com
                </p>
              </div>
            </div>

            <div className="info-box">
              <div>🕐</div>
              <div>
                <h3>Working Hours</h3>
                <p>
                  Sat - Thu: 9:00 AM - 10:00 PM<br />
                  Fri: 2:00 PM - 10:00 PM
                </p>
              </div>
            </div>

            <h3>Follow Us</h3>
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
            <h2>FAQ</h2>
            <p>Quick answers to common questions</p>
          </div>

          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            {[
              {
                question: "How can I track my order?",
                answer:
                  "A tracking link will be sent to your email once the order is shipped. You can also track via your account on the website.",
              },
              {
                question: "What payment methods are available?",
                answer:
                  "We accept Visa, Mastercard, Mada, Apple Pay, and Cash on Delivery.",
              },
              {
                question: "Do you ship outside Saudi Arabia?",
                answer:
                  "Yes, we ship to all GCC countries. Contact us for shipping cost and delivery time.",
              },
            ].map((item, index) => (
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
