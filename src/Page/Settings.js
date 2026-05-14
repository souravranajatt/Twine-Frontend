import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import HeaderArea from "../Components/Header";
import FooterArea from "../Components/Footer";
import "../Assets/Bundle/Settings.css";
import { settingDataAPI, updateProfileAPI, updatePrivacyAPI, deactivateAccountAPI } from "../utils/SettingDataAPI";
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

  // Handle Privacy API
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

      // 3. Show "Session Expired" popup
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
              <button className="save-btn" onClick={handleUpdateProfile} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save changes'}
              </button>
              {statusMessage && (
                <span className={`status-text ${statusType}`}>
                  {statusMessage}
                </span>
              )}
            </div>
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
                placeholder="Password"
                value={deactivatePassword}
                onChange={(e) => setDeactivatePassword(e.target.value)}
              />
            </div>

            <div className="form-actions-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
              <button className="deactivate-btn" onClick={handleDeactivateAccount} disabled={isLoading}>
                {isLoading ? 'Deactivating...' : 'Deactivate Account'}
              </button>
              {statusMessage && activeSection === "deactivate" && (
                <span className={`status-text ${statusType}`}>
                  {statusMessage}
                </span>
              )}
            </div>
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