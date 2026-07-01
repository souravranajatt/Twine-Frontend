import React, { useState, useRef } from "react";
import { updatePrivacyAPI } from "../../Utils/SettingDataAPI.js";

function AccountPrivate({ profileData, setProfileData }) {
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState("");
  const isSubmitting = useRef(false);

  // Handle Private Account Privacy API
  const handlePrivacyToggle = async () => {
    if (!profileData || isSubmitting.current) return;
    isSubmitting.current = true;

    const newPrivacyStatus = !profileData.privateAccount;

    // Optimistic Update
    setProfileData(prev => ({
      ...prev,
      privateAccount: newPrivacyStatus
    }));

    try {
      await updatePrivacyAPI(newPrivacyStatus);
    } catch (err) {
      // Revert on error
      setProfileData(prev => ({
        ...prev,
        privateAccount: !newPrivacyStatus
      }));
      setStatusMessage("Error Occurred");
      setStatusType("error");
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      isSubmitting.current = false;
    }
  };

  return (
    <div className="settings-form">
      <h2 className="sf-section-title">Private Account</h2>
      <p className="section-subtitle">Control who can see your profile and posts</p>

      <div className="privacy-toggle-container">
        <div className="privacy-info">
          <h3>Private Account</h3>
          <p>When private, people must request to follow you and cannot see your posts.</p>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={profileData?.privateAccount || false}
            onChange={handlePrivacyToggle}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      {statusMessage && (
        <p className={`status-text ${statusType}`} style={{ marginTop: '16px' }}>
          {statusMessage}
        </p>
      )}
    </div>
  );
}

export default AccountPrivate;