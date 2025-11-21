import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "./AddProduct.css";
import { BASE_URL } from "../../../../assets/url";
import { useLang } from "../../../../context/LangContext";

const AddProduct = () => {
  const { t, lang } = useLang();
  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("");
  const [shippingPrice, setShippingPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (submitting) {
      return;
    }
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("price", price);
      formData.append("purchasePrice", purchasePrice || price);
      formData.append("category", category);
      formData.append("brand", brand);
      formData.append("description", description);
      formData.append("stock", stock || 0);
      formData.append("shippingPrice", shippingPrice || 0);
      if (image) formData.append("image", image);
      images.forEach((img) => formData.append("images", img));

      await axios.post(`${BASE_URL}/product`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(t("productAdded"));
      setTitle(""); setPrice(""); setPurchasePrice("");
      setCategory(""); setBrand(""); setDescription(""); setStock("");
      setShippingPrice(""); setImage(null); setImages([]);
      navigate("/dashboard/products");
    } catch (err) {
      console.error(err.response?.data);
      toast.error(err.response?.data?.message || t("errorAddingProduct"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const removeGalleryImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="add-product-container">
      <div className="add-product-header">
        <button className="back-btn" onClick={() => navigate("/dashboard/products")}>
          {lang === "ar" ? "← " : ""}{t("back") || "Back"}{lang === "en" ? " ←" : ""}
        </button>
        <h2>{t("addNewProduct") || "Add New Product"}</h2>
      </div>

      <form className="add-product-form" onSubmit={handleSubmit}>
        <div className="add-product-content">
          <div className="product-images-section">
            <div className="main-image-section">
              <label className="image-label">{t("mainImage") || "Main Image"} *</label>
              <div className="main-image">
                {image && (
                  <img 
                    src={typeof image === 'string' ? image : URL.createObjectURL(image)} 
                    alt={title || "Product"} 
                  />
                )}
                {!image && (
                  <div className="image-placeholder">
                    <span className="placeholder-icon">📷</span>
                    <span className="placeholder-text">{t("selectMainImage") || "Select main image"}</span>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setImage(e.target.files[0])}
                className="file-input"
                id="main-image-input"
                required
              />
              <label htmlFor="main-image-input" className="file-input-button">
                <span>{t("chooseFile") || "Choose File"}</span>
              </label>
            </div>

            <div className="gallery-section">
              <label className="image-label">{t("galleryImages") || "Gallery Images"}</label>
              {images.length > 0 && (
                <div className="gallery-images">
                  {images.map((img, index) => (
                    <div key={index} className="gallery-image-wrapper">
                      <img 
                        src={typeof img === 'string' ? img : URL.createObjectURL(img)} 
                        alt={`Gallery ${index + 1}`}
                      />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeGalleryImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const selectedFiles = Array.from(e.target.files);
                  setImages(prev => [...prev, ...selectedFiles]);
                }}
                className="file-input"
                id="gallery-images-input"
              />
              <label htmlFor="gallery-images-input" className="file-input-button">
                <span>{t("addGalleryImages") || "Add Gallery Images"}</span>
              </label>
            </div>
          </div>

          <div className="product-form-section">
            <div className="info-card">
              <h3>{t("basicInformation") || "Basic Information"}</h3>
              <div className="info-grid">
                <div className="form-group">
                  <label className="form-label">{t("productTitle") || "Product Name"} *</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder={t("enterProductName") || "Enter product name"}
                    required 
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t("category") || "Category"} *</label>
                  <select 
                    value={category} 
                    onChange={handleCategoryChange} 
                    required
                    className="form-input"
                  >
                    <option value="">{t("selectCategory") || "Select Category"}</option>
                    <option value="perfumes">{t("categoryPerfumes") || "Perfumes"}</option>
                    <option value="oud-charcoal">{t("categoryOudCharcoal") || "Oud Charcoal"}</option>
                    <option value="incense">{t("categoryIncense") || "Incense"}</option>
                    <option value="accessories">{t("categoryAccessories") || "Accessories"}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t("brand") || "Brand"} *</label>
                  <input 
                    type="text" 
                    value={brand} 
                    onChange={(e) => setBrand(e.target.value)} 
                    placeholder={t("enterBrand") || "Enter brand"}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t("price") || "Price"} *</label>
                  <input 
                    type="text" 
                    inputMode="decimal"
                    value={price} 
                    onChange={(e) => {
                      // Allow only numbers and one decimal point
                      const value = e.target.value;
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setPrice(value);
                      }
                    }}
                    onBlur={(e) => {
                      // Ensure valid number format on blur, but preserve exact value
                      const value = e.target.value.trim();
                      if (value !== "" && !isNaN(parseFloat(value)) && parseFloat(value) >= 0) {
                        // Keep the exact value as entered (don't round)
                        setPrice(value);
                      } else if (value !== "") {
                        // If invalid, clear it
                        setPrice("");
                      }
                    }}
                    placeholder={t("enterPrice") || "Enter price"}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t("purchasePrice") || "Purchase Price"}</label>
                  <input 
                    type="text" 
                    inputMode="decimal"
                    value={purchasePrice} 
                    onChange={(e) => {
                      // Allow only numbers and one decimal point
                      const value = e.target.value;
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setPurchasePrice(value);
                      }
                    }}
                    onBlur={(e) => {
                      // Ensure valid number format on blur, but preserve exact value
                      const value = e.target.value.trim();
                      if (value !== "" && !isNaN(parseFloat(value)) && parseFloat(value) >= 0) {
                        setPurchasePrice(value);
                      } else if (value !== "") {
                        setPurchasePrice("");
                      }
                    }}
                    placeholder={t("enterPurchasePrice") || "Enter purchase price"}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t("availableQuantity") || "Available Quantity (Stock)"}</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    value={stock} 
                    onChange={(e) => {
                      // Allow only whole numbers (no decimals, no negatives)
                      const value = e.target.value;
                      if (value === "" || /^\d+$/.test(value)) {
                        setStock(value);
                      }
                    }}
                    onBlur={(e) => {
                      // Ensure valid whole number on blur
                      const value = e.target.value.trim();
                      if (value !== "" && /^\d+$/.test(value)) {
                        const numValue = parseInt(value, 10);
                        if (numValue >= 0) {
                          setStock(numValue.toString());
                        } else {
                          setStock("");
                        }
                      } else if (value !== "") {
                        setStock("");
                      }
                    }}
                    placeholder={t("enterStock") || "Enter stock quantity"}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t("shippingPrice") || "Shipping Price"}</label>
                  <input 
                    type="text" 
                    inputMode="decimal"
                    value={shippingPrice} 
                    onChange={(e) => {
                      // Allow only numbers and one decimal point
                      const value = e.target.value;
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setShippingPrice(value);
                      }
                    }}
                    onBlur={(e) => {
                      // Ensure valid number format on blur, but preserve exact value
                      const value = e.target.value.trim();
                      if (value !== "" && !isNaN(parseFloat(value)) && parseFloat(value) >= 0) {
                        setShippingPrice(value);
                      } else if (value !== "") {
                        setShippingPrice("");
                      }
                    }}
                    placeholder={t("enterShippingPrice") || "Enter shipping price"}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="description-card">
              <h3>{t("description") || "Description"}</h3>
              <textarea
                rows="6"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("enterDescription") || "Enter product description"}
                className="form-textarea"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? (t("addingProduct") || "Adding Product...") : (t("addProduct") || "Add Product")}
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => navigate("/dashboard/products")}
              >
                {t("cancel") || "Cancel"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
