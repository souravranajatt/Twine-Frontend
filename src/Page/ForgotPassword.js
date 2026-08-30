import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Lock, UserRoundPlus, Image, TrendingUp } from "lucide-react";
import "../AuthCSS/AuthPage.css";
import "../AuthCSS/ForgotPassword.css";
import "../Assets/Bundle/GlobalSpinner.css";
import FooterArea from "../Components/Footer/Footer.js";

function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "error" | "success"
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);

  // Submit Handler (Frontend structure ready for backend hookup)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmittingRef.current || isLoading) return;

    if (!identifier.trim()) {
      setMessage("Please enter your username or email address.");
      setMessageType("error");
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    setMessage("");

    try {
      // Structure placeholder for future API call
      // e.g. await sendPasswordResetLinkAPI(identifier.trim());
      setMessage("If an account matches that info, we've sent a link to reset your password.");
      setMessageType("success");
    } catch (err) {
      setMessage(err?.message || "Failed to process request. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="content-aut-wrapper">
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

        {/* Right Side: Forgot Password Form Panel */}
        <div className="auth-right-panel">
          <div className="auth-box">

            {/* Mobile Brand Logo (Visible only on mobile/tablet) */}
            <div className="mobile-logo-container">
              <h1 className="mobile-auth-logo">Twine</h1>
              <p className="mobile-logo-tagline">Connect. Match. Unfold</p>
            </div>

            <div className="forgot-password-box">
              <div className="forgot-icon-container">
                <Lock size={32} strokeWidth={1.5} />
              </div>

              <h2 className="forgot-title">Trouble logging in?</h2>
              <p className="forgot-subtitle">
                Enter your email or username and we'll send you a link to get back into your account.
              </p>

              {message && (
                <div className={`forgot-status-msg ${messageType}`}>
                  {message}
                </div>
              )}

              <form className="forgot-form" onSubmit={handleSubmit}>
                <div className="forgot-input-group">
                  <input
                    type="text"
                    className="forgot-input"
                    placeholder="Email or username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                  />
                </div>

                <button type="submit" className="forgot-btn" disabled={isLoading}>
                  {isLoading ? <span className="twine-auth-btn-spinner" /> : "Send Login Link"}
                </button>

                <div className="forgot-divider">
                  <div className="forgot-divider-line" />
                  <span className="forgot-divider-text">OR</span>
                  <div className="forgot-divider-line" />
                </div>

                <Link to="/signup" className="forgot-create-account-link">
                  Create new account
                </Link>
              </form>
            </div>

            <div className="forgot-back-to-login-box">
              <Link to="/login" className="forgot-back-to-login-link">
                Back to login
              </Link>
            </div>

          </div>
        </div>

      </div>

      {/* Footer Section */}
      <FooterArea />
    </div>
  );
}

export default ForgotPassword;
