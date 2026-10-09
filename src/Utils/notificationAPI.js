import api from "./instanceAPI";

// 1. Get Paginated Notifications Feed
export const getNotificationsAPI = async (page = 0) => {
  try {
    const response = await api.get(`/notifications?page=${page}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch notifications";
  }
};

// 2. Get Fast Unread Notification Count (Badge)
export const getUnreadCountAPI = async () => {
  try {
    const response = await api.get("/notifications/unread-count");
    return response.data;
  } catch (error) {
    throw error.response?.data || { unreadCount: 0 };
  }
};

// 3. Mark Single Notification as Read
export const markAsReadAPI = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to mark as read";
  }
};

// 4. Mark All Notifications as Read
export const markAllAsReadAPI = async () => {
  try {
    const response = await api.put("/notifications/read-all");
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to mark all as read";
  }
};
