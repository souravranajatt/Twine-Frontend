import React from "react";
import "./PostCardSkeleton.css";

function PostCardSkeleton() {
    return (
        <div className="slide-bar-wrapper">
            <div className="side-bar-box">

                {/* Profile Card Skeleton */}
                <div className="profile-card-box">
                    <div className="skel-avatar" />
                    <div className="skel-info">
                        <div className="skel-line skel-name" />
                        <div className="skel-line skel-username" />
                    </div>
                </div>

                {/* Create Post Skeleton */}
                <div className="createPost-card-box">
                    <div className="skel-line skel-header" />

                    {/* Icon row */}
                    <div className="skel-icon-row">
                        <div className="skel-icon" />
                        <div className="skel-icon" />
                        <div className="skel-icon" />
                        <div className="skel-icon" />
                    </div>

                    {/* Caption textarea */}
                    <div className="skel-textarea" />

                    {/* Upload button */}
                    <div className="skel-button" />
                </div>

            </div>
        </div>
    );
}

export default PostCardSkeleton;