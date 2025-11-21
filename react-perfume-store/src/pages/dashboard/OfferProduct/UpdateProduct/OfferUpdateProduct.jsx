import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../../Product/UpdateProduct/UpdateProduct.css";
import { BASE_URL } from "../../../../assets/url";
import Loading from "../../../../components/Loading/Loading";
import { useLang } from "../../../../context/LangContext";

const OfferUpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();

  const [product, setProduct] = useState(null);
  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/offerProduct/${id}`);
        const data = res.data.product;
        setProduct(data);
        setTitle(data.title || "");
        setPrice(data.price || "");
        setDiscount(data.discount || "");
        setCategory(data.category || "");
        setDescription(data.description || "");
        setBrand(data.brand || "");
        setImage(data.image || null);
        setImages(data.images || []);
        setStartDate(data.startDate?.split("T")[0] || ""); // yyyy-mm-dd
        setEndDate(data.endDate?.split("T")[0] || "");
        setLoading(false);
      } catch (err) {
        console.log(err);
        toast.error(t("failedToLoad") + " " + t("productDetails"));
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
      formData.append("discount", discount);
      formData.append("category", category);
      formData.append("brand", brand);
      formData.append("description", description);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      if (image && typeof image !== 'string') formData.append("image", image);
      images.forEach((img) => {
        if (typeof img !== 'string') formData.append("images", img);
      });

      await axios.put(`${BASE_URL}/offerProduct/${id}`, formData, {
        withCredentials: true,
      });

      toast.success(t("offerUpdated"));
      navigate("/dashboard/offers");
    } catch (err) {
      console.error("Error updating product:", err);
      toast.error(err.response?.data?.message || t("failedToUpdate") + " " + t("adminOffers"));
    }
  };

  if (loading) return <Loading />;
  if (!product) return <div className="error-message">{t("productNotFound")}</div>;

  return (
    <div className="update-product-container">
      <div className="update-product-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate("/dashboard/offers")}>
            <span className="back-icon">←</span>
            <span>{t("back")}</span>
          </button>
          <div className="header-title-section">
            <h2>{t("updateProduct")}</h2>
            <p className="header-subtitle">{product.title || t("productDetails")}</p>
          </div>
        </div>
      </div>

      <form className="update-product-form" onSubmit={handleSubmit}>
        <div className="update-product-content">
          <div className="product-images-section">
            <div className="image-card">
              <div className="main-image-section">
                <label className="image-label">
                  <span className="label-icon">🖼️</span>
                  {t("mainImageLabel")}
                </label>
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
                  {!image && !product.image && (
                    <div className="image-placeholder">
                      <span className="placeholder-icon">📷</span>
                      <span className="placeholder-text">{t("noImage") || "No Image"}</span>
                    </div>
                  )}
                </div>
                <label className="file-input-label">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  <span className="file-input-button">
                    <span className="upload-icon">📤</span>
                    {t("chooseImage") || "Choose Image"}
                  </span>
                </label>
              </div>
            </div>

            <div className="image-card">
              <div className="gallery-section">
                <label className="image-label">
                  <span className="label-icon">🖼️</span>
                  {t("galleryImagesLabel")}
                </label>
                {((images && images.length > 0) || (product.images && product.images.length > 0)) && (
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
                          title={t("remove") || "Remove"}
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
                )}
                <label className="file-input-label">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesChange}
                    className="file-input"
                  />
                  <span className="file-input-button">
                    <span className="upload-icon">📤</span>
                    {t("addImages") || "Add Images"}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="product-form-section">
            <div className="form-card">
              <h3 className="form-card-title">{t("productInformation") || "Product Information"}</h3>
              
              <div className="form-group">
                <label className="form-label">{t("productTitle")}</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                  placeholder={t("enterProductTitle") || "Enter product title"}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t("productPrice")}</label>
                  <input 
                    type="number" 
                    className="form-input"
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    required 
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t("discount")}</label>
                  <input 
                    type="number" 
                    className="form-input"
                    value={discount} 
                    onChange={(e) => setDiscount(e.target.value)} 
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t("section")}</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  required 
                  placeholder={t("enterCategory") || "Enter category"}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t("brand")}</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={brand} 
                  onChange={(e) => setBrand(e.target.value)} 
                  required 
                  placeholder={t("enterBrand") || "Enter brand"}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t("description")}</label>
                <textarea
                  className="form-textarea"
                  rows="5"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("enterDescription") || "Enter product description"}
                ></textarea>
              </div>
            </div>

            <div className="form-card">
              <h3 className="form-card-title">{t("offerDates") || "Offer Dates"}</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t("startDate")}</label>
                  <input
                    type="date"
                    className="form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t("endDate")}</label>
                  <input
                    type="date"
                    className="form-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => navigate("/dashboard/offers")}
              >
                {t("cancel") || "Cancel"}
              </button>
              <button type="submit" className="submit-btn">
                <span className="submit-icon">✓</span>
                {t("updateProduct")}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OfferUpdateProduct;




