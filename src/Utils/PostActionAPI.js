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

// Archive a post
export const archivePostAPI = async (postId) => {
    try {
        const response = await api.put(`/v2/posts/${postId}/archive`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

