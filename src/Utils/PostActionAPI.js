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
        const response = await api.patch(`/v2/posts/${postId}/archive`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Unarchive a post
export const unarchivePostAPI = async (postId) => {
    try {
        const response = await api.patch(`/v2/posts/${postId}/unarchive`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Hide Likes
export const hideLikeAPI = async (postId) => {
    try {
        const response = await api.patch(`/v2/posts/${postId}/hide-likes`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Unhide Likes
export const unhideLikeAPI = async (postId) => {
    try {
        const response = await api.patch(`/v2/posts/${postId}/show-likes`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Disable Commenting on a Post 
export const disableCommentingAPI = async (postId) => {
    try {
        const response = await api.patch(`/v2/posts/${postId}/disable-comments`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Enable Commenting on a Post 
export const enableCommentingAPI = async (postId) => {
    try {
        const response = await api.patch(`/v2/posts/${postId}/enable-comments`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete a post
export const deletePostAPI = async (postId) => {
    try {
        const response = await api.delete(`/v2/posts/${postId}/delete`);
        return response.data;
    } catch (error) {
        throw error;
    }
};


