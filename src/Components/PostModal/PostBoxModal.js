import React, { useState, useEffect, useRef } from "react";
import { X, Heart, MessageCircle, Forward, SendHorizontal, Loader2, BadgeCheck, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { likePostAPI, dislikePostAPI, postCommentAPI } from "../../Utils/PostActionAPI.js";
import { fetchCommentsAPI } from "../../Utils/PostFeaturesAPI.js";
import { loggedUserDataAPI } from "../../Utils/homePageAPI.js";
import formatPostTime from "../../Lib/formatPostTime.js";
import renderFormattedCaption from "../../Lib/renderFormattedCaption.js";
import "./PostBoxModal.css";

const DEFAULT_IMAGE = "https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png";

function PostBoxModal({ isOpen, onClose, post, onPostUpdate }) {
    const [localPost, setLocalPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const [commentPage, setCommentPage] = useState(0);
    const [commentText, setCommentText] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [loggedUser, setLoggedUser] = useState(null);
    const [expandedCaption, setExpandedCaption] = useState(false);

    const originalUrlRef = useRef("");
    const commentsEndRef = useRef(null);
    const isFetchingRef = useRef(false);
    const likingRef = useRef(false);
    const commentingRef = useRef(false);

    // Fetch logged user data
    useEffect(() => {
        const getLoggedUser = async () => {
            try {
                const data = await loggedUserDataAPI();
                setLoggedUser(data);
            } catch (err) {
                console.error("Failed to get logged user data", err);
            }
        };
        getLoggedUser();
    }, []);

    // Update local post state if prop changes
    useEffect(() => {
        if (post) {
            setLocalPost(post);
        }
    }, [post]);

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



    // Fetch comments on Initial/Reset
    useEffect(() => {
        if (isOpen && post?.fetchPostId) {
            // Reset pagination states
            setComments([]);
            setCommentPage(0);
            setHasMoreComments(true);
            isFetchingRef.current = true;
            setLoadingComments(true);

            const getComments = async () => {
                try {
                    const data = await fetchCommentsAPI(post.fetchPostId, 0);
                    setComments(data || []);
                    if (!data || data.length < 15) {
                        setHasMoreComments(false);
                    }
                } catch (err) {
                    console.error("Failed to load comments", err);
                    setComments([]);
                    setHasMoreComments(false);
                } finally {
                    setLoadingComments(false);
                    isFetchingRef.current = false;
                }
            };
            getComments();
        } else {
            setComments([]);
            setCommentPage(0);
            setHasMoreComments(false);
            isFetchingRef.current = false;
        }
    }, [isOpen, post?.fetchPostId]);

    // Scroll handler to fetch next page of comments
    const handleScroll = async (e) => {
        if (!hasMoreComments || isFetchingRef.current || loadingComments || !post?.fetchPostId) return;

        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        // Check if user has scrolled near bottom
        if (scrollHeight - scrollTop - clientHeight <= 30) {
            isFetchingRef.current = true;
            setLoadingComments(true);
            const nextPage = commentPage + 1;

            try {
                const data = await fetchCommentsAPI(post.fetchPostId, nextPage);
                if (!data || data.length === 0) {
                    setHasMoreComments(false);
                } else {
                    setCommentPage(nextPage);
                    setComments((prev) => {
                        const existingIds = new Set(prev.map(c => c.commentId));
                        const newComments = data.filter(c => !existingIds.has(c.commentId));
                        return [...prev, ...newComments];
                    });
                    if (data.length < 15) {
                        setHasMoreComments(false);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch paginated comments", err);
            } finally {
                setLoadingComments(false);
                isFetchingRef.current = false;
            }
        }
    };

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

    // Add Comment API call
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const text = commentText.trim();
        if (!text || commentingRef.current) return;

        commentingRef.current = true;
        setSubmittingComment(true);
        setCommentText("");

        const newCommentObj = {
            commentId: `temp-${Date.now()}`,
            username: loggedUser?.userName || "you",
            profileImage: loggedUser?.profilePhoto || DEFAULT_IMAGE,
            commentText: text,
            createdAt: new Date().toISOString(),
            fetchVerified: loggedUser?.verify || false
        };

        // Optimistic Update
        setComments((prev) => [...prev, newCommentObj]);

        // Scroll to the bottom to show user's comment
        setTimeout(() => {
            commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 80);

        const updatedPost = {
            ...localPost,
            commentCount: (localPost.commentCount || 0) + 1
        };
        setLocalPost(updatedPost);
        if (onPostUpdate) {
            onPostUpdate(updatedPost);
        }

        try {
            await postCommentAPI(localPost.fetchPostId, { commentText: text, parentId: null });
        } catch (err) {
            console.error("Comment submit failed", err);
            // Rollback comment 
            setComments((prev) => prev.filter((c) => c.commentId !== newCommentObj.commentId));
            const rolledBackPost = {
                ...localPost,
                commentCount: Math.max(0, (localPost.commentCount || 1) - 1)
            };
            setLocalPost(rolledBackPost);
            if (onPostUpdate) {
                onPostUpdate(rolledBackPost);
            }
            setCommentText(text); // Restore typed text
        } finally {
            setSubmittingComment(false);
            commentingRef.current = false;
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
                        <video
                            src={localPost.fetchFileName}
                            className="post-modal-media-content"
                            controls
                            playsInline
                            autoPlay
                            muted
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
                                    {localPost.fetchPostLocation && (
                                        <span className="post-modal-location-text">
                                            <MapPin size={10} style={{ marginRight: 2 }} />
                                            {localPost.fetchPostLocation}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {localPost.fetchUploadAt && (
                                <span className="post-modal-time-badge">
                                    {formatPostTime(localPost.fetchUploadAt)}
                                </span>
                            )}
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

                        {/* Tagged users - placed inside header */}
                        {localPost.fetchTaggedUsers && localPost.fetchTaggedUsers.length > 0 && (
                            <div className="post-modal-header-tagged">
                                <span className="post-modal-tagged-label">With: </span>
                                {localPost.fetchTaggedUsers.map((user) => (
                                    <span key={user} className="post-modal-tagged-pill">
                                        @{user.replace(/^@/, "")}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Scrollable comments panel */}
                    {localPost.commentEnable ? (
                        <div className="post-modal-comments-scrollview" onScroll={handleScroll}>

                            {/* Comments List */}
                            {loadingComments && comments.length === 0 ? (
                                <div className="post-modal-comments-list">
                                    {[...Array(4)].map((_, idx) => (
                                        <div key={idx} className="post-modal-comment-skeleton">
                                            <div className="comment-skeleton-avatar" />
                                            <div className="comment-skeleton-info">
                                                <div className="comment-skeleton-name" />
                                                <div className="comment-skeleton-text" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="post-modal-empty-comments">
                                    <p>No comments yet. Start the conversation!</p>
                                </div>
                            ) : (
                                <div className="post-modal-comments-list">
                                    {comments.map((comment) => (
                                        <div key={comment.commentId} className="post-modal-comment-row">
                                            <div className="post-modal-comment-avatar-div">
                                                <img
                                                    src={comment.profileImage && comment.profileImage !== "null"
                                                        ? comment.profileImage
                                                        : DEFAULT_IMAGE}
                                                    className="post-modal-comment-avatar-img"
                                                    alt={comment.username}
                                                />
                                            </div>
                                            <div className="post-modal-comment-body">
                                                <div className="post-modal-comment-meta">
                                                    <span className="post-modal-comment-username">
                                                        {comment.username}
                                                    </span>
                                                    {comment.fetchVerified && (
                                                        <BadgeCheck size={14} className="post-modal-verify-badge inline-badge" />
                                                    )}
                                                    <span className="post-modal-comment-time">
                                                        {formatPostTime(comment.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="post-modal-comment-text">
                                                    {comment.commentText}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Pagination Loader */}
                                    {loadingComments && comments.length > 0 && (
                                        <div className="post-modal-spinner-container" style={{ padding: "10px 0" }}>
                                            <Loader2 size={20} className="spinner-icon" />
                                        </div>
                                    )}
                                    <div ref={commentsEndRef} />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ padding: "20px", textAlign: "center" }}>
                            <p style={{ color: "#888", fontSize: "13px" }}><i>Comments are disabled for this post</i></p>
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
                                        <Loader2 size={16} className="spinner-icon" />
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
