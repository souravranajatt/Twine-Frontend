import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { deactivateAccountAPI } from "../../Utils/SettingDataAPI.js";
import { logoutHandleAPI } from "../../Utils/authAPI.js";

function AccountDeactivate({ setShowExpiredPopup }) {
  const navigate = useNavigate();
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivateReason, setDeactivateReason] = useState("Need a break");
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isSubmitting = useRef(false);

  // Handle Account Deactivation
  const handleDeactivateAccount = async (e) => {
    e.preventDefault();

    if (isSubmitting.current || isLoading) return;
    setStatusMessage(null);

    if (!deactivatePassword) {
      setStatusMessage("Please enter your password to deactivate.");
      setStatusType("error");
      return;
    }

    isSubmitting.current = true;
    setIsLoading(true);

    try {
      const deactivationData = {
        password: deactivatePassword,
        reason: deactivateReason
      };

      await deactivateAccountAPI(deactivationData);

      setShowExpiredPopup(true);
      await logoutHandleAPI();

      navigate("/login", { replace: true });

    } catch (err) {
      setStatusMessage(err.message || err.error || "Failed to deactivate account.");
      setStatusType("error");
    } finally {
      setIsLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="settings-form">
      <h2 className="sf-section-title">Deactivate Account</h2>
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
          <button type="submit" className="deactivate-btn" disabled={isLoading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: '180px' }}>
            {isLoading ? <Loader2 size={20} className="spin-icon" style={{ color: '#ffffff' }} /> : 'Deactivate Account'}
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