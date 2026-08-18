import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import { fetchUserSuggestionsAPI } from "../../../Utils/homePageAPI.js";
import UserSuggestionSkeleton from "./UserSuggestionSkeleton.js";
import "./UserSuggestion.css";

const DEFAULT_AVATAR = "https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png";

function UserSuggestion() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

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
                <button className="follow-btn">Follow</button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default UserSuggestion;