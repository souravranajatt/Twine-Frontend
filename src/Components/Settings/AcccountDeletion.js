import React from "react";

function AcccountDeletion() {
  return (
    <div className="settings-form">
      <h2>Account Deletion</h2>
      <p className="section-subtitle">Permanently delete your account</p>
      <p className="warning-text danger">This action cannot be undone. All your data will be permanently deleted.</p>
      <button className="delete-btn">Delete Account Permanently</button>
    </div>
  );
}

export default AcccountDeletion;
