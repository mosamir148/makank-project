import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
// import "./AddProduct.css";
import { BASE_URL } from "../../../../assets/url";

const OfferAddProduct = () => {
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
  const navigate = useNavigate()

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
      formData.append("startDate", new Date(startDate).toISOString());
      formData.append("endDate", new Date(endDate).toISOString());
      
      if (image) formData.append("image", image);
      images.forEach((img) => formData.append("images", img));

      await axios.post(`${BASE_URL}/offerProduct`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product uploaded successfully!");
      setTitle(""); setPrice(""); setDiscount(""); setCategory(""); setBrand(""); setDescription(""); setStartDate(""); setEndDate(""); setImage(null); setImages([]);
      navigate("/dashboard/offer-products");
      window.location.reload();
    } catch (err) {
      console.error(err.response?.data);
      alert(JSON.stringify(err.response?.data, null, 2));
    }
  };

  return (
    <section className="add-product-section">
      <h2 className="add-product-title">Add New Offer Product</h2>
      <form className="add-product-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter product name" required />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Price</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Enter price" required />
          </div>
          <div className="form-group">
            <label>Discount</label>
            <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="Enter discount" />
          </div>
        </div>

        <div className="form-group">
          <label>Category</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Enter category" required />
        </div>

        <div className="form-group">
          <label>Brand</label>
          <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Enter brand" required />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter product description" rows="4" />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>تاريخ البداية</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}  />
          </div>
          <div className="form-group">
            <label>تاريخ النهاية</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}  />
          </div>
        </div>

        <div className="form-group">
          <label>Main Image</label>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required />
        </div>

        <div className="form-group">
          <label>Gallery Images</label>
          <input type="file" accept="image/*" multiple onChange={(e) => {
            const selectedFiles = Array.from(e.target.files);
            setImages(prev => [...prev, ...selectedFiles]);
          }} />
        </div>

        <button type="submit" className="submit-btn">Add Product</button>
      </form>
    </section>
  );
};

export default OfferAddProduct;



