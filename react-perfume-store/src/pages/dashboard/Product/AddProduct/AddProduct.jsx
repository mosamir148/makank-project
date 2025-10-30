import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "./AddProduct.css";
import { BASE_URL } from "../../../../assets/url";

const AddProduct = () => {
  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const navigate = useNavigate();

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
      if (image) formData.append("image", image);
      images.forEach((img) => formData.append("images", img));

      await axios.post(`${BASE_URL}/product`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product uploaded successfully!");
      setTitle(""); setPrice(""); setDiscount(""); setCategory(""); setBrand(""); setDescription(""); setImage(null); setImages([]);
      navigate("/dashboard/products");
      window.location.reload();
    } catch (err) {
      console.error(err.response?.data);
      alert(JSON.stringify(err.response?.data, null, 2));
    }
  };

  return (
 <section className="add-product-section">
  <h2 className="add-product-title">إضافة منتج جديد</h2>
  <form className="add-product-form" onSubmit={handleSubmit}>
    <div className="form-group">
      <label>اسم المنتج</label>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="أدخل اسم المنتج" required />
    </div>

    <div className="form-grid">
      <div className="form-group">
        <label>السعر</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="أدخل السعر" required />
      </div>
      <div className="form-group">
        <label>التخفيض</label>
        <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="أدخل قيمة التخفيض" />
      </div>
    </div>

    <div className="form-group">
      <label>الفئة</label>
      <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="أدخل الفئة" required />
    </div>

    <div className="form-group">
      <label>الماركة</label>
      <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="أدخل الماركة" required />
    </div>

    <div className="form-group">
      <label>الوصف</label>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="أدخل وصف المنتج" rows="4" />
    </div>

    <div className="form-group">
      <label>الصورة الأساسية</label>
      <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required />
    </div>

    <div className="form-group">
      <label>صور المعرض</label>
      <input type="file" accept="image/*" multiple onChange={(e) => {
        const selectedFiles = Array.from(e.target.files);
        setImages(prev => [...prev, ...selectedFiles]);
      }} />
    </div>

    <button type="submit" className="submit-btn">إضافة المنتج</button>
  </form>
</section>

  );
};

export default AddProduct;



