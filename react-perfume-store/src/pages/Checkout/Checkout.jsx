import React from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      <p>Checkout page is under construction.</p>
      <button onClick={() => navigate("/cart")}>Back to Cart</button>
    </div>
  );
};

export default Checkout;
