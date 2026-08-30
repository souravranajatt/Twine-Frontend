import { Bell, User, Search, LogOut, CircleUserRound } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useDebounce from "../../Lib/useDebounce.js";
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
  const navigate = useNavigate();

  // Refs to detect outside click
  const profileRef = useRef(null);
  const notifyRef = useRef(null);
  const searchRef = useRef(null);

  // Debounced value
  const debouncedSearch = useDebounce(searchGo, 500);

  // Toogle Nav Bar
  const HandleprofileTabNavToogleBtn = () => {
    setProfileTabNav(!profileTabNav); // Change true/false
    setNotifyTabNav(false);
  }
  const HandlenotifyTabNavToogleBtn = () => {
    setNotifyTabNav(!notifyTabNav); // Change true/false
    setProfileTabNav(false);
  }

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileTabNav(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(event.target)) {
        setNotifyTabNav(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

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
              <button type="button" className="headerRightIconBtn-ToogleBox" onClick={HandlenotifyTabNavToogleBtn}><Bell size={20} className="iconTabRight" /></button>
              {notifyTabNav && (
                <div className="dropdown notify-dropdown">
                  <ul className="dropdown-unorderList">
                    <li className="dropdown-listItem">❤️ Liked your post</li>
                    <li className="dropdown-listItem">👀 Someone sent a like</li>
                    <li className="dropdown-listItem">✅ twine.ceo followed you</li>
                  </ul>
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