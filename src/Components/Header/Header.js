import { Bell, User, Search, LogOut, CircleUserRound } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import { logoutHandleAPI } from "../../Utils/authAPI";

function Header() {

  const [searchGo, setSearch] = useState("");
  const [profileTabNav, setProfileTabNav] = useState(false);
  const [notifyTabNav, setNotifyTabNav] = useState(false);
  const isText = searchGo.length > 0;
  const navigate = useNavigate();

  // Refs to detect outside click
  const profileRef = useRef(null);
  const notifyRef = useRef(null);

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
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Define Search Variable & Search Handle
  const searchHandle = (e) => {
    // API for Search
  }

  // Logout Functionality ....
  const logoutHandle = async () => {
    // Call Logout API
    try {
      await logoutHandleAPI();
      setProfileTabNav(false);
      setNotifyTabNav(false);
      navigate("/login", { replace: true });
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
      <div className="header-center">
        {/* Search Box Form */}
        <form className="search-box" onSubmit={searchHandle}>
          <div className="search-nav-icons">
            <Search size={16} className="search-icon" />
          </div>
          <input
            type="text"
            placeholder="Search"
            name="search"
            value={searchGo}
            onChange={(e) => setSearch(e.target.value)}
            className="boxField"
            autoCorrect="off"
            autoComplete="off"
            autoCapitalize="none"
          />
        </form>
      </div>

      {/* Header Right */}
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

    </header>
  );
}

export default Header;