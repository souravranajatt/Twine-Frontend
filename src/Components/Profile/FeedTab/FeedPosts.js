import React, { useState, useEffect, useCallback } from "react";
import useInfiniteScroll from "../../../Lib/useInfiniteScroll.js";
import { searchUserPostsAPI } from "../../../utils/userProfileAPI.js";
import formatPostTime from "../../../Lib/formatPostTime.js";
import {
    Heart, Flame, MessageCircleDashed, Link2,
    BadgeCheck, Aperture, Loader2, SendHorizontal
} from "lucide-react";
import "./FeedPosts.css";

function FeedPosts({ username, userProfileDataURL, contentVisibleTab }) {

    const [profilePosts, setProfilePosts] = useState([]);
    const [postPage, setPostPage] = useState(0);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const [expandedCaptions, setExpandedCaptions] = useState({});

    const toggleCaption = (postId) => {
        setExpandedCaptions((prev) => ({ ...prev, [postId]: !prev[postId] }));
    };

    // Initial Load
    useEffect(() => {
        setProfilePosts([]);
        setPostPage(0);
        setHasMorePosts(true);

        const fetchInitial = async () => {
            try {
                const data = await searchUserPostsAPI(username, 0);
                if (!data || data.length === 0) setHasMorePosts(false);
                else setProfilePosts(data);
            } catch (err) {
                console.log("Error loading profile posts!", err);
            }
        };

        fetchInitial();
    }, [username]);

    // Pagination
    useEffect(() => {
        if (postPage === 0) return;

        const fetchMore = async () => {
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
            } finally {
                setLoadingPosts(false);
            }
        };

        fetchMore();
    }, [username, postPage]);

    useInfiniteScroll({
        loading: loadingPosts,
        hasMore: hasMorePosts,
        onLoadMore: useCallback(() => setPostPage((prev) => prev + 1), []),
        activeTab: contentVisibleTab,
        tabName: "FeedVisibleTab",
    });

    return (
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
                                        <BadgeCheck height="16" width="16" className="profilePostUsernameVerifyBadgeIcon-Box" />
                                    )}
                                    {post.fetchUploadAt && (
                                        <span className="profilePostTimeText">• {formatPostTime(post.fetchUploadAt)}</span>
                                    )}
                                </div>
                                {post.fetchPostLocation && (
                                    <span className="profilePostLocationText">{post.fetchPostLocation}</span>
                                )}
                            </div>
                        </div>

                        {/* Post Caption */}
                        {post?.fetchPostCaption && (
                            <div className="profilePostCaptionMain-Box">
                                <p className="profilePostCaptionText-Box">
                                    {post.fetchPostCaption.length > 100 && !expandedCaptions[post.fetchPostId]
                                        ? post.fetchPostCaption.slice(0, 100) + "... "
                                        : post.fetchPostCaption}
                                    {post.fetchPostCaption.length > 100 && (
                                        <span className="captionShowMoreBtn" onClick={() => toggleCaption(post.fetchPostId)}>
                                            {expandedCaptions[post.fetchPostId] ? " show less" : "more"}
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}

                        {/* Tagged Users */}
                        {post.fetchTaggedUsers && post.fetchTaggedUsers.length > 0 && (
                            <div className="profilePostTaggedUsers-Box">
                                <span className="taggedUserLabel">With </span>
                                {post.fetchTaggedUsers.map((taggedUser) => (
                                    <span key={taggedUser} className="taggedUserPill">@{taggedUser}</span>
                                ))}
                            </div>
                        )}

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
                                        className="profilePostContentView-Box"
                                        style={{ position: "absolute", top: 0, left: 0 }}
                                        controls
                                        playsInline
                                    />
                                ) : (
                                    <img
                                        src={post.fetchFileName}
                                        alt="Post Media"
                                        className="profilePostContentView-Box"
                                        style={{ position: "absolute", top: 0, left: 0 }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Post Actions */}
                        <div className="postBottomAction">
                            <div className="action-toogles">
                                <div className="postAction-Icons">
                                    <button type="button" className="postActionContentBtn-ToogleBox">
                                        <Heart size={23} className="bottomAction-icons" />
                                        {!post.likeHide && post.likeCount && post.likeCount !== "0" && (
                                            <span className="postActionCountText">{post.likeCount}</span>
                                        )}
                                    </button>
                                </div>
                                <div className="postAction-Icons">
                                    <button type="button" className="postActionContentBtn-ToogleBox">
                                        <Flame size={23} className="bottomAction-icons" />
                                    </button>
                                </div>
                                {post.commentEnable === true && (
                                    <div className="postAction-Icons">
                                        <button type="button" className="postActionContentBtn-ToogleBox">
                                            <MessageCircleDashed size={23} className="bottomAction-icons" />
                                            {post.commentCount && post.commentCount !== "0" && (
                                                <span className="postActionCountText">{post.commentCount}</span>
                                            )}
                                        </button>
                                    </div>
                                )}
                                {post.shareEnable === true && (
                                    <div className="postAction-Icons">
                                        <button type="button" className="postActionContentBtn-ToogleBox" title="Copy Link">
                                            <Link2 size={23} className="bottomAction-icons" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {post.commentEnable === true && (
                                <div className="action-toogles">
                                    <div className="commentPost-Box">
                                        <input
                                            type="text"
                                            name="commentPost"
                                            className="commentPost-field"
                                            placeholder="Drop a comment"
                                            autoCapitalize="none"
                                            autoComplete="off"
                                            autoCorrect="off"
                                        />
                                        <button type="button" className="commentIcon-box">
                                            <SendHorizontal size={23} className="comment-icon" />
                                        </button>
                                    </div>
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
            {loadingPosts && (
                <div className="feed-loading-spinner-box">
                    <Loader2 size={30} className="spinner-icon" />
                </div>
            )}
        </div>
    );
}

export default FeedPosts;