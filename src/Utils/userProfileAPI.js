import api from "./instanceAPI";

//  User Profile API (pass username dynamically)....
export const userProfilePageAPI = async (username) => {
  try {
    const response = await api.get(`/profile/${encodeURIComponent(username)}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error("NotFoundUserProfileURL");
    } else {
      throw new Error("ErrorUserProfileURL");
    }
  }
};

// Follow User API
export const followUserAPI = async (targetUserId) => {
  try {
    const res = await api.post(`/v1/user/follow/${targetUserId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Something went wrong!";
  }
};

// Unfollow User API
export const unfollowUserAPI = async (targetUserId) => {
  try {
    const res = await api.delete(`/v1/user/unfollow/${targetUserId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Something went wrong!";
  }
};

// Cancel Follow Request API
export const cancelFollowRequestAPI = async (targetUserId) => {
  try {
    const res = await api.delete(`/v1/user/follow/cancel/${targetUserId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Something went wrong!";
  }
};

// Block User API....
export const blockUserAPI = async (targetUserId) => {
  try {
    const res = await api.post(`/v1/user/block/${targetUserId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Something went wrong!";
  }
};

// UnBlock User API....
export const unblockUserAPI = async (targetUserId) => {
  try {
    const res = await api.delete(`/v1/user/unblock/${targetUserId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Something went wrong!";
  }
};

// Search User Posts API...
export const searchUserPostsAPI = async (username, page = 0) => {
  try {
    const response = await api.get(`/profile/${encodeURIComponent(username)}/post?page=${page}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Something went wrong!";
  }
};

// Search User Timeline Posts API...
export const searchUserTimelinePostsAPI = async (username, page = 0) => {
  try {
    const response = await api.get(
      `/profile/${encodeURIComponent(username)}/timeline?page=${page}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Something went wrong!";
  }
};

// Tagged Posts
export const searchUserTaggedPostsAPI = async (username, page = 0) => {
  try {
    const response = await api.get(
      `/profile/${encodeURIComponent(username)}/tagged?page=${page}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Something went wrong!";
  }
};

// Send Secret Crush API
export const sendSecretCrushAPI = async (targetUserId) => {
  try {
    const res = await api.post(`/v1/user/secret-crush/${targetUserId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Something went wrong!";
  }
};

// Fetch followers list (paginated)
export const fetchFollowersAPI = async (targetUserId, page = 0) => {
  try {
    const response = await api.get(`/profile/${targetUserId}/follower?page=${page}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Something went wrong!";
  }
};
