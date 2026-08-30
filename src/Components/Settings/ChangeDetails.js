import React, { useState, useEffect, useRef } from "react";
import {
  userPersonalDetailsFetchAPI,
  userPersonalDetailsUpdateAPI
} from "../../Utils/SettingDataAPI.js";

function ChangeDetails() {
  const [formData, setFormData] = useState({
    emailId: "",
    mobileNumber: ""
  });
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState("");

  const hasFetched = useRef(false);
  const isSubmitting = useRef(false);

  // Fetch personal details on mount — once only (double fetch avoided via ref)
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchPersonalDetails = async () => {
      try {
        setIsFetching(true);
        const data = await userPersonalDetailsFetchAPI();
        if (data) {
          setFormData({
            emailId: data.emailId || "",
            mobileNumber: data.mobileNumber || ""
          });
        }
      } catch (err) {
        console.error("Error fetching personal details:", err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchPersonalDetails();
  }, []);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit Updated Personal Details
  const handlePersonalDetailSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting.current || isLoading) return;
    setStatusMessage(null);

    const emailId = formData.emailId?.trim();
    const mobileNumber = formData.mobileNumber?.trim();

    if (!emailId && !mobileNumber) {
      setStatusType("error");
      return setStatusMessage("Please provide email or mobile number!");
    }

    if (emailId) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailId)) {
        setStatusType("error");
        return setStatusMessage("Please enter a valid email address!");
      }
    }

    if (mobileNumber) {
      const phoneRegex = /^\+?[1-9]\d{6,14}$/;
      if (!phoneRegex.test(mobileNumber)) {
        setStatusType("error");
        return setStatusMessage("Please enter a valid phone number!");
      }
    }

    isSubmitting.current = true;
    setIsLoading(true);

    try {
      const personalDetailData = {
        emailId: emailId || null,
        mobileNumber: mobileNumber || null
      };
      await userPersonalDetailsUpdateAPI(personalDetailData);

      // Update local form data with saved values
      setFormData({
        emailId: emailId || "",
        mobileNumber: mobileNumber || ""
      });

      setStatusMessage("Personal details updated successfully!");
      setStatusType("success");

      setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
    } catch (err) {
      console.error("Error updating personal details:", err);
      setStatusMessage(err.message || err.error || (typeof err === 'string' ? err : "Failed to update. Please try again."));
      setStatusType("error");
    } finally {
      setIsLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="cd-main-container">
      <h2 className="sf-section-title">Change Details</h2>
      <p className="section-subtitle">Update your email and phone number</p>

      {isFetching ? (
        <div className="cd-skeleton-container">
          <div className="cd-skeleton-group">
            <div className="cd-skeleton-shimmer cd-skeleton-label" />
            <div className="cd-skeleton-shimmer cd-skeleton-input" />
          </div>

          <div className="cd-skeleton-group">
            <div className="cd-skeleton-shimmer cd-skeleton-label" />
            <div className="cd-skeleton-shimmer cd-skeleton-input" />
          </div>

          <div className="cd-skeleton-shimmer cd-skeleton-btn" />
        </div>
      ) : (
        <form onSubmit={handlePersonalDetailSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="emailId"
              value={formData.emailId}
              onChange={handleInputChange}
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleInputChange}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="form-actions-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              className="save-btn"
              type="submit"
              disabled={isLoading}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: '130px' }}
            >
              {isLoading ? <span className="twine-setting-btn-spinner" /> : 'Save changes'}
            </button>
            {statusMessage && (
              <span className={`status-text ${statusType}`}>
                {statusMessage}
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

export default ChangeDetails;