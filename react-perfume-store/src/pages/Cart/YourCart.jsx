import { useEffect, useState } from "react";
import axios from "axios";
import { RiDeleteBack2Fill } from "react-icons/ri";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import "./YourCart.css";
import { BASE_URL } from "../../assets/url";

const YourCart = () => {
  const [cart, setCart] = useState([]);

  const Subtotal = cart.reduce((acc, cur) => acc + cur.product?.price, 0);
  const Total = Subtotal ;

  const MyCart = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/cart/mycart`, {
        withCredentials: true,
      });
      setCart(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    MyCart();
  }, []);

  const DeleteCart = async (id) => {
    try {
      const result = await Swal.fire({
        title: "هل أنت متأكد؟",
        text: "سيتم حذف هذا المنتج من السلة!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#D4AF37",
        cancelButtonColor: "#2a2a2a",
        confirmButtonText: "نعم، احذف!",
        cancelButtonText: "إلغاء",
      });

      if (result.isConfirmed) {
        await axios.delete(`${BASE_URL}/cart/${id}`, {
          withCredentials: true,
        });
        await MyCart();
        Swal.fire("تم الحذف!", "تم حذف المنتج من السلة.", "success");
      } else {
        Swal.fire("تم الإلغاء", "المنتج ما زال في السلة.", "info");
      }
    } catch (err) {
      console.log(err);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <section className="cart-section">
      
      {/* LEFT - CART ITEMS */}
      <div className="cart-items">
        <div className="cart-title">
          <p>
            Your <span>Cart</span>
          </p>
          <div className="line"></div>
        </div>

        {cart.map((cart, index) => (
          <div key={index} className="cart-card">
            <div className="cart-image">
              <img
                src={`${cart.product?.image}`}
                crossOrigin="anonymous"
                alt="product"
                loading="lazy"
              />
            </div>

            <div className="cart-info">
              <h3>{cart.product?.title}</h3>
              <p className="cart-meta">
                {cart.product?.category}{" "}
                <span>{cart.product?.brand}</span>
              </p>
              <p className="cart-desc">{cart.product?.description}</p>

              <div className="cart-bottom">
                <p className="price">${cart.product?.price}</p>
                <p className="date">
                  Created:{" "}
                  {new Date(cart.product?.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => DeleteCart(cart?._id)}
              className="delete-btn"
            >
              <RiDeleteBack2Fill size={26} />
            </button>
          </div>
        ))}
      </div>

      {/* RIGHT - TOTALS */}
      <div className="cart-summary">
        <div className="cart-title">
          <p>
            CART <span>TOTALS</span>
          </p>
          <div className="line"></div>
        </div>

        <div className="summary-details">
         
         
          <div>
            <p>Total</p>
            <p>${Total}</p>
          </div>
        </div>

        <button className="checkout-btn">Proceed to Checkout</button>
      </div>

    </section>
  );
};

export default YourCart;

