import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BadgeCheck, Heart, MessageCircle, Forward, SendHorizontal, Loader2, MapPin, Lock } from 'lucide-react';
import HeaderArea from "../Components/Header/Header.js";
import FooterArea from "../Components/Footer/Footer.js";
import { postFetchAPI } from "../Utils/PostFeaturesAPI.js";
import { likePostAPI, dislikePostAPI, postCommentAPI, fetchCommentsAPI } from "../Utils/PostActionAPI.js";
import { loggedUserDataAPI } from "../Utils/homePageAPI.js";
import formatPostTime from "../Lib/formatPostTime.js";
import renderFormattedCaption from "../Lib/renderFormattedCaption.js";
import "../Assets/Bundle/Post.css";

const DEFAULT_IMAGE = "https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png";

function Post() {

    const { username, postId } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [expandedCaption, setExpandedCaption] = useState(false);
    const [loggedUser, setLoggedUser] = useState(null);

    const [commentPage, setCommentPage] = useState(0);
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const isFetchingCommentsRef = useRef(false);
    const commentsEndRef = useRef(null);

    // Fetch logged user
    useEffect(() => {
        const getLoggedUser = async () => {
            try {
                const data = await loggedUserDataAPI();
                setLoggedUser(data);
            } catch (err) {
                console.error("Failed to get logged user", err);
            }
        };
        getLoggedUser();
    }, []);

    // Fetch post
    useEffect(() => {
        const getPost = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await postFetchAPI(postId);

                // change username silently if incorrect
                if (data.username && data.username !== username) {
                    navigate(`/${data.username}/posts/${postId}`, { replace: true });
                }

                setPost(data);
            } catch (err) {
                setError(err || "Post not found!");
            } finally {
                setLoading(false);
            }
        };
        getPost();
    }, [postId]);

    // Fetch comments
    useEffect(() => {
        if (!post || post.privateAccount) return;

        setComments([]);
        setCommentPage(0);
        setHasMoreComments(true);
        isFetchingCommentsRef.current = true;
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
                isFetchingCommentsRef.current = false;
            }
        };
        getComments();
    }, [post?.fetchPostId]);

    // Infinite scroll listener for comments on post page
    useEffect(() => {
        const handleScroll = async () => {
            if (!hasMoreComments || isFetchingCommentsRef.current || loadingComments || !post || post.privateAccount) return;

            // Check if scroll is near bottom
            if (
                window.innerHeight + document.documentElement.scrollTop + 100 >=
                document.documentElement.scrollHeight
            ) {
                isFetchingCommentsRef.current = true;
                setLoadingComments(true);
                const nextPage = commentPage + 1;

                try {
                    const data = await fetchCommentsAPI(postId, nextPage);
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
                    console.error("Failed to load page comments", err);
                } finally {
                    setLoadingComments(false);
                    isFetchingCommentsRef.current = false;
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [hasMoreComments, commentPage, loadingComments, post, postId]);

    // Like handler
    const handleLike = async () => {
        if (isLiking || !post) return;

        const isCurrentlyLiked = post.likedByCurrentUser;
        setPost(prev => ({
            ...prev,
            likedByCurrentUser: !isCurrentlyLiked,
            likeCount: isCurrentlyLiked
                ? Math.max(0, prev.likeCount - 1)
                : prev.likeCount + 1
        }));

        setIsLiking(true);
        try {
            if (isCurrentlyLiked) {
                await dislikePostAPI(postId);
            } else {
                await likePostAPI(postId);
            }
        } catch (err) {
            console.error("Like failed", err);
            // Rollback
            setPost(prev => ({
                ...prev,
                likedByCurrentUser: isCurrentlyLiked,
                likeCount: post.likeCount
            }));
        } finally {
            setIsLiking(false);
        }
    };

    // Comment handler
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const text = commentText.trim();
        if (!text || submittingComment) return;

        setSubmittingComment(true);
        setCommentText("");

        const newComment = {
            commentId: `temp-${Date.now()}`,
            username: loggedUser?.userName || "you",
            profileImage: loggedUser?.profilePhoto || DEFAULT_IMAGE,
            commentText: text,
            createdAt: new Date().toISOString(),
            fetchVerified: loggedUser?.verify || false
        };

        setComments(prev => [...prev, newComment]);

        // Scroll to bottom to show user's comment
        setTimeout(() => {
            commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 80);

        setPost(prev => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));

        try {
            await postCommentAPI(postId, { commentText: text, parentId: null });
        } catch (err) {
            console.error("Comment failed", err);
            setComments(prev => prev.filter(c => c.commentId !== newComment.commentId));
            setPost(prev => ({ ...prev, commentCount: Math.max(0, (prev.commentCount || 1) - 1) }));
            setCommentText(text);
        } finally {
            setSubmittingComment(false);
        }
    };

    return (
        <div className="post-page-wrapper">
            <HeaderArea />

            <main className="post-page-main">

                {/* Loading Skeleton */}
                {loading && (
                    <div className="post-page-card">
                        <div className="post-page-header">
                            <div className="post-page-avatar-wrapper skeleton-shimmer" style={{ border: 'none' }} />
                            <div className="post-page-header-info" style={{ width: '100%', gap: '6px', paddingTop: '2px' }}>
                                <div className="skeleton-shimmer" style={{ width: '120px', height: '14px', borderRadius: '4px' }} />
                                <div className="skeleton-shimmer" style={{ width: '80px', height: '12px', borderRadius: '4px' }} />
                            </div>
                        </div>
                        <div className="post-page-media-wrapper">
                            <div className="post-page-media-box skeleton-shimmer" style={{ paddingBottom: '100%', borderRadius: '8px', border: 'none' }} />
                        </div>
                        <div className="post-page-actions" style={{ padding: '14px 16px', gap: '12px' }}>
                            <div className="post-page-action-row" style={{ gap: '16px' }}>
                                <div className="skeleton-shimmer" style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
                                <div className="skeleton-shimmer" style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
                                <div className="skeleton-shimmer" style={{ width: '26px', height: '26px', borderRadius: '50%', marginLeft: 'auto' }} />
                            </div>
                            <div className="skeleton-shimmer" style={{ width: '60%', height: '14px', borderRadius: '4px', marginTop: '6px' }} />
                            <div className="skeleton-shimmer" style={{ width: '85%', height: '14px', borderRadius: '4px' }} />
                        </div>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="post-page-error-box">
                        <p className="post-page-error-text">{error}</p>
                    </div>
                )}

                {/* Private Account */}
                {!loading && post?.privateAccount && (
                    <div className="post-page-private-box">
                        <div className="post-page-private-avatar-wrapper">
                            <img
                                src={post.profileImage && post.profileImage !== "null"
                                    ? post.profileImage : DEFAULT_IMAGE}
                                className="post-page-private-avatar"
                                alt={post.username}
                            />
                        </div>
                        <div className="post-page-private-lock">
                            <Lock size={20} className="post-page-lock-icon" />
                        </div>
                        <p className="post-page-private-username">@{post.username} {post.fetchVerified && (
                            <BadgeCheck size={17} className="post-page-verify-badge" />
                        )}</p>
                        <p className="post-page-private-text">This account is private</p>
                        <p className="post-page-private-subtext">Follow to see their posts</p>
                    </div>
                )}

                {/* Post Content */}
                {!loading && post && !post.privateAccount && (
                    <div className="post-page-card">

                        {/* Post Header */}
                        <div className="post-page-header">
                            <div className="post-page-avatar-wrapper">
                                <img
                                    src={post.profileImage && post.profileImage !== "null"
                                        ? post.profileImage : DEFAULT_IMAGE}
                                    className="post-page-avatar"
                                    alt={post.username}
                                />
                            </div>
                            <div className="post-page-header-info">
                                <div className="post-page-header-row">
                                    <Link to={`/${post.username}`} className="post-page-username-link">
                                        {post.username}
                                    </Link>
                                    {post.fetchVerified && (
                                        <BadgeCheck size={17} className="post-page-verify-badge" />
                                    )}
                                    {post.fetchUploadAt && (
                                        <span className="post-page-time">
                                            • {formatPostTime(post.fetchUploadAt)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Post Media */}
                        <div className="post-page-media-wrapper">
                            <div
                                className="post-page-media-box"
                                style={{
                                    paddingBottom: post.width && post.height
                                        ? `${(post.height / post.width) * 100}%`
                                        : "100%"
                                }}
                            >
                                {post.postType === "VIDEO" ? (
                                    <video
                                        src={post.fetchFileName}
                                        className="post-page-media video-post"
                                        controls
                                        playsInline
                                    />
                                ) : (
                                    <img
                                        src={post.fetchFileName}
                                        alt="post"
                                        className="post-page-media image-post"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Caption */}
                        {post.fetchPostCaption && (
                            <div className="post-page-caption-box">
                                <p className="post-page-caption-text">
                                    {renderFormattedCaption(
                                        post.fetchPostCaption,
                                        post.fetchPostId,
                                        expandedCaption,
                                        () => setExpandedCaption(!expandedCaption),
                                        post.fetchPostCaption.length
                                    )}
                                </p>
                            </div>
                        )}

                        {/* Location & Tagged */}
                        {(post.fetchPostLocation || (post.fetchTaggedUsers && post.fetchTaggedUsers.length > 0)) && (
                            <div className="post-page-meta-row">
                                {post.fetchPostLocation && (
                                    <span className="post-page-location">
                                        <MapPin size={11} style={{ marginRight: 3 }} />
                                        {post.fetchPostLocation}
                                    </span>
                                )}
                                {post.fetchPostLocation && post.fetchTaggedUsers?.length > 0 && (
                                    <span className="post-page-meta-divider">•</span>
                                )}
                                {post.fetchTaggedUsers && post.fetchTaggedUsers.length > 0 && (
                                    <div className="post-page-tagged-box">
                                        <span className="post-page-tagged-label">With </span>
                                        {post.fetchTaggedUsers.map((u) => (
                                            <span key={u} className="post-page-tagged-pill">@{u}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="post-page-actions">
                            <div className="post-page-action-row">

                                {/* Like */}
                                <button
                                    type="button"
                                    className="post-page-action-btn"
                                    onClick={handleLike}
                                    disabled={isLiking}
                                >
                                    <Heart
                                        size={23}
                                        fill={post.likedByCurrentUser ? "#ff3b6c" : "none"}
                                        color={post.likedByCurrentUser ? "#ff3b6c" : "currentColor"}
                                        className="post-page-action-icon"
                                    />
                                    {post.likeVisible === true && (
                                        <span className="post-page-action-count">{post.likeCount || 0}</span>
                                    )}
                                </button>

                                {/* Comment */}
                                {post.commentEnable && (
                                    <button type="button" className="post-page-action-btn">
                                        <MessageCircle size={23} className="post-page-action-icon" />
                                        <span className="post-page-action-count">{post.commentCount || 0}</span>
                                    </button>
                                )}

                                {/* Share */}
                                {post.shareEnable && (
                                    <button type="button" className="post-page-action-btn post-page-share-btn">
                                        <Forward size={23} className="post-page-action-icon" />
                                    </button>
                                )}
                            </div>

                            {/* Comment Form */}
                            {post.commentEnable && (
                                <form onSubmit={handleCommentSubmit} className="post-page-comment-form">
                                    <input
                                        type="text"
                                        className="post-page-comment-input"
                                        placeholder="Drop a comment..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        disabled={submittingComment}
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="none"
                                    />
                                    <button
                                        type="submit"
                                        className="post-page-comment-submit"
                                        disabled={submittingComment || !commentText.trim()}
                                    >
                                        {submittingComment
                                            ? <Loader2 size={16} className="post-page-spinner" />
                                            : <SendHorizontal size={16} />
                                        }
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Comments Section */}
                        {post.commentEnable && (
                            <div className="post-page-comments-section">

                                {loadingComments && comments.length === 0 ? (
                                    <div className="post-page-comments-list">
                                        {[...Array(4)].map((_, idx) => (
                                            <div key={idx} className="post-page-comment-skeleton">
                                                <div className="comment-skeleton-avatar skeleton-shimmer" />
                                                <div className="comment-skeleton-info">
                                                    <div className="comment-skeleton-name skeleton-shimmer" />
                                                    <div className="comment-skeleton-text skeleton-shimmer" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : comments.length === 0 ? (
                                    <div className="post-page-no-comments">
                                        <p>No comments yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    <div className="post-page-comments-list">
                                        {comments.map((comment) => (
                                            <div key={comment.commentId} className="post-page-comment-row">
                                                <div className="post-page-comment-avatar-wrapper">
                                                    <img
                                                        src={comment.profileImage && comment.profileImage !== "null"
                                                            ? comment.profileImage : DEFAULT_IMAGE}
                                                        className="post-page-comment-avatar"
                                                        alt={comment.username}
                                                    />
                                                </div>
                                                <div className="post-page-comment-body">
                                                    <div className="post-page-comment-meta">
                                                        <span className="post-page-comment-username">
                                                            {comment.username}
                                                        </span>
                                                        {comment.fetchVerified && (
                                                            <BadgeCheck size={13} className="post-page-verify-badge inline" />
                                                        )}
                                                        <span className="post-page-comment-time">
                                                            {formatPostTime(comment.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="post-page-comment-text">
                                                        {comment.commentText}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Pagination Loader */}
                                        {loadingComments && comments.length > 0 && (
                                            <div className="post-page-comments-loader" style={{ padding: "10px 0" }}>
                                                <Loader2 size={20} className="post-page-spinner" />
                                            </div>
                                        )}
                                        <div ref={commentsEndRef} />
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                )}

            </main>

            <FooterArea />
        </div>
    );
}

export default Post;