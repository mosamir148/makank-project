// OverView.jsx
import "./OverView.css";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../assets/url";
import { userContext } from "../../../context/UserContext";
import { useLang } from "../../../context/LangContext";
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
import { 
  FaUsers, 
  FaBox, 
  FaStar, 
  FaTag, 
  FaGlobe, 
  FaHeart, 
  FaShoppingCart,
  FaChartBar,
  FaChartPie,
  FaChartLine
} from "react-icons/fa";

const COLORS = ["#FACC15", "#22C55E", "#EF4444", "#3B82F6", "#8B5CF6"];

const OverView = () => {
  const { user } = useContext(userContext); // user from context (may contain token)
  const token = user?.token || null;
  const { t, lang } = useLang();

  const [data, setData] = useState({
    users: [],
    totalUsers: 0, // Store total users count
    products: 0,
    featured: 0,
    online: 0,
    offer: 0,
    orders: [],
    wishlists: [],
  });

  const [pending, setPending] = useState(0);
  const [failed, setFailed] = useState(0);
  const [success, setSuccess] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Track dark mode changes
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.body.classList.contains('dark'));
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);


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
          // First get total count with a small limit to ensure we get totalCount field
          axios.get(`${BASE_URL}/user/getUsers`, {
            ...buildConfig(true),
            params: { page: 1, limit: 1 } // Small limit to get totalCount quickly
          }).catch(e => e),
          axios.get(`${BASE_URL}/product`, buildConfig(false)).catch(e => e),
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
          ordersRes,
          wishRes,
        ] = results.map((r, i) =>
          unwrap(r, [
            "users",
            "products",
            "orders",
            "wishlists",
          ][i])
        );

        // Set removed product types to null (they no longer exist)
        const featuredRes = { data: null, error: null };
        const offerRes = { data: null, error: null };
        const onlineRes = { data: null, error: null };


        [usersRes, ordersRes, wishRes].forEach((r, idx) => {
          if (r?.error && r.error.response?.status === 401) {
            console.warn("Protected endpoint returned 401 (need admin auth or valid token).");
          }
        });


        // Extract users list - handle different response structures
        let usersList = [];
        let totalUsersCount = 0;
        
        if (usersRes?.data) {
          // Check if response has Users array and totalCount (paginated response)
          if (usersRes.data.Users && Array.isArray(usersRes.data.Users)) {
            usersList = usersRes.data.Users;
            totalUsersCount = usersRes.data.totalCount ?? usersList.length;
          } 
          // Check if response is directly an array
          else if (Array.isArray(usersRes.data)) {
            usersList = usersRes.data;
            totalUsersCount = usersList.length;
          }
          // Check for other possible structures
          else if (usersRes.data.users && Array.isArray(usersRes.data.users)) {
            usersList = usersRes.data.users;
            totalUsersCount = usersRes.data.totalCount ?? usersRes.data.total ?? usersList.length;
          }
        }
        
        // Fallback: if we got users but no count, use array length
        if (totalUsersCount === 0 && usersList.length > 0) {
          totalUsersCount = usersList.length;
        }
        
        // Debug log to see what we're getting
        console.log("Users API Response Debug:", {
          hasData: !!usersRes?.data,
          responseKeys: usersRes?.data ? Object.keys(usersRes.data) : [],
          totalCount: usersRes?.data?.totalCount,
          total: usersRes?.data?.total,
          usersListLength: usersList.length,
          finalCount: totalUsersCount,
          isArray: Array.isArray(usersRes?.data)
        });

        const productsCount =
          (productsRes?.data && (productsRes.data.totalProducts ?? productsRes.data.products?.length ?? (Array.isArray(productsRes.data) ? productsRes.data.length : 0))) || 0;
        
        // These product types no longer exist - set to 0
        const featuredCount = 0;
        const onlineCount = 0;
        const offerCount = 0;
        const ordersArray = Array.isArray(ordersRes?.data) ? ordersRes.data : [];
        const wishlistsArray = Array.isArray(wishRes?.data) ? wishRes.data : [];

        const pendingOrders = ordersArray.filter((o) => o?.status === "Pending").length;
        const failedOrders = ordersArray.filter((o) => o?.status === "Failed").length;
        const successOrders = ordersArray.filter((o) => o?.status === "Complete").length;

        if (!cancelled) {
          setData({
            users: usersList,
            totalUsers: totalUsersCount,
            products: productsCount,
            featured: featuredCount,
            offer: offerCount,
            online: onlineCount,
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
          ]);

          const unwrapPublic = (r) => (r.status === "fulfilled" ? r.value?.data : null);

          const productsRes = unwrapPublic(publicCalls[0]);
          const featuredRes = unwrapPublic(publicCalls[1]);
          const offerRes = unwrapPublic(publicCalls[2]);
          const onlineRes = unwrapPublic(publicCalls[3]);

          const productsCount =
            (productsRes && (productsRes.totalProducts ?? productsRes.products?.length ?? (Array.isArray(productsRes) ? productsRes.length : 0))) ||
            0;
          const featuredCount = (featuredRes && (featuredRes.length ?? 0)) || 0;
          const offerCount =
            (offerRes && (offerRes.offers?.length ?? (Array.isArray(offerRes) ? offerRes.length : 0))) || 0;
          const onlineCount = (onlineRes && (onlineRes.length ?? 0)) || 0;

          if (!cancelled) {
            setData((prev) => ({
              ...prev,
              products: productsCount,
              featured: featuredCount,
              offer: offerCount,
              online: onlineCount,
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
    { name: t("adminUsers"), value: data.totalUsers || 0, icon: FaUsers, color: "#3B82F6", bgColor: "#EFF6FF" },
    { name: t("normalProducts"), value: data.products || 0, icon: FaBox, color: "#10B981", bgColor: "#ECFDF5" },
    { name: t("featuredProducts"), value: data.featured || 0, icon: FaStar, color: "#F59E0B", bgColor: "#FFFBEB" },
    { name: t("specialOffers"), value: data.offer || 0, icon: FaTag, color: "#EF4444", bgColor: "#FEF2F2" },
    { name: t("exclusiveOnline"), value: data.online || 0, icon: FaGlobe, color: "#8B5CF6", bgColor: "#F5F3FF" },
    { name: t("wishlist"), value: (data.wishlists && data.wishlists.length) || 0, icon: FaHeart, color: "#F43F5E", bgColor: "#FFF1F2" },
    { name: t("totalOrdersOverview"), value: (data.orders && data.orders.length) || 0, icon: FaShoppingCart, color: "#D4AF37", bgColor: "#FFFBEB" },
  ];

  const ordersData = [
    { name: t("completed"), value: success },
    { name: t("pending"), value: pending },
    { name: t("failed"), value: failed },
  ];

  return (
    <div className="overview-wrapper">
      <div className="overview-header">
        <h2 className="overview-heading">{t("storeAnalytics")}</h2>
        <p className="overview-subtitle">{t("comprehensiveOverview")}</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        {summaryData.map((item, i) => {
          const IconComponent = item.icon;
          return (
            <div 
              key={i} 
              className="stat-card" 
              style={{ 
                '--card-color': item.color, 
                '--card-bg': item.bgColor 
              }}
            >
              <div 
                className="stat-icon-wrapper" 
                style={{ backgroundColor: item.bgColor, color: item.color }}
              >
                <IconComponent className="stat-icon" />
              </div>
              <div className="stat-content">
                <p className="stat-title">{item.name}</p>
                <h3 className="stat-value">{item.value.toLocaleString()}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <FaChartBar className="chart-icon" />
            <h3>{t("storeSummary")}</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summaryData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis 
                dataKey="name" 
                interval={0} 
                tick={{ fontSize: 11, fill: isDarkMode ? '#9CA3AF' : '#6B7280' }} 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: isDarkMode ? '#9CA3AF' : '#6B7280' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1F2937' : '#fff', 
                  border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  color: isDarkMode ? '#F9FAFB' : '#111827'
                }} 
              />
              <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} barSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <FaChartPie className="chart-icon" />
            <h3>{t("orderStatusChart")}</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ordersData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={40}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {ordersData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1F2937' : '#fff', 
                  border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  color: isDarkMode ? '#F9FAFB' : '#111827'
                }} 
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px', color: isDarkMode ? '#F9FAFB' : '#111827' }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Overview */}
      <div className="chart-card full">
        <div className="chart-header">
          <FaChartLine className="chart-icon" />
          <h3>{t("activityOverview")}</h3>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={[
              { name: t("adminUsers"), value: data.totalUsers || 0 },
              {
                name: t("adminProducts"),
                value:
                  (data.products || 0) + (data.featured || 0) + (data.offer || 0) + (data.online || 0),
              },
              { name: t("adminOrders"), value: (data.orders && data.orders.length) || 0 },
              { name: t("wishlist"), value: (data.wishlists && data.wishlists.length) || 0 },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: isDarkMode ? '#9CA3AF' : '#6B7280' }}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: isDarkMode ? '#9CA3AF' : '#6B7280' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#1F2937' : '#fff', 
                border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                color: isDarkMode ? '#F9FAFB' : '#111827'
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#D4AF37" 
              strokeWidth={3} 
              dot={{ r: 6, fill: '#D4AF37' }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default React.memo(OverView);
