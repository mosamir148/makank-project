import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./UpdateProduct.css";
import { BASE_URL } from "../../../../assets/url";
import Loading from "../../../../components/Loading/Loading";
import { useLang } from "../../../../context/LangContext";

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();

  const [product, setProduct] = useState(null);
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/product/${id}`);
        const data = res.data.product;
        setProduct(data);
        setTitle(data.title);
        setPrice(data.price);
        setPurchasePrice(data.purchasePrice || "");
        setCategory(data.category);
        setDescription(data.description);
        setBrand(data.brand);
        setStock(data.stock || "");
        setShippingPrice(data.shippingPrice || "");
        setImage(data.image);
        setImages(data.images || []);
        setLoading(false);
      } catch (err) {
        console.log(err);
        toast.error(t("failedToLoad") + " " + (t("productDetails") || "Product Details"));
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleImagesChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeGalleryImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      if (image && typeof image !== 'string') formData.append("image", image);
      images.forEach((img) => {
        if (typeof img !== 'string') formData.append("images", img);
      });

      await axios.put(`${BASE_URL}/product/${id}`, formData, {
        withCredentials: true,
      });

      toast.success(t("productUpdated") || "Product updated successfully!");
      navigate("/dashboard/products");
    } catch (err) {
      console.log(err.response ? err.response.data : err);
      toast.error(t("failedToUpdate") || "Failed to update product!");
    }
  };

  if (loading) return <Loading />;
  if (!product) return <div className="error-message">{t("productNotFound") || "Product not found"}</div>;

  return (
    <div className="update-product-container">
      <div className="update-product-header">
        <button className="back-btn" onClick={() => navigate("/dashboard/products")}>
          {lang === "ar" ? "← " : ""}{t("back") || "Back"}{lang === "en" ? " ←" : ""}
        </button>
        <h2>{t("updateProduct") || "Update Product"}</h2>
      </div>

      <form className="update-product-form" onSubmit={handleSubmit}>
        <div className="update-product-content">
          <div className="product-images-section">
            <div className="main-image-section">
              <label className="image-label">{t("mainImage") || "Main Image"}</label>
              <div className="main-image">
                {image && (
                  <img 
                    src={typeof image === 'string' ? image : URL.createObjectURL(image)} 
                    alt={title || "Product"} 
                  />
                )}
                {!image && product.image && (
                  <img src={product.image} alt={product.title} />
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="file-input"
              />
            </div>

            {((images && images.length > 0) || (product.images && product.images.length > 0)) && (
              <div className="gallery-section">
                <label className="image-label">{t("galleryImages") || "Gallery Images"}</label>
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
                  {product.images && product.images.map((img, index) => (
                    <div key={`existing-${index}`} className="gallery-image-wrapper">
                      <img src={img} alt={`Existing ${index + 1}`} />
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  className="file-input"
                />
              </div>
            )}
            {(!images || images.length === 0) && (!product.images || product.images.length === 0) && (
              <div className="gallery-section">
                <label className="image-label">{t("galleryImages") || "Gallery Images"}</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  className="file-input"
                />
              </div>
            )}
          </div>

          <div className="product-form-section">
            <div className="info-card">
              <h3>{t("basicInformation") || "Basic Information"}</h3>
              <div className="info-grid">
                <div className="form-group">
                  <label className="form-label">{t("productTitle") || "Product Name"}</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t("category") || "Category"}</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
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
                  <label className="form-label">{t("brand") || "Brand"}</label>
                  <input 
                    type="text" 
                    value={brand} 
                    onChange={(e) => setBrand(e.target.value)} 
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t("price") || "Price"}</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t("purchasePrice") || "Purchase Price"}</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={purchasePrice} 
                    onChange={(e) => setPurchasePrice(e.target.value)}
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
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t("shippingPrice") || "Shipping Price"}</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={shippingPrice} 
                    onChange={(e) => setShippingPrice(e.target.value)}
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
                className="form-textarea"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">{t("updateProduct") || "Update Product"}</button>
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

export default UpdateProduct;
