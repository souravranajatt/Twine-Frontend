import React, { useState, useEffect } from "react";
import { X, Loader2, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchFollowersAPI } from "../../../Utils/userProfileAPI.js";
import "./FollowerList.css";

function FollowerList({ isOpen, onClose, targetUserId }) {
  const [followers, setFollowers] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Fetch initial followers
  useEffect(() => {
    if (isOpen && targetUserId) {
      setFollowers([]);
      setPage(0);
      setHasMore(true);
      loadFollowers(0, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, targetUserId]);

  // Load followers from API
  const loadFollowers = async (pageNum, isInitial = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await fetchFollowersAPI(targetUserId, pageNum);
      if (data.length < 15) {
        setHasMore(false);
      }
      setFollowers((prev) => (isInitial ? data : [...prev, ...data]));
    } catch (err) {
      console.error("Failed to fetch followers", err);
    } finally {
      setLoading(false);
    }
  };

  // Load next page
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadFollowers(nextPage);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Background overlay */}
      <div className="follower-modal-backdrop" onClick={onClose} />

      {/* Modal box */}
      <div className="follower-modal-box">
        <div className="follower-modal-header">
          <h3>Followers</h3>
          <button className="follower-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="follower-modal-body">
          {followers.length === 0 && !loading && (
            <p className="no-followers-text">No followers found</p>
          )}

          <div className="follower-list-items">
            {followers.map((item) => (
              <div key={item.userId} className="follower-list-row">
                {/* User info linking to profile */}
                <Link
                  to={`/${item.username}/posts`}
                  onClick={onClose}
                  className="follower-info-link"
                >
                  <div className="follower-box-avatar">
                    <img
                      src={
                        item.profilePicture && item.profilePicture !== "null"
                          ? item.profilePicture
                          : "https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png"
                      }
                      alt={item.username}
                      className="follower-row-avatar"
                    />
                  </div>
                  <div className="follower-row-meta">
                    <div className="follower-row-username-grp">
                      <span className="follower-row-username">{item.username}</span>
                      {item.verify && (
                        <BadgeCheck className="follower-row-badge" size={16} />
                      )}
                    </div>
                  </div>
                </Link>

                {/* check if profile is myself */}
                {!item.isMe && (
                  <span className={`follower-row-btn ${item.followedByMe ? "following-style" : "follow-style"}`}>
                    {item.followedByMe ? "Following" : "Follow"}
                  </span>
                )}
              </div>
            ))}

            {/* Pagination & Loading  */}
            {loading && (
              <div className="follower-modal-spinner">
                <Loader2 size={24} className="spinner-icon" />
              </div>
            )}

            {!loading && hasMore && (
              <button className="follower-load-more-btn" onClick={handleLoadMore}>
                Load More
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default FollowerList;
