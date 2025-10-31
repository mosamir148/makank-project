import {  useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './Product.css'
import { BASE_URL } from '../../../assets/url'
import Loading from '../../../components/Loading/Loading'
import { useLang } from '../../../context/LangContext'

const Product = () => {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedBrandies, setSelectedBrandies] = useState([])
  const [sortOption, setSortOption] = useState("relavent")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const {t} = useLang()
  useEffect(() => {
    fetchProducts()
  }, [currentPage, selectedCategories, selectedBrandies, sortOption])

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/product`, {
        params: {
          page: currentPage,
          limit: 9,
          categories: selectedCategories.join(','),
          brands: selectedBrandies.join(','),
          sort: sortOption
        },
        withCredentials: true
      })
      setProducts(res.data.products)
      console.log(res.data.products)
      setTotalPages(res.data.totalPages || 1)

      if (res.data.products.length > 0) {
        setCategories([...new Set(res.data.products.map(p => p.category))])
        setBrands([...new Set(res.data.products.map(p => p.brand))])
      }
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
    setCurrentPage(1)
  }

  const handleBrandChange = (brand) => {
    setSelectedBrandies(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    )
    setCurrentPage(1)
  }

 

  if (loading) return <Loading />

  return (
    <section className="products-page">
      <div className="products-header">
        <h1>{t("OurProducts")}</h1>
        <p>{t("OurProductsSub")}</p>
      </div>

      <div className="products-container">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <div className="filter-section">
            <h3 className="filter-title">{t("Categories")}</h3>
            {categories.map((category, i) => (
              <div key={i} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                />
                <label>{category}</label>
              </div>
            ))}
          </div>

          <div className="filter-section">
            <h3 className="filter-title">{t("Brands")}</h3>
            {brands.map((brand, i) => (
              <div key={i} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedBrandies.includes(brand)}
                  onChange={() => handleBrandChange(brand)}
                />
                <label>{brand}</label>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Products Section */}
        <main className="products-main">
          <div className="products-toolbar">
            <p className="products-count">{products.length} - {t("ProductsFound")}</p>
            <div className="sort-options">
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                <option value="relavent">{t("Sortby")}</option>
                <option value="low-high">{t("PriceLow")}</option>
                <option value="high-low">{t("PriceHigh")}</option>
              </select>
            </div>
          </div>

          <div className="products-grid">
            {products.map((p) => (
              <div key={p._id} className="product-card">
                <div
                  className="product-image"
                  style={{ backgroundImage: `url(${p.image})` }}
                >
                  
                </div>
                <div className="product-content">
                  <h4 className="product-name">{p.title}</h4>
                  <p className="product-category">{p.category}</p>
                  <p className="product-description">{p.description}</p>
                  <div className="product-footer">
                    <p className="product-price">${p.price}</p>
                    <Link to={`/product/${p._id}`} className="buy-btn">Buy Now</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="pagination-btn"
            >
              {t("Prev")}
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`pagination-btn ${currentPage === index + 1 ? "active" : ""}`}
              >
                {index + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="pagination-btn"
            >
              {t("Next")}
            </button>
          </div>
        </main>
      </div>
    </section>
  )
}

export default React.memo(Product)
