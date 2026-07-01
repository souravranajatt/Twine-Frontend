import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import HeaderArea from "../Components/Header/Header.js";
import FooterArea from "../Components/Footer/Footer.js";
import "../Assets/Bundle/Settings.css";
import { Loader2 } from "lucide-react";
import { settingDataAPI, userPersonalDetailsFetchAPI } from "../Utils/SettingDataAPI.js";

// Import Page Components
import EditProfile from "../Components/Settings/EditProfile.js";
import ChangeDetails from "../Components/Settings/ChangeDetails.js";
import ChangePassword from "../Components/Settings/ChangePassword.js";
import AccountDeactivate from "../Components/Settings/AccountDeactivate.js";
import AccountPrivate from "../Components/Settings/AccountPrivate.js";
import BlockUserList from "../Components/Settings/BlockUserList.js";
import AcccountDeletion from "../Components/Settings/AcccountDeletion.js";
import TwoFactorAuthentication from "../Components/Settings/2FactorAuthentication.js";
import ActiveSession from "../Components/Settings/ActiveSession.js";
import SavedPosts from "../Components/Settings/SavedPosts.js";
import InteractionPreferences from "../Components/Settings/InteractionPreferences.js";
import ArchivePosts from "../Components/Settings/ArchivePosts.js";

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
  const [showExpiredPopup, setShowExpiredPopup] = useState(false);
  const [personalDetails, setPersonalDetails] = useState(null);

  const hasFetched = useRef(false);

  // Fetch initial profile & personal data concurrently
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchInitialSettings = async () => {
      try {
        setIsLoading(true);
        const [profileRes, detailsRes] = await Promise.all([
          settingDataAPI(),
          userPersonalDetailsFetchAPI()
        ]);
        setProfileData(profileRes);
        setPersonalDetails(detailsRes);
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialSettings();
  }, []);

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

      if (!isMobile && !activeSection) {
        setActiveSection("edit-profile");
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeSection]);

  // Handle Back Button 
  const handleBackClick = () => {
    setActiveSection("");
  };

  // Handle View Content Based on Active Section
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="st-loading-spinner-box">
          <Loader2 size={40} className="spin-icon" />
        </div>
      );
    }

    if (!profileData && (activeSection === "edit-profile" || activeSection === "private-account" || activeSection === "change-details")) {
      return (
        <div className="settings-form empty-state">
          <p className="empty-text">Failed to load profile settings. Please refresh the page.</p>
        </div>
      );
    }

    switch (activeSection) {
      case "edit-profile":
        return (
          <EditProfile
            profileData={profileData}
            setProfileData={setProfileData}
          />
        );

      case "change-details":
        return (
          <ChangeDetails
            personalDetails={personalDetails}
            setPersonalDetails={setPersonalDetails}
          />
        );

      case "deactivate":
        return (
          <AccountDeactivate
            setShowExpiredPopup={setShowExpiredPopup}
          />
        );

      case "delete-account":
        return <AcccountDeletion />;

      case "change-password":
        return <ChangePassword />;

      case "active-sessions":
        return <ActiveSession />;

      case "2fa":
        return <TwoFactorAuthentication />;

      case "private-account":
        return (
          <AccountPrivate
            profileData={profileData}
            setProfileData={setProfileData}
          />
        );

      case "blocked-users":
        return <BlockUserList />;

      case "saved-posts":
        return <SavedPosts />;

      case "archive-posts":
        return <ArchivePosts />;

      case "interaction-preferences":
        return <InteractionPreferences />;

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
                <h3 className="category-title">Your Activity</h3>
                <nav className="sidebar-nav">
                  <button
                    className={`nav-item ${activeSection === "saved-posts" ? "active" : ""}`}
                    onClick={() => setActiveSection("saved-posts")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    Saved Posts
                  </button>
                  <button
                    className={`nav-item ${activeSection === "archive-posts" ? "active" : ""}`}
                    onClick={() => setActiveSection("archive-posts")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="21 8 21 21 3 21 3 8"></polyline>
                      <rect x="1" y="3" width="22" height="5"></rect>
                      <line x1="10" y1="12" x2="14" y2="12"></line>
                    </svg>
                    Archive
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
                  <button
                    className={`nav-item ${activeSection === "interaction-preferences" ? "active" : ""}`}
                    onClick={() => setActiveSection("interaction-preferences")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Interaction Preferences
                  </button>
                </nav>
              </div>
            </aside>
          )}

          {/* mobile view size handle  */}
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