import {  useEffect, useState, useContext, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import './Product.css'
import { BASE_URL } from '../../../assets/url'
import Loading from '../../../components/Loading/Loading'
import { useLang } from '../../../context/LangContext'
import { userContext } from '../../../context/UserContext'
import toast from 'react-hot-toast'
import { findMatchingCategory, getCategoryNameFromKey } from '../../../utils/categoryMapping'

const Product = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedBrandies, setSelectedBrandies] = useState([])
  const [sortOption, setSortOption] = useState("relavent")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeOffers, setActiveOffers] = useState([])
  const {t, lang} = useLang()
  const {user} = useContext(userContext)

  // Fetch all categories and brands on mount (only once)
  useEffect(() => {
    const fetchAllCategoriesAndBrands = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/product`, {
          params: { limit: 1000, page: 1 },
          withCredentials: true
        })
        if (res.data.products && res.data.products.length > 0) {
          // Filter out 'offers' category from the list
          setCategories([...new Set(res.data.products.map(p => p.category).filter(Boolean).filter(cat => cat !== 'offers'))])
          setBrands([...new Set(res.data.products.map(p => p.brand).filter(Boolean))])
        }
      } catch (err) {
        console.log('Error fetching categories and brands:', err)
      }
    }
    fetchAllCategoriesAndBrands()
  }, [])

  // Fetch active discount offers
  useEffect(() => {
    const fetchActiveOffers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/offer/active`)
        const offers = res.data.offers || []
        // Filter for discount type only
        const discountOffers = offers.filter(offer => offer.type === "discount")
        setActiveOffers(discountOffers)
      } catch (err) {
        console.log('Error fetching active offers:', err)
      }
    }
    fetchActiveOffers()
  }, [])

  // Helper function to get offer for a product
  const getProductOffer = (productId) => {
    for (const offer of activeOffers) {
      if (offer.products && offer.products.some(p => (p._id || p) === productId)) {
        const product = offer.products.find(p => (p._id || p) === productId)
        const originalPrice = product.price || 0
        let discountAmount = 0
        let finalPrice = originalPrice
        
        if (offer.discountType === "percentage") {
          discountAmount = (originalPrice * offer.discountValue) / 100
          finalPrice = originalPrice - discountAmount
        } else if (offer.discountType === "value") {
          discountAmount = offer.discountValue
          finalPrice = originalPrice - discountAmount
        }
        
        return {
          ...offer,
          discountAmount,
          finalPrice,
          originalPrice,
        }
      }
    }
    return null
  }

  // Read category from URL query parameter and update when URL changes
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      console.log('Category from URL:', categoryFromUrl)
      // Special handling for "offers" category
      if (categoryFromUrl === "offers") {
        // Don't set selectedCategories for offers, we'll handle it in fetchProducts
        setSelectedCategories([])
      } else {
        // Try to find matching category from available categories
        // This ensures we use the correct format that exists in the database
        let categoryToUse = categoryFromUrl
        
        if (categories.length > 0) {
          // First try to match against actual categories from database
          const matchedCategory = findMatchingCategory(categoryFromUrl, categories)
          if (matchedCategory) {
            categoryToUse = matchedCategory
          } else {
            // If no match found, try using the mapping utility
            const mappedName = getCategoryNameFromKey(categoryFromUrl)
            // Check if the mapped name exists in available categories
            if (mappedName && categories.includes(mappedName)) {
              categoryToUse = mappedName
            } else {
              // Use the mapped name anyway (backend might accept it)
              categoryToUse = mappedName || categoryFromUrl
            }
          }
        } else {
          // If categories not loaded yet, use the mapping
          categoryToUse = getCategoryNameFromKey(categoryFromUrl) || categoryFromUrl
        }
        
        console.log('Matched category:', categoryToUse, 'from URL key:', categoryFromUrl)
        setSelectedCategories([categoryToUse])
        console.log('Setting selectedCategories to:', [categoryToUse])
      }
    } else {
      // Clear selection if no category in URL
      setSelectedCategories([])
    }
    setCurrentPage(1)
  }, [searchParams, categories])

  // Use string representations for stable dependency comparison
  const selectedCategoriesStr = selectedCategories.join(',');
  const selectedBrandiesStr = selectedBrandies.join(',');

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const categoryFromUrl = searchParams.get('category')
      
      // Special handling for "offers" category - only if no selectedCategories override it
      if (categoryFromUrl === "offers" && selectedCategoriesStr === "") {
        // Fetch products from active offers
        const res = await axios.get(`${BASE_URL}/offer/active`)
        const allOffers = res.data.offers || []
        
        // Filter for discount type offers only (not coupon)
        const discountOffers = allOffers.filter((offer) => offer.type === "discount")
        
        // Flatten products from all discount offers with offer details
        const offerProducts = []
        discountOffers.forEach((offer) => {
          if (offer.products && offer.products.length > 0) {
            offer.products.forEach((product) => {
              // Calculate discount price
              const originalPrice = product.price || 0
              let discountAmount = 0
              let finalPrice = originalPrice
              
              if (offer.discountType === "percentage") {
                discountAmount = (originalPrice * offer.discountValue) / 100
                finalPrice = originalPrice - discountAmount
              } else if (offer.discountType === "value") {
                discountAmount = offer.discountValue
                finalPrice = originalPrice - discountAmount
              }
              
              offerProducts.push({
                ...product,
                offerId: offer._id,
                offerName: offer.name,
                discountType: offer.discountType,
                discountValue: offer.discountValue,
                discountAmount,
                finalPrice,
                originalPrice,
                startDate: offer.startDate,
                endDate: offer.endDate,
              })
            })
          }
        })
        
        // Apply pagination
        const limit = 9
        const startIndex = (currentPage - 1) * limit
        const endIndex = startIndex + limit
        const paginatedProducts = offerProducts.slice(startIndex, endIndex)
        const totalPagesCount = Math.ceil(offerProducts.length / limit)
        
        setProducts(paginatedProducts)
        setTotalPages(totalPagesCount)
      } else {
        // Regular product fetching
        const params = {
          page: currentPage,
          limit: 9,
          sort: sortOption
        }
        
        // Only add categories if there are selected categories
        if (selectedCategoriesStr) {
          params.categories = selectedCategoriesStr
        }
        
        // Only add brands if there are selected brands
        if (selectedBrandiesStr) {
          params.brands = selectedBrandiesStr
        }

        console.log('Fetching products with params:', params)
        console.log('Selected categories:', selectedCategoriesStr)

        const res = await axios.get(`${BASE_URL}/product`, {
          params: params,
          withCredentials: true
        })
        
        console.log('Products received:', res.data.products?.length || 0, 'products')
        console.log('Sample product categories:', res.data.products?.slice(0, 3).map(p => p.category))
        
        setProducts(res.data.products || [])
        setTotalPages(res.data.totalPages || 1)
      }
    } catch (err) {
      console.log('Error fetching products:', err)
      setProducts([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [currentPage, selectedCategoriesStr, selectedBrandiesStr, sortOption, searchParams])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleCategoryChange = (cat) => {
    const categoryFromUrl = searchParams.get('category')
    
    // If currently on offers page, update URL to the selected category
    if (categoryFromUrl === "offers") {
      // Update URL to show the selected category
      setSearchParams({ category: cat })
      setSelectedCategories([cat])
    } else {
      // Normal category toggle behavior
      setSelectedCategories(prev =>
        prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
      )
      // Update URL to reflect the selection
      const newCategories = selectedCategories.includes(cat) 
        ? selectedCategories.filter(c => c !== cat)
        : [...selectedCategories, cat]
      
      if (newCategories.length === 0) {
        // If no categories selected, remove category from URL
        setSearchParams({})
      } else if (newCategories.length === 1) {
        // Single category, use it in URL
        setSearchParams({ category: newCategories[0] })
      } else {
        // Multiple categories - keep current URL or use first one
        // For simplicity, we'll use the first category
        setSearchParams({ category: newCategories[0] })
      }
    }
    setCurrentPage(1)
  }

  const handleBrandChange = (brand) => {
    setSelectedBrandies(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    )
    setCurrentPage(1)
  }

  const AddToCart = async (product) => {
    try {
      if (!product || !product._id) {
        toast.error(lang === "ar" ? "خطأ: المنتج غير صحيح" : "Error: Invalid product");
        return;
      }

      // Check if product is out of stock
      if (product.stock !== undefined && product.stock <= 0) {
        toast.error(lang === "ar" ? "المنتج غير متوفر" : "Product is out of stock");
        return;
      }
      
      if (user && user._id) {
        const payload = { 
          userId: user._id,
          productId: product._id
        };
        
        const response = await axios.post(`${BASE_URL}/wish/add`, payload, { withCredentials: true });
        
        // Check if product was already in wishlist
        if (response.data.message && response.data.message.includes("Already in wishlist")) {
          toast(lang === "ar" ? "هذا المنتج موجود بالفعل في السلة ❤️" : "This product is already in cart ❤️");
        } else {
          toast.success(lang === "ar" ? "✅ تمت الإضافة للسلة" : "✅ Added to cart");
        }
        window.dispatchEvent(new Event("wishlistUpdated"));
      } else {
        let localWish = JSON.parse(localStorage.getItem("localWish")) || [];
        const exists = localWish.find((item) => item._id === product._id);
        if (exists) {
          toast(lang === "ar" ? "موجود بالفعل ❤️" : "Already in cart ❤️");
          return;
        }
        
        // Check if product has an active offer (from offers page or regular products with offers)
        const isOfferProduct = searchParams.get('category') === 'offers' && product.discountType;
        const offer = isOfferProduct ? {
          discountType: product.discountType,
          discountValue: product.discountValue,
          originalPrice: product.originalPrice,
          finalPrice: product.finalPrice
        } : getProductOffer(product._id);
        
        // Use finalPrice if available, otherwise use original price
        const priceToUse = offer ? offer.finalPrice : (product.finalPrice || product.price || 0);
        
        localWish.push({ 
          ...product, 
          quantity: 1,
          type: "product",
          price: priceToUse,
          // Store offer info for display
          offerInfo: offer ? {
            discountType: offer.discountType,
            discountValue: offer.discountValue,
            originalPrice: offer.originalPrice,
            finalPrice: offer.finalPrice,
          } : undefined,
        });
        localStorage.setItem("localWish", JSON.stringify(localWish));
        toast.success(lang === "ar" ? "تمت الإضافة ✅" : "Added ✅");
        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      
      // Handle "already in wishlist" as a success case
      const errorMessage = err.response?.data?.message || "";
      if (errorMessage.includes("already in the wishlist") || errorMessage.includes("Already in wishlist")) {
        toast(lang === "ar" ? "هذا المنتج موجود بالفعل في السلة ❤️" : "This product is already in cart ❤️");
        window.dispatchEvent(new Event("wishlistUpdated"));
        return;
      }
      
      // For other errors, show error message
      const finalErrorMessage = errorMessage || err.message || (lang === "ar" ? "خطأ أثناء الإضافة" : "Error adding");
      toast.error(finalErrorMessage);
    }
  };

 

  const categoryFromUrl = searchParams.get('category')
  const isOffersPage = categoryFromUrl === 'offers'

  return (
    <section className="products-page">
      <div className="products-header">
        <h1>{isOffersPage ? (t("offers") || "Offers") : t("OurProducts")}</h1>
        <p>{isOffersPage ? (t("offersSub") || t("specialOffersSub") || "Special offers and discounts") : t("OurProductsSub")}</p>
      </div>

      <div className="products-container">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <div className="filter-section">
            <h3 className="filter-title">{t("Categories")}</h3>
            {/* Show Offers option only if there are active offers */}
            {activeOffers.length > 0 && (
              <div className="filter-option">
                <input
                  type="checkbox"
                  checked={isOffersPage}
                  onChange={() => {
                    if (isOffersPage) {
                      // If offers is selected, clear it
                      setSearchParams({})
                      setSelectedCategories([])
                    } else {
                      // Navigate to offers
                      setSearchParams({ category: 'offers' })
                      setSelectedCategories([])
                    }
                    setCurrentPage(1)
                  }}
                />
                <label>{t("offers") || "Offers"}</label>
              </div>
            )}
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
            <p className="products-count">
              {loading ? (lang === "ar" ? "جاري التحميل..." : "Loading...") : `${products.length} - ${t("ProductsFound")}`}
            </p>
            <div className="sort-options">
              <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
                disabled={loading}
              >
                <option value="relavent">{t("Sortby")}</option>
                <option value="low-high">{t("PriceLow")}</option>
                <option value="high-low">{t("PriceHigh")}</option>
              </select>
            </div>
          </div>

          <div className={`products-grid ${loading ? 'loading-state' : ''}`}>
            {loading ? (
              <div className="products-loading-overlay">
                <Loading />
              </div>
            ) : products.length > 0 ? (
              products.map((p) => {
                // For offer products, use the offer info already in the product object
                // For regular products, get offer info from activeOffers
                const isOfferProduct = searchParams.get('category') === 'offers' && p.discountType
                const offer = isOfferProduct ? {
                  discountType: p.discountType,
                  discountValue: p.discountValue,
                  originalPrice: p.originalPrice,
                  finalPrice: p.finalPrice
                } : getProductOffer(p._id)
                
                return (
                  <Link key={p._id} to={`/product/${p._id}`} className="product-card">
                    {offer && (
                      <div className="product-offer-badge">
                        {offer.discountType === "percentage"
                          ? `${offer.discountValue}% ${lang === "ar" ? "خصم" : "OFF"}`
                          : `${offer.discountValue} ${lang === "ar" ? "خصم" : "OFF"}`}
                      </div>
                    )}
                    <div
                      className="product-image"
                      style={{ backgroundImage: `url(${p.image})` }}
                    >
                      
                    </div>
                    <div className="product-content">
                      {p.brand && (
                        <p className="product-brand">{p.brand}</p>
                      )}
                      <h4 className="product-name">{p.title}</h4>
                      <p className="product-category">{p.category}</p>
                      <p className="product-description">{p.description}</p>
                      {p.stock !== undefined && p.stock <= 0 && (
                        <div className="out-of-stock-badge">
                          {lang === "ar" ? "غير متوفر" : "Out of Stock"}
                        </div>
                      )}
                      <div className="product-footer">
                        {offer ? (
                          <div className="product-price-with-offer">
                            <span className="old-price">${offer.originalPrice.toFixed(2)}</span>
                            <span className="new-price">${offer.finalPrice.toFixed(2)}</span>
                          </div>
                        ) : (
                          <p className="product-price">${typeof p.price === 'number' ? p.price.toFixed(2) : p.price}</p>
                        )}
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            AddToCart(p);
                          }} 
                          className="add-to-cart-btn"
                          disabled={p.stock !== undefined && p.stock <= 0}
                        >
                          {p.stock !== undefined && p.stock <= 0 
                            ? (lang === "ar" ? "غير متوفر" : "Out of Stock")
                            : (lang === "ar" ? "أضف للسلة" : "Add to Cart")
                          }
                        </button>
                      </div>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="no-products-message">
                <p>{lang === "ar" ? "لا توجد منتجات متاحة" : "No products available"}</p>
              </div>
            )}
          </div>

          {!loading && totalPages > 1 && (
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
          )}
        </main>
      </div>
    </section>
  )
}

export default Product
