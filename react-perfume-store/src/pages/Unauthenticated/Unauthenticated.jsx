import React from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../../context/LangContext";
import "./Unauthenticated.css";

const Unauthenticated = () => {
  const navigate = useNavigate();
  const { lang } = useLang();

  return (
    <div className="unauthenticated-page">
      <div className="unauthenticated-container">
        <div className="unauthenticated-icon">
          <svg
            width="100"
            height="100"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="#d4af37" strokeWidth="2" />
            <path
              d="M12 8v4M12 16h.01"
              stroke="#d4af37"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M8 12h8"
              stroke="#d4af37"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1 className="unauthenticated-title">
          {lang === "ar" ? "🔒 يتطلب تسجيل الدخول" : "🔒 Authentication Required"}
        </h1>

        <p className="unauthenticated-message">
          {lang === "ar"
            ? "يجب عليك تسجيل الدخول للوصول إلى هذه الصفحة."
            : "You need to be logged in to access this page."}
        </p>

        <div className="unauthenticated-actions">
          <button
            className="btn-login"
            onClick={() => navigate("/signin")}
          >
            {lang === "ar" ? "تسجيل الدخول" : "Sign In"}
          </button>
          <button
            className="btn-register"
            onClick={() => navigate("/register")}
          >
            {lang === "ar" ? "إنشاء حساب جديد" : "Create Account"}
          </button>
          <button
            className="btn-home"
            onClick={() => navigate("/")}
          >
            {lang === "ar" ? "العودة للرئيسية" : "Back to Home"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthenticated;

