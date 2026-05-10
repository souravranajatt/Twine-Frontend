import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import HeaderArea from "../Components/Header";
import FooterArea from "../Components/Footer";
import "../Assets/Bundle/Settings.css";
import { settingDataAPI } from "../utils/SettingDataAPI";

function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");

  // State Management
  const [activeSection, setActiveSection] = useState(() => {
    return tabFromUrl || localStorage.getItem("twine_settings_tab") || "edit-profile";
  });
  const [isMobileView, setIsMobileView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        setIsLoading(true);
        const data = await settingDataAPI();
        setProfileData(data);
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettingsData();
  }, []);

  // Handle Input Changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    if (activeSection) {
      localStorage.setItem("twine_settings_tab", activeSection);
      setSearchParams({ tab: activeSection }, { replace: true });
    } else {
      localStorage.removeItem("twine_settings_tab");
      searchParams.delete("tab");
      setSearchParams(searchParams, { replace: true });
    }
  }, [activeSection, setSearchParams]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeSection) {
      setActiveSection(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      setIsMobileView(isMobile);

      // If switching to mobile and a section is active, keep it. 
      // If switching to desktop and no section is active, set default.
      if (!isMobile && !activeSection) {
        setActiveSection("edit-profile");
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeSection]);

  const handleBackClick = () => {
    setActiveSection(""); // Clear active section to show menu on mobile
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="settings-loading">
          <p>Loading...</p>
        </div>
      );
    }

    switch (activeSection) {
      case "edit-profile":
        return (
          <div className="settings-form">
            <h2>Edit Profile</h2>
            <p className="section-subtitle">Update your profile information and how you appear on Twine.</p>

            {/* Profile Photo Section */}
            <div className="profile-photo-section">
              <div className="profile-avatar">
                <img
                  src={profileData.profilePhoto || "https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png"}
                  alt="Profile Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="profile-photo-actions">
                <button className="change-photo-btn">Change Photo</button>
                <button className="remove-photo-btn">Remove</button>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half-width">
                <label>Full name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  name="fullName"
                  value={profileData.fullname}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-group half-width">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="@username"
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                placeholder="Write a short bio about yourself..."
                name="bio"
                value={profileData.bio}
                onChange={handleProfileChange}
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group half-width">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA"
                  name="location"
                  value={profileData.location}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-group half-width">
                <label>Website / Link</label>
                <input
                  type="url"
                  placeholder="https://yoursite.com"
                  name="link"
                  value={profileData.websiteLink}
                  onChange={handleProfileChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half-width">
                <label>Gender</label>
                <div className="select-wrapper">
                  <select
                    name="gender"
                    value={profileData.gender}
                    onChange={handleProfileChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group half-width">
                <label>Profile Badge</label>
                <div className="select-wrapper">
                  <select
                    name="profileBadge"
                    value={profileData.profileBBadge}
                    onChange={handleProfileChange}
                  >
                    <option value="">Select Badge</option>
                    <option value="developer">Developer</option>
                    <option value="designer">Designer</option>
                    <option value="creator">Creator</option>
                    <option value="pro">Sport Club</option>
                  </select>
                </div>
              </div>
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
        return (
          <div className="settings-form empty-state">
            <p className="empty-text">Please select a setting from the menu.</p>
          </div>
        );
    }
  };

  return (
    <>
      <div className="main-settings-container">
        <HeaderArea />

        <div className="settings-wrapper">
          {/* Sidebar - Shown on Desktop always, or on Mobile when no section is active */}
          {(!isMobileView || !activeSection) && (
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
          )}

          {/* Main Content - Shown on Desktop always, or on Mobile when a section is active */}
          {(!isMobileView || activeSection) && (
            <main className="settings-content">
              {isMobileView && activeSection && (
                <button className="back-to-menu-btn" onClick={handleBackClick}>
                  <span className="back-arrow">&larr;</span> Back to Settings
                </button>
              )}
              {activeSection ? renderContent() : null}
            </main>
          )}
        </div>

        <FooterArea />
      </div>
    </>
  );
}

export default Settings;