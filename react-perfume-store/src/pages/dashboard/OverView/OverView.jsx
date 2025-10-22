import "./OverView.css";
import React, { useEffect, useState } from "react";
import { FaUsers, FaBox, FaShoppingCart } from "react-icons/fa";
import axios from "axios";
import { BASE_URL } from "../../../assets/url";

const OverView = () => {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [order, setOrder] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [failedOrders, setFailedOrders] = useState([]);
  const [successOrders, setSuccessOrders] = useState([]);
  const [comments, setComments] = useState([]);

  // GET USERS
  const GetUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/getUsers`, { withCredentials: true });
      setUsers(res.data.Users);
    } catch (err) {
      console.log(err);
    }
  };

  // GET COMMENTS
  const getComments = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/comment/all`, { withCredentials: true });
      setComments(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // GET ORDERS
  const getOrders = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/cart/all`, { withCredentials: true });
      setOrder(res.data);
      setPendingOrders(res.data.filter((o) => o.status === "Pending"));
      setFailedOrders(res.data.filter((o) => o.status === "Failed"));
      setSuccessOrders(res.data.filter((o) => o.status === "Complete"));
    } catch (err) {
      console.log(err);
    }
  };

  // GET PRODUCTS
  const getAllProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/product`, { withCredentials: true });
      setProducts(res.data.totalProducts);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    GetUsers();
    getComments();
    getOrders();
    getAllProducts();
  }, []);

  return (
    <div className="overview-container">
      <h2 className="overview-title">Dashboard Overview</h2>

      <div className="overview-grid">
        <div className="overview-card">
          <div className="icon gold"><FaUsers size={22} /></div>
          <p>Total Users</p>
          <h3>{users.length}</h3>
        </div>

        <div className="overview-card">
          <div className="icon gold"><FaBox size={22} /></div>
          <p>Total Products</p>
          <h3>{products}</h3>
        </div>

        <div className="overview-card">
          <div className="icon dark-gold"><FaShoppingCart size={22} /></div>
          <p>Total Orders</p>
          <h3>{order.length}</h3>
        </div>

        <div className="overview-card success">
          <div className="icon success-icon"><FaShoppingCart size={22} /></div>
          <p>Success Orders</p>
          <h3>{successOrders.length}</h3>
        </div>

        <div className="overview-card pending">
          <div className="icon pending-icon"><FaShoppingCart size={22} /></div>
          <p>Pending Orders</p>
          <h3>{pendingOrders.length}</h3>
        </div>

        <div className="overview-card failed">
          <div className="icon failed-icon"><FaShoppingCart size={22} /></div>
          <p>Failed Orders</p>
          <h3>{failedOrders.length}</h3>
        </div>

        <div className="overview-card">
          <div className="icon gold"><FaBox size={22} /></div>
          <p>Total Comments</p>
          <h3>{comments.length}</h3>
        </div>
      </div>
    </div>
  );
};

export default OverView;
