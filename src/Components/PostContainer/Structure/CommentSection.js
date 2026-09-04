import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { BadgeCheck } from "lucide-react";
import { fetchCommentsAPI } from "../../../Utils/PostFeaturesAPI.js";
import { postCommentAPI } from "../../../Utils/PostActionAPI.js";
import formatPostTime from "../../../Lib/formatPostTime.js";
import "../Style/CommentSection.css";
import "../../../Assets/Bundle/GlobalSpinner.css";

const DEFAULT_IMAGE = "https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png";

const CommentSection = forwardRef(({ postId, isModal, loggedUser, onCommentCountUpdate }, ref) => {
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const [commentPage, setCommentPage] = useState(0);

    const isFetchingRef = useRef(false);
    const commentsEndRef = useRef(null);

    // Initial Fetch
    useEffect(() => {
        if (!postId) return;

        setComments([]);
        setCommentPage(0);
        setHasMoreComments(true);
        isFetchingRef.current = true;
        setLoadingComments(true);

        const getComments = async () => {
            try {
                const data = await fetchCommentsAPI(postId, 0);
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
    }, [postId]);

    // Pagination logic for infinite scroll
    const loadNextPage = async () => {
        if (!hasMoreComments || isFetchingRef.current || loadingComments || !postId) return;

        isFetchingRef.current = true;
        setLoadingComments(true);
        const nextPage = commentPage + 1;

        try {
            const data = await fetchCommentsAPI(postId, nextPage);
            if (!data || data.length === 0) {
                setHasMoreComments(false);
            } else {
                setCommentPage(nextPage);
                setComments((prev) => {
                    const existingIds = new Set(prev.map((c) => c.commentId));
                    const newComments = data.filter((c) => !existingIds.has(c.commentId));
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
    };

    // Modal Scroll Handler
    const handleModalScroll = (e) => {
        if (!isModal) return;
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop - clientHeight <= 30) {
            loadNextPage();
        }
    };

    // Page Scroll Handler (Window)
    useEffect(() => {
        if (isModal) return;

        const handleWindowScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop + 100 >= document.documentElement.scrollHeight) {
                loadNextPage();
            }
        };

        window.addEventListener("scroll", handleWindowScroll);
        return () => window.removeEventListener("scroll", handleWindowScroll);
    }, [hasMoreComments, commentPage, loadingComments, postId, isModal]);

    // Let parent components trigger comment submission
    useImperativeHandle(ref, () => ({
        async submitNewComment(text) {
            if (!text || !postId) return Promise.reject("Invalid text or postId");

            const newCommentObj = {
                commentId: `temp-${Date.now()}`,
                username: loggedUser?.userName || "you",
                profileImage: loggedUser?.profilePhoto || DEFAULT_IMAGE,
                commentText: text,
                createdAt: new Date().toISOString(),
                fetchVerified: loggedUser?.verify || false,
            };

            setComments((prev) => [...prev, newCommentObj]);

            if (onCommentCountUpdate) {
                onCommentCountUpdate(1);
            }

            setTimeout(() => {
                commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 80);

            try {
                await postCommentAPI(postId, { commentText: text, parentId: null });
                return Promise.resolve();
            } catch (err) {
                console.error("Comment submit failed", err);

                // Revert UI updates if API call fails
                setComments((prev) => prev.filter((c) => c.commentId !== newCommentObj.commentId));
                if (onCommentCountUpdate) {
                    onCommentCountUpdate(-1);
                }

                return Promise.reject(err);
            }
        }
    }));

    // Show skeletons during initial load
    if (loadingComments && comments.length === 0) {
        return (
            <div className={isModal ? "twine-comment-scrollview" : "twine-comment-pageview"}>
                <div className="twine-comments-list">
                    {[...Array(4)].map((_, idx) => (
                        <div key={idx} className="twine-comment-skeleton">
                            <div className="twine-comment-skeleton-avatar skeleton-shimmer" />
                            <div className="twine-comment-skeleton-info">
                                <div className="twine-comment-skeleton-name skeleton-shimmer" />
                                <div className="twine-comment-skeleton-text skeleton-shimmer" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div
            className={isModal ? "twine-comment-scrollview" : "twine-comment-pageview"}
            onScroll={isModal ? handleModalScroll : undefined}
        >
            {comments.length === 0 ? (
                <div className="twine-empty-comments">
                    <p>No comments yet. Start the conversation!</p>
                </div>
            ) : (
                <div className="twine-comments-list">
                    {comments.map((comment) => (
                        <div key={comment.commentId} className="twine-comment-row">
                            <div className="twine-comment-avatar-div">
                                <img
                                    src={comment.profileImage && comment.profileImage !== "null"
                                        ? comment.profileImage
                                        : DEFAULT_IMAGE}
                                    className="twine-comment-avatar-img"
                                    alt={comment.username}
                                />
                            </div>
                            <div className="twine-comment-body">
                                <div className="twine-comment-meta">
                                    <span className="twine-comment-username">
                                        {comment.username}
                                    </span>
                                    {comment.fetchVerified && (
                                        <BadgeCheck size={14} className="twine-comment-verify-badge inline-badge" />
                                    )}
                                    <span className="twine-comment-time">
                                        {formatPostTime(comment.createdAt)}
                                    </span>
                                </div>
                                <p className="twine-comment-text">
                                    {comment.commentText}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Pagination Loader */}
                    {loadingComments && comments.length > 0 && (
                        <div className="twine-postmodal-spinner-center">
                            <span className="twine-loader-spinner"></span>
                        </div>
                    )}
                    <div ref={commentsEndRef} />
                </div>
            )}
        </div>
    );
});

export default CommentSection;
