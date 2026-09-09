import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, MoreHorizontal } from "lucide-react";
import formatPostTime from "../../../Lib/formatPostTime.js";
import PostDropDown from "../../PostModal/PostDropDown.js";
import "../Style/PostHeader.css";

const DEFAULT_IMAGE = "https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png";

function PostHeader({ post, onPostUpdate }) {
    const [openDropdown, setOpenDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Close 3-dot dropdown on clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenDropdown(false);
            }
        };

        if (openDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openDropdown]);

    if (!post) return null;

    // Profile Avatar
    const avatarSrc = (post.profileImage && post.profileImage !== "null")
        ? post.profileImage
        : DEFAULT_IMAGE;

    // Username
    const username = post.username || "";
    const cleanUsername = username.replace(/^@/, "");

    return (
        <div className="post-header">
            {/* User Profile Avatar */}
            <div className="postHeaderImageMainFeed">
                <Link to={`/${cleanUsername}`} className="postHeaderAvatarLink">
                    <img
                        src={avatarSrc}
                        className="imageFeedPostMainHeader"
                        alt={username || "user-avatar"}
                        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
                    />
                </Link>
            </div>

            {/* Username, Verified Badge & Post Upload Time */}
            <div className="post-header-userText">
                <div className="post-header-userTextBox">
                    <span className="username-title">
                        <Link to={`/${cleanUsername}`} className="userLinkTextStyle">
                            {username}
                        </Link>
                    </span>
                    {post.fetchVerified && (
                        <BadgeCheck height="19" width="19" className="profilePostUsernameVerifyBadgeIcon-Box" />
                    )}
                    {post.fetchUploadAt && (
                        <span className="profilePostTimeText">
                            • {formatPostTime(post.fetchUploadAt)}
                        </span>
                    )}
                </div>
            </div>

            {/* Three-dot Dropdown Menu */}
            <div className="postDropdownWrapper" ref={dropdownRef}>
                <button
                    type="button"
                    className="postDropdownToggleBtn"
                    onClick={() => setOpenDropdown(prev => !prev)}
                    aria-label="Post options"
                >
                    <MoreHorizontal size={20} color="#111010" />
                </button>

                {openDropdown && (
                    <PostDropDown
                        isOpen={openDropdown}
                        onClose={() => setOpenDropdown(false)}
                        Post={post}
                        onPostUpdate={(updatedPost) => {
                            if (onPostUpdate) onPostUpdate(updatedPost);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default PostHeader;
