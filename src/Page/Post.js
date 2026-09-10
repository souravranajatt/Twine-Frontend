import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BadgeCheck, Heart, MessageCircle, Forward, SendHorizontal, Lock } from 'lucide-react';
import HeaderArea from "../Components/Header/Header.js";
import FooterArea from "../Components/Footer/Footer.js";
import { postFetchAPI } from "../Utils/PostFeaturesAPI.js";
import { likePostAPI, dislikePostAPI } from "../Utils/PostActionAPI.js";
import { useAuth } from "../AuthChecker/AuthContext.js";
import PostHeader from "../Components/PostContainer/Structure/PostHeader.js";
import PostContent from "../Components/PostContainer/Structure/PostContent.js";
import PostCaption from "../Components/PostContainer/Structure/PostCaption.js";
import CommentSection from "../Components/PostContainer/Structure/CommentSection.js";
import "../Assets/Bundle/Post.css";
import "../Assets/Bundle/GlobalSpinner.css";

const DEFAULT_IMAGE = "https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png";

function Post() {

    const { username, postId } = useParams();
    const navigate = useNavigate();
    const { loggedUser } = useAuth();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [commentText, setCommentText] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    const likingRef = useRef(false);
    const commentSectionRef = useRef(null);

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



    // Like handler
    const handleLike = async () => {
        if (!post || likingRef.current) return;

        const isCurrentlyLiked = post.likedByCurrentUser;
        setPost(prev => ({
            ...prev,
            likedByCurrentUser: !isCurrentlyLiked,
            likeCount: isCurrentlyLiked
                ? Math.max(0, prev.likeCount - 1)
                : prev.likeCount + 1
        }));

        likingRef.current = true;
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
            likingRef.current = false;
        }
    };

    // Comment handler via CommentSection ref
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

                        {/* Header: Avatar, Username, Badge, Time, 3-dot dropdown */}
                        <PostHeader
                            post={post}
                            onPostUpdate={(updatedPost) => setPost(updatedPost)}
                        />

                        {/* Media: Responsive Image or CustomVideoPlayer */}
                        <PostContent
                            post={post}
                            isParentModalOpen={false}
                        />

                        {/* Caption, Hashtags, Mentions, Location & Tagged Users */}
                        <PostCaption post={post} />


                        {/* Actions */}
                        <div className="post-page-actions">
                            <div className="post-page-action-row">

                                {/* Like */}
                                <div className="post-page-action-icon-box">
                                    <button
                                        type="button"
                                        className="post-page-action-btn"
                                        onClick={handleLike}
                                        aria-label={post.likedByCurrentUser ? "Unlike post" : "Like post"}
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
                                </div>

                                {/* Comment (display only) */}
                                {post.commentEnable && (
                                    <div className="post-page-action-icon-box">
                                        <button
                                            type="button"
                                            className="post-page-action-btn post-page-comment-btn-static"
                                            aria-label="Comments"
                                        >
                                            <MessageCircle size={23} className="post-page-action-icon" />
                                            <span className="post-page-action-count">{post.commentCount || 0}</span>
                                        </button>
                                    </div>
                                )}

                                {/* Share */}
                                {post.shareEnable && (
                                    <div className="post-page-action-icon-box post-page-share-box">
                                        <button
                                            type="button"
                                            className="post-page-action-btn"
                                            aria-label="Share post"
                                        >
                                            <Forward size={23} className="post-page-action-icon" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Comment Form */}
                            {post.commentEnable && (
                                <div className="post-page-comment-wrapper">
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
                                            aria-label="Send comment"
                                        >
                                            {submittingComment
                                                ? <span className='twine-comment-modal-post-spinner'></span>
                                                : <SendHorizontal size={18} />
                                            }
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* Comments Section */}
                        <CommentSection
                            ref={commentSectionRef}
                            postId={post.fetchPostId}
                            isModal={false}
                            loggedUser={loggedUser}
                            commentEnable={post.commentEnable}
                            onCommentCountUpdate={(change) => {
                                setPost(prev => ({
                                    ...prev,
                                    commentCount: Math.max(0, (prev.commentCount || 0) + change)
                                }));
                            }}
                        />

                    </div>
                )
                }

            </main >

            <FooterArea />
        </div >
    );
}

export default Post;