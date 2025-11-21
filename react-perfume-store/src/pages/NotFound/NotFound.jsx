import React from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../../context/LangContext";
import "./NotFound.css";

const NotFound = () => {
  const navigate = useNavigate();
  const { lang } = useLang();

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-content">
          <div className="error-code">404</div>
          <h1 className="error-title">
            {lang === "ar" ? "الصفحة غير موجودة" : "Page Not Found"}
          </h1>
          <p className="error-message">
            {lang === "ar"
              ? "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها."
              : "Sorry, the page you are looking for does not exist or has been moved."}
          </p>
          <div className="not-found-actions">
            <button
              className="btn-home"
              onClick={() => navigate("/")}
            >
              {lang === "ar" ? "العودة للرئيسية" : "Back to Home"}
            </button>
            <button
              className="btn-back"
              onClick={() => navigate(-1)}
            >
              {lang === "ar" ? "العودة للخلف" : "Go Back"}
            </button>
          </div>
        </div>
        <div className="not-found-illustration">
          <svg
            width="300"
            height="300"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="100" cy="100" r="80" stroke="#d4af37" strokeWidth="2" fill="none" opacity="0.3" />
            <path
              d="M60 100 L90 100 M110 100 L140 100"
              stroke="#d4af37"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="80" cy="80" r="8" fill="#d4af37" />
            <circle cx="120" cy="80" r="8" fill="#d4af37" />
            <path
              d="M70 130 Q100 150 130 130"
              stroke="#d4af37"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

