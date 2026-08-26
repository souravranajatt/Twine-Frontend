import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import { fetchUserSuggestionsAPI } from "../../../Utils/homePageAPI.js";
import { followUserAPI, unfollowUserAPI, cancelFollowRequestAPI } from "../../../Utils/userProfileAPI.js";
import UserSuggestionSkeleton from "./UserSuggestionSkeleton.js";
import "../../../Assets/Bundle/GlobalSpinner.css";
import "./UserSuggestion.css";

const DEFAULT_AVATAR = "https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png";

function UserSuggestion() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  // Follow State & Action Tracking
  const [followStatus, setFollowStatus] = useState({});
  const [isFollowing, setIsFollowing] = useState({});
  const followRef = useRef({});

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const loadSuggestions = async () => {
      try {
        const data = await fetchUserSuggestionsAPI(0, 5);
        setSuggestions(data || []);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    loadSuggestions();
  }, []);

  // Follow User Action
  const handleFollow = async (user) => {
    const userId = user.userId;
    if (!userId || followRef.current[userId]) return;

    followRef.current[userId] = true;
    setIsFollowing((prev) => ({ ...prev, [userId]: true }));

    try {
      await followUserAPI(userId);
      const newStatus = user.isPrivate ? "REQUESTED" : "UNFOLLOW";
      setFollowStatus((prev) => ({ ...prev, [userId]: newStatus }));
      setSuggestions((prev) =>
        prev.map((u) =>
          u.userId === userId
            ? { ...u, followedByMe: !user.isPrivate, isRequestSent: !!user.isPrivate }
            : u
        )
      );
    } catch (error) {
      console.error("Failed to follow user:", error);
    } finally {
      setIsFollowing((prev) => ({ ...prev, [userId]: false }));
      followRef.current[userId] = false;
    }
  };

  // Unfollow User Action
  const handleUnfollow = async (user) => {
    const userId = user.userId;
    if (!userId || followRef.current[userId]) return;

    followRef.current[userId] = true;
    setIsFollowing((prev) => ({ ...prev, [userId]: true }));

    try {
      await unfollowUserAPI(userId);
      setFollowStatus((prev) => ({ ...prev, [userId]: "FOLLOW" }));
      setSuggestions((prev) =>
        prev.map((u) =>
          u.userId === userId
            ? { ...u, followedByMe: false, isRequestSent: false }
            : u
        )
      );
    } catch (error) {
      console.error("Failed to unfollow user:", error);
    } finally {
      setIsFollowing((prev) => ({ ...prev, [userId]: false }));
      followRef.current[userId] = false;
    }
  };

  // Cancel Follow Request Action
  const handleCancelRequest = async (user) => {
    const userId = user.userId;
    if (!userId || followRef.current[userId]) return;

    followRef.current[userId] = true;
    setIsFollowing((prev) => ({ ...prev, [userId]: true }));

    try {
      await cancelFollowRequestAPI(userId);
      setFollowStatus((prev) => ({ ...prev, [userId]: "FOLLOW" }));
      setSuggestions((prev) =>
        prev.map((u) =>
          u.userId === userId
            ? { ...u, followedByMe: false, isRequestSent: false }
            : u
        )
      );
    } catch (error) {
      console.error("Failed to cancel follow request:", error);
    } finally {
      setIsFollowing((prev) => ({ ...prev, [userId]: false }));
      followRef.current[userId] = false;
    }
  };

  if (loading) {
    return <UserSuggestionSkeleton count={5} />;
  }

  const topFive = suggestions.slice(0, 5);

  return (
    <div className="user-suggestion-container">
      <div className="suggestion-header">
        <h3>People you may know</h3>
        <Link to="/people/recommendations" className="see-all-btn">See All</Link>
      </div>
      <div className="suggestion-list">
        {topFive.length === 0 ? (
          <p className="no-suggestions-text">No suggestions right now</p>
        ) : (
          topFive.map((user) => {
            const avatarSrc = user.profilePicture && user.profilePicture !== "null"
              ? user.profilePicture
              : DEFAULT_AVATAR;
            const displayName = user.name || user.username;
            const userId = user.userId;

            // current button status
            const currentStatus = followStatus[userId] || (
              user.followedByMe ? "UNFOLLOW" : user.isRequestSent ? "REQUESTED" : "FOLLOW"
            );

            // Follow/Requested/Unfollow button based on state variable
            let actionButton = null;
            if (currentStatus === "UNFOLLOW") {
              actionButton = (
                <button
                  onClick={() => handleUnfollow(user)}
                  disabled={isFollowing[userId]}
                  className="suggestion-unfollow-btn"
                >
                  {isFollowing[userId] ? (
                    <div className="twine-profile-actions-others-btn-spinner"></div>
                  ) : (
                    "Unfollow"
                  )}
                </button>
              );
            } else if (currentStatus === "REQUESTED") {
              actionButton = (
                <button
                  onClick={() => handleCancelRequest(user)}
                  disabled={isFollowing[userId]}
                  className="suggestion-requested-btn"
                >
                  {isFollowing[userId] ? (
                    <div className="twine-profile-actions-others-btn-spinner"></div>
                  ) : (
                    "Requested"
                  )}
                </button>
              );
            } else {
              actionButton = (
                <button
                  onClick={() => handleFollow(user)}
                  disabled={isFollowing[userId]}
                  className="follow-btn"
                >
                  {isFollowing[userId] ? (
                    <div className="twine-profile-actions-follow-btn-spinner"></div>
                  ) : (
                    user.followsYou ? "Follows you" : "Follow"
                  )}
                </button>
              );
            }

            return (
              <div key={user.userId || user.username} className="suggestion-item">
                <Link to={`/${user.username}`} className="suggestion-user-link">
                  <img
                    src={avatarSrc}
                    alt={displayName}
                    className="suggestion-avatar"
                  />
                  <div className="suggestion-info">
                    <div className="suggestion-name-row">
                      <span className="suggestion-name">{displayName}</span>
                      {user.verify && (
                        <BadgeCheck size={15} className="suggestion-verify-badge" />
                      )}
                    </div>
                    <span className="suggestion-username">@{user.username}</span>
                  </div>
                </Link>
                {actionButton}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default UserSuggestion;