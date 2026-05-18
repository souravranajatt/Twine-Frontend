import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import HeaderArea from "../Components/Header/Header.js";
import FooterArea from "../Components/Footer/Footer.js";
import "../Assets/Bundle/Settings.css";
import { settingDataAPI, updateProfileAPI, updatePrivacyAPI, deactivateAccountAPI, updatePasswordAPI } from "../utils/SettingDataAPI";
import { logoutHandleAPI } from "../utils/authAPI";

function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabFromUrl = searchParams.get("tab");

  // State Management
  const [activeSection, setActiveSection] = useState(() => {
    return tabFromUrl || "edit-profile";
  });
  const [isMobileView, setIsMobileView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState("");
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivateReason, setDeactivateReason] = useState("Need a break");
  const [showExpiredPopup, setShowExpiredPopup] = useState(false);
  const [password, setPassword] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const fileInputRef = useRef(null);

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
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle Photo Upload (Convert to Base64)
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          profilePictureUrl: reader.result // Base64 string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Photo Select Change
  const handleChangePhotoClick = (e) => {
    e.preventDefault();
    fileInputRef.current.click(); // Open hidden file input
  };

  // Photo Remove Function
  const handleRemovePhoto = (e) => {
    e.preventDefault();
    setProfileData(prev => ({
      ...prev,
      profilePictureUrl: "" // Clear photo
    }));
  };

  // Update Profile Functionality
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    // ====== Frontend Validation ======
    const fullname = profileData.fullname?.trim() || "";
    const username = profileData.username?.trim() || "";
    const bio = profileData.bio || "";

    if (!fullname) {
      setStatusType("error");
      return setStatusMessage("Fullname is required!");
    }
    if (fullname.length > 30) {
      setStatusType("error");
      return setStatusMessage("Fullname can't exceed 30 characters!");
    }

    if (!username) {
      setStatusType("error");
      return setStatusMessage("Username is required!");
    }
    if (username.length > 25) {
      setStatusType("error");
      return setStatusMessage("Username can't exceed 25 characters!");
    }
    if (!/^[a-z0-9_.]+$/.test(username.toLowerCase())) {
      setStatusType("error");
      return setStatusMessage("Username can only contain lowercase letters, digits, '.', and '_' !");
    }

    if (bio && bio.length > 101) {
      setStatusType("error");
      return setStatusMessage("Bio can't exceed 101 characters!");
    }

    try {
      setIsLoading(true);
      await updateProfileAPI(profileData);
      setStatusMessage("Profile updated successfully!");
      setStatusType("success");

      // Clear success message after 5 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setStatusMessage(err.message || err.error || (typeof err === 'string' ? err : "Failed to update profile. Please try again."));
      setStatusType("error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Private Account Privacy API
  const handlePrivacyToggle = async () => {
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
    }
  };

  // Handle Account Deactivation
  const handleDeactivateAccount = async (e) => {
    e.preventDefault();

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

  // Handle Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
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

    try {
      setIsLoading(true);

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
    }
  };

  useEffect(() => {
    if (activeSection) {
      setSearchParams({ tab: activeSection }, { replace: true });
    } else {
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

            <form onSubmit={handleUpdateProfile}>
              {/* Profile Photo Section */}
              <div className="profile-photo-section">
                <div className="profile-avatar">
                  <img
                    src={profileData.profilePictureUrl || "https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png"}
                    alt="Profile Avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="profile-photo-actions">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handlePhotoUpload}
                  />
                  <button type="button" className="change-photo-btn" onClick={handleChangePhotoClick}>Change Photo</button>
                  <button type="button" className="remove-photo-btn" onClick={handleRemovePhoto}>Remove</button>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half-width">
                  <label>Full name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    name="fullname"
                    value={profileData.fullname || ""}
                    onChange={handleProfileInputChange}
                  />
                </div>

                <div className="form-group half-width">
                  <label>Username</label>
                  <input
                    type="text"
                    placeholder="@username"
                    name="username"
                    value={profileData.username || ""}
                    onChange={handleProfileInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  placeholder="Write a short bio about yourself..."
                  name="bio"
                  value={profileData.bio || ""}
                  onChange={handleProfileInputChange}
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group half-width">
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA"
                    name="location"
                    value={profileData.location || ""}
                    onChange={handleProfileInputChange}
                  />
                </div>

                <div className="form-group half-width">
                  <label>Website / Link</label>
                  <input
                    type="url"
                    placeholder="https://yoursite.com"
                    name="websiteLink"
                    value={profileData.websiteLink || ""}
                    onChange={handleProfileInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half-width">
                  <label>Gender</label>
                  <div className="select-wrapper">
                    <select
                      name="gender"
                      value={profileData.gender || ""}
                      onChange={handleProfileInputChange}
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
                  <div>
                    <input
                      type="text"
                      name="profileBadge"
                      value={profileData.profileBadge || ""}
                      onChange={handleProfileInputChange}
                      list="badge-options"
                      maxLength="15"
                      placeholder="Select or type badge"
                      className="datalist-input"
                    />
                    <datalist id="badge-options">
                      <option value="Actor" />
                      <option value="Artist" />
                      <option value="Beauty & Cosmetic" />
                      <option value="Blogger" />
                      <option value="Business" />
                      <option value="Clothing Brand" />
                      <option value="Comedian" />
                      <option value="Community" />
                      <option value="Creator" />
                      <option value="Dancer" />
                      <option value="Designer" />
                      <option value="Developer" />
                      <option value="Educationist" />
                      <option value="Entertainer" />
                      <option value="Entrepreneur" />
                      <option value="Fashion Designer" />
                      <option value="Gamer" />
                      <option value="Health & Wellness" />
                      <option value="Influencer" />
                      <option value="Investor" />
                      <option value="Journalist" />
                      <option value="Makeup Artist" />
                      <option value="Musician" />
                      <option value="Official Account" />
                      <option value="Photographer" />
                      <option value="Politician" />
                      <option value="Public Figure" />
                      <option value="Restaurant" />
                      <option value="Shopping & Retail" />
                      <option value="Sport Club" />
                      <option value="Sports Person" />
                      <option value="Streamer" />
                      <option value="Video Creator" />
                      <option value="Vlogger" />
                      <option value="Writer" />
                      <option value="Other" />
                    </datalist>
                  </div>
                </div>
              </div>

              <div className="form-actions-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button type="submit" className="save-btn" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save changes'}
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
                {statusMessage && activeSection === "deactivate" && (
                  <span className={`status-text ${statusType}`}>
                    {statusMessage}
                  </span>
                )}
              </div>
            </form>
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

            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  id="current-password"
                  name="current-password"
                  autoComplete="current-password"
                  placeholder="Enter current password"
                  value={password.oldPassword}
                  onChange={(e) => setPassword(prev => ({ ...prev, oldPassword: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  id="new-password"
                  name="new-password"
                  autoComplete="new-password"
                  placeholder="Enter new password (min 8 characters)"
                  value={password.newPassword}
                  onChange={(e) => setPassword(prev => ({ ...prev, newPassword: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  id="confirm-password"
                  name="confirm-password"
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  value={password.confirmPassword}
                  onChange={(e) => setPassword(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>

              <div className="form-actions-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
                <button type="submit" className="save-btn" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Password"}
                </button>
                {statusMessage && activeSection === "change-password" && (
                  <span className={`status-text ${statusType}`}>{statusMessage}</span>
                )}
              </div>
            </form>
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

            {statusMessage && activeSection === "private-account" && (
              <p className={`status-text ${statusType}`} style={{ marginTop: '16px' }}>
                {statusMessage}
              </p>
            )}
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
                <h3 className="category-title">Your Account</h3>
                <nav className="sidebar-nav">
                  <button
                    className={`nav-item ${activeSection === "edit-profile" ? "active" : ""}`}
                    onClick={() => setActiveSection("edit-profile")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Edit Profile
                  </button>
                  <button
                    className={`nav-item ${activeSection === "change-details" ? "active" : ""}`}
                    onClick={() => setActiveSection("change-details")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    Change Details
                  </button>
                  <button
                    className={`nav-item ${activeSection === "deactivate" ? "active" : ""}`}
                    onClick={() => setActiveSection("deactivate")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                    </svg>
                    Deactivate Account
                  </button>
                  <button
                    className={`nav-item ${activeSection === "delete-account" ? "active" : ""}`}
                    onClick={() => setActiveSection("delete-account")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                    Account Deletion
                  </button>
                </nav>
              </div>

              <div className="settings-category">
                <h3 className="category-title">Security</h3>
                <nav className="sidebar-nav">
                  <button
                    className={`nav-item ${activeSection === "change-password" ? "active" : ""}`}
                    onClick={() => setActiveSection("change-password")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                    Change Password
                  </button>
                  <button
                    className={`nav-item ${activeSection === "active-sessions" ? "active" : ""}`}
                    onClick={() => setActiveSection("active-sessions")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                    Active Sessions
                  </button>
                  <button
                    className={`nav-item ${activeSection === "2fa" ? "active" : ""}`}
                    onClick={() => setActiveSection("2fa")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                    2F Authentication
                  </button>
                </nav>
              </div>

              <div className="settings-category">
                <h3 className="category-title">Privacy</h3>
                <nav className="sidebar-nav">
                  <button
                    className={`nav-item ${activeSection === "private-account" ? "active" : ""}`}
                    onClick={() => setActiveSection("private-account")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Private Account
                  </button>
                  <button
                    className={`nav-item ${activeSection === "blocked-users" ? "active" : ""}`}
                    onClick={() => setActiveSection("blocked-users")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                    Blocked Users
                  </button>
                </nav>
              </div>
            </aside>
          )}

          {/* Main Content - Shown on Desktop always, or on Mobile when a section is active */}
          {(!isMobileView || activeSection) && (
            <main className="settings-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
              <div style={{ flex: '1 0 auto' }}>
                {isMobileView && activeSection && (
                  <button className="back-to-menu-btn" onClick={handleBackClick}>
                    <span className="back-arrow">&larr;</span> Back to Settings
                  </button>
                )}
                {activeSection ? renderContent() : null}
              </div>
              <FooterArea />
            </main>
          )}
        </div>
      </div>

      {showExpiredPopup && (
        <div className="expired-popup-overlay">
          <div className="expired-popup-content">
            <h3>Session Expired</h3>
            <p>Your session has expired. Redirecting to login page...</p>
            <div className="loading-spinner-small"></div>
          </div>
        </div>
      )}
    </>
  );
}

export default Settings;