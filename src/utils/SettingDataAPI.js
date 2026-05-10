import api from "./instanceAPI";

// Setting Data API
export const settingDataAPI = async () => {
    try {
        const res = await api.get("/profile/data/setting");
        return res.data;
    } catch (err) {
        throw err.response?.data || err;
    }
};
