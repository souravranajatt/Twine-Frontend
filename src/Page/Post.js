import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BadgeCheck, Heart, MessageCircle, Forward, SendHorizontal, MapPin, Lock, MoreHorizontal } from 'lucide-react';
import HeaderArea from "../Components/Header/Header.js";
import FooterArea from "../Components/Footer/Footer.js";
import { postFetchAPI } from "../Utils/PostFeaturesAPI.js";
import { likePostAPI, dislikePostAPI } from "../Utils/PostActionAPI.js";
import { loggedUserDataAPI } from "../Utils/homePageAPI.js";
import formatPostTime from "../Lib/formatPostTime.js";
import renderFormattedCaption from "../Lib/renderFormattedCaption.js";
import RenderTaggedUsers from "../Components/PostContainer/Structure/RenderTaggedUsers.js";
import CustomVideoPlayer from "../Lib/CustomVideoPlayer.js";
import PostDropDown from "../Components/PostModal/PostDropDown.js";
import CommentSection from "../Components/PostContainer/Structure/CommentSection.js";
import "../Assets/Bundle/Post.css";
import "../Assets/Bundle/GlobalSpinner.css";

const DEFAULT_IMAGE = "https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png";

function Post() {

    const { username, postId } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [commentText, setCommentText] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [expandedCaption, setExpandedCaption] = useState(false);
    const [loggedUser, setLoggedUser] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(false);

    const likingRef = useRef(false);
    const commentSectionRef = useRef(null);

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
                            {/* Three-dot dropdown */}
                            <div className="postDropdownWrapper" style={{ position: "relative", marginLeft: "auto", display: "flex", alignItems: "center" }}>
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
                                        Post={post}
                                        onPostUpdate={(updatedPost) => setPost(updatedPost)}
                                    />
                                )}
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
                                    <CustomVideoPlayer
                                        src={post.fetchFileName}
                                        className="post-page-media video-post"
                                        autoPlay={true}
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
                        {(post.fetchPostLocation || post.fetchTaggedUsers?.length > 0) && (
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
                                {post.fetchTaggedUsers?.length > 0 && (
                                    <RenderTaggedUsers taggedUsers={post.fetchTaggedUsers} />
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
                                            ? <span className='twine-comment-modal-post-spinner'></span>
                                            : <SendHorizontal size={16} />
                                        }
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Comments Section */}
                        {post.commentEnable ? (
                            <CommentSection
                                ref={commentSectionRef}
                                postId={post.fetchPostId}
                                isModal={false}
                                loggedUser={loggedUser}
                                onCommentCountUpdate={(change) => {
                                    setPost(prev => ({
                                        ...prev,
                                        commentCount: Math.max(0, (prev.commentCount || 0) + change)
                                    }));
                                }}
                            />
                        ) : (<>
                            <div style={{ padding: "20px", textAlign: "center" }}>
                                <p style={{ color: "#8e8e93", fontSize: "13px" }}><i>Comments are disabled for this post</i></p>
                            </div>
                        </>)}

                    </div>
                )
                }

            </main >

            <FooterArea />
        </div >
    );
}

export default Post;