import api from "./instanceAPI";

// Home Feed API 
export const homeFeedFetch = async (page = 0) => {

    try {
        const response = await api.get(`/feed?page=${page}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || "Something went wrong!";
    }

}