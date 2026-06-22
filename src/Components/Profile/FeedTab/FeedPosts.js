import React, { useState, useEffect, useCallback, useRef } from "react";
import useInfiniteScroll from "../../../Lib/useInfiniteScroll.js";
import { searchUserPostsAPI } from "../../../Utils/userProfileAPI.js";
import { likePostAPI, dislikePostAPI, postCommentAPI } from "../../../Utils/PostActionAPI.js";
import formatPostTime from "../../../Lib/formatPostTime.js";
import renderFormattedCaption from "../../../Lib/renderFormattedCaption.js";
import {
    Heart, Forward, MessageCircle,
    BadgeCheck, Aperture, Loader2, SendHorizontal, MoreHorizontal
} from "lucide-react";
import "./FeedPosts.css";
import PostsSkeleton from "../SkeletonBody/PostsSkeleton.js";
import PostBoxModal from "../../PostModal/PostBoxModal.js";
import PostDropDown from "../../PostModal/PostDropDown.js";

function FeedPosts({ username, userProfileDataURL, contentVisibleTab }) {

    const [profilePosts, setProfilePosts] = useState([]);
    const [postPage, setPostPage] = useState(0);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const hasFetchedInitialRef = useRef(false);

    // For Post Modal
    const [activePostForModal, setActivePostForModal] = useState(null);

    // caption state
    const [expandedCaptions, setExpandedCaptions] = useState({});

    // post comment state
    const [commentTexts, setCommentTexts] = useState({});
    const [submittingComments, setSubmittingComments] = useState({});

    // Prevent double like API calls per post
    const likingPostsRef = useRef({});
    const submittingCommentsRef = useRef({});

    // Dropdown state
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const toggleCaption = (postId) => {
        setExpandedCaptions((prev) => ({ ...prev, [postId]: !prev[postId] }));
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.postDropdownWrapper')) {
                setOpenDropdownId(null);
            }
        };

        if (openDropdownId) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownId]);

    // Reset on User Change 
    useEffect(() => {
        setProfilePosts([]);
        setPostPage(0);
        setHasMorePosts(true);
        hasFetchedInitialRef.current = false;
        setOpenDropdownId(null);
    }, [username]);

    // Initial Load
    useEffect(() => {

        if (contentVisibleTab !== "FeedVisibleTab") return;
        if (!userProfileDataURL?.searchPrivateShow) return;

        if (hasFetchedInitialRef.current) return;
        hasFetchedInitialRef.current = true;

        const fetchInitial = async () => {
            setLoadingPosts(true);
            try {
                const data = await searchUserPostsAPI(username, 0);
                if (!data || data.length === 0) setHasMorePosts(false);
                else setProfilePosts(data);
            } catch (err) {
                console.log("Error loading profile posts!", err);
                hasFetchedInitialRef.current = false;
            } finally {
                setLoadingPosts(false);
            }
        };

        fetchInitial();
    }, [username, userProfileDataURL, contentVisibleTab]);

    // Pagination
    useEffect(() => {
        if (postPage === 0) return;
        if (!userProfileDataURL?.searchPrivateShow) return;

        const fetchMore = async () => {
            if (!hasMorePosts) return;
            setLoadingPosts(true);
            try {
                const data = await searchUserPostsAPI(username, postPage);
                if (!data || data.length === 0) {
                    setHasMorePosts(false);
                } else {
                    setProfilePosts((prev) => {
                        const existingIds = new Set(prev.map((p) => p.fetchPostId));
                        return [...prev, ...data.filter((p) => !existingIds.has(p.fetchPostId))];
                    });
                }
            } catch (err) {
                console.log("Error loading more posts!", err);
                setPostPage((prev) => prev - 1);
            } finally {
                setLoadingPosts(false);
            }
        };

        fetchMore();
    }, [username, postPage, hasMorePosts, userProfileDataURL]);

    // Infinite Scroll
    useInfiniteScroll({
        loading: loadingPosts,
        hasMore: hasMorePosts,
        onLoadMore: useCallback(() => setPostPage((prev) => prev + 1), []),
        activeTab: contentVisibleTab,
        tabName: "FeedVisibleTab",
    });

    // Handle Like/Dislike Button
    const handleLike = async (postId) => {
        if (likingPostsRef.current[postId]) return;

        const post = profilePosts.find(p => p.fetchPostId === postId);
        const isLiked = post.likedByCurrentUser;

        // Optimistic UI update
        setProfilePosts(prev => prev.map(p =>
            p.fetchPostId === postId
                ? {
                    ...p,
                    likedByCurrentUser: !isLiked,
                    likeCount: isLiked ? p.likeCount - 1 : p.likeCount + 1
                }
                : p
        ));

        likingPostsRef.current[postId] = true;

        try {
            if (isLiked) {
                await dislikePostAPI(postId);
            } else {
                await likePostAPI(postId);
            }
        } catch (error) {
            console.log("Like error:", error);
            // Rollback on failure
            setProfilePosts(prev => prev.map(p =>
                p.fetchPostId === postId
                    ? {
                        ...p,
                        likedByCurrentUser: isLiked,
                        likeCount: post.likeCount
                    }
                    : p
            ));
        } finally {
            likingPostsRef.current[postId] = false;
        }
    };

    // Handle Comment Submit
    const handleCommentSubmit = async (e, postId) => {
        e.preventDefault();

        const text = (commentTexts[postId] || "").trim();
        if (!text || submittingCommentsRef.current[postId]) return;

        submittingCommentsRef.current[postId] = true;
        setSubmittingComments(prev => ({ ...prev, [postId]: true }));
        setCommentTexts(prev => ({ ...prev, [postId]: "" }));

        // Change Comment Count
        setProfilePosts(prev => prev.map(p =>
            p.fetchPostId === postId
                ? { ...p, commentCount: (p.commentCount || 0) + 1 }
                : p
        ));

        try {
            await postCommentAPI(postId, { commentText: text, parentId: null });
        } catch (error) {
            console.error("Comment failed!", error);
            // Revert on Failure API
            setProfilePosts(prev => prev.map(p =>
                p.fetchPostId === postId
                    ? { ...p, commentCount: Math.max(0, (p.commentCount || 1) - 1) }
                    : p
            ));
            setCommentTexts(prev => ({ ...prev, [postId]: text }));
        } finally {
            submittingCommentsRef.current[postId] = false;
            setSubmittingComments(prev => ({ ...prev, [postId]: false }));
        }
    };

    return (
        <>
            {profilePosts.length === 0 && loadingPosts ? (
                <div className="contentSectionDesignFeed-Box">
                    <PostsSkeleton />
                </div>
            ) : (
                <div className="contentSectionDesignFeed-Box">
                    {profilePosts && profilePosts.length > 0 ? (
                        profilePosts.map((post) => (
                            <div key={post.fetchPostId} className="profilePostCard-Box">

                                {/* Post Header */}
                                <div className="profilePostHeaderMain-Box">
                                    <div className="profilePostHeaderPFPImage-Box">
                                        <img
                                            src={
                                                post.profileImage && post.profileImage !== "null"
                                                    ? `${post.profileImage}`
                                                    : userProfileDataURL?.searchProfilePhoto &&
                                                        userProfileDataURL.searchProfilePhoto !== "null"
                                                        ? `${userProfileDataURL.searchProfilePhoto}`
                                                        : `https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png`
                                            }
                                            className="profilePostHeaderPFP-Box"
                                            alt="profileImage"
                                        />
                                    </div>
                                    <div className="profilePostHeaderUsernameText-box">
                                        <div className="profilePostHeaderUserRow">
                                            <span className="profilePostHeaderUserText-Box">
                                                {post.username || userProfileDataURL.searchUsername}
                                            </span>
                                            {post.fetchVerified === true && (
                                                <BadgeCheck height="19" width="19" className="profilePostUsernameVerifyBadgeIcon-Box" />
                                            )}
                                            {post.fetchUploadAt && (
                                                <span className="profilePostTimeText">• {formatPostTime(post.fetchUploadAt)}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Dropdown Menu */}
                                    <div className="postDropdownWrapper" style={{ position: "relative", marginLeft: "auto", display: "flex", alignItems: "center" }}>
                                        <button
                                            type="button"
                                            onClick={() => setOpenDropdownId(prev => prev === post.fetchPostId ? null : post.fetchPostId)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', display: 'flex' }}
                                        >
                                            <MoreHorizontal size={20} color="#111010" />
                                        </button>

                                        {openDropdownId === post.fetchPostId && (
                                            <PostDropDown
                                                isOpen={openDropdownId === post.fetchPostId}
                                                onClose={() => setOpenDropdownId(null)}
                                                Post={post}
                                                onPostUpdate={(updatePost) => {
                                                    setProfilePosts(prev => prev.map(p => (p.fetchPostId === post.fetchPostId) ? updatePost : p));
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Post Media */}
                                <div className="profilePostMainContentMedia-Box">
                                    <div
                                        className="postMainContentMiddleBox"
                                        style={{
                                            paddingBottom: post.width && post.height
                                                ? `${(post.height / post.width) * 100}%`
                                                : "100%",
                                        }}
                                    >
                                        {post.postType === "VIDEO" ? (
                                            <video
                                                src={post.fetchFileName}
                                                className="profilePostContentView-Box video-post"
                                                controls
                                                playsInline
                                            />
                                        ) : (
                                            <img
                                                src={post.fetchFileName}
                                                alt="Post Media"
                                                className="profilePostContentView-Box image-post"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Post Caption */}
                                {post?.fetchPostCaption && (
                                    <div className="profilePostCaptionMain-Box">
                                        <p className="profilePostCaptionText-Box">
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

                                {/* Location & Tagged Users metadata at the bottom */}
                                {(post.fetchPostLocation || (post.fetchTaggedUsers && post.fetchTaggedUsers.length > 0)) && (
                                    <div className="postMetaInfoRow">
                                        {post.fetchPostLocation && (
                                            <span className="postMetaLocation">
                                                {post.fetchPostLocation}
                                            </span>
                                        )}
                                        {post.fetchPostLocation && post.fetchTaggedUsers && post.fetchTaggedUsers.length > 0 && (
                                            <span className="metaDivider">•</span>
                                        )}
                                        {post.fetchTaggedUsers && post.fetchTaggedUsers.length > 0 && (
                                            <div className="postMetaTagged-Box">
                                                <span className="taggedUserLabel">With </span>
                                                {post.fetchTaggedUsers.map((taggedUser) => (
                                                    <span key={taggedUser} className="taggedUserPill">@{taggedUser}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}



                                {/* Post Actions */}
                                <div className="postBottomAction">
                                    <div className="action-toogles">
                                        <div className="postAction-Icons">
                                            <button type="button" className="postActionContentBtn-ToogleBox" onClick={() => handleLike(post.fetchPostId)}>
                                                <Heart size={23} className={`bottomAction-icons ${post.likedByCurrentUser ? "likedActive" : ""}`}
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

                                        {post.commentEnable === true && (
                                            <div className="postAction-Icons">
                                                <button type="button" className="postActionContentBtn-ToogleBox" onClick={() => setActivePostForModal(post)}>
                                                    <MessageCircle size={23} className="bottomAction-icons" />
                                                    <span className="postActionCountText">
                                                        {post.commentCount || 0}
                                                    </span>
                                                </button>
                                            </div>
                                        )}

                                        {post.shareEnable === true && (
                                            <div className="postAction-Icons shareIconRight">
                                                <button type="button" className="postActionContentBtn-ToogleBox">
                                                    <Forward size={23} className="bottomAction-icons" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Inline Comment Box */}
                                    {post.commentEnable === true && (
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
                        ))
                    ) : (
                        !loadingPosts && (
                            <div className="errorCheckNoPost-Box">
                                <div className="errorCheckNoPostWrapper-Box">
                                    <div className="errorCheckIconPost-Box">
                                        <Aperture height="24" width="24" className="errorCheckIconNoPost" />
                                    </div>
                                    <p className="errorCheckTextNoPost-Box">No Post Yet</p>
                                </div>
                            </div>
                        )
                    )}
                    {/* Pagination Loader */}
                    {loadingPosts && profilePosts.length > 0 && (
                        <div className="feed-loading-spinner-box">
                            <Loader2 size={30} className="spinner-icon" />
                        </div>
                    )}
                </div>
            )}

            {/* Showing Popup for Each Post */}
            <PostBoxModal
                isOpen={activePostForModal !== null}
                onClose={() => setActivePostForModal(null)}
                post={activePostForModal}
                onPostUpdate={(updatedPost) => {
                    setProfilePosts((prev) =>
                        prev.map((p) => (p.fetchPostId === updatedPost.fetchPostId ? updatedPost : p))
                    );
                    setActivePostForModal(updatedPost);
                }}
            />
        </>
    );
}

export default FeedPosts;