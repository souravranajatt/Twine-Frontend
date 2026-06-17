import api from "./instanceAPI";

// Add like on a post
export const likePostAPI = async (postId) => {
    try {
        const response = await api.post(`/v2/posts/${postId}/like`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Dislike on a post
export const dislikePostAPI = async (postId) => {
    try {
        const response = await api.delete(`/v2/posts/${postId}/unlike`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Save a Post 
export const savePostAPI = async (postId) => {
    try {
        const response = await api.post(`/v2/posts/${postId}/save`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Unsaved a post
export const unsavePostAPI = async (postId) => {
    try {
        const response = await api.delete(`/v2/posts/${postId}/unsave`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Post a Comment
export const postCommentAPI = async (postId, data) => {
    try {
        const response = await api.post(`/v2/posts/${postId}/comment`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Fetch Comments of a post
export const fetchCommentsAPI = async (postId, page = 0) => {
    try {
        const response = await api.get(`/v2/posts/${postId}/comments?page=${page}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};



