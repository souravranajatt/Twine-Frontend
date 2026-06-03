import React from "react";

function ActiveSession() {
  return (
    <div className="settings-form">
      <h2>Active Sessions</h2>
      <p className="section-subtitle">Manage your active login sessions</p>
      <div className="sessions-list">
        <div className="session-item">
          <div className="session-info">
            <p className="session-device">Chrome on macOS</p>
            <p className="session-location">Last active: 2 hours ago</p>
          </div>
          <button className="logout-btn">Logout</button>
        </div>
      </div>
    </div>
  );
}

export default ActiveSession;