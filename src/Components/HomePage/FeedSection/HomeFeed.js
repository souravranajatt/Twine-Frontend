import React, { useState, useEffect } from "react";
import { Loader2, BadgeCheck, Heart, MessageCircle, Forward, SendHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import "./HomeFeed.css";
import { homeFeedFetch } from "../../../Utils/homePageAPI.js";
import { likePostAPI, dislikePostAPI, postCommentAPI } from "../../../Utils/PostActionAPI.js";
import formatPostTime from "../../../Lib/formatPostTime.js";
import renderFormattedCaption from "../../../Lib/renderFormattedCaption.js";

const DEFAULT_IMAGE = "https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png";

function HomeFeed() {

    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [expandedCaptions, setExpandedCaptions] = useState({});

    // post comment state
    const [commentTexts, setCommentTexts] = useState({});       // { postId: "text" }
    const [submittingComments, setSubmittingComments] = useState({}); // { postId: true/false }

    const toggleCaption = (postId) => {
        setExpandedCaptions(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    // Fetch Feed
    useEffect(() => {
        const fetchFeed = async () => {
            if (!hasMore) return;
            setLoadingPosts(true);
            try {
                const data = await homeFeedFetch(page);
                if (data.length === 0) {
                    setHasMore(false);
                } else {
                    setPosts(prev => {
                        const existingIds = new Set(prev.map(p => p.fetchPostId));
                        const newPosts = data.filter(p => !existingIds.has(p.fetchPostId));
                        return [...prev, ...newPosts];
                    });
                }
            } catch (err) {
                console.log("Error loading feed!", err);
            } finally {
                setLoadingPosts(false);
            }
        };
        fetchFeed();
    }, [page]);

    // Infinite Scroll
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop + 100 >=
                document.documentElement.scrollHeight
            ) {
                if (!loadingPosts && hasMore) {
                    setPage(prev => prev + 1);
                }
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [loadingPosts, hasMore]);

    // Handle Like/Unlike Button
    const handleLike = async (postId) => {

        const post = posts.find(p => p.fetchPostId === postId);
        const isLiked = post.likedByCurrentUser;

        // Update UI first
        setPosts(prev => prev.map(p =>
            p.fetchPostId === postId
                ? {
                    ...p,
                    likedByCurrentUser: !isLiked,
                    likeCount: isLiked ? p.likeCount - 1 : p.likeCount + 1
                }
                : p
        ));

        try {
            if (isLiked) {
                await dislikePostAPI(postId);
            } else {
                await likePostAPI(postId);
            }
        } catch (error) {
            console.log("Error!", error);
            // Revert on API error 
            setPosts(prev => prev.map(p =>
                p.fetchPostId === postId
                    ? {
                        ...p,
                        likedByCurrentUser: isLiked,
                        likeCount: post.likeCount
                    }
                    : p
            ));
        }
    };

    // Handle Comment Submit
    const handleCommentSubmit = async (e, postId) => {
        e.preventDefault();

        const text = (commentTexts[postId] || "").trim();
        if (!text || submittingComments[postId]) return;

        setSubmittingComments(prev => ({ ...prev, [postId]: true }));
        setCommentTexts(prev => ({ ...prev, [postId]: "" }));

        // Change Comment Count 
        setPosts(prev => prev.map(p =>
            p.fetchPostId === postId
                ? { ...p, commentCount: (p.commentCount || 0) + 1 }
                : p
        ));

        try {
            await postCommentAPI(postId, { commentText: text, parentId: null });
        } catch (error) {
            console.error("Comment failed!", error);
            // Revert on Fsilure API
            setPosts(prev => prev.map(p =>
                p.fetchPostId === postId
                    ? { ...p, commentCount: Math.max(0, (p.commentCount || 1) - 1) }
                    : p
            ));
            setCommentTexts(prev => ({ ...prev, [postId]: text }));
        } finally {
            setSubmittingComments(prev => ({ ...prev, [postId]: false }));
        }
    };


    return (
        <div className="feed-wrapper">
            {posts.map(post => (
                <div className="feed-post-box" key={post.fetchPostId}>

                    {/* Post Header */}
                    <div className="post-header">
                        <div className="postHeaderImageMainFeed">
                            <img
                                src={post.profileImage && post.profileImage !== "null"
                                    ? post.profileImage : DEFAULT_IMAGE}
                                className="imageFeedPostMainHeader"
                                alt="user-profile"
                            />
                        </div>
                        <div className="post-header-userText">
                            <div className="post-header-userTextBox">
                                <span className="username-title">
                                    <Link to={`/${post.username}`} className="userLinkTextStyle">
                                        {post.username}
                                    </Link>
                                </span>
                                {post.fetchVerified && (
                                    <BadgeCheck height="19" width="19"
                                        className="profilePostUsernameVerifyBadgeIcon-Box" />
                                )}
                                {post.fetchUploadAt && (
                                    <span className="profilePostTimeText">
                                        • {formatPostTime(post.fetchUploadAt)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Post Media */}
                    <div className="postFeedMainContent">
                        <div className="postMainFeedContentMiddleBox" style={{
                            paddingBottom: post.width && post.height
                                ? `${(post.height / post.width) * 100}%` : '100%'
                        }}>
                            {post.postType === 'VIDEO' ? (
                                <video
                                    src={post.fetchFileName}
                                    className="mainContentMediaBox video-post"
                                    controls playsInline
                                />
                            ) : (
                                <img
                                    src={post.fetchFileName}
                                    alt="post-content"
                                    className="mainContentMediaBox image-post"
                                />
                            )}
                        </div>
                    </div>

                    {/* Caption */}
                    {post?.fetchPostCaption && (
                        <div className="post-caption-wrapper">
                            <p className="caption-paraHead">
                                {renderFormattedCaption(
                                    post.fetchPostCaption,
                                    post.fetchPostId,
                                    expandedCaptions[post.fetchPostId],
                                    toggleCaption,
                                    post.fetchPostCaption.length
                                )}
                            </p>
                        </div>
                    )}

                    {/* Location + Tagged */}
                    {(post.fetchPostLocation || post.fetchTaggedUsers?.length > 0) && (
                        <div className="postMetaInfoRow">
                            {post.fetchPostLocation && (
                                <span className="postMetaLocation">{post.fetchPostLocation}</span>
                            )}
                            {post.fetchPostLocation && post.fetchTaggedUsers?.length > 0 && (
                                <span className="metaDivider">•</span>
                            )}
                            {post.fetchTaggedUsers?.length > 0 && (
                                <div className="postMetaTagged-Box">
                                    <span className="taggedUserLabel">With </span>
                                    {post.fetchTaggedUsers.map(u => (
                                        <span key={u} className="taggedUserPill">@{u}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="postBottomAction">
                        <div className="action-toogles">

                            <div className="postAction-Icons">
                                <button type="button" className="postActionContentBtn-ToogleBox"
                                    onClick={() => handleLike(post.fetchPostId)}>
                                    <Heart size={23} className="bottomAction-icons"
                                        fill={post.likedByCurrentUser ? "#ff3b6c" : "none"}
                                        color={post.likedByCurrentUser ? "#ff3b6c" : "currentColor"}
                                    />
                                    {post.likeVisible === true && (
                                        <span className="postActionCountText">
                                            {post.likeCount || 0}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {post.commentEnable && (
                                <div className="postAction-Icons">
                                    <button type="button" className="postActionContentBtn-ToogleBox">
                                        <MessageCircle size={23} className="bottomAction-icons" />
                                        <span className="postActionCountText">
                                            {post.commentCount || 0}
                                        </span>
                                    </button>
                                </div>
                            )}

                            {post.shareEnable && (
                                <div className="postAction-Icons shareIconRight">
                                    <button type="button" className="postActionContentBtn-ToogleBox">
                                        <Forward size={23} className="bottomAction-icons" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Comment Form */}
                        {post.commentEnable && (
                            <div className="action-toogles commentFormToggleBox">
                                <form
                                    onSubmit={(e) => handleCommentSubmit(e, post.fetchPostId)}
                                    className="commentPost-Box"
                                >
                                    <input
                                        type="text"
                                        className="commentPost-field"
                                        placeholder="Drop a comment..."
                                        autoCapitalize="none"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        value={commentTexts[post.fetchPostId] || ""}
                                        onChange={(e) =>
                                            setCommentTexts(prev => ({
                                                ...prev,
                                                [post.fetchPostId]: e.target.value
                                            }))
                                        }
                                        disabled={submittingComments[post.fetchPostId]}
                                    />
                                    <button
                                        type="submit"
                                        className="commentIcon-box"
                                        disabled={
                                            submittingComments[post.fetchPostId] ||
                                            !(commentTexts[post.fetchPostId] || "").trim()
                                        }
                                    >
                                        {submittingComments[post.fetchPostId]
                                            ? <Loader2 size={18} className="comment-icon spinner-icon" />
                                            : <SendHorizontal size={18} className="comment-icon" />}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                </div>
            ))}

            {loadingPosts && (
                <div className="feed-loading-spinner-box">
                    <Loader2 size={30} className="spinner-icon" />
                </div>
            )}
        </div>
    );
}

export default HomeFeed;