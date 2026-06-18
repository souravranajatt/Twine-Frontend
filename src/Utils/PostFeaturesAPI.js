import api from "./instanceAPI";

// Post Upload API...
export const uploadPostAPI = async (formData) => {
    try {
        const response = await api.post("/post/uploadpost", formData);
        return response.data;
    } catch (error) {
        throw error.response?.data || "Something went wrong!";
    }
};

// Specific Post Fetch API...
export const postFetchAPI = async (postId) => {
    try {
        const response = await api.get(`/post/${postId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || "Something went wrong!";
    }
};