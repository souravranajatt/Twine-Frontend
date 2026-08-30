import React from "react";

function AcccountDeletion() {
  return (
    <div className="del-main-container">
      <h2 className="sf-section-title">Account Deletion</h2>
      <p className="section-subtitle">Permanently delete your account</p>
      
      <p className="warning-text danger">
        This action cannot be undone. All your data will be permanently deleted.
      </p>

      <div className="del-conditions-box">
        <h4 className="del-conditions-title">Before deleting, please note:</h4>
        <ul className="del-conditions-list">
          <li className="del-condition-item">
            All your posts, photos, videos, captions, and saved items will be permanently erased.
          </li>
          <li className="del-condition-item">
            Your followers, following list, likes, comments, and conversation history will be lost.
          </li>
          <li className="del-condition-item">
            Your username will become available for anyone else to register.
          </li>
          <li className="del-condition-item">
            You cannot recover or reactivate this account once deletion is processed.
          </li>
        </ul>
      </div>

      <button className="delete-btn">Delete Account Permanently</button>
    </div>
  );
}

export default AcccountDeletion;
