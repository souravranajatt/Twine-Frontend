import React from 'react';
import "../../Assets/Bundle/Settings.css";

function InteractionPreferences() {
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
            <input type="checkbox" />
            <span className="ip-slider round"></span>
          </label>
        </div>

        <div className="ip-item-row">
          <div className="ip-item-info">
            <span className="ip-item-label">Disable Comments</span>
            <span className="ip-item-desc">Turn off commenting on your new posts by default.</span>
          </div>
          <label className="ip-toggle-switch">
            <input type="checkbox" />
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
          <select className="ip-select-input">
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
          <select className="ip-select-input">
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
