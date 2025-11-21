import axios from "../../../utils/axiosConfig";
import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import toast from "react-hot-toast";
import "./ProductDetails.css";
import { BASE_URL } from "../../../assets/url";
import { userContext } from "../../../context/UserContext";
import { productsContext } from "../../../context/GetProducts";
import Loading from "../../../components/Loading/Loading";
import { useLang } from "../../../context/LangContext";

const ProductDetails = () => {
  const { id } = useParams();
  const { product } = useContext(productsContext);
  const [data, setData] = useState(null);
  const { user } = useContext(userContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {t, lang} = useLang();
  const fetchingRef = useRef(false); // Track if we're currently fetching
  const fetchedIdsRef = useRef(new Set()); // Track which IDs we've already tried

  // Validate MongoDB ObjectId format (24 hex characters)
  const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Helper function to format image URL
  const formatImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // If starts with /, it's a relative path from backend
    if (imagePath.startsWith('/')) {
      return `http://localhost:5000${imagePath}`;
    }
    // Otherwise, assume it's relative to backend images
    return `http://localhost:5000/images/${imagePath}`;
  };

  // Helper function to make silent requests using fetch API (prevents console errors)
  // Uses fetch instead of axios to avoid automatic error logging
  const silentGet = async (path) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });
      
      // Parse JSON response (even for 404s, server might return JSON)
      let data = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (e) {
          // Response might not be valid JSON
        }
      }
      
      // Return axios-like response object for compatibility
      return {
        status: response.status,
        data: data,
        statusText: response.statusText,
        ok: response.ok,
      };
    } catch (err) {
      // Network errors or other issues - return error response
      return {
        status: 0,
        data: null,
        statusText: err.message || 'Network Error',
        ok: false,
      };
    }
  };

  const getProduct = useCallback(async () => {
    // Validate product ID format before making request
    if (!id || !isValidObjectId(id)) {
      setError(t("invalidProductId"));
      toast.error(t("invalidProductId"));
      setLoading(false);
      return;
    }

    // Prevent duplicate requests
    if (fetchingRef.current) {
      return; // Already fetching, don't make another request
    }

    // If we've already tried this ID and it failed, don't try again
    if (fetchedIdsRef.current.has(id) && !data) {
      setError(t("productNotFound"));
      setLoading(false);
      return;
    }

    // First, check if product exists in context (already loaded products)
    // Note: product is accessed via closure, not as a dependency
    const productFromContext = product?.find(p => p._id === id);
    if (productFromContext) {
      setData(productFromContext);
      setError(null);
      setLoading(false);
      fetchedIdsRef.current.add(id);
      return;
    }

    try {
      fetchingRef.current = true;
      setError(null);
      setLoading(true);
      
      // Try to fetch from all product endpoints in parallel for better performance
      const endpoints = [
        { path: `/product/${id}`, name: 'product' },
        { path: `/onlineProduct/${id}`, name: 'onlineProduct' },
        { path: `/featuredProduct/${id}`, name: 'featuredProduct' },
        { path: `/offerProduct/${id}`, name: 'offerProduct' }
      ];
      
      // Use Promise.allSettled to try all endpoints without failing on 404s
      // 404s are expected when searching across multiple product collections
      // Note: Browser console will still show 404s in network tab (this is normal browser behavior)
      const results = await Promise.allSettled(
        endpoints.map(endpoint => silentGet(endpoint.path))
      );
      
      let productData = null;
      
      // Check each result to find a successful response
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        
        if (result.status === 'fulfilled') {
          const response = result.value;
          
          // Skip 404 responses (they're expected when product doesn't exist in that collection)
          if (response.status === 404) {
            continue;
          }
          
          // Check if product is directly in res.data or in res.data.product
          // OfferProduct returns { product: ... }, others return { product: ... } or { ... }
          const data = response.data?.product || response.data;
          
          // Validate that we have actual product data
          if (data && typeof data === 'object' && (data._id || data.title)) {
            productData = data;
            break; // Found the product, exit loop
          }
        }
        // If rejected (non-404 errors), continue to next endpoint
      }
      
      // Mark this ID as fetched
      fetchedIdsRef.current.add(id);
      
      // If we found the product, set it
      if (productData) {
        setData(productData);
        setError(null);
        setLoading(false);
      } else {
        // Product not found in any collection
        setError(t("productNotFound"));
        toast.error(t("productNotFound"));
        setData(null);
        setLoading(false);
      }
    } catch (err) {
      // This catch block should rarely be hit since we handle errors in the loop
      // But keep it for any unexpected errors
      if (err.response?.status === 500) {
        setError(t("errorOccurred"));
        toast.error(t("errorOccurred"));
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setError(t("errorOccurred"));
        toast.error(t("errorOccurred"));
      } else {
        setError(t("productNotFound"));
        toast.error(t("productNotFound"));
      }
      setData(null);
      setLoading(false);
    } finally {
      fetchingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, t]);

  useEffect(() => {
    // Reset fetching state when ID changes
    fetchingRef.current = false;
    fetchedIdsRef.current.clear();
    getProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Only depend on id, getProduct is stable via useCallback

  
  const AddToWish = async () => {
    try {
      // Check if product is out of stock
      if (data.stock !== undefined && data.stock <= 0) {
        toast.error(t("outOfStock"));
        return;
      }

      if (user && user._id) {
        await axios.post(
          `${BASE_URL}/wish/add`,
          {
            userId: user._id,
            productId: data._id,
          },
          { withCredentials: true }
        );
        toast.success(t("addToCartSuccess"));
        window.dispatchEvent(new Event("wishlistUpdated"));
      } else {

        let localWish = JSON.parse(localStorage.getItem("localWish")) || [];

        const exists = localWish.find((item) => item._id === data._id);
        if (exists) {
          toast(t("productAlreadyInCart"));
          return;
        }

        localWish.push({
          _id: data._id,
          title: data.title,
          price: data.price,
          image: data.image,
          description: data.description,
          brand: data.brand,
          category: data.category,
          quantity: 1,
        });

        localStorage.setItem("localWish", JSON.stringify(localWish));
        toast.success(t("addToCartSuccess"));
        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } catch (err) {
      console.log(err);
      toast.error(t("errorAddingToCart"));
    }
  };

  if(loading) {
    return (
      <section className="product-details-section">
        <div className="loading"><Loading/></div>
      </section>
    );
  }

  // Show error only if we have an error AND no data
  if(error && !data) {
    return (
      <section className="product-details-section">
        <div className="error-message">
          <h2>{error}</h2>
          <Link to="/products" className="back-to-products-btn">
            {t("backToProducts")}
          </Link>
        </div>
      </section>
    );
  }

  // If we have data, show product details
  if(!data) {
    return (
      <section className="product-details-section">
        <div className="error-message">
          <h2>{t("productNotFound")}</h2>
          <Link to="/products" className="back-to-products-btn">
            {t("backToProducts")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="product-details-section">
      <div className="product-details-container">

          <div className="product-images">
            {data.image ? (
              <ImageGallery
                items={[
                  {
                    original: formatImageUrl(data.image),
                    thumbnail: formatImageUrl(data.image),
                  },
                  ...(data.images && data.images.length > 0 ? data.images.map((img) => ({
                    original: formatImageUrl(img),
                    thumbnail: formatImageUrl(img),
                  })) : []),
                ]}
                showPlayButton={false}
                showFullscreenButton={false}
                showNav={false}
                autoPlay={false}
              />
            ) : (
              <div className="no-image-placeholder">
                <p>{t("noImageAvailable")}</p>
              </div>
            )}
          </div>


          <div className="product-info">
            <h1>{data.title}</h1>

            <p className="description">{data.description}</p>

            <div className="price-section">
              {data.discount && data.discount > 0 ? (
                <>
                  <p className="price">
                    {(data.price - (data.discount || 0)).toFixed(2)}
                    <span className="discount">{data.price.toFixed(2)}</span>
                  </p>
                  <span className="discount-badge">
                    {t("save")} {data.discount.toFixed(2)}
                  </span>
                </>
              ) : (
                <p className="price">{data.price?.toFixed(2) || "0.00"}</p>
              )}
            </div>

            {data.stock !== undefined && (
              <div className="stock-info">
                <span className={`stock-status ${data.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {data.stock > 0 
                    ? `${t("inStock")} (${data.stock} ${lang === "ar" ? "متوفر" : "available"})` 
                    : t("outOfStock")
                  }
                </span>
              </div>
            )}

            {data.shippingPrice !== undefined && data.shippingPrice > 0 && (
              <div className="shipping-info">
                <span>{t("shipping")}: {data.shippingPrice.toFixed(2)}</span>
              </div>
            )}

            <hr />

            <table className="product-table">
              <tbody>
                <tr>
                  <td>{t("brand")}</td>
                  <td>{data.brand || t("nA")}</td>
                </tr>
                <tr>
                  <td>{t("category")}</td>
                  <td>{data.category || t("nA")}</td>
                </tr>
                {data.stock !== undefined && (
                  <tr>
                    <td>{t("availability")}</td>
                    <td>{data.stock > 0 
                      ? `${data.stock} ${lang === "ar" ? "متوفر" : "in stock"}` 
                      : t("outOfStock")
                    }</td>
                  </tr>
                )}
              </tbody>
            </table>

            <button 
              onClick={AddToWish} 
              className="add-to-cart-btn"
              disabled={data.stock !== undefined && data.stock <= 0}
            >
              {data.stock !== undefined && data.stock <= 0
                ? t("outOfStock")
                : t("addToCart")
              }
            </button>
          </div>
        </div>

      {/* المنتجات المشابهة */}
      {product && product.length > 0 && (
        <div className="related-products">
          <h2>
            {t("products")}  <span>{t("Related")}</span>
          </h2>

          <div className="related-grid">
            {product
              .filter((p) => p.category === data.category && p._id !== data._id)
              .map((d) => (
                <Link to={`/product/${d._id}`} key={d._id} className="related-card">
                  <div className="image-box">
                    <img src={d.image} loading='lazy' alt={d.title} crossOrigin="anonymous" />
                  </div>
                  <p className="title">{d.title}</p>
                  <p className="desc">{d.description}</p>
                  <div className="price-row">
                    <p>{d.price}</p>
                    <button className="buy-btn">{t("buyNow")}</button>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default React.memo(ProductDetails);
