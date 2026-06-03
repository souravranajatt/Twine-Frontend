import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deactivateAccountAPI } from "../../Utils/SettingDataAPI.js";
import { logoutHandleAPI } from "../../Utils/authAPI.js";

function AccountDeactivate({ setShowExpiredPopup }) {
  const navigate = useNavigate();
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivateReason, setDeactivateReason] = useState("Need a break");
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle Account Deactivation
  const handleDeactivateAccount = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!deactivatePassword) {
      setStatusMessage("Please enter your password to deactivate.");
      setStatusType("error");
      return;
    }

    try {
      setIsLoading(true);

      const deactivationData = {
        password: deactivatePassword,
        reason: deactivateReason
      };

      // 1. Deactivate Account
      await deactivateAccountAPI(deactivationData);

      // 2. Call Logout API
      await logoutHandleAPI();

      // 3. Show "Session Expired" Msg
      setShowExpiredPopup(true);

      // 4. Wait for 5 seconds then redirect
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 5000);

    } catch (err) {
      setStatusMessage(err.message || err.error || "Failed to deactivate account.");
      setStatusType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="settings-form">
      <h2>Deactivate Account</h2>
      <p className="section-subtitle">Temporarily deactivate your account</p>
      <p className="warning-text">Your account will be hidden from public view. You can reactivate it anytime by logging back in.</p>

      <form onSubmit={handleDeactivateAccount}>
        <div className="form-group" style={{ marginTop: '20px' }}>
          <label>Reason for Deactivation</label>
          <div className="select-wrapper">
            <select
              value={deactivateReason}
              onChange={(e) => setDeactivateReason(e.target.value)}
            >
              <option value="Need a break">Need a break</option>
              <option value="Privacy concerns">Privacy concerns</option>
              <option value="Too many notifications">Too many notifications</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '20px' }}>
          <label>Enter Password to Confirm</label>
          <input
            type="password"
            name="current-password"
            placeholder="Password"
            value={deactivatePassword}
            onChange={(e) => setDeactivatePassword(e.target.value)}
          />
        </div>

        <div className="form-actions-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
          <button type="submit" className="deactivate-btn" disabled={isLoading}>
            {isLoading ? 'Deactivating...' : 'Deactivate Account'}
          </button>
          {statusMessage && (
            <span className={`status-text ${statusType}`}>
              {statusMessage}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

export default AccountDeactivate;