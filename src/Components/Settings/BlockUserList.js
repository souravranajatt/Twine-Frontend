import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { fetchBlockedListAPI } from "../../Utils/SettingDataAPI.js";
import { unblockUserAPI } from "../../Utils/userProfileAPI.js";

function BlockUserList() {
  const [blockedList, setBlockedList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unblockingUsers, setUnblockingUsers] = useState(new Set());
  const [isUnblocking, setIsUnblocking] = useState(false);
  const actionRef = useRef(false);
  const hasFetched = useRef(false);

  // Fetching Blocked List on Tab Click / Load
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchBlockedList = async () => {
      try {
        setIsLoading(true);
        const dataList = await fetchBlockedListAPI();
        setBlockedList(dataList);
      } catch (err) {
        console.error("Error fetching blocked list:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlockedList();
  }, []);

  // Handle Unblock User API
  const handleUnBlockUser = async (userId) => {
    if (actionRef.current || isUnblocking) return;
    actionRef.current = true;

    setUnblockingUsers(prev => new Set(prev).add(userId));
    setIsUnblocking(true);

    try {
      await unblockUserAPI(userId);
      setBlockedList(prev => prev.filter(user => user.userId !== userId));
    } catch (err) {
      console.error("Error unblocking user:", err);
    } finally {
      setIsUnblocking(false);
      actionRef.current = false;
      setUnblockingUsers(prev => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
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
    <div className="settings-form">
      <h2>Blocked Users</h2>
      <p className="section-subtitle">Manage users you've blocked</p>
      <div className="blocked-list">
        {blockedList.length === 0 ? (
          <p className="empty-text">You haven't blocked anyone yet</p>
        ) : (
          blockedList.map(user => (
            <div key={user.userId} className="blocked-user-item">
              <div className="blocked-user-avatar">
                <img
                  src={user.profilePicture || "https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png"}
                  alt={user.username}
                  className="AvaatarIcon-PFP"
                />
              </div>
              <span className="blocked-user-name">{user.username}</span>
              <button
                className="unblock-Btn"
                onClick={() => handleUnBlockUser(user.userId)}
                disabled={isUnblocking}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: '100px' }}
              >
                {unblockingUsers.has(user.userId) ? <Loader2 size={18} className="spin-icon" style={{ color: '#ffffff' }} /> : "Unblock"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BlockUserList;