import axios from 'axios';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { BASE_URL } from '../assets/url';
import { userContext } from './UserContext';
import toast from 'react-hot-toast';

export const notificationContext = createContext({});

const NotificationContextProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(userContext);
  const previousUnreadCountRef = useRef(0);
  const previousNotificationsRef = useRef([]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const endpoint = user.role === 'admin' 
        ? `${BASE_URL}/notification/admin`
        : `${BASE_URL}/notification/user`;
      
      const res = await axios.get(endpoint, {
        params: { page: 1, limit: 50 },
        withCredentials: true,
        validateStatus: (status) => status === 200 || status === 404,
      });

      if (res.status === 404) {
        // Backend route not available yet - silently handle
        setNotifications([]);
        return;
      }

      const fetchedNotifications = res.data.notifications || [];
      setNotifications(fetchedNotifications);
      
      // Check for new notifications and show toast
      if (previousNotificationsRef.current.length > 0) {
        const newNotifications = fetchedNotifications.filter(
          (newNotif) => !previousNotificationsRef.current.some(
            (oldNotif) => oldNotif._id === newNotif._id
          )
        );
        
        // Show toast for new notifications (only unread ones)
        newNotifications
          .filter(notif => !notif.isRead)
          .slice(0, 3) // Limit to 3 toasts to avoid spam
          .forEach((notif) => {
            toast.success(notif.title, {
              duration: 4000,
              icon: '🔔',
              position: 'top-right',
            });
          });
      }
      
      previousNotificationsRef.current = fetchedNotifications;
    } catch (err) {
      // Silently handle errors - backend might not be running or routes not loaded
      if (err.response?.status !== 404) {
        console.error('Error fetching notifications:', err);
      }
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const res = await axios.get(`${BASE_URL}/notification/unread-count`, {
        withCredentials: true,
        validateStatus: (status) => status === 200 || status === 404,
      });
      
      if (res.status === 404) {
        // Backend route not available yet - silently handle
        setUnreadCount(0);
        return;
      }
      
      const newUnreadCount = res.data.unreadCount || 0;
      const previousCount = previousUnreadCountRef.current;
      
      // Show notification badge animation if count increased
      if (newUnreadCount > previousCount && previousCount > 0) {
        // New notifications arrived - visual feedback is handled by badge
      }
      
      previousUnreadCountRef.current = newUnreadCount;
      setUnreadCount(newUnreadCount);
    } catch (err) {
      // Silently handle errors - backend might not be running or routes not loaded
      if (err.response?.status !== 404) {
        console.error('Error fetching unread count:', err);
      }
      setUnreadCount(0);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    // Validate notificationId
    if (!notificationId) {
      console.warn('markAsRead called with invalid notificationId');
      return;
    }

    // Optimistically update UI first for better UX
    const previousNotifications = [...notifications];
    setNotifications((prev) =>
      prev.map((notif) =>
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const response = await axios.put(
        `${BASE_URL}/notification/read/${notificationId}`,
        {},
        { 
          withCredentials: true,
          validateStatus: (status) => status === 200 || status === 404 || status === 400 || status === 403
        }
      );
      
      // If 404/403/400, the notification might not exist or doesn't belong to user
      // UI is already updated optimistically, so we just log a warning
      if (response.status === 404 || response.status === 403 || response.status === 400) {
        // Notification might have been deleted or doesn't belong to user
        // Remove it from the list if it doesn't exist
        if (response.status === 404) {
          setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));
        }
        return;
      }
      
      // Success - update with server response if needed
      if (response.data?.notification) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId ? { ...notif, ...response.data.notification } : notif
          )
        );
      }
    } catch (err) {
      // Revert optimistic update on unexpected errors
      if (err.response?.status && err.response.status >= 500) {
        setNotifications(previousNotifications);
        setUnreadCount((prev) => prev + 1);
        console.error('Error marking notification as read:', err);
      } else {
        // For 404/403/400, notification might not exist - remove it
        if (err.response?.status === 404 || err.response?.status === 403) {
          setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));
        }
        // UI is already updated optimistically, so we don't need to do anything else
      }
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.put(
        `${BASE_URL}/notification/read-all`,
        {},
        { withCredentials: true }
      );
      
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${BASE_URL}/notification/${notificationId}`, {
        withCredentials: true,
      });
      
      const notification = notifications.find((n) => n._id === notificationId);
      setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));
      
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Refresh notifications
  const refreshNotifications = () => {
    fetchNotifications();
    fetchUnreadCount();
  };

  // Fetch notifications when user changes
  useEffect(() => {
    if (user) {
      // Initial fetch
      fetchNotifications();
      fetchUnreadCount();
      
      // Poll for new notifications every 20 seconds (more responsive)
      const interval = setInterval(() => {
        fetchUnreadCount();
        fetchNotifications();
      }, 20000);

      return () => {
        clearInterval(interval);
        // Reset refs when user logs out
        previousUnreadCountRef.current = 0;
        previousNotificationsRef.current = [];
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
      previousUnreadCountRef.current = 0;
      previousNotificationsRef.current = [];
    }
  }, [user]);

  return (
    <notificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
        fetchNotifications,
        fetchUnreadCount,
      }}
    >
      {children}
    </notificationContext.Provider>
  );
};

export default NotificationContextProvider;

