import React from "react";
import "./UserSuggestionSkeleton.css";

function UserSuggestionSkeleton({ count = 5 }) {
    return (
        <div className="skel-suggestion-container">
            <div className="skel-suggestion-header">
                <div className="skel-suggestion-text skel-suggestion-title" />
            </div>
            <div className="skel-suggestion-list">
                {Array.from({ length: count }).map((_, index) => (
                    <div key={index} className="skel-suggestion-item">
                        <div className="skel-suggestion-avatar" />
                        <div className="skel-suggestion-info">
                            <div className="skel-suggestion-text skel-suggestion-name" />
                            <div className="skel-suggestion-text skel-suggestion-username" />
                        </div>
                        <div className="skel-suggestion-btn" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserSuggestionSkeleton;
