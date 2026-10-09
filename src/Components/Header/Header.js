import { Bell, User, Search, LogOut, CircleUserRound } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import useDebounce from "../../Lib/useDebounce.js";
import useScrollLock from "../../Lib/useScrollLock.js";
import useClickOutside from "../../Lib/useClickOutside.js";
import formatPostTime from "../../Lib/formatPostTime.js";
import useNotificationSocket from "../../Lib/useNotificationSocket.js";
import {
  getNotificationsAPI,
  getUnreadCountAPI,
  markAsReadAPI,
  markAllAsReadAPI,
} from "../../Utils/notificationAPI.js";
import "./Header.css";
import { searchUsersAPI } from "../../Utils/searchAPI.js";
import { useAuth } from "../../AuthChecker/AuthContext.js";

const Default_ProfilePhoto = "https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png";

function Header() {
  const { loggedUser, logout } = useAuth();

  const [searchGo, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [profileTabNav, setProfileTabNav] = useState(false);
  const [notifyTabNav, setNotifyTabNav] = useState(false);

  // Notification States
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const navigate = useNavigate();

  // Screen width detection for mobile
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch initial unread count on login/mount
  useEffect(() => {
    if (!loggedUser) return;
    getUnreadCountAPI()
      .then((res) => {
        setUnreadCount(res?.unreadCount || 0);
      })
      .catch(() => {});
  }, [loggedUser]);

  // Connect to Real-Time WebSocket STOMP
  const currentUserId = loggedUser?.userUid || loggedUser?.userId;
  const handleRealtimeNotification = useCallback((newNotif) => {
    setUnreadCount((prev) => prev + 1);
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  useNotificationSocket(currentUserId, handleRealtimeNotification);

  // Lock background scroll only on mobile when profile dropdown is open
  useScrollLock(profileTabNav && isMobile);

  // Refs to detect outside click
  const profileRef = useRef(null);
  const notifyRef = useRef(null);
  const searchRef = useRef(null);

  // Debounced value
  const debouncedSearch = useDebounce(searchGo, 500);

  // Toggle Nav Bar
  const HandleprofileTabNavToogleBtn = () => {
    setProfileTabNav(!profileTabNav);
    setNotifyTabNav(false);
  };

  const HandlenotifyTabNavToogleBtn = () => {
    const nextState = !notifyTabNav;
    setNotifyTabNav(nextState);
    setProfileTabNav(false);

    if (nextState) {
      setLoadingNotifs(true);
      getNotificationsAPI(0)
        .then((data) => {
          setNotifications(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.error("Failed to load notifications:", err);
        })
        .finally(() => {
          setLoadingNotifs(false);
        });
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      await markAllAsReadAPI();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // Click on individual notification
  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await markAsReadAPI(notif.notificationId);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationId === notif.notificationId ? { ...n, read: true } : n
          )
        );
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }

    setNotifyTabNav(false);

    // Navigation based on notification type
    if (notif.type === "USER_FOLLOW" || notif.type === "FOLLOW_ACCEPT") {
      if (notif.actorUsername) navigate(`/${notif.actorUsername}`);
    } else if (notif.type === "FOLLOW_REQUEST") {
      navigate("/people/follow-requests");
    } else if (
      notif.type === "POST_LIKE" ||
      notif.type === "POST_COMMENT" ||
      notif.type === "COMMENT_REPLY"
    ) {
      const userParam = loggedUser?.userName || loggedUser?.username || "p";
      navigate(`/${userParam}/posts/${notif.targetId}`);
    } else if (notif.type === "SECRET_CRUSH_MATCH") {
      if (notif.actorUsername) navigate(`/${notif.actorUsername}`);
    }
  };

  // Close each dropdown/panel on outside click using shared hook
  useClickOutside(profileRef, () => setProfileTabNav(false), profileTabNav);
  useClickOutside(notifyRef, () => setNotifyTabNav(false), notifyTabNav);
  useClickOutside(searchRef, () => setShowResults(false), showResults);

  // Define Search Variable & Search Handle
  useEffect(() => {

    if (!debouncedSearch || debouncedSearch.trim().length <= 1) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const controller = new AbortController(); // cancel previous request

    const fetchResults = async () => {
      setIsSearching(true);
      setShowResults(true);
      try {
        const data = await searchUsersAPI(
          debouncedSearch.trim(),
          controller.signal
        );
        setSearchResults(data);
        setShowResults(true);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.log("Search error!", err);
        }
      } finally {
        setIsSearching(false);
      }
    };

    fetchResults();

    return () => controller.abort();
  }, [debouncedSearch]);

  // Logout Functionality ....
  const logoutHandle = async () => {
    try {
      await logout();
      setProfileTabNav(false);
      setNotifyTabNav(false);
    } catch (err) {
      console.log("Logout Failed!");
    }
  }

  return (
    <header className="header">
      {/* Header Left */}
      <div className="header-left">
        <Link to="/" className="header-logo-link">
          <div className="logo-head">
            <svg className="header-logo-svg" viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg">
              <g className="header-rings-group">
                {/* Left Ring (Brand Dark) */}
                <circle
                  className="header-ring ring-left"
                  cx="45"
                  cy="35"
                  r="18"
                  stroke="#111010"
                  strokeWidth="4.5"
                  fill="none"
                />
                {/* Right Ring (Brand Pink) */}
                <circle
                  className="header-ring ring-right"
                  cx="71"
                  cy="35"
                  r="18"
                  stroke="#F0186E"
                  strokeWidth="4.5"
                  fill="none"
                />
                {/* Overlapping arc of Left Ring to interlock them */}
                <path
                  className="header-ring-overlap"
                  d="M 61 26.75 A 18 18 0 0 0 41.5 17.35"
                  stroke="#111010"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            </svg>
            <span className="header-brand-text">
              <span className="brand-t">T</span>
              <span className="brand-wine">wine</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Header Center */}
      <div className="header-center" ref={searchRef}>
        {/* Search Box Form */}
        <form className="search-box" onSubmit={(e) => e.preventDefault()}>
          <div className="search-nav-icons">
            {isSearching
              ? <div className="twine-search-spinner-center">
                <div className="twine-search-loader-spinner"></div>
              </div>
              : <Search size={16} className="search-icon" />
            }
          </div>
          <input
            type="text"
            placeholder="Search"
            name="search"
            value={searchGo}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!e.target.value) setShowResults(false);
            }}
            onFocus={(e) => {
              if (searchResults.length > 0 && e.target.value.trim().length > 1) setShowResults(true);
            }}
            className="boxField"
            autoCorrect="off"
            autoComplete="off"
            autoCapitalize="none"
          />
        </form>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="search-dropdown">
            {isSearching ? (
              <div className="twine-postmodal-spinner-center">
                <div className="twine-loader-spinner"></div>
              </div>
            ) : searchResults.length === 0 ? (
              <p className="search-no-result">No users found</p>
            ) : (
              searchResults.map(user => (
                <Link
                  to={`/${user.username}`}
                  key={user.userId}
                  className="search-result-item"
                  onClick={() => {
                    setShowResults(false);
                    setSearch("");
                  }}
                >
                  <img
                    src={user.profilePhoto || Default_ProfilePhoto}
                    alt={user.username}
                    className="search-result-avatar"
                  />
                  <div className="search-result-info">
                    <p className="search-result-username">
                      {user.username}
                    </p>
                    <p className="search-result-fullname">
                      {user.fullname}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

      </div>

      {/* Header Right - Only shown when logged in */}
      {loggedUser && (
        <div className="header-right">
          {/* Profile-Notify Nav Bar Icons */}
          <div className="nav-bar-icons">
            {/* Notification DropDown */}
            <div className="icon-left" ref={notifyRef}>
              <button
                type="button"
                className="headerRightIconBtn-ToogleBox"
                onClick={HandlenotifyTabNavToogleBtn}
                title="Notifications"
              >
                <Bell size={20} className="iconTabRight" />
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notifyTabNav && (
                <div className="dropdown notify-dropdown">
                  <div className="notify-header">
                    <h4 className="notify-title">Notifications</h4>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="notify-mark-all-btn"
                        onClick={handleMarkAllRead}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {loadingNotifs ? (
                    <div className="notify-loading">
                      <div className="twine-loader-spinner"></div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <p className="notify-empty-state">No notifications yet</p>
                  ) : (
                    <ul className="notify-list">
                      {notifications.map((notif) => (
                        <li
                          key={notif.notificationId}
                          className={`notify-item ${!notif.read ? "unread" : ""}`}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <img
                            src={notif.actorProfilePhoto || Default_ProfilePhoto}
                            alt={notif.actorUsername || "User"}
                            className="notify-avatar"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = Default_ProfilePhoto;
                            }}
                          />
                          <div className="notify-content">
                            <p className="notify-text">
                              {notif.message || (
                                <>
                                  <span className="notify-actor-name">
                                    {notif.actorUsername ? `@${notif.actorUsername} ` : ""}
                                  </span>
                                  interacted with you.
                                </>
                              )}
                            </p>
                            <span className="notify-time">
                              {formatPostTime(notif.createdAt)}
                            </span>
                          </div>
                          {!notif.read && <span className="notify-unread-dot"></span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Profile DropDown */}
            <div className="icon-left" ref={profileRef}>
              <button type="button" className="headerRightIconBtn-ToogleBox" onClick={HandleprofileTabNavToogleBtn}><User size={20} className="iconTabRight" /></button>
              {profileTabNav && (
                <div className="dropdown profile-dropdown">
                  <ul className="dropdown-unorderList">
                    <li className="dropdown-listItem">
                      <Link to="/account/settings" className="dropdown-linkList">
                        <button type="button" className="dropDownBtnDesign-Box">
                          <CircleUserRound size={18} className="dropdownIcons" />
                          Settings & Privacy
                        </button>
                      </Link>
                    </li>
                    <li className="dropdown-listItem">
                      <button type="button" className="dropDownBtnDesign-Box" onClick={logoutHandle}>
                        <LogOut size={18} className="dropdownIcons" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </header>
  );
}

export default Header;