import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaStar } from "react-icons/fa6";
import { CiStar } from "react-icons/ci";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import toast from "react-hot-toast";
import { BASE_URL } from "../../../assets/url";
import { userContext } from "../../../context/UserContext";
import Loading from "../../../components/Loading/Loading";

const OfferDetails = () => {
  const { id } = useParams();
  const { user } = useContext(userContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);


  const getProduct = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/offerProduct/${id}`);
        console.log(res.data.product)
      setData(res.data.product);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProduct();
  }, [id]);


  const AddToWish = async () => {
    try {

      if (user && user._id) {
        await axios.post(
          `${BASE_URL}/wish/add`,
          {
            userId: user._id,
            offerProductId: data._id, 
        },
          { withCredentials: true }
        );
        toast.success("تمت إضافة المنتج إلى المفضلة بنجاح ✅");
        window.dispatchEvent(new Event("wishlistUpdated"));
      } else {
        let localWish = JSON.parse(localStorage.getItem("localWish")) || [];

        const exists = localWish.find((item) => item._id === data._id);
        if (exists) {
          toast("هذا المنتج موجود بالفعل في المفضلة ❤️");
          return;
        }

        localWish.push({
          _id: data._id,
          title: data.title || "منتج بدون عنوان",
          price: data.price || "غير محدد",
          image: data.image || "/placeholder.png",
          description: data.description || "منتج بدون وصف",
          brand: data.brand || "منتج بدون براند",
          category: data.category || "منتج بدون كاتيجوري",
          type: "offer", // فرق نوع المنتج
          quantity: 1,
        });

        localStorage.setItem("localWish", JSON.stringify(localWish));
        toast.success("✅ تمت إضافة المنتج للمفضلة بنجاح");
        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } catch (err) {
      console.log(err);
      toast.error("حدث خطأ أثناء الإضافة إلى المفضلة");
    }
  };

  if (loading) return <Loading />;

  return (
    <section className="product-details-section">
      {data ? (
        <div className="product-details-container">
          <div className="product-images">
            <ImageGallery
              items={[
                { original: data.image, thumbnail: data.image },
                ...(data.images?.map((img) => ({
                  original: img,
                  thumbnail: img,
                })) || []),
              ]}
              showPlayButton={false}
              showFullscreenButton={false}
              showNav={false}
              autoPlay={false}
            />
          </div>

          <div className="product-info">
            <h1>{data.title || "منتج بدون عنوان"}</h1>

            <div className="rating">
              <p>4.5</p>
              <div className="stars">
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <CiStar />
              </div>
            </div>

            <p className="description">{data.description || "منتج بدون وصف"}</p>

            <p className="price">
              {data.price || "غير محدد"}
              <span className="discount">{data.discount || 0}</span>
            </p>

            <hr />

            <table className="product-table">
              <tbody>
                <tr>
                  <td>Brand</td>
                  <td>{data.brand || "منتج بدون براند"}</td>
                </tr>
                <tr>
                  <td>Color</td>
                  <td>Multi</td>
                </tr>
                <tr>
                  <td>Category</td>
                  <td>{data.category || "منتج بدون كاتيجوري"}</td>
                </tr>
              </tbody>
            </table>

            <button onClick={AddToWish} className="add-to-cart-btn">
              Add to Cart ❤️
            </button>
          </div>
        </div>
      ) : (
        <p className="loading">Loading...</p>
      )}
    </section>
  );
};

export default React.memo(OfferDetails);
