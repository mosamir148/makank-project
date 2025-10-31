// OverView.jsx
import "./OverView.css";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../assets/url";
import { userContext } from "../../../context/UserContext";
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

const COLORS = ["#FACC15", "#22C55E", "#EF4444", "#3B82F6", "#8B5CF6"];

const OverView = () => {
  const { user } = useContext(userContext); // user from context (may contain token)
  const token = user?.token || null;

  const [data, setData] = useState({
    users: [],
    products: 0,
    featured: 0,
    online: 0,
    offer: 0,
    coupons: 0,
    orders: [],
    wishlists: [],
  });

  const [pending, setPending] = useState(0);
  const [failed, setFailed] = useState(0);
  const [success, setSuccess] = useState(0);
  const [loading, setLoading] = useState(true);


  const buildConfig = (needsAuth = false) => {
   
    
    const cfg = {};
    if (needsAuth) {
      cfg.withCredentials = true;
      if (token) cfg.headers = { Authorization: `Bearer ${token}` };
    }
    return cfg;
  };

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        setLoading(true);

        const calls = [
          axios.get(`${BASE_URL}/user/getUsers`, buildConfig(true)).catch(e => e),
          axios.get(`${BASE_URL}/product`, buildConfig(false)).catch(e => e),
          axios.get(`${BASE_URL}/featuredProduct`, buildConfig(false)).catch(e => e),
          axios.get(`${BASE_URL}/offerProduct`, buildConfig(false)).catch(e => e),
          axios.get(`${BASE_URL}/onlineProduct`, buildConfig(false)).catch(e => e),
          axios.get(`${BASE_URL}/coupon`, buildConfig(false)).catch(e => e),
          axios.get(`${BASE_URL}/cart/all`, buildConfig(true)).catch(e => e),
          axios.get(`${BASE_URL}/wish/all`, buildConfig(true)).catch(e => e),
        ];

        const results = await Promise.allSettled(calls);


        const unwrap = (res, label) => {
          if (!res) return null;
          if (res.status === "fulfilled") {
            const value = res.value;

            if (value && value.isAxiosError) {
              console.warn(`${label} returned axios error:`, value.message);
              return { error: value, data: null };
            }
            return { data: value.data ?? null, error: null };
          } else {

            console.warn(`${label} rejected:`, res.reason);
            return { data: null, error: res.reason };
          }
        };

        const [
          usersRes,
          productsRes,
          featuredRes,
          offerRes,
          onlineRes,
          couponRes,
          ordersRes,
          wishRes,
        ] = results.map((r, i) =>
          unwrap(r, [
            "users",
            "products",
            "featured",
            "offer",
            "online",
            "coupon",
            "orders",
            "wishlists",
          ][i])
        );


        [usersRes, ordersRes, wishRes].forEach((r, idx) => {
          if (r?.error && r.error.response?.status === 401) {
            console.warn("Protected endpoint returned 401 (need admin auth or valid token).");
          }
        });


        const usersList = usersRes?.data?.Users ?? usersRes?.data ?? [];

        const productsCount =
          (productsRes?.data && (productsRes.data.totalProducts ?? productsRes.data.products?.length ?? (Array.isArray(productsRes.data) ? productsRes.data.length : 0))) || 0;
       const featuredCount =
  (featuredRes?.data?.products?.length ??
    featuredRes?.data?.length ??
    (Array.isArray(featuredRes?.data) ? featuredRes.data.length : 0)) || 0;

const onlineCount =
  (onlineRes?.data?.products?.length ??
    onlineRes?.data?.length ??
    (Array.isArray(onlineRes?.data) ? onlineRes.data.length : 0)) || 0;

const couponsCount =
  (couponRes?.data?.coupons?.length ??
    couponRes?.data?.length ??
    (Array.isArray(couponRes?.data) ? couponRes.data.length : 0)) || 0;

        const offerCount =
          (offerRes?.data && (offerRes.data.offers?.length ?? (Array.isArray(offerRes.data) ? offerRes.data.length : 0))) ?? 0;
        const ordersArray = Array.isArray(ordersRes?.data) ? ordersRes.data : [];
        const wishlistsArray = Array.isArray(wishRes?.data) ? wishRes.data : [];

        const pendingOrders = ordersArray.filter((o) => o?.status === "Pending").length;
        const failedOrders = ordersArray.filter((o) => o?.status === "Failed").length;
        const successOrders = ordersArray.filter((o) => o?.status === "Complete").length;

        if (!cancelled) {
          setData({
            users: usersList,
            products: productsCount,
            featured: featuredCount,
            offer: offerCount,
            online: onlineCount,
            coupons: couponsCount,
            orders: ordersArray,
            wishlists: wishlistsArray,
          });

          setPending(pendingOrders);
          setFailed(failedOrders);
          setSuccess(successOrders);
        }
      } catch (err) {
        console.error("❌ Unexpected fetchAll error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    
    if (user) {
      fetchAll();
    } else {

      (async () => {
        try {
          setLoading(true);
          const publicCalls = await Promise.allSettled([
            axios.get(`${BASE_URL}/product`).catch(e => e),
            axios.get(`${BASE_URL}/featuredProduct`).catch(e => e),
            axios.get(`${BASE_URL}/offerProduct`).catch(e => e),
            axios.get(`${BASE_URL}/onlineProduct`).catch(e => e),
            axios.get(`${BASE_URL}/coupon`).catch(e => e),
          ]);

          const unwrapPublic = (r) => (r.status === "fulfilled" ? r.value?.data : null);

          const productsRes = unwrapPublic(publicCalls[0]);
          const featuredRes = unwrapPublic(publicCalls[1]);
          const offerRes = unwrapPublic(publicCalls[2]);
          const onlineRes = unwrapPublic(publicCalls[3]);
          const couponRes = unwrapPublic(publicCalls[4]);

          const productsCount =
            (productsRes && (productsRes.totalProducts ?? productsRes.products?.length ?? (Array.isArray(productsRes) ? productsRes.length : 0))) ||
            0;
          const featuredCount = (featuredRes && (featuredRes.length ?? 0)) || 0;
          const offerCount =
            (offerRes && (offerRes.offers?.length ?? (Array.isArray(offerRes) ? offerRes.length : 0))) || 0;
          const onlineCount = (onlineRes && (onlineRes.length ?? 0)) || 0;
          const couponsCount = (couponRes && (couponRes.length ?? 0)) || 0;

          if (!cancelled) {
            setData((prev) => ({
              ...prev,
              products: productsCount,
              featured: featuredCount,
              offer: offerCount,
              online: onlineCount,
              coupons: couponsCount,
            }));
          }
        } catch (err) {
          console.error("❌ Error fetching public endpoints:", err);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }

    return () => {
      cancelled = true;
    };
  }, [user, token]);

  if (loading) return <Loading />;

  const summaryData = [
    { name: "المستخدمون", value: data.users.length || 0 },
    { name: "المنتجات العادية", value: data.products || 0 },
    { name: "منتجات مميزة", value: data.featured || 0 },
    { name: "عروض خاصه", value: data.offer || 0 },
    { name: "حصري علي الموقع", value: data.online || 0 },
    { name: "الكوبونات", value: data.coupons || 0 },
    { name: "قائمة الرغبات", value: (data.wishlists && data.wishlists.length) || 0 },
    { name: "إجمالي الطلبات", value: (data.orders && data.orders.length) || 0 },
  ];

  const ordersData = [
    { name: "مكتملة", value: success },
    { name: "قيد الانتظار", value: pending },
    { name: "فاشلة", value: failed },
  ];

  return (
    <div className="overview-wrapper">
      <h2 className="overview-heading">📊 لوحة تحليلات المتجر</h2>

      {/* 🟢 الإحصائيات العلوية */}
      <div className="stats-grid">
        {summaryData.map((item, i) => (
          <div key={i} className="stat-card">
            <p className="stat-title">{item.name}</p>
            <h3 className="stat-value">{item.value}</h3>
          </div>
        ))}
      </div>

      {/* 🟠 الرسوم البيانية */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>📦 ملخص المتجر</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summaryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} angle={10} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" barSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>📈 حالة الطلبات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ordersData}
                cx="50%"
                cy="50%"
                outerRadius={100}
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
        </div>
      </div>

      {/* 🔵 النشاط العام */}
      <div className="chart-card full">
        <h3>🔍 نظرة عامة على النشاط</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={[
              { name: "المستخدمون", value: data.users.length || 0 },
              {
                name: "المنتجات",
                value:
                  (data.products || 0) + (data.featured || 0) + (data.offer || 0) + (data.online || 0),
              },
              { name: "الكوبونات", value: data.coupons || 0 },
              { name: "الطلبات", value: (data.orders && data.orders.length) || 0 },
              { name: "قائمة الرغبات", value: (data.wishlists && data.wishlists.length) || 0 },
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

export default React.memo(OverView);
