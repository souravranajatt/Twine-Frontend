import '../AuthCSS/AuthPage.css'; // Style File
import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { loginUserAuthAPI } from "../Utils/authAPI.js"; // Import API 
import { Image, UserRoundPlus, TrendingUp } from "lucide-react";
import FooterArea from "../Components/Footer/Footer.js";

function Login() {

  // Define Variable of Fields 
  const [UserId, setUserId] = useState("");
  const [UserPwd, setUserPwd] = useState("");
  const [message, setMessage] = useState(""); // for message handling 
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate(); // for navigation 

  // When User click OnSubmit button / Form Handling
  const handleSubmit = async (e) => {

    e.preventDefault(); // Off Default Event

    // Input Validation
    if (!UserId.trim()) return setMessage("Username is required!");
    if (!UserPwd) return setMessage("Password is required!");

    // Send Data as JSON Object
    const userData = {
      username: UserId.trim(),
      password: UserPwd
    }
    // Create API
    try {
      setIsLogin(true);
      await loginUserAuthAPI(userData);
      navigate("/");
    } catch (err) {
      setMessage(err.message || err);
    } finally {
      setIsLogin(false);
    }

  }

  return (
    <div className='content-aut-wrapper'>

      <div className="auth-split-container">

        {/* Left Side: Brand Info Panel */}
        <div className="auth-left-panel">
          <div className="brand-info-content">
            <h1 className="brand-title">Twine</h1>
            <p className="brand-tagline">Connect. Match. Unfold</p>

            <ul className="brand-features">
              <li>
                <UserRoundPlus className="feature-lucide-icon" />
                <span className="feature-text">Find your people</span>
              </li>
              <li>
                <Image className="feature-lucide-icon" />
                <span className="feature-text">Share moments</span>
              </li>
              <li>
                <TrendingUp className="feature-lucide-icon" />
                <span className="feature-text">Build your timeline</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="auth-right-panel">
          <div className="auth-box">

            {/* Mobile Brand Logo (Visible only on mobile/tablet) */}
            <div className="mobile-logo-container">
              <h1 className="mobile-auth-logo">Twine</h1>
              <p className="mobile-logo-tagline">Connect. Match. Unfold</p>
            </div>

            {message && <p className="error-msg">{message}</p>}
            <form className="auth-form" onSubmit={handleSubmit}>

              <div className="fields-input">
                <input
                  type="text"
                  placeholder="Username or email"
                  value={UserId}
                  className="auth-input"
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>

              <div className="fields-input">
                <input
                  type="password"
                  placeholder="Password"
                  value={UserPwd}
                  className="auth-input"
                  onChange={(e) => setUserPwd(e.target.value)}
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect="off"
                />
              </div>

              <div className="fields-input">
                <button type="submit" className="auth-btn" disabled={isLogin}>
                  {isLogin ? "Logging in..." : "Log in"}
                </button>
              </div>

              {/* Forgot password */}
              <div className="forgot-password-wrapper">
                <Link to="/forgot-password" className="forgot-password-link">Forgot password?</Link>
              </div>

              <div className="divider-line"></div>

              {/* Footer navigation */}
              <div className="other">
                <p className="auth-footer">
                  Don’t have an account?{" "}
                  <span><Link to="/signup" className="link-col">Sign up</Link></span>
                </p>
              </div>

            </form>
          </div>
        </div>

      </div>

      {/* Footer-Section*/}
      <FooterArea />

    </div>
  );
}

export default Login;