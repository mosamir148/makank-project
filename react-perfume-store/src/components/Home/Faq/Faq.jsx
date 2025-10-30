import { useLang } from "../../../context/LangContext";
import "./Faq.css";
import { useEffect } from "react";

const Faq = () => {
  const { t, lang } = useLang();

  const faqs = [
    {
      q: {
        ar: "كيف أختار العطر المناسب لي؟",
        en: "How can I choose the right perfume for me?",
      },
      a: {
        ar: "اختيار العطر المناسب يعتمد على شخصيتك والمناسبة. ننصح بتجربة العطر على البشرة وانتظار 30 دقيقة لتقييم الرائحة الحقيقية.",
        en: "Choosing the right perfume depends on your personality and the occasion. Try it on your skin and wait 30 minutes to evaluate the true scent.",
      },
    },
    {
      q: {
        ar: "ما هي مدة بقاء العطر؟",
        en: "How long does the perfume last?",
      },
      a: {
        ar: "عطورنا الفاخرة تدوم من 8 إلى 12 ساعة حسب نوع العطر وتركيزه. العطور الشرقية والخشبية عادة ما تدوم لفترة أطول.",
        en: "Our luxury perfumes last between 8 to 12 hours depending on the type and concentration. Oriental and woody scents usually last longer.",
      },
    },
    {
      q: {
        ar: "هل المنتجات أصلية 100%؟",
        en: "Are the products 100% authentic?",
      },
      a: {
        ar: "نعم، جميع منتجاتنا أصلية 100% ومستوردة مباشرة من الشركات المصنعة. نقدم ضمان الأصالة مع كل منتج.",
        en: "Yes, all our products are 100% authentic and imported directly from manufacturers. We provide an authenticity guarantee with every purchase.",
      },
    },
    {
      q: {
        ar: "ما هي سياسة الاسترجاع؟",
        en: "What is your return policy?",
      },
      a: {
        ar: "نوفر سياسة استرجاع مرنة خلال 14 يوم من تاريخ الشراء للمنتجات غير المفتوحة.",
        en: "We offer a flexible 14-day return policy for unopened products.",
      },
    },
  ];

  useEffect(() => {
    const headers = document.querySelectorAll(".accordion-header");
    const handlers = new Map(); // لتخزين كل handler فعلاً

    const handleClick = (header) => {
      const parent = header.parentNode;
      document.querySelectorAll(".accordion-item").forEach((item) => {
        if (item !== parent) item.classList.remove("active");
      });
      parent.classList.toggle("active");
    };

    headers.forEach((header) => {
      const onClick = () => handleClick(header);
      header.addEventListener("click", onClick);
      handlers.set(header, onClick);
    });

    return () => {
      headers.forEach((header) => {
        const onClick = handlers.get(header);
        if (onClick) header.removeEventListener("click", onClick);
      });
    };
  }, []);

  return (
    <section className="faq-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t("FAQ")}</h2>
          <p className="section-subtitle">{t("FAQSub")}</p>
        </div>

        <div className="accordion" id="faqAccordion">
          {faqs.map((item, i) => (
            <div
              className="accordion-item"
              key={i}
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <button className="accordion-header">
                <span>{item.q[lang]}</span>
                <span className="accordion-icon">+</span>
              </button>
              <div className="accordion-content">
                <p>{item.a[lang]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
