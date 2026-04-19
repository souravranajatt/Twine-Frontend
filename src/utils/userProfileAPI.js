import api from "./instanceAPI";

// ✅ User Profile API (pass username dynamically)....
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

// Post Upload API...
export const uploadPostAPI = async (formData) => {
  try {
    const response = await api.post("/post/uploadpost", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Something went wrong!";
  }

}

// Fetch Logged User Data...
export const loggedUserDataAPI = async () => {
  try {
    const response = await api.get("/profile/data/loggeduser");
    return response.data;
  } catch (error) {
    throw error.response.data || "Something went wrong!";
  }
}

// Follow User API....
export const followUserAPI = async (followData) => {
  try {
    const res = await api.post("/action/follow/request/user", followData);
    return res.data;
  } catch (err) {
    throw new err.response.data || "Something went wrong!";
  }
}

// ✅ Search User Posts API (Paginated)...
export const searchUserPostsAPI = async (username, page = 0) => {
  try {
    const response = await api.get(`/profile/${encodeURIComponent(username)}/post?page=${page}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Something went wrong!";
  }
}

// Send Like Anonyms API
export const sendLikeAPI = async () => {
  try {
    const res = await api.post();
    return res.data;
  } catch (err) {
    // Err
  }
}
