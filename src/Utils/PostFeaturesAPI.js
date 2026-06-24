import api from "./instanceAPI";

// Post Upload API...
export const uploadPostAPI = async (formData) => {
    try {
        const response = await api.post("/post/upload", formData);
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

// Fetch Comments of a post
export const fetchCommentsAPI = async (postId, page = 0) => {
    try {
        const response = await api.get(`/post/${postId}/comments?page=${page}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};