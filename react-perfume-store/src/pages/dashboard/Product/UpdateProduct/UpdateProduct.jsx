import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./UpdateProduct.css";
import { BASE_URL } from "../../../../assets/url";
import Loading from "../../../../components/Loading/Loading";

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/product/${id}`);
        const data = res.data.product;
        setProduct(data);
        setTitle(data.title);
        setPrice(data.price);
        setDiscount(data.discount);
        setCategory(data.category);
        setDescription(data.description);
        setBrand(data.brand);
        setImage(data.image);
        setImages(data.images || []);
      } catch (err) {
        console.log(err);
      }
    };
    fetchProduct();
  }, [id]);

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

      await axios.put(`${BASE_URL}/product/${id}`, formData, {
        withCredentials: true,
      });

      toast.success("تم تحديث المنتج بنجاح!");
      navigate("/dashboard/products");
      window.location.reload();
    } catch (err) {
      console.log(err.response ? err.response.data : err);
    }
  };

  if (!product) return <Loading />;

  return (
    <section className="update-section">
      <h2 className="update-title">تحديث المنتج</h2>

      <form className="update-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>اسم المنتج</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>السعر</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>الخصم</label>
            <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>القسم</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>الماركة</label>
          <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>الوصف</label>
          <textarea
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="form-group">
          <label>الصورة الرئيسية</label>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        </div>

        <div className="form-group">
          <label>صور المعرض</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const selectedFiles = Array.from(e.target.files);
              setImages((prev) => [...prev, ...selectedFiles]);
            }}
          />
        </div>

        <button type="submit" className="submit-btn">تحديث المنتج</button>
      </form>
    </section>
  );
};

export default UpdateProduct;
