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

// Fetch Logged User Data...
export const loggedUserDataAPI = async () => {
  try {
    const response = await api.get("/profile/data/loggeduser");
    return response.data;
  } catch (error) {
    throw error.response.data || "Something went wrong!";
  }
};

// Follow User API....
export const followUserAPI = async (followData) => {
  try {
    const res = await api.post("/v1/user/follow", followData);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Something went wrong!";
  }
};

// Block User API....
export const blockUserAPI = async (blockData) => {
  try {
    const res = await api.post("/v1/user/block", blockData);
    return res.data;
  } catch (err) {
    throw err.response?.data || "Something went wrong!";
  }
};

// UnBlock User API....
export const unblockUserAPI = async (blockData) => {
  try {
    const res = await api.post("/v1/user/unblock", blockData);
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

// Tagged Posts (Paginated Grid)
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

// Send Like Anonyms API
export const sendLikeAPI = async () => {
  try {
    const res = await api.post();
    return res.data;
  } catch (err) {
    // Err
  }
};
