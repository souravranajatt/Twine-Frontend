import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import HeaderArea from "../Components/Header/Header.js";
import FooterArea from "../Components/Footer/Footer.js";
import useInfiniteScroll from "../Lib/useInfiniteScroll.js";
import { fetchUserSuggestionsAPI } from "../Utils/homePageAPI.js";
import { followUserAPI, unfollowUserAPI, cancelFollowRequestAPI } from "../Utils/userProfileAPI.js";
import "../Assets/Bundle/GlobalSpinner.css";
import "../Assets/Bundle/UserRecommendation.css";

const DEFAULT_AVATAR = "https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png";
const PAGE_SIZE = 15;

function UserRecommendation() {
  const [users, setUsers] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const isFetchingRef = useRef(false);
  const hasFetchedInitial = useRef(false);
  const pageRef = useRef(0);

  // Follow State & Action Tracking
  const [followStatus, setFollowStatus] = useState({});
  const [isFollowing, setIsFollowing] = useState({});
  const followRef = useRef({});

  const fetchRecommendations = async (pageToFetch) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (pageToFetch === 0) {
      setLoadingInitial(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const data = await fetchUserSuggestionsAPI(pageToFetch, PAGE_SIZE);
      const fetchedList = data || [];

      if (fetchedList.length < PAGE_SIZE) {
        setHasMore(false);
      }

      setUsers((prev) => {
        if (pageToFetch === 0) return fetchedList;
        const existingIds = new Set(prev.map((u) => u.userId));
        const newUsers = fetchedList.filter((u) => !existingIds.has(u.userId));
        return [...prev, ...newUsers];
      });
    } catch (err) {
      setHasMore(false);
    } finally {
      isFetchingRef.current = false;
      setLoadingInitial(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    pageRef.current += 1;
    fetchRecommendations(pageRef.current);
  }, []);

  useInfiniteScroll({
    loading: loadingInitial || loadingMore,
    hasMore,
    onLoadMore: handleLoadMore,
    activeTab: "recommendations",
    tabName: "recommendations"
  });

  useEffect(() => {
    if (hasFetchedInitial.current) return;
    hasFetchedInitial.current = true;
    fetchRecommendations(0);
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
    } catch (error) {
      console.error("Failed to cancel follow request:", error);
    } finally {
      setIsFollowing((prev) => ({ ...prev, [userId]: false }));
      followRef.current[userId] = false;
    }
  };

  return (
    <div className="recommendation-page-container">
      <HeaderArea />

      <main className="recommendation-main-content">
        <div className="recommendation-wrapper-box">
          <div className="recommendation-header-section">
            <h1 className="recommendation-header-title">Suggested Recommendations</h1>
            <p className="recommendation-header-subtitle">
              Discover people you may know based on mutual connections and activity.
            </p>
          </div>

          {loadingInitial ? (
            <div className="recommendation-skel-list">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="recommendation-skel-item">
                  <div className="skel-suggestion-avatar recommendation-skel-avatar-row" />
                  <div className="recommendation-skel-meta">
                    <div className="skel-suggestion-text recommendation-skel-name-line" />
                    <div className="skel-suggestion-text recommendation-skel-user-line" />
                  </div>
                  <div className="skel-suggestion-btn recommendation-skel-btn-row" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="recommendation-list">
                {users.map((user) => {
                  const avatarSrc = user.profilePicture && user.profilePicture !== "null"
                    ? user.profilePicture
                    : DEFAULT_AVATAR;
                  const displayName = user.name || user.username;
                  const userId = user.userId;

                  // current button status
                  const currentStatus = followStatus[userId] || (user.followedByMe ? "UNFOLLOW" : "FOLLOW");

                  // Follow/Requested/Unfollow button based on state variable
                  let actionButton = null;
                  if (currentStatus === "UNFOLLOW") {
                    actionButton = (
                      <button
                        onClick={() => handleUnfollow(user)}
                        disabled={isFollowing[userId]}
                        className="recommendation-unfollow-btn"
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
                        className="recommendation-requested-btn"
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
                        className="recommendation-follow-btn"
                      >
                        {isFollowing[userId] ? (
                          <div className="twine-profile-actions-follow-btn-spinner"></div>
                        ) : (
                          "Follow"
                        )}
                      </button>
                    );
                  }

                  return (
                    <div key={user.userId || user.username} className="recommendation-list-item">
                      <Link to={`/${user.username}`} className="recommendation-item-user-info">
                        <img
                          src={avatarSrc}
                          alt={displayName}
                          className="recommendation-item-avatar"
                        />
                        <div className="recommendation-item-meta">
                          <div className="recommendation-item-name-row">
                            <span className="recommendation-item-name">{displayName}</span>
                            {user.verify && (
                              <BadgeCheck size={16} className="recommendation-verify-badge" />
                            )}
                          </div>
                          <span className="recommendation-item-username">@{user.username}</span>
                        </div>
                      </Link>

                      {actionButton}
                    </div>
                  );
                })}
              </div>

              {loadingMore && (
                <div className="twine-loader-spinner-center" style={{ margin: "24px 0" }}>
                  <span className="twine-loader-spinner"></span>
                </div>
              )}

              {!hasMore && users.length > 0 && (
                <p className="no-more-recommendations">You've reached the end of all recommendations.</p>
              )}

              {!loadingMore && users.length === 0 && (
                <p className="no-more-recommendations">No suggestions available right now.</p>
              )}
            </>
          )}
        </div>
      </main>

      <FooterArea />
    </div>
  );
}

export default UserRecommendation;
