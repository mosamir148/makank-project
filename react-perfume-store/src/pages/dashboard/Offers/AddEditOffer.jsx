import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../../../assets/url";
import Loading from "../../../components/Loading/Loading";
import Pagination from "../../../components/dashboard/Pagination/Pagination";
import { useLang } from "../../../context/LangContext";
import "./AddEditOffer.css";

const AddEditOffer = () => {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [productsLoading, setProductsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all products for selected section
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    type: "discount", // "coupon" or "discount"
    discountType: "percentage", // "percentage" or "value"
    discountValue: "",
    discountCode: "",
    startDate: "",
    endDate: "",
  });

  const fetchAllProducts = useCallback(async () => {
    try {
      // Fetch all products for selected products section
      const res = await axios.get(`${BASE_URL}/product?limit=10000`);
      setAllProducts(res.data.products || []);
    } catch (err) {
      console.error("Failed to fetch all products");
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
      };
      
      // Add search query if provided
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      const res = await axios.get(`${BASE_URL}/product`, { params });
      setProducts(res.data.products || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalProducts(res.data.totalProducts || 0);
    } catch (err) {
      console.error(err);
      toast.error("فشل في تحميل المنتجات");
    } finally {
      setProductsLoading(false);
    }
  }, [currentPage, pageSize, searchQuery]);

  useEffect(() => {
    fetchAllProducts();
    if (isEditMode) {
      fetchOfferData();
    }
  }, [id, fetchAllProducts]);

  useEffect(() => {
    // Reset to page 1 when search query changes
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const fetchOfferData = async () => {
    try {
      setInitialLoading(true);
      const res = await axios.get(`${BASE_URL}/offer/${id}`, { withCredentials: true });
      const offer = res.data.offer;

      setFormData({
        name: offer.name,
        type: offer.type,
        discountType: offer.discountType,
        discountValue: String(offer.discountValue),
        discountCode: offer.discountCode || offer.couponName || "",
        startDate: offer.startDate ? new Date(offer.startDate).toISOString().slice(0, 16) : "",
        endDate: offer.endDate ? new Date(offer.endDate).toISOString().slice(0, 16) : "",
      });
      setSelectedProducts(offer.products.map((p) => p._id || p));
    } catch (err) {
      console.error(err);
      toast.error("فشل في تحميل بيانات العرض");
      navigate("/dashboard/offers");
    } finally {
      setInitialLoading(false);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.discountValue || !formData.startDate || !formData.endDate) {
      toast.error(t("fillRequiredFields") || "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (formData.type === "coupon" && !formData.discountCode) {
      toast.error(t("enterDiscountCode") || "يرجى إدخال كود الخصم");
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error(t("selectAtLeastOneProduct") || "يرجى اختيار منتج واحد على الأقل");
      return;
    }

    try {
      setLoading(true);
      const offerData = {
        name: formData.name,
        type: formData.type,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        products: selectedProducts,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      if (formData.type === "coupon" && formData.discountCode) {
        offerData.discountCode = formData.discountCode;
      }

      if (isEditMode) {
        await axios.put(`${BASE_URL}/offer/${id}`, offerData, { withCredentials: true });
        toast.success("تم تحديث العرض بنجاح");
      } else {
        await axios.post(`${BASE_URL}/offer`, offerData, { withCredentials: true });
        toast.success("تم إنشاء العرض بنجاح");
      }

      navigate("/dashboard/offers");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "حدث خطأ أثناء حفظ العرض");
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts((prev) => prev.filter((id) => id !== productId));
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p._id));
    }
  };

  const calculateDiscountAmount = (originalPrice) => {
    if (!formData.discountValue || !originalPrice) return 0;
    
    const discountValue = parseFloat(formData.discountValue);
    const price = parseFloat(originalPrice);
    
    if (formData.discountType === "percentage") {
      return price * discountValue / 100;
    } else {
      return discountValue;
    }
  };

  const calculateDiscountPrice = (originalPrice) => {
    if (!formData.discountValue || !originalPrice) return originalPrice;
    
    const discountValue = parseFloat(formData.discountValue);
    const price = parseFloat(originalPrice);
    
    if (formData.discountType === "percentage") {
      return price - (price * discountValue / 100);
    } else {
      return Math.max(0, price - discountValue);
    }
  };

  if (initialLoading) return <Loading />;

  return (
    <div className="add-edit-offer-container">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate("/dashboard/offers")}>
          ← {t("back") || "رجوع"}
        </button>
        <h2>{isEditMode ? t("editOffer") || "تعديل العرض" : t("addNewOffer") || "إضافة عرض جديد"}</h2>
      </div>

      <form onSubmit={handleSubmit} className="offer-form-page">
        {/* Offer Name */}
        <div className="form-group">
          <label>{t("offerName") || "اسم العرض"} *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder={t("enterOfferName") || "أدخل اسم العرض"}
          />
        </div>

        {/* Offer Type */}
        <div className="form-group">
          <label>{t("offerType") || "نوع العرض"} *</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="type"
                value="discount"
                checked={formData.type === "discount"}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
              <span>{t("directDiscount") || "خصم مباشر"}</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="type"
                value="coupon"
                checked={formData.type === "coupon"}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
              <span>{t("coupon") || "كوبون"}</span>
            </label>
          </div>
        </div>

        {/* Discount Code - Only show when type is coupon */}
        {formData.type === "coupon" && (
          <div className="form-group">
            <label>{t("discountCode") || "كود الخصم"} *</label>
            <input
              type="text"
              value={formData.discountCode}
              onChange={(e) => setFormData({ ...formData, discountCode: e.target.value })}
              required
              placeholder={t("enterDiscountCode") || "أدخل كود الخصم"}
            />
          </div>
        )}

        {/* Discount Type */}
        <div className="form-group">
          <label>{t("discountType") || "نوع الخصم"} *</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="discountType"
                value="percentage"
                checked={formData.discountType === "percentage"}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              />
              <span>{t("percentage") || "نسبة مئوية"}</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="discountType"
                value="value"
                checked={formData.discountType === "value"}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              />
              <span>{t("fixedAmount") || "مبلغ ثابت"}</span>
            </label>
          </div>
        </div>

        {/* Discount Value */}
        <div className="form-group">
          <label>
            {formData.discountType === "percentage"
              ? t("discountPercentage") || "نسبة الخصم (%)"
              : t("discountValue") || "قيمة الخصم"}{" "}
            *
          </label>
          <input
            type="number"
            value={formData.discountValue}
            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
            required
            min="0"
            step={formData.discountType === "percentage" ? "1" : "0.01"}
            placeholder={formData.discountType === "percentage" ? "10" : "50"}
          />
        </div>

        {/* Dates */}
        <div className="form-row">
          <div className="form-group">
            <label>{t("startDate") || "تاريخ البدء"} *</label>
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>{t("endDate") || "تاريخ الانتهاء"} *</label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Selected Products Section */}
        {selectedProducts.length > 0 && (
          <div className="form-group">
            <label>{t("selectedProducts") || "المنتجات المحددة"} ({selectedProducts.length})</label>
            <div className="selected-products-section">
              <div className="selected-products-grid">
                {allProducts
                  .filter((p) => selectedProducts.includes(p._id))
                  .map((product) => {
                    const originalPrice = product.price || 0;
                    const finalPrice = calculateDiscountPrice(originalPrice);
                    const discountAmount = calculateDiscountAmount(originalPrice);
                    
                    return (
                      <div key={product._id} className="selected-product-card">
                        <div className="product-info">
                          <div className="product-name">{product.title}</div>
                          <div className="product-price-details">
                            <div className="price-row">
                              <span className="price-label">{t("originalPrice") || "السعر الأصلي"}:</span>
                              <span className="original-price">{originalPrice.toFixed(2)}</span>
                            </div>
                            {formData.discountValue && (
                              <>
                                <div className="price-row">
                                  <span className="price-label">{t("discount") || "الخصم"}:</span>
                                  <span className="discount-value">
                                    {formData.discountType === "percentage" 
                                      ? `${formData.discountValue}%` 
                                      : formData.discountValue}
                                  </span>
                                </div>
                                <div className="price-row">
                                  <span className="price-label">{t("discountAmount") || "قيمة الخصم"}:</span>
                                  <span className="discount-amount">{discountAmount.toFixed(2)}</span>
                                </div>
                                <div className="price-row final-price-row">
                                  <span className="price-label">{t("priceAfterDiscount") || "السعر بعد الخصم"}:</span>
                                  <span className="final-price">{finalPrice.toFixed(2)}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="remove-product-btn"
                          onClick={() => handleRemoveProduct(product._id)}
                          title={t("remove") || "إزالة"}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Products Selection */}
        <div className="form-group">
          <label>{t("products") || "المنتجات"} *</label>
          <div className="products-selection">
            <div className="search-bar">
              <input
                type="text"
                placeholder={t("searchProducts") || "بحث عن منتجات..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
                    <button type="button" onClick={toggleSelectAll} className="select-all-btn">
                      {selectedProducts.length === products.length
                        ? t("deselectAll") || "إلغاء تحديد الكل"
                        : t("selectAll") || "تحديد الكل"}
                    </button>
            </div>
            {productsLoading ? (
              <div className="products-loading">
                <Loading />
              </div>
            ) : (
              <>
            <div className="products-grid-wrapper">
              <div className="products-grid">
                {products.length === 0 ? (
                  <div className="no-products-message">
                    {t("noProductsFound") || "لا توجد منتجات"}
                  </div>
                ) : (
                  products.map((product) => {
                const originalPrice = product.price || 0;
                const finalPrice = calculateDiscountPrice(originalPrice);
                const discountAmount = calculateDiscountAmount(originalPrice);
                const isSelected = selectedProducts.includes(product._id);
                
                return (
                  <div
                    key={product._id}
                    className={`product-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleProductSelect(product._id)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleProductSelect(product._id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="product-info">
                      <div className="product-name">{product.title}</div>
                      <div className="product-price-details">
                        <div className="price-row">
                          <span className="price-label">{t("originalPrice") || "السعر الأصلي"}:</span>
                          <span className="original-price">{originalPrice.toFixed(2)}</span>
                        </div>
                        {formData.discountValue && (
                          <>
                            <div className="price-row">
                              <span className="price-label">{t("discount") || "الخصم"}:</span>
                              <span className="discount-value">
                                {formData.discountType === "percentage" 
                                  ? `${formData.discountValue}%` 
                                  : formData.discountValue}
                              </span>
                            </div>
                            <div className="price-row">
                              <span className="price-label">{t("discountAmount") || "قيمة الخصم"}:</span>
                              <span className="discount-amount">{discountAmount.toFixed(2)}</span>
                            </div>
                            <div className="price-row final-price-row">
                              <span className="price-label">{t("priceAfterDiscount") || "السعر بعد الخصم"}:</span>
                              <span className="final-price">{finalPrice.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                }))}
              </div>
            </div>
            <div className="selected-count">
              {t("selectedProducts") || "المنتجات المحددة"}: {selectedProducts.length}
            </div>
            {totalProducts > 0 && (
              <div className="pagination-container">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  pageSize={pageSize}
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setCurrentPage(1);
                  }}
                  totalItems={totalProducts}
                />
              </div>
            )}
              </>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? t("saving") || "جاري الحفظ..." : isEditMode ? t("update") || "تحديث" : t("create") || "إنشاء"}
          </button>
          <button type="button" onClick={() => navigate("/dashboard/offers")} className="cancel-btn">
            {t("cancel") || "إلغاء"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditOffer;

