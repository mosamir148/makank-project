// OverView.jsx
import "./OverView.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../assets/url";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import Loading from "../../../components/Loading/Loading";

const COLORS = ["#FACC15", "#22C55E", "#EF4444"];

const OverView = () => {
  const [data, setData] = useState({
    users: [],
    products: 0,
    orders: [],
    comments: [],
    wishlists: [],
  });

  const [pending, setPending] = useState(0);
  const [failed, setFailed] = useState(0);
  const [success, setSuccess] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        const results = await Promise.allSettled([
          axios.get(`${BASE_URL}/user/getUsers`, { withCredentials: true }),
          axios.get(`${BASE_URL}/product`, { withCredentials: true }),
          axios.get(`${BASE_URL}/cart/all`, { withCredentials: true }),
          axios.get(`${BASE_URL}/wish/all`, { withCredentials: true }),
        ]);

        const [usersRes, productsRes, ordersRes, wishRes] = results;

        const usersList =
          usersRes?.status === "fulfilled" && usersRes.value?.data?.Users
            ? usersRes.value.data.Users
            : [];

        const totalProducts =
          productsRes?.status === "fulfilled" && productsRes.value?.data
            ? productsRes.value.data.totalProducts ?? productsRes.value.data.products?.length ?? 0
            : 0;

        const allOrders =
          ordersRes?.status === "fulfilled" && Array.isArray(ordersRes.value.data)
            ? ordersRes.value.data
            : [];

        const wishlists =
          wishRes?.status === "fulfilled" && Array.isArray(wishRes.value.data)
            ? wishRes.value.data
            : [];

        const pendingOrders = allOrders.filter(o => o && o.status === "Pending").length;
        const failedOrders = allOrders.filter(o => o && o.status === "Failed").length;
        const successOrders = allOrders.filter(o => o && o.status === "Complete").length;

        setData({
          users: usersList,
          products: totalProducts,
          orders: allOrders,
          comments: [],
          wishlists,
        });

        setPending(pendingOrders);
        setFailed(failedOrders);
        setSuccess(successOrders);

      } catch (err) {
        console.error("❌ Unexpected fetch error:", err);
        setError("حدث خطأ أثناء جلب البيانات. تحقق من الكونسول للمزيد.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const summaryData = [
    { name: "المستخدمون", value: data.users?.length || 0 },
    { name: "المنتجات", value: data.products || 0 },
    { name: "إجمالي الطلبات", value: data.orders?.length || 0 },
    { name: "قائمة الرغبات", value: data.wishlists?.length || 0 },
  ];

  const ordersData = [
    { name: "مكتملة", value: success },
    { name: "قيد الانتظار", value: pending },
    { name: "فاشلة", value: failed },
  ];

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="overview-wrapper">
        <h2 className="overview-heading">📊 لوحة تحليلات المتجر</h2>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="overview-wrapper">
      <h2 className="overview-heading">📊 لوحة تحليلات المتجر</h2>

      {/* Top small stats */}
      <div className="stats-grid">
        {summaryData.map((item, i) => (
          <div key={i} className="stat-card">
            <p className="stat-title">{item.name}</p>
            <h3 className="stat-value">{item.value}</h3>
          </div>
        ))}
      </div>

      {/* charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>ملخص المتجر</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summaryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} tick={{ fontSize: 16 }} angle={5} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#FACC15" barSize={40} />
            </BarChart>
          </ResponsiveContainer>

          <table className="overview-table">
            <thead>
              <tr>
                <th>الفئة</th>
                <th>العدد</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.map((it, idx) => (
                <tr key={idx}>
                  <td>{it.name}</td>
                  <td>{it.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="chart-card">
          <h3>حالة الطلبات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ordersData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {ordersData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <table className="overview-table">
            <thead>
              <tr>
                <th>الحالة</th>
                <th>العدد</th>
              </tr>
            </thead>
            <tbody>
              {ordersData.map((it, idx) => (
                <tr key={idx}>
                  <td>{it.name}</td>
                  <td>{it.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="chart-card full">
        <h3>نظرة عامة على النشاط</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={[
              { name: "المستخدمون", value: data.users.length },
              { name: "الطلبات", value: data.orders.length },
              { name: "قائمة الرغبات", value: data.wishlists.length },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={3} dot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OverView;
