import api from "./instanceAPI";

// Setting Data API
export const settingDataAPI = async () => {
    try {
        const res = await api.get("/settings/account/profile-fetch");
        return res.data;
    } catch (err) {
        throw err.response?.data || err;
    }
};

// Setting Profile Data Update API
export const updateProfileAPI = async (data) => {
    try {
        const res = await api.put("/settings/account/profile-update", data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err;
    }
};

// Privacy Status Update API (Private Account)
export const updatePrivacyAPI = async (isPrivate) => {
    try {
        const res = await api.patch("/settings/privacy/private-account", isPrivate, {
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
        const res = await api.patch("/settings/account/deactivate", deactivationData, {
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
        const res = await api.put("/settings/security/password-change", passwordData, {
            headers: { 'Content-Type': 'application/json' }
        });
        return res.data;
    } catch (err) {
        const errorData = err.response?.data || err;
        throw typeof errorData === 'string' ? { message: errorData } : errorData;
    }
};

// Login Active Session Fetch 
export const activeSessionFetchAPI = async () => {
    try {
        const res = await api.get("/settings/security/login-activity");
        return res.data;
    } catch (err) {
        const errorData = err.response?.data || err;
        throw typeof errorData === 'string' ? { message: errorData } : errorData;
    }
};

// Fetch Blocked List API
export const fetchBlockedListAPI = async () => {
    try {
        const res = await api.get("/settings/privacy/block-list");
        return res.data;
    } catch (err) {
        const errorData = err.response?.data || err;
        throw typeof errorData === 'string' ? { message: errorData } : errorData;
    }
};

// User Personal Details Fetch API
export const userPersonalDetailsFetchAPI = async () => {
    try {
        const res = await api.get("/settings/account/personal-details-fetch");
        return res.data;
    } catch (err) {
        const errorData = err.response?.data || err;
        throw typeof errorData === 'string' ? { message: errorData } : errorData;
    }
};

// User Personal Details Update API
export const userPersonalDetailsUpdateAPI = async (data) => {
    try {
        const res = await api.put("/settings/account/personal-details-update", data, {
            headers: { 'Content-Type': 'application/json' }
        });
        return res.data;
    } catch (err) {
        const errorData = err.response?.data || err;
        throw typeof errorData === 'string' ? { message: errorData } : errorData;
    }
};

// Fetch Saved Posts API
export const fetchSavedPostsAPI = async (page = 0) => {
    try {
        const res = await api.get(`/settings/activity/saved-posts?page=${page}`);
        return res.data;
    } catch (err) {
        const errorData = err.response?.data || err;
        throw typeof errorData === 'string' ? { message: errorData } : errorData;
    }
};

// Archive Posts API
export const fetchArchivePostsAPI = async (page = 0) => {
    try {
        const res = await api.get(`/settings/activity/archive-posts?page=${page}`);
        return res.data;
    } catch (err) {
        const errorData = err.response?.data || err;
        throw typeof errorData === 'string' ? { message: errorData } : errorData;
    }
};

// Fetch Interaction Preferences API
export const fetchInteractionPreferencesAPI = async () => {
    try {
        const res = await api.get("/settings/privacy/intreaction-settings");
        return res.data;
    } catch (err) {
        const errorData = err.response?.data || err;
        throw typeof errorData === 'string' ? { message: errorData } : errorData;
    }
};

// Hide Like Counts API
export const hideLikeDefaultSettingAPI = async () => {
    try {
        const res = await api.patch("/settings/privacy/hide-like");
        return res.data;
    } catch (err) {
        const errorData = err.response?.data || err;
        throw typeof errorData === 'string' ? { message: errorData } : errorData;
    }
};

// Show Like Counts API
export const showLikeDefaultSettingAPI = async () => {
    try {
        const res = await api.patch("/settings/privacy/show-like");
        return res.data;
    } catch (err) {
        const errorData = err.response?.data || err;
        throw typeof errorData === 'string' ? { message: errorData } : errorData;
    }
};

// Turn Off Commenting API
export const turnOffCommentingDefaultSettingAPI = async () => {
    try {
        const res = await api.patch("/settings/privacy/turn-off-commenting");
        return res.data;
    } catch (err) {
        const errorData = err.response?.data || err;
        throw typeof errorData === 'string' ? { message: errorData } : errorData;
    }
};

// Turn On Commenting API
export const turnOnCommentingDefaultSettingAPI = async () => {
    try {
        const res = await api.patch("/settings/privacy/turn-on-commenting");
        return res.data;
    } catch (err) {
        const errorData = err.response?.data || err;
        throw typeof errorData === 'string' ? { message: errorData } : errorData;
    }
};

// Update Tagging Preference API
export const updateTaggingPreferenceAPI = async (visibility) => {
    try {
        console.log("Sending tagging preference:", visibility);
        const res = await api.patch("/settings/privacy/tagging-preference", { visibility }, {
            headers: { 'Content-Type': 'application/json' }
        });
        return res.data;
    } catch (err) {
        console.error("Tagging preference error:", err.response?.data);
        const errorData = err.response?.data || err;
        throw typeof errorData === 'string' ? { message: errorData } : errorData;
    }
};

// Update Mention Preference API
export const updateMentionPreferenceAPI = async (visibility) => {
    try {
        console.log("Sending mention preference:", visibility);
        const res = await api.patch("/settings/privacy/mention-preference", { visibility }, {
            headers: { 'Content-Type': 'application/json' }
        });
        return res.data;
    } catch (err) {
        console.error("Mention preference error:", err.response?.data);
        const errorData = err.response?.data || err;
        throw typeof errorData === 'string' ? { message: errorData } : errorData;
    }
};



