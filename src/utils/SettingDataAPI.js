import api from "./instanceAPI";

// Setting Data API
export const settingDataAPI = async () => {
    try {
        const res = await api.get("/setting/profile/fetch");
        return res.data;
    } catch (err) {
        throw err.response?.data || err;
    }
};

// Setting Profile Data Update API
export const updateProfileAPI = async (data) => {
    try {
        const res = await api.put("/setting/profile/update", data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err;
    }
};

// Privacy Status Update API (Partial Update)
export const updatePrivacyAPI = async (isPrivate) => {
    try {
        const res = await api.put("/setting/privacy/private/update", isPrivate, {
            headers: { 'Content-Type': 'application/json' }
        });
        return res.data;
    } catch (err) {
        throw err.response?.data || err;
    }
};

// Account Deactivate API
export const deactivateAccountAPI = async (deactivationData) => {
    try {
        const res = await api.put("/setting/account/deactivate", deactivationData, {
            headers: { 'Content-Type': 'application/json' }
        });
        return res.data;
    } catch (err) {
        const errorData = err.response?.data || err;
        throw typeof errorData === 'string' ? { message: errorData } : errorData;
    }
};

// Password Update API
export const updatePasswordAPI = async (passwordData) => {
    try {
        const res = await api.put("/setting/password/update", passwordData, {
            headers: { 'Content-Type': 'application/json' }
        });
        return res.data;
    } catch (err) {
        const errorData = err.response?.data || err;
        throw typeof errorData === 'string' ? { message: errorData } : errorData;
    }
};
