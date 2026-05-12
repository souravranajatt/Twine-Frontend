import api from "./instanceAPI";

// Setting Data API
export const settingDataAPI = async () => {
    try {
        const res = await api.get("/profile/setting/fetch");
        return res.data;
    } catch (err) {
        throw err.response?.data || err;
    }
};

// Setting Profile Data Update API
export const updateProfileAPI = async (data) => {
    try {
        const res = await api.put("/profile/setting/update", data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err;
    }
};

// Privacy Status Update API (Partial Update)
export const updatePrivacyAPI = async (isPrivate) => {
    try {
        const res = await api.put("/profile/setting/privacy/private/update", isPrivate, {
            headers: { 'Content-Type': 'application/json' }
        });
        return res.data;
    } catch (err) {
        throw err.response?.data || err;
    }
};
