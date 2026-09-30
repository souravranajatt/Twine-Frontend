import api from "./instanceAPI";

export const searchUsersAPI = async (query, signal) => {

    try {
        const response = await api.get(`/search/users?query=${query}`, { signal });
        return response.data;
    } catch (error) {
        throw error.response?.data || "Something went wrong!";
    }

};

export const searchUsersForTaggingAPI = async (query, signal) => {

    try {
        const response = await api.get(`/search/tagging?query=${query}`, { signal });
        return response.data;
    } catch (error) {
        throw error.response?.data || "Something went wrong!";
    }

};