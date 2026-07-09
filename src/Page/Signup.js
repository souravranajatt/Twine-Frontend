import '../AuthCSS/AuthPage.css'; // Style File
import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUserAuthAPI, sendOtpAuthAPI, verifyOtpAuthAPI } from "../Utils/authAPI.js"; // Import API
import { maskEmail } from "../Lib/maskEmail.js"; // Email Masker
import { Image, UserRoundPlus, TrendingUp } from "lucide-react";
import FooterArea from "../Components/Footer/Footer.js";

function Signup() {

  // Define Variable 
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [userPass, setUserPass] = useState("");
  const [otpValue, setOtpValue] = useState("");

  // Full data
  const [userData, setUserData] = useState({});

  const [message, setMessage] = useState("");
  const [verifyMessage, setVerifyMessage] = useState("");

  const [isSignup, setIsSignup] = useState(false);
  const isSignupRef = useRef(false);
  const [isVerify, setIsVerify] = useState(false);
  const isVerifyRef = useRef(false);

  const [OTPBox, setOTPBox] = useState(false);

  const navigate = useNavigate();


  // Final submit validation to request OTP
  const handleSignup = async (e) => {

    e.preventDefault();

    setMessage("");
    setVerifyMessage("");

    if (isSignupRef.current || isSignup) return;

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
    if (!userPass) return setMessage("Password is required!");
    if (userPass.length > 72) return setMessage("Password cannot exceed 72 characters!");
    if (userPass.length < 8) return setMessage("Password must be at least 8 characters long!");



    // Create Data Object
    const signupData = {
      fullname: trimmedFullName,
      username: trimmedUserName,
      email: trimmedEmail,
      password: userPass
    }

    setUserData(signupData);

    setIsSignup(true);
    isSignupRef.current = true;

    try {
      await sendOtpAuthAPI(signupData);
      setOTPBox(true);
    } catch (err) {
      setMessage(err.message || err);
    } finally {
      setIsSignup(false);
      isSignupRef.current = false;
    }

  }

  // Handle OTP verification and final registration
  const handleVerifyOTP = async (e) => {

    e.preventDefault();

    setMessage("");
    setVerifyMessage("")

    if (isVerifyRef.current || isVerify) return;

    // Check OTP Validation
    if (!otpValue || otpValue.trim().length !== 6) {
      return setVerifyMessage("Please enter a valid 6-digit OTP!");
    }

    // Set Loading State
    setIsVerify(true);
    isVerifyRef.current = true;

    try {
      //  Verify OTP first
      await verifyOtpAuthAPI({
        email: userData.email,
        otp: otpValue.trim()
      });

      setVerifyMessage("OTP Verified Successfully!");

      // Create user
      await signupUserAuthAPI(userData);
      setOTPBox(false);
      setOtpValue("");
      navigate("/");

    } catch (err) {
      setVerifyMessage(err.message || err);
    } finally {
      setIsVerify(false);
      isVerifyRef.current = false;
    }
  }


  return (
    <>
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
                  <button type="submit" className="auth-btn" disabled={isSignup}>
                    {isSignup ? <span className="twine-auth-btn-spinner" /> : "Sign Up"}
                  </button>
                </div>

                <div className="divider-line"></div>

                {/* Footer-box */}
                <div className="other">
                  <p className="auth-footer">
                    Already have an account? <span><Link to="/login" className="link-col">Log in</Link></span>
                  </p>
                </div>

              </form>
            </div>
          </div>

        </div>

        {/* Footer-Section */}
        <FooterArea />

      </div>


      {/* OTP Verification Box */}
      {OTPBox && (
        <div className="otp-overlay">
          <div className="otp-modal-box">
            <h3 className="otp-title">Verify Your Email</h3>
            <p className="otp-subtitle">
              We have sent a 6-digit OTP code to <span className="otp-email-highlight">{maskEmail(emailId.trim().toLowerCase())}</span>.
            </p>

            {verifyMessage && <p className="error-msg">{verifyMessage}</p>}

            <div className="fields-input">
              <input
                type="text"
                placeholder="Enter 6-Digit OTP"
                className="auth-input otp-input"
                maxLength={6}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                autoComplete="one-time-code"
              />
            </div>

            <div className="otp-btn-group">
              <button
                type="button"
                className="auth-btn otp-verify-btn"
                onClick={handleVerifyOTP}
                disabled={isVerify}
              >
                {isVerify ? <span className="twine-auth-btn-spinner" /> : "Verify & Sign Up"}
              </button>

              <button
                type="button"
                className="otp-cancel-btn"
                onClick={() => {
                  setOTPBox(false);
                  setOtpValue("");
                  setMessage("");
                  setVerifyMessage("");
                }}
                disabled={isVerify}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

export default Signup;
