import '../AuthCSS/AuthPage.css'; // Style File
import React, { useState } from "react";
import { Link, useNavigate} from "react-router-dom";
import { signupUserAuthAPI } from "../utils/authAPI.js"; // Import API
import FooterArea from "./Footer";

function Signup() {

  // Define Variable 
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [userPass, setUserPass] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Final submit validation
  const handleSignup = async (e) => { // we can also write , const handleSignup (e){ }

    e.preventDefault();

    // Trim inputs and Validate
    const trimmedFullName = fullName.trim();
    const trimmedUserName = userName.trim();
    const trimmedEmail = emailId.trim();

    if (!trimmedFullName) return setMessage("Full Name is required!");
    if (trimmedFullName.length > 30) return setMessage("Full Name cannot exceed 30 characters!");
    if (!trimmedUserName) return setMessage("Username is required!");
    if (!/^[a-z0-9_.]+$/.test(trimmedUserName)) return setMessage("Username contain only 'a-z0-9_.' !");
    if (trimmedUserName.length > 25) return setMessage("Username cannot exceed 25 characters!");
    if (!trimmedEmail) return setMessage("Email is required!");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return setMessage("Enter a valid email address!");
    if(!userPass) return setMessage("Password is required!");
    if (userPass.length < 8) return setMessage("Password must be at least 8 characters long!");



    // API call yaha karna
    const userData = {
      fullname: trimmedFullName, // match backend field as in Java
      username: trimmedUserName, // match backend field as in Java
      email: trimmedEmail, // match backend field as in Java
      password: userPass // backend expects "passwordHash" as in Java
    }

    try {
      const res = await signupUserAuthAPI(userData);
      //setMessage(res.message);
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
        <form className="auth-form" onSubmit={handleSignup}>

          {/* Full Name */}
          <div className="fields-input">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            className="auth-input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          </div>

          {/* Username */}
          <div className="fields-input">
          <input
            type="text"
            name="userName"
            placeholder="Username"
            className="auth-input"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
          />
          </div>

          {/* Email */}
          <div className="fields-input">
          <input
            type="email"
            name="emailId"
            placeholder="Email"
            className="auth-input"
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
          />
          </div>

          {/* Password */}
          <div className="fields-input">
          <input
            type="password"
            name="userPass"
            placeholder="Password"
            className="auth-input"
            value={userPass}
            onChange={(e) => setUserPass(e.target.value)}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
          />
          </div>

          {/* Button */}
          <div className="fields-input">
          <button type="submit" className="auth-btn">
            Sign Up
          </button>
          </div>

        {/* Footer-box */}
        <div className="other">
        <p className="auth-footer">
          Already have an account? <span><Link to="/login" className="link-col">Log in</Link></span>
        </p>
        </div>

        </form>
      </div>
    </div>

    {/* Footer-Section */}
      <FooterArea />
    
  </div>
  );
}

export default Signup;
