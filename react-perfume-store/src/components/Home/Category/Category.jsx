import "./Category.css";

const categories = [
  {
    title: "Men’s Perfumes",
    subtitle: "Power & Attraction",
    image:
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600",
    link: "/products?category=men",
  },
  {
    title: "Women’s Perfumes",
    subtitle: "Elegance & Charm",
    image:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600",
    link: "/products?category=women",
  },
  {
    title: "Unisex",
    subtitle: "Modern & Stylish Scents",
    image:
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600",
    link: "/products?category=unisex",
  },
  {
    title: "Oriental Perfumes",
    subtitle: "Authenticity & Heritage",
    image:
      "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600",
    link: "/products?category=oriental",
  },
  {
    title: "French Perfumes",
    subtitle: "Parisian Luxury",
    image:
      "https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=600",
    link: "/products?category=french",
  },
  {
    title: "Woody Perfumes",
    subtitle: "Warmth & Depth",
    image:
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600",
    link: "/products?category=woody",
  },
];

const Category = () => {
  return (
    <section className="categories" id="categories">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Explore Categories</h2>
          <p className="section-subtitle">
            Choose from a wide range of luxury fragrances
          </p>
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
                  Shop Now
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
