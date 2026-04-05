import { Bell, User, Search, LogOut, CircleUserRound, Settings2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Assets/Bundle/Header.css";
import { logoutHandleAPI } from "../utils/authAPI";

function Header() {

  const [searchGo, setSearch] = useState("");
  const [profileTabNav, setProfileTabNav] = useState(false);
  const [notifyTabNav, setNotifyTabNav] = useState(false);
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
      const res = await logoutHandleAPI();
      setProfileTabNav(false);
      setNotifyTabNav(false);
      navigate("/login", { replace: true });
      console.log("Logout Success");
    } catch (err) {
      console.log("Logout Failed!");
    }
  }

  return (
    <header className="header">
      {/* Header Left */}
      <div className="header-left">
        <div className="logo-head">
          Twine
        </div>
      </div>

      {/* Header Right */}
      <div className="header-right">
        {/* Search Box Form */}
        <form className="search-box" onSubmit={searchHandle}>
          <input type="text" placeholder="Search" name="search" value={searchGo} onChange={(e) => setSearch(e.target.value)} className="boxField" autoCorrect="off" autoComplete="off" autoCapitalize="none"></input>
          <div className="search-nav-icons">
            <Search size={24} className="search-icon" />
          </div>
        </form>

        {/* Profile-Notify Nav Bar Icons */}
        <div className="nav-bar-icons">
          {/* Notification DropDown */}
          <div className="icon-left" ref={notifyRef}>
            <button type="button" className="headerRightIconBtn-ToogleBox" onClick={HandlenotifyTabNavToogleBtn}><Bell size={22} className="iconTabRight" /></button>
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
            <button type="button" className="headerRightIconBtn-ToogleBox" onClick={HandleprofileTabNavToogleBtn}><User size={22} className="iconTabRight" /></button>
            {profileTabNav && (
              <div className="dropdown profile-dropdown">
                <ul className="dropdown-unorderList">
                  <li className="dropdown-listItem">
                    <Link to="/settings/my-account" className="dropdown-linkList">
                      <button type="button" className="dropDownBtnDesign-Box">
                        <CircleUserRound size={18} className="dropdownIcons" />
                        My Account
                      </button>
                    </Link>
                  </li>
                  <li className="dropdown-listItem">
                    <Link to="/account" className="dropdown-linkList">
                      <button type="button" className="dropDownBtnDesign-Box">
                        <Settings2 size={18} className="dropdownIcons" />
                        Settings
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