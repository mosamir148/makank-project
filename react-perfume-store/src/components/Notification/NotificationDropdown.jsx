import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationContext } from '../../context/NotificationContext';
import { userContext } from '../../context/UserContext';
import { useLang } from '../../context/LangContext';
import { 
  FaBox, 
  FaTimesCircle, 
  FaUserEdit, 
  FaBell,
  FaCheckCircle,
  FaShippingFast,
  FaTrash
} from 'react-icons/fa';
import './NotificationDropdown.css';
import Loading from '../Loading/Loading';

const NotificationDropdown = ({ onClose }) => {
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useContext(notificationContext);
  const { user } = useContext(userContext);
  const { t, lang } = useLang();
  const navigate = useNavigate();
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

  useEffect(() => {
    refreshNotifications();
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    // Navigate based on notification type and user role
    const isAdmin = user?.role === 'admin';
    
    if (notification.relatedOrder) {
      const orderId = notification.relatedOrder._id || notification.relatedOrder;
      
      // Admin navigation to order detail page
      if (isAdmin) {
        navigate(`/dashboard/cart/${orderId}`);
      } else {
        // User navigation to order detail page
        navigate(`/orders/${orderId}`);
      }
    } else if (notification.type === 'user_info_updated') {
      navigate('/profile');
    } else if (notification.type === 'order_created' && isAdmin) {
      // Admin: new order created, go to orders list (no specific order ID)
      navigate('/dashboard/carts');
    }

    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    if (minutes < 1) return lang === 'ar' ? 'الآن' : 'Just now';
    if (minutes < 60) return lang === 'ar' ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
    if (hours < 24) return lang === 'ar' ? `منذ ${hours} ساعة` : `${hours}h ago`;
    if (days < 7) return lang === 'ar' ? `منذ ${days} يوم` : `${days}d ago`;
    if (weeks < 4) return lang === 'ar' ? `منذ ${weeks} أسبوع` : `${weeks}w ago`;
    if (months < 12) return lang === 'ar' ? `منذ ${months} شهر` : `${months}mo ago`;
    
    return date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getNotificationIcon = (type) => {
    const iconProps = { size: 20, className: 'notification-icon-svg' };
    switch (type) {
      case 'order_created':
        return <FaBox {...iconProps} style={{ color: '#007bff' }} />;
      case 'order_status_changed':
        return <FaBox {...iconProps} style={{ color: '#007bff' }} />;
      case 'order_pending':
        return <FaBox {...iconProps} style={{ color: '#ffc107' }} />;
      case 'order_processing':
        return <FaBox {...iconProps} style={{ color: '#17a2b8' }} />;
      case 'order_cancelled':
        return <FaTimesCircle {...iconProps} style={{ color: '#dc3545' }} />;
      case 'user_info_updated':
        return <FaUserEdit {...iconProps} style={{ color: '#28a745' }} />;
      case 'order_shipped':
        return <FaShippingFast {...iconProps} style={{ color: '#17a2b8' }} />;
      case 'order_delivered':
        return <FaCheckCircle {...iconProps} style={{ color: '#28a745' }} />;
      case 'payment_received':
        return <FaCheckCircle {...iconProps} style={{ color: '#28a745' }} />;
      case 'payment_failed':
        return <FaTimesCircle {...iconProps} style={{ color: '#dc3545' }} />;
      default:
        return <FaBell {...iconProps} style={{ color: '#6c757d' }} />;
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className={`notification-dropdown ${isDarkMode ? 'dark-mode' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="notification-dropdown-header">
          <h3>{t('notifications')}</h3>
        </div>
        <div className="notification-loading">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className={`notification-dropdown ${isDarkMode ? 'dark-mode' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="notification-dropdown-header">
        <h3>{t('notifications')}</h3>
        {notifications.length > 0 && (
          <button
            className="mark-all-read-btn"
            onClick={() => {
              markAllAsRead();
            }}
            aria-label={t('markAllAsRead')}
          >
            {t('markAllAsRead')}
          </button>
        )}
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="notification-empty">
            <div className="notification-empty-icon">
              <FaBell size={48} />
            </div>
            <p>{t('noNotifications')}</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">{formatDate(notification.createdAt)}</div>
              </div>
              {!notification.isRead && (
                <div className="notification-unread-indicator" aria-label="Unread"></div>
              )}
              <button
                className="notification-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification._id);
                }}
                aria-label={lang === 'ar' ? 'حذف الإشعار' : 'Delete notification'}
                title={lang === 'ar' ? 'حذف' : 'Delete'}
              >
                <FaTrash size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;

