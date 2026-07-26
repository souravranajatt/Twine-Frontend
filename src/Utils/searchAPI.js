import api from "./instanceAPI";

export const searchUsersAPI = async (query, signal) => {

    try {
        const response = await api.get(`/users/search?query=${query}`, { signal });
        return response.data;
    } catch (error) {
        throw error.response?.data || "Something went wrong!";
    }

}