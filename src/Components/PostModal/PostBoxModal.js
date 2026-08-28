import React, { useState, useEffect, useRef } from "react";
import { X, Heart, MessageCircle, Forward, SendHorizontal, BadgeCheck, MapPin, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { likePostAPI, dislikePostAPI } from "../../Utils/PostActionAPI.js";
import { useAuth } from "../../AuthChecker/AuthContext.js";
import formatPostTime from "../../Lib/formatPostTime.js";
import renderFormattedCaption from "../../Lib/renderFormattedCaption.js";
import RenderTaggedUsers from "../PostContainer/Structure/RenderTaggedUsers.js";
import CustomVideoPlayer from "../../Lib/CustomVideoPlayer.js";
import PostDropDown from "./PostDropDown.js";
import useScrollLock from "../../Lib/useScrollLock.js";
import CommentSection from "../PostContainer/Structure/CommentSection.js";
import "./PostBoxModal.css";
import "../../Assets/Bundle/GlobalSpinner.css";

const DEFAULT_IMAGE = "https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png";

function PostBoxModal({ isOpen, onClose, post, onPostUpdate }) {
    const { loggedUser } = useAuth();
    const [localPost, setLocalPost] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [expandedCaption, setExpandedCaption] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(false);

    const originalUrlRef = useRef("");
    const likingRef = useRef(false);
    const commentSectionRef = useRef(null);

    // Update local post state if prop changes
    useEffect(() => {
        if (post) {
            setLocalPost(post);
        }
    }, [post]);

    useScrollLock(isOpen);

    // Handle URL change when modal opens/closes
    useEffect(() => {
        if (isOpen && post) {
            originalUrlRef.current = window.location.pathname;
            const cleanUsername = post.username.replace(/^@/, "");
            window.history.pushState(null, "", `/${cleanUsername}/posts/${post.fetchPostId}`);
        }

        return () => {
            if (isOpen && originalUrlRef.current) {
                window.history.pushState(null, "", originalUrlRef.current);
            }
        };
    }, [isOpen, post]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.postDropdownWrapper')) {
                setOpenDropdown(false);
            }
        };
        if (openDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdown]);





    if (!isOpen || !localPost) return null;

    // Like/Dislike action inside Modal
    const handleLikeClick = async () => {
        if (likingRef.current) return;

        const isCurrentlyLiked = localPost.likedByCurrentUser;
        const updatedPost = {
            ...localPost,
            likedByCurrentUser: !isCurrentlyLiked,
            likeCount: isCurrentlyLiked ? Math.max(0, localPost.likeCount - 1) : localPost.likeCount + 1
        };

        // Update Local States
        setLocalPost(updatedPost);
        if (onPostUpdate) {
            onPostUpdate(updatedPost);
        }

        likingRef.current = true;
        try {
            if (isCurrentlyLiked) {
                await dislikePostAPI(localPost.fetchPostId);
            } else {
                await likePostAPI(localPost.fetchPostId);
            }
        } catch (err) {
            console.error("Like API action failed", err);
            // Rollback
            const rolledBackPost = {
                ...localPost,
                likedByCurrentUser: isCurrentlyLiked,
                likeCount: localPost.likeCount
            };
            setLocalPost(rolledBackPost);
            if (onPostUpdate) {
                onPostUpdate(rolledBackPost);
            }
        } finally {
            likingRef.current = false;
        }
    };

    // Add Comment API call via CommentSection ref
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const text = commentText.trim();
        if (!text || submittingComment) return;

        setSubmittingComment(true);
        try {
            await commentSectionRef.current?.submitNewComment(text);
            setCommentText("");
        } catch (err) {
            console.error("Failed to post comment via CommentSection", err);
        } finally {
            setSubmittingComment(false);
        }
    };

    const cleanAuthorUsername = localPost.username.replace(/^@/, "");

    return (
        <>
            {/* Backdrop overlay */}
            <div className="post-modal-backdrop" onClick={onClose} />

            {/* Main unique modal wrapper */}
            <div className="post-modal-container">

                {/* Sleek Close Button */}
                <button className="post-modal-close-btn" onClick={onClose}>
                    <X size={22} />
                </button>

                {/* Post Media Panel (Left) */}
                <div className="post-modal-media-section">
                    {localPost.postType === "VIDEO" ? (
                        <CustomVideoPlayer
                            src={localPost.fetchFileName}
                            className="post-modal-media-content"
                            autoPlay={true}
                        />
                    ) : (
                        <img
                            src={localPost.fetchFileName}
                            alt="Post Content"
                            className="post-modal-media-content"
                        />
                    )}
                </div>

                {/* Post Details & Comments Panel (Right) */}
                <div className="post-modal-info-section">

                    {/* Header section (contains author profile, caption, and tags) */}
                    <div className="post-modal-header">
                        <div className="post-modal-header-top">
                            <div className="post-modal-header-profile">
                                <div className="post-modal-header-avatar-div">
                                    <img
                                        src={localPost.profileImage && localPost.profileImage !== "null" ? localPost.profileImage : DEFAULT_IMAGE}
                                        className="post-modal-header-avatar-img"
                                        alt={localPost.username}
                                    />
                                </div>
                                <div className="post-modal-header-info">
                                    <div className="post-modal-header-name-row">
                                        <Link to={`/${cleanAuthorUsername}`} onClick={onClose} className="post-modal-author-link">
                                            {localPost.username}
                                        </Link>
                                        {localPost.fetchVerified && (
                                            <BadgeCheck size={16} className="post-modal-verify-badge" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {localPost.fetchUploadAt && (
                                <span className="post-modal-time-badge">
                                    {formatPostTime(localPost.fetchUploadAt)}
                                </span>
                            )}
                            {/* Three-dot dropdown */}
                            <div className="postDropdownWrapper" style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                <button
                                    type="button"
                                    onClick={() => setOpenDropdown(prev => !prev)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', display: 'flex' }}
                                >
                                    <MoreHorizontal size={20} color="#111010" />
                                </button>
                                {openDropdown && (
                                    <PostDropDown
                                        isOpen={openDropdown}
                                        onClose={() => setOpenDropdown(false)}
                                        Post={localPost}
                                        onPostUpdate={(updatedPost) => {
                                            setLocalPost(updatedPost);
                                            if (onPostUpdate) onPostUpdate(updatedPost);
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Caption row - placed inside header once, without repeating avatar */}
                        {localPost.fetchPostCaption && (
                            <div className="post-modal-header-caption">
                                <p className="post-modal-caption-text">
                                    {renderFormattedCaption(
                                        localPost.fetchPostCaption,
                                        localPost.fetchPostId,
                                        expandedCaption,
                                        () => setExpandedCaption(!expandedCaption),
                                        localPost.fetchPostCaption.length
                                    )}
                                </p>
                            </div>
                        )}

                        {/* Location & Tagged */}
                        {(localPost.fetchPostLocation || (localPost.fetchTaggedUsers && localPost.fetchTaggedUsers.length > 0)) && (
                            <div className="post-modal-location-tagged-row" style={{ display: "flex", alignItems: "center", gap: "6px", margin: "4px 0 8px" }}>
                                {localPost.fetchPostLocation && (
                                    <span className="post-modal-location-text" style={{ display: "inline-flex", alignItems: "center", fontSize: "11px", color: "#8e8e93" }}>
                                        <MapPin size={10} style={{ marginRight: 2 }} />
                                        {localPost.fetchPostLocation}
                                    </span>
                                )}
                                {localPost.fetchPostLocation && localPost.fetchTaggedUsers && localPost.fetchTaggedUsers.length > 0 && (
                                    <span style={{ fontSize: "10px", color: "#8e8e93" }}>•</span>
                                )}
                                {localPost.fetchTaggedUsers && localPost.fetchTaggedUsers.length > 0 && (
                                    <RenderTaggedUsers taggedUsers={localPost.fetchTaggedUsers} />
                                )}
                            </div>
                        )}

                    </div>

                    {/* CommentSection */}
                    {localPost.commentEnable ? (
                        <CommentSection
                            ref={commentSectionRef}
                            postId={localPost.fetchPostId}
                            isModal={true}
                            loggedUser={loggedUser}
                            onCommentCountUpdate={(change) => {
                                const updatedPost = {
                                    ...localPost,
                                    commentCount: Math.max(0, (localPost.commentCount || 0) + change)
                                };
                                setLocalPost(updatedPost);
                                if (onPostUpdate) {
                                    onPostUpdate(updatedPost);
                                }
                            }}
                        />
                    ) : (
                        <div style={{ padding: "20px", textAlign: "center" }}>
                            <p style={{ color: "#8e8e93", fontSize: "13px" }}><i>Comments are disabled for this post</i></p>
                        </div>
                    )}

                    {/* Action indicators (Like, comment count, share, save) */}
                    <div className="post-modal-actions-container">
                        <div className="post-modal-action-row">
                            <button
                                type="button"
                                className={`post-modal-action-btn ${localPost.likedByCurrentUser ? "liked" : ""}`}
                                onClick={handleLikeClick}
                            >
                                <Heart
                                    size={22}
                                    fill={localPost.likedByCurrentUser ? "#ff3b6c" : "none"}
                                    color={localPost.likedByCurrentUser ? "#ff3b6c" : "currentColor"}
                                />
                                {localPost.likeVisible === true && (
                                    <span className="post-modal-action-count">
                                        {localPost.likeCount || 0}
                                    </span>
                                )}
                            </button>

                            {localPost.commentEnable && (
                                <div className="post-modal-action-btn-static">
                                    <MessageCircle size={22} />
                                    <span className="post-modal-action-count">
                                        {localPost.commentCount || 0}
                                    </span>
                                </div>
                            )}

                            {localPost.shareEnable && (
                                <button type="button" className="post-modal-action-btn share-btn">
                                    <Forward size={22} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Write comment field */}
                    {localPost.commentEnable && (
                        <div className="post-modal-input-container">
                            <form onSubmit={handleCommentSubmit} className="post-modal-comment-form">
                                <input
                                    type="text"
                                    className="post-modal-comment-input"
                                    placeholder="Add a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    disabled={submittingComment}
                                />
                                <button
                                    type="submit"
                                    className="post-modal-comment-submit-btn"
                                    disabled={submittingComment || !commentText.trim()}
                                >
                                    {submittingComment ? (
                                        <span className="twine-comment-modal-post-spinner"></span>
                                    ) : (
                                        <SendHorizontal size={16} />
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default PostBoxModal;
