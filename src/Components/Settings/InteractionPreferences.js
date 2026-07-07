import React, { useState, useEffect, useRef } from 'react';
import "../../Assets/Bundle/Settings.css";
import { Loader2 } from "lucide-react";
import {
  fetchInteractionPreferencesAPI,
  hideLikeDefaultSettingAPI,
  showLikeDefaultSettingAPI,
  turnOffCommentingDefaultSettingAPI,
  turnOnCommentingDefaultSettingAPI
} from "../../Utils/SettingDataAPI.js";

function InteractionPreferences() {
  const [preferences, setPreferences] = useState({
    likeVisible: true,
    commentingEnable: true
  });
  const [isLoading, setIsLoading] = useState(true);

  const hasFetched = useRef(false);
  const isTogglingLike = useRef(false);
  const isTogglingComment = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchPreferences = async () => {
      try {
        setIsLoading(true);
        const data = await fetchInteractionPreferencesAPI();
        if (data) {
          setPreferences({
            likeVisible: data.likeVisible ?? true,
            commentingEnable: data.commentingEnable ?? true
          });
        }
      } catch (err) {
        console.error("Error fetching interaction preferences:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  // Update like visiblity
  const handleLikeToggle = async () => {
    if (isTogglingLike.current) return;
    isTogglingLike.current = true;

    const previousValue = preferences.likeVisible;

    setPreferences(prev => ({ ...prev, likeVisible: !previousValue }));

    try {
      if (previousValue) {
        await hideLikeDefaultSettingAPI();
      } else {
        await showLikeDefaultSettingAPI();
      }
    } catch (err) {
      console.error("Failed to update like preferences:", err);
      setPreferences(prev => ({ ...prev, likeVisible: previousValue }));
    } finally {
      isTogglingLike.current = false;
    }
  };

  // Update commenting on/off
  const handleCommentingToggle = async () => {
    if (isTogglingComment.current) return;
    isTogglingComment.current = true;

    const previousValue = preferences.commentingEnable;

    setPreferences(prev => ({ ...prev, commentingEnable: !previousValue }));

    try {
      if (previousValue) {
        await turnOffCommentingDefaultSettingAPI();
      } else {
        await turnOnCommentingDefaultSettingAPI();
      }
    } catch (err) {
      console.error("Failed to update comment preferences:", err);
      setPreferences(prev => ({ ...prev, commentingEnable: previousValue }));
    } finally {
      isTogglingComment.current = false;
    }
  };


  if (isLoading) {
    return (
      <div className="st-loading-spinner-box">
        <Loader2 size={40} className="spin-icon" />
      </div>
    );
  }

  return (
    <div className="ip-main-container">
      <h2 className="sf-section-title ip-title">Interaction Preferences</h2>
      <p className="ip-description">
        Manage how others interact with you and your default post settings.
      </p>

      <div className="ip-group-box">
        <h3 className="ip-subtitle">Likes & Comments</h3>

        <div className="ip-item-row">
          <div className="ip-item-info">
            <span className="ip-item-label">Hide Like Counts</span>
            <span className="ip-item-desc">Hide the number of likes on your new posts by default.</span>
          </div>
          <label className="ip-toggle-switch">
            <input
              type="checkbox"
              checked={preferences.likeVisible === false}
              onChange={handleLikeToggle}
            />
            <span className="ip-slider round"></span>
          </label>
        </div>

        <div className="ip-item-row">
          <div className="ip-item-info">
            <span className="ip-item-label">Disable Comments</span>
            <span className="ip-item-desc">Turn off commenting on your new posts by default.</span>
          </div>
          <label className="ip-toggle-switch">
            <input
              type="checkbox"
              checked={preferences.commentingEnable === false}
              onChange={handleCommentingToggle}
            />
            <span className="ip-slider round"></span>
          </label>
        </div>
      </div>

      <div className="ip-group-box" style={{ marginTop: "30px" }}>
        <h3 className="ip-subtitle">Tags & Mentions</h3>

        <div className="ip-item-row">
          <div className="ip-item-info">
            <span className="ip-item-label">Who can tag you</span>
            <span className="ip-item-desc">Choose who can tag you in their posts.</span>
          </div>
          <select className="ip-select-input" defaultValue="everyone">
            <option value="everyone">Everyone</option>
            <option value="following">People you follow</option>
            <option value="no_one">No one</option>
          </select>
        </div>

        <div className="ip-item-row">
          <div className="ip-item-info">
            <span className="ip-item-label">Who can mention you</span>
            <span className="ip-item-desc">Choose who can @mention you in their captions or comments.</span>
          </div>
          <select className="ip-select-input" defaultValue="everyone">
            <option value="everyone">Everyone</option>
            <option value="following">People you follow</option>
            <option value="no_one">No one</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default InteractionPreferences;


