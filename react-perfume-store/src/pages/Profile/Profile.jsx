import { useContext, useEffect, useState } from 'react';
import { BASE_URL } from '../../assets/url';
import './Profile.css';
import { userContext } from '../../context/UserContext';
import axios from 'axios';

const Profile = () => {
  const [orders, setOrders] = useState([]);
  const { user } = useContext(userContext);

  const getOrders = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${BASE_URL}/cart/mycart`, {
        withCredentials: true,
      });
      setOrders(res.data);
    } catch (err) {
      console.error("❌ Error fetching orders:", err.response?.data || err);
    }
  };

  useEffect(() => {
    getOrders();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#D4AF37';
      case 'complete':
        return 'green';
      case 'failed':
        return 'red';
      default:
        return '#1a1a1a'; 
    }
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title">طلباتك</h1>

      {orders.length > 0 ? (
        <div className="orders-grid">
          {orders.map((item) => (
            <div key={item._id} className="order-card">
              <img
              loading='lazy'
                src={item.product?.image || 'https://via.placeholder.com/150'}
                alt={item.product?.title}
                className="order-image"
              />
              <div className="order-details">
                <h3>{item.product?.title || item.title}</h3>
                <p><strong>الوصف:</strong> {item.product?.description || '—'}</p>
                <p><strong>الكمية:</strong> {item.quantity}</p>
                <p><strong>السعر:</strong> ${item.product?.price || item.price}</p>
                <p><strong>البراند:</strong> {item.product?.brand || item.price}</p>
                <p><strong>الكاتيجوري:</strong> {item.product?.category || item.price}</p>
                <p>
                  <strong>الحالة:</strong>{' '}
                  <span style={{ color: getStatusColor(item.status), fontWeight: 'bold' }}>
                    {item.status || 'قيد الانتظار'}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-orders">لا توجد طلبات حتى الآن.</p>
      )}
    </div>
  );
};

export default React.memo(Profile);
