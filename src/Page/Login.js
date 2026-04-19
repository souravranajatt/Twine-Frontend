import '../AuthCSS/AuthPage.css'; // Style File
import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { loginUserAuthAPI } from "../utils/authAPI.js"; // Import API 
import FooterArea from "./Footer";

function Login() {

  // Define Variable of Fields 
  const [UserId, setUserId] = useState("");
  const [UserPwd, setUserPwd] = useState("");
  const [message, setMessage] = useState(""); // for message handling 
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
      await loginUserAuthAPI(userData);
      navigate("/");
    } catch (err) {
      setMessage(err.message || err);
    }


  }

  return (
    <div className='content-aut-wrapper'>
      <div className="auth-container">
        <div className="auth-box">

          {/* Logo */}
          <div className="logo-container">
            <h1 className="auth-logo">Twine</h1>
            <p className="logo-tagline">“Connect. Match. Unfold”</p>
          </div>

          {/* Form */}
          {message && <p className="error-msg">{message}</p>}
          <form className="auth-form" onSubmit={handleSubmit}>

            <div className="fields-input">
              <input type="text" placeholder="Username or Email" value={UserId} className="auth-input" onChange={(e) => setUserId(e.target.value)} />
            </div>

            <div className="fields-input">
              <input type="password" placeholder="Password" value={UserPwd} className="auth-input" onChange={(e) => setUserPwd(e.target.value)} autoCapitalize="none" autoComplete="off" autoCorrect="off" />
            </div>

            <div className="fields-input">
              <button type="submit" className="auth-btn">Log In</button>
            </div>

            {/* Forgot password */}
            <div className="other">
              <p className="auth-footer">
                <span><Link to="/forgot-password" className="link-col">Forgot password?</Link></span>
              </p>

              {/* Footer */}
              <p className="auth-footer">
                Don’t have an account?{" "}
                <span><Link to="/signup" className="link-col">Sign up</Link></span>
              </p>
            </div>

          </form>
        </div>
      </div>

      {/* Footer-Section*/}
      <FooterArea />

    </div>
  );
}

export default Login;