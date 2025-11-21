import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import "./ProductDetail.css";
import { BASE_URL } from "../../../../assets/url";
import Loading from "../../../../components/Loading/Loading";
import { useLang } from "../../../../context/LangContext";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/product/${id}`);
      setProduct(res.data.product);
      setLoading(false);
    } catch (err) {
      console.log(err);
      toast.error(t("failedToLoad") + " " + (t("productDetails") || "Product Details"));
      setLoading(false);
    }
  };

  const DeleteProduct = async () => {
    const result = await Swal.fire({
      title: t("confirm") || "Are you sure?",
      text: t("cannotUndo") || "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("yesDelete") || "Yes, delete it!",
      cancelButtonText: t("cancel") || "Cancel",
    });
    
    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/product/${id}`, { 
          withCredentials: true 
        });
        toast.success(t("productDeleted") || "Product deleted successfully!");
        navigate("/dashboard/products");
      } catch (err) {
        console.log(err);
        toast.error(t("failedToDelete") || "Failed to delete product!");
      }
    }
  };

  if (loading) return <Loading />;
  if (!product) return <div className="error-message">{t("productNotFound") || "Product not found"}</div>;

  return (
    <div className="product-detail-container">
      <div className="product-detail-header">
        <button className="back-btn" onClick={() => navigate("/dashboard/products")}>
          {lang === "ar" ? "← " : ""}{t("back") || "Back"}{lang === "en" ? " ←" : ""}
        </button>
        <h2>{t("productDetails") || "Product Details"}</h2>
        <div className="header-actions">
          <button 
            className="edit-btn" 
            onClick={() => navigate(`/dashboard/products/update-product/${id}`)}
          >
            {t("edit") || "Edit"}
          </button>
          <button className="delete-btn" onClick={DeleteProduct}>
            {t("delete") || "Delete"}
          </button>
        </div>
      </div>

      <div className="product-detail-content">
        <div className="product-images-section">
          <div className="main-image">
            <img src={product.image} alt={product.title} />
          </div>
          {product.images && product.images.length > 0 && (
            <div className="gallery-images">
              {product.images.map((img, index) => (
                <img key={index} src={img} alt={`${product.title} - ${index + 1}`} />
              ))}
            </div>
          )}
        </div>

        <div className="product-info-section">
          <div className="info-card">
            <h3>{t("basicInformation") || "Basic Information"}</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">{t("productTitle") || "Product Name"}:</span>
                <span className="info-value">{product.title}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t("category") || "Category"}:</span>
                <span className="info-value category-badge">{product.category}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t("brand") || "Brand"}:</span>
                <span className="info-value">{product.brand}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t("price") || "Price"}:</span>
                <span className="info-value price">{product.price}</span>
              </div>
              {product.stock !== undefined && (
                <div className="info-item">
                  <span className="info-label">{t("availableQuantity") || "Available Quantity"}:</span>
                  <span className={`info-value ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {product.stock}
                  </span>
                </div>
              )}
              {product.purchasePrice !== undefined && (
                <div className="info-item">
                  <span className="info-label">{t("purchasePrice") || "Purchase Price"}:</span>
                  <span className="info-value">{product.purchasePrice}</span>
                </div>
              )}
              {product.shippingPrice !== undefined && (
                <div className="info-item">
                  <span className="info-label">{t("shippingPrice") || "Shipping Price"}:</span>
                  <span className="info-value">{product.shippingPrice}</span>
                </div>
              )}
            </div>
          </div>

          <div className="description-card">
            <h3>{t("description") || "Description"}</h3>
            <p>{product.description}</p>
          </div>

          <div className="meta-card">
            <h3>{t("additionalInformation") || "Additional Information"}</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">{t("createdAt") || "Created At"}:</span>
                <span className="info-value">
                  {(() => {
                    const date = new Date(product.createdAt);
                    // Always use Gregorian calendar format
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    return `${year}-${month}-${day} ${hours}:${minutes}`;
                  })()}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">{t("updatedAt") || "Updated At"}:</span>
                <span className="info-value">
                  {(() => {
                    const date = new Date(product.updatedAt);
                    // Always use Gregorian calendar format
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    return `${year}-${month}-${day} ${hours}:${minutes}`;
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

