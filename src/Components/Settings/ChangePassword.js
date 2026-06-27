import React, { useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import { updatePasswordAPI } from "../../Utils/SettingDataAPI.js";

function ChangePassword() {
  const [password, setPassword] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isSubmitting = useRef(false);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPassword(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit Password Change
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (isSubmitting.current || isLoading) return;
    setStatusMessage(null);

    // ====== Frontend Validation ======
    if (!password.oldPassword) {
      setStatusType("error");
      return setStatusMessage("Current password is required!");
    }
    if (!password.newPassword) {
      setStatusType("error");
      return setStatusMessage("New password is required!");
    }
    if (password.newPassword.length < 8) {
      setStatusType("error");
      return setStatusMessage("New password must be at least 8 characters!");
    }
    if (password.newPassword !== password.confirmPassword) {
      setStatusType("error");
      return setStatusMessage("Passwords do not match!");
    }
    if (password.oldPassword === password.newPassword) {
      setStatusType("error");
      return setStatusMessage("New password must be different from current password!");
    }

    isSubmitting.current = true;
    setIsLoading(true);

    try {

      const passwordData = {
        oldPassword: password.oldPassword,
        newPassword: password.newPassword
      };
      await updatePasswordAPI(passwordData);

      setStatusMessage("Password updated successfully!");
      setStatusType("success");

      // Reset password fields on success
      setPassword({ oldPassword: "", newPassword: "", confirmPassword: "" });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
    } catch (err) {
      console.error("Error updating password:", err);
      setStatusMessage(err.message || err.error || (typeof err === 'string' ? err : "Failed to update password. Please try again."));
      setStatusType("error");
    } finally {
      setIsLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="settings-form">
      <h2>Change Password</h2>
      <p className="section-subtitle">Update your password to keep your account secure</p>

      <form onSubmit={handleUpdatePassword}>
        <div className="form-group">
          <label>Current Password</label>
          <input
            type="password"
            id="current-password"
            name="oldPassword"
            autoComplete="current-password"
            placeholder="Enter current password"
            value={password.oldPassword}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            id="new-password"
            name="newPassword"
            autoComplete="new-password"
            placeholder="Enter new password (min 8 characters)"
            value={password.newPassword}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            id="confirm-password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={password.confirmPassword}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-actions-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
          <button type="submit" className="save-btn" disabled={isLoading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: '170px' }}>
            {isLoading ? <Loader2 size={20} className="spin-icon" style={{ color: '#ffffff' }} /> : "Update Password"}
          </button>
          {statusMessage && (
            <span className={`status-text ${statusType}`}>{statusMessage}</span>
          )}
        </div>
      </form>
    </div>
  );
}

export default ChangePassword;