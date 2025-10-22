import './Faq.css'
import { useEffect } from 'react'

const Faq = () => {
  useEffect(() => {
    const items = document.querySelectorAll('.accordion-header')
    items.forEach((item) => {
      item.addEventListener('click', () => {
        const parent = item.parentNode
        parent.classList.toggle('active')
      })
    })
  }, [])

  return (
    <section className="faq-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">أسئلة شائعة</h2>
          <p className="section-subtitle">كل ما تحتاج معرفته عن عطورنا</p>
        </div>

        <div className="accordion" id="faqAccordion">
          <div className="accordion-item" data-aos="fade-up">
            <button className="accordion-header">
              <span>كيف أختار العطر المناسب لي؟</span>
              <span className="accordion-icon">+</span>
            </button>
            <div className="accordion-content">
              <p>اختيار العطر المناسب يعتمد على شخصيتك والمناسبة. ننصح بتجربة العطر على البشرة وانتظار 30 دقيقة لتقييم الرائحة الحقيقية.</p>
            </div>
          </div>

          <div className="accordion-item" data-aos="fade-up" data-aos-delay="100">
            <button className="accordion-header">
              <span>ما هي مدة بقاء العطر؟</span>
              <span className="accordion-icon">+</span>
            </button>
            <div className="accordion-content">
              <p>عطورنا الفاخرة تدوم من 8 إلى 12 ساعة حسب نوع العطر وتركيزه. العطور الشرقية والخشبية عادة ما تدوم لفترة أطول.</p>
            </div>
          </div>

          <div className="accordion-item" data-aos="fade-up" data-aos-delay="200">
            <button className="accordion-header">
              <span>هل المنتجات أصلية 100%؟</span>
              <span className="accordion-icon">+</span>
            </button>
            <div className="accordion-content">
              <p>نعم، جميع منتجاتنا أصلية 100% ومستوردة مباشرة من الشركات المصنعة. نقدم ضمان الأصالة مع كل منتج.</p>
            </div>
          </div>

          <div className="accordion-item" data-aos="fade-up" data-aos-delay="300">
            <button className="accordion-header">
              <span>ما هي سياسة الاسترجاع؟</span>
              <span className="accordion-icon">+</span>
            </button>
            <div className="accordion-content">
              <p>نوفر سياسة استرجاع مرنة خلال 14 يوم من تاريخ الشراء للمنتجات غير المفتوحة.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Faq
