import React, { useState } from "react";
import HeaderArea from "../Components/Header";
import FooterArea from "../Components/Footer";
import "../Assets/Bundle/Settings.css";

function Settings() {
  const [activeSection, setActiveSection] = useState("edit-profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case "edit-profile":
        return (
          <div className="settings-form">
            <h2>Edit Profile</h2>
            <p className="section-subtitle">Update your profile photo, name and bio</p>
            
            <div className="form-group">
              <label>Full name</label>
              <input type="text" placeholder="Your name" />
            </div>

            <div className="form-group">
              <label>Username</label>
              <input type="text" placeholder="@username" />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea placeholder="Write something..."></textarea>
            </div>

            <button className="save-btn">Save changes</button>
          </div>
        );

      case "change-details":
        return (
          <div className="settings-form">
            <h2>Change Details</h2>
            <p className="section-subtitle">Update your email and phone number</p>
            
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="your@email.com" />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" placeholder="+1 (555) 000-0000" />
            </div>

            <button className="save-btn">Save changes</button>
          </div>
        );

      case "deactivate":
        return (
          <div className="settings-form">
            <h2>Deactivate Account</h2>
            <p className="section-subtitle">Temporarily deactivate your account</p>
            <p className="warning-text">Your account will be hidden from public view. You can reactivate it anytime.</p>
            <button className="deactivate-btn">Deactivate Account</button>
          </div>
        );

      case "delete-account":
        return (
          <div className="settings-form">
            <h2>Account Deletion</h2>
            <p className="section-subtitle">Permanently delete your account</p>
            <p className="warning-text danger">This action cannot be undone. All your data will be permanently deleted.</p>
            <button className="delete-btn">Delete Account Permanently</button>
          </div>
        );

      case "change-password":
        return (
          <div className="settings-form">
            <h2>Change Password</h2>
            <p className="section-subtitle">Update your password to keep your account secure</p>
            
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" placeholder="Enter current password" />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input type="password" placeholder="Enter new password" />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Confirm new password" />
            </div>

            <button className="save-btn">Save changes</button>
          </div>
        );

      case "active-sessions":
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

      case "2fa":
        return (
          <div className="settings-form">
            <h2>2F Authentication</h2>
            <p className="section-subtitle">Add an extra layer of security to your account</p>
            <p className="info-text">Two-factor authentication requires a verification code in addition to your password.</p>
            <button className="save-btn">Enable 2FA</button>
          </div>
        );

      case "private-account":
        return (
          <div className="settings-form">
            <h2>Private Account</h2>
            <p className="section-subtitle">Control who can see your profile and posts</p>
            
            <div className="toggle-group">
              <div className="toggle-item">
                <span>Make account private</span>
                <input type="checkbox" className="toggle-checkbox" />
              </div>
              <p className="info-text">When private, people must request to follow you and cannot see your posts.</p>
            </div>

            <button className="save-btn">Save changes</button>
          </div>
        );

      case "blocked-users":
        return (
          <div className="settings-form">
            <h2>Blocked Users</h2>
            <p className="section-subtitle">Manage users you've blocked</p>
            <div className="blocked-list">
              <p className="empty-text">You haven't blocked anyone yet</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="main-settings-container">
        <HeaderArea />

        <div className="settings-wrapper">
          {/* Sidebar */}
          <aside className="settings-sidebar">
            <div className="settings-category">
              <h3 className="category-title">YOUR ACCOUNT</h3>
              <nav className="sidebar-nav">
                <button
                  className={`nav-item ${activeSection === "edit-profile" ? "active" : ""}`}
                  onClick={() => setActiveSection("edit-profile")}
                >
                  Edit Profile
                </button>
                <button
                  className={`nav-item ${activeSection === "change-details" ? "active" : ""}`}
                  onClick={() => setActiveSection("change-details")}
                >
                  Change Details
                </button>
                <button
                  className={`nav-item ${activeSection === "deactivate" ? "active" : ""}`}
                  onClick={() => setActiveSection("deactivate")}
                >
                  Deactivate Account
                </button>
                <button
                  className={`nav-item ${activeSection === "delete-account" ? "active" : ""}`}
                  onClick={() => setActiveSection("delete-account")}
                >
                  Account Deletion
                </button>
              </nav>
            </div>

            <div className="settings-category">
              <h3 className="category-title">SECURITY</h3>
              <nav className="sidebar-nav">
                <button
                  className={`nav-item ${activeSection === "change-password" ? "active" : ""}`}
                  onClick={() => setActiveSection("change-password")}
                >
                  Change Password
                </button>
                <button
                  className={`nav-item ${activeSection === "active-sessions" ? "active" : ""}`}
                  onClick={() => setActiveSection("active-sessions")}
                >
                  Active Sessions
                </button>
                <button
                  className={`nav-item ${activeSection === "2fa" ? "active" : ""}`}
                  onClick={() => setActiveSection("2fa")}
                >
                  2F Authentication
                </button>
              </nav>
            </div>

            <div className="settings-category">
              <h3 className="category-title">PRIVACY</h3>
              <nav className="sidebar-nav">
                <button
                  className={`nav-item ${activeSection === "private-account" ? "active" : ""}`}
                  onClick={() => setActiveSection("private-account")}
                >
                  Private Account
                </button>
                <button
                  className={`nav-item ${activeSection === "blocked-users" ? "active" : ""}`}
                  onClick={() => setActiveSection("blocked-users")}
                >
                  Blocked Users
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="settings-content">
            {renderContent()}
          </main>
        </div>

        <FooterArea />
      </div>
    </>
  );
}

export default Settings;