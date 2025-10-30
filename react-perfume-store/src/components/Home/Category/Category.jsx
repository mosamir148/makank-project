import "./Category.css";
import { useLang } from "../../../context/LangContext";

const Category = () => {
  const { t } = useLang();

  const categories = [
    {
      title: t("MensPerfumes"),
      subtitle: t("powerAttraction"),
      image:
        "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600",
      link: "/products?category=men",
    },
    {
      title: t("WomenPerfumes"),
      subtitle: t("unisexPerfumesS"),
      image:
        "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600",
      link: "/products?category=women",
    },
    {
      title: t("unisexPerfumes"),
      subtitle: t("modernStylishScents"),
      image:
        "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600",
      link: "/products?category=unisex",
    },
    {
      title: t("orientalPerfumes"),
      subtitle: t("authenticityHeritage"),
      image:
        "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600",
      link: "/products?category=oriental",
    },
    {
      title: t("frenchPerfumes"),
      subtitle: t("parisianLuxury"),
      image:
        "https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=600",
      link: "/products?category=french",
    },
    {
      title: t("woodyPerfumes"),
      subtitle: t("warmthDepth"),
      image:
        "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600",
      link: "/products?category=woody",
    },
  ];

  return (
    <section className="categories" id="categories">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t("exploreCategories")}</h2>
          <p className="section-subtitle">{t("exploreCategoriessub")}</p>
        </div>

        <div className="categories-grid">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="category-card"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div
                className="category-image"
                style={{
                  background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url('${cat.image}') center/cover`,
                }}
              ></div>
              <div className="category-content">
                <h3>{cat.title}</h3>
                <p>{cat.subtitle}</p>
                <a href={cat.link} className="category-link">
                  {t("shopNow")}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Category;
