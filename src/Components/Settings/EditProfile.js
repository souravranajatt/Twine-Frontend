import React, { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { updateProfileAPI } from "../../Utils/SettingDataAPI.js";

function EditProfile({ profileData, setProfileData }) {
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Local state to manage form changes before submitting
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    bio: "",
    location: "",
    websiteLink: "",
    gender: "",
    profileBadge: "",
    profilePictureUrl: ""
  });

  // Sync prop data to local state
  useEffect(() => {
    if (profileData) {
      setFormData({
        fullname: profileData.fullname || "",
        username: profileData.username || "",
        bio: profileData.bio || "",
        location: profileData.location || "",
        websiteLink: profileData.websiteLink || "",
        gender: profileData.gender || "",
        profileBadge: profileData.profileBadge || "",
        profilePictureUrl: profileData.profilePictureUrl || ""
      });
    }
  }, [profileData]);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle Photo Upload (Convert to Base64)
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {

      // Size Check
      if (file.size > 20 * 1024 * 1024) {
        setStatusType("error");
        setStatusMessage("Photo too large! Max 20MB allowed.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profilePictureUrl: reader.result // Base64 string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger hidden file input
  const handleChangePhotoClick = (e) => {
    e.preventDefault();
    fileInputRef.current.click();
  };

  // Remove photo locally
  const handleRemovePhoto = (e) => {
    e.preventDefault();
    setFormData(prev => ({
      ...prev,
      profilePictureUrl: "" // Clear photo URL
    }));
  };

  // Update Profile Functionality
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    // ====== Frontend Validation ======
    const fullname = formData.fullname?.trim() || "";
    const username = formData.username?.trim() || "";
    const bio = formData.bio || "";

    if (!fullname) {
      setStatusType("error");
      return setStatusMessage("Fullname is required!");
    }
    if (fullname.length > 30) {
      setStatusType("error");
      return setStatusMessage("Fullname can't exceed 30 characters!");
    }

    if (!username) {
      setStatusType("error");
      return setStatusMessage("Username is required!");
    }
    if (username.length > 25) {
      setStatusType("error");
      return setStatusMessage("Username can't exceed 25 characters!");
    }
    if (!/^[a-z0-9_.]+$/.test(username.toLowerCase())) {
      setStatusType("error");
      return setStatusMessage("Username can only contain lowercase letters, digits, '.', and '_' !");
    }

    if (bio && bio.length > 101) {
      setStatusType("error");
      return setStatusMessage("Bio can't exceed 101 characters!");
    }

    try {
      setIsLoading(true);
      await updateProfileAPI(formData);

      // Update parent state so other pages get fresh data
      setProfileData(prev => ({
        ...prev,
        ...formData
      }));

      setStatusMessage("Profile updated successfully!");
      setStatusType("success");

      // Clear success message after 5 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setStatusMessage(err.message || err.error || (typeof err === 'string' ? err : "Failed to update profile. Please try again."));
      setStatusType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="settings-form">
      <h2>Edit Profile</h2>
      <p className="section-subtitle">Update your profile information and how you appear on Twine.</p>

      <form onSubmit={handleUpdateProfile}>
        {/* Profile Photo Section */}
        <div className="profile-photo-section">
          <div className="profile-avatar">
            <img
              src={formData.profilePictureUrl || "https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png"}
              alt="Profile Avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div className="profile-photo-actions">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />
            <button type="button" className="change-photo-btn" onClick={handleChangePhotoClick}>Change Photo</button>
            <button type="button" className="remove-photo-btn" onClick={handleRemovePhoto}>Remove</button>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half-width">
            <label>Full name</label>
            <input
              type="text"
              placeholder="Your name"
              name="fullname"
              value={formData.fullname}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group half-width">
            <label>Username</label>
            <input
              type="text"
              placeholder="@username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            placeholder="Write a short bio about yourself..."
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
          ></textarea>
        </div>

        <div className="form-row">
          <div className="form-group half-width">
            <label>Location</label>
            <input
              type="text"
              placeholder="e.g. San Francisco, CA"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group half-width">
            <label>Website / Link</label>
            <input
              type="url"
              placeholder="https://yoursite.com"
              name="websiteLink"
              value={formData.websiteLink}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half-width">
            <label>Gender</label>
            <div className="select-wrapper">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group half-width">
            <label>Profile Badge</label>
            <div>
              <input
                type="text"
                name="profileBadge"
                value={formData.profileBadge}
                onChange={handleInputChange}
                list="badge-options"
                maxLength="15"
                placeholder="Select or type badge"
                className="datalist-input"
              />
              <datalist id="badge-options">
                <option value="Actor" />
                <option value="Artist" />
                <option value="Beauty & Cosmetic" />
                <option value="Blogger" />
                <option value="Business" />
                <option value="Clothing Brand" />
                <option value="Comedian" />
                <option value="Community" />
                <option value="Creator" />
                <option value="Dancer" />
                <option value="Designer" />
                <option value="Developer" />
                <option value="Educationist" />
                <option value="Entertainer" />
                <option value="Entrepreneur" />
                <option value="Fashion Designer" />
                <option value="Gamer" />
                <option value="Health & Wellness" />
                <option value="Influencer" />
                <option value="Investor" />
                <option value="Journalist" />
                <option value="Makeup Artist" />
                <option value="Musician" />
                <option value="Official Account" />
                <option value="Photographer" />
                <option value="Politician" />
                <option value="Public Figure" />
                <option value="Restaurant" />
                <option value="Shopping & Retail" />
                <option value="Sport Club" />
                <option value="Sports Person" />
                <option value="Streamer" />
                <option value="Video Creator" />
                <option value="Vlogger" />
                <option value="Writer" />
                <option value="Other" />
              </datalist>
            </div>
          </div>
        </div>

        <div className="form-actions-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button type="submit" className="save-btn" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save changes'}
          </button>
          {statusMessage && (
            <span className={`status-text ${statusType}`}>
              {statusMessage}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

export default EditProfile;