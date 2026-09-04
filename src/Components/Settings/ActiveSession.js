import React, { useState, useEffect, useRef } from "react";
import "../../Assets/Bundle/Settings.css";
import "../../Assets/Bundle/GlobalSpinner.css";
import { Monitor } from "lucide-react";
import { activeSessionFetchAPI } from "../../Utils/SettingDataAPI.js";
import { logoutSessionAPI } from "../../Utils/authAPI.js";
import formatPostTime from "../../Lib/formatPostTime.js";

function ActiveSession() {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggingOut, setLoggingOut] = useState(null);
  const hasFetched = useRef(false);
  const isLoggingOutRef = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        const data = await activeSessionFetchAPI();
        setSessions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching active sessions:", err);
        setError(err?.message || "Failed to load active sessions.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Handle Logout Specific Device 
  const handleLogoutSession = async (sessionId) => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;
    setLoggingOut(sessionId);
    try {
      await logoutSessionAPI(sessionId);
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
    } catch (err) {
      console.error("Failed to logout session:", err);
    } finally {
      isLoggingOutRef.current = false;
      setLoggingOut(null);
    }
  };

  return (
    <div className="as-main-container">
      <h2 className="sf-section-title">Active Sessions</h2>
      <p className="section-subtitle">Manage your active login sessions</p>

      {isLoading ? (
        <div className="twine-setting-spinner-center">
          <span className="twine-loader-spinner" />
        </div>
      ) : error ? (
        <div className="sp-empty-state">
          <div className="sp-empty-icon-box">
            <Monitor size={32} />
          </div>
          <h3 className="sp-empty-title">Failed to load sessions</h3>
          <p className="sp-empty-text">{error}</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="sp-empty-state">
          <div className="sp-empty-icon-box">
            <Monitor size={32} />
          </div>
          <h3 className="sp-empty-title">No Active Sessions</h3>
          <p className="sp-empty-text">
            No active login sessions found for your account.
          </p>
        </div>
      ) : (
        <div className="sessions-list">
          {sessions.map((session, index) => (
            <div className="session-item" key={session.sessionId || index}>
              <div className="session-info">
                <p className="session-device">
                  {session.browser || "Unknown Browser"} on {session.deviceName || "Unknown Device"}
                  {session.currentDevice && (
                    <span className="current-device-badge">
                      (This device)
                    </span>
                  )}
                </p>
                <p className="session-location">
                  IP: {session.ipAddress || "Unknown"} • Location: {session.location || "Unknown"}
                </p>
                {session.lastActive && (
                  <p className="session-location" style={{ marginTop: "2px" }}>
                    Last active: {formatPostTime(session.lastActive)}
                  </p>
                )}
              </div>
              <button
                className="logout-btn"
                disabled={loggingOut === session.sessionId}
                onClick={() => handleLogoutSession(session.sessionId)}
              >
                {loggingOut === session.sessionId ? (<span className="twine-logout-session-btn-spinner" />) : "Logout"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActiveSession;