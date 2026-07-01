import React from "react";

function TwoFactorAuthentication() {
  return (
    <div className="settings-form">
      <h2 className="sf-section-title">2F Authentication</h2>
      <p className="section-subtitle">Add an extra layer of security to your account</p>
      <p className="info-text">Two-factor authentication requires a verification code in addition to your password.</p>
      <button className="save-btn">Enable 2FA</button>
    </div>
  );
}

export default TwoFactorAuthentication;