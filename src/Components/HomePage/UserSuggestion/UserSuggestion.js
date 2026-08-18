import React from "react";
import "./UserSuggestion.css";

const mockUsers = [
  { id: 1, name: "Rahul Sharma", username: "rahul_sharma", avatar: "https://i.pravatar.cc/150?u=1" },
  { id: 2, name: "Priya Singh", username: "priya_singh", avatar: "https://i.pravatar.cc/150?u=2" },
  { id: 3, name: "Amit Kumar", username: "amit_kumar", avatar: "https://i.pravatar.cc/150?u=3" },
  { id: 4, name: "Neha Gupta", username: "neha_gupta", avatar: "https://i.pravatar.cc/150?u=4" },
  { id: 5, name: "Vikash Yadav", username: "vikash_yadav", avatar: "https://i.pravatar.cc/150?u=5" },
];

function UserSuggestion() {
  return (
    <div className="user-suggestion-container">
      <div className="suggestion-header">
        <h3>People you may know</h3>
      </div>
      <div className="suggestion-list">
        {mockUsers.map((user) => (
          <div key={user.id} className="suggestion-item">
            <img src={user.avatar} alt={user.name} className="suggestion-avatar" />
            <div className="suggestion-info">
              <span className="suggestion-name">{user.name}</span>
              <span className="suggestion-username">@{user.username}</span>
            </div>
            <button className="follow-btn">Follow</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserSuggestion;