import React, { useState, useEffect, useCallback } from "react";
import useInfiniteScroll from "../../../Lib/useInfiniteScroll.js";
import { searchUserTimelinePostsAPI } from "../../../Utils/userProfileAPI.js";
import { HeartOff, Play, Users, Loader2 } from "lucide-react";
import "./TimelinePosts.css";
import TimelineSkeleton from "../SkeletonBody/TimelineSkeleton.js";
import PostBoxModal from "../../PostModal/PostBoxModal.js";

function TimelinePosts({ username, userProfileDataURL, contentVisibleTab }) {

    const [timelinePosts, setTimelinePosts] = useState([]);
    const [activePostForModal, setActivePostForModal] = useState(null);
    const [timelinePage, setTimelinePage] = useState(0);
    const [loadingTimeline, setLoadingTimeline] = useState(false);
    const [hasMoreTimeline, setHasMoreTimeline] = useState(true);

    // Initial Load
    useEffect(() => {
        setTimelinePosts([]);
        setTimelinePage(0);
        setHasMoreTimeline(true);

        if (contentVisibleTab !== "TimeLineVisibleTab") return;
        if (!userProfileDataURL?.searchPrivateShow || !userProfileDataURL?.searchUserTimeline) return;

        const fetchInitial = async () => {
            setLoadingTimeline(true);
            try {
                const data = await searchUserTimelinePostsAPI(username, 0);
                if (!data || data.length === 0) setHasMoreTimeline(false);
                else setTimelinePosts(data);
            } catch (err) {
                console.log("Error loading timeline posts!", err);
            } finally {
                setLoadingTimeline(false);
            }
        };

        fetchInitial();
    }, [contentVisibleTab, username, userProfileDataURL]);

    // Pagination
    useEffect(() => {
        if (timelinePage === 0) return;
        if (contentVisibleTab !== "TimeLineVisibleTab") return;
        if (!userProfileDataURL?.searchPrivateShow || !userProfileDataURL?.searchUserTimeline) return;

        const fetchMore = async () => {
            if (hasMoreTimeline === false) return;
            setLoadingTimeline(true);
            try {
                const data = await searchUserTimelinePostsAPI(username, timelinePage);
                if (!data || data.length === 0) {
                    setHasMoreTimeline(false);
                } else {
                    setTimelinePosts((prev) => {
                        const existingIds = new Set(prev.map((p) => p.fetchPostId));
                        return [...prev, ...data.filter((p) => !existingIds.has(p.fetchPostId))];
                    });
                }
            } catch (err) {
                console.log("Error loading more timeline posts!", err);
            } finally {
                setLoadingTimeline(false);
            }
        };

        fetchMore();
    }, [username, timelinePage, contentVisibleTab, userProfileDataURL]);

    useInfiniteScroll({
        loading: loadingTimeline,
        hasMore: hasMoreTimeline,
        onLoadMore: useCallback(() => setTimelinePage((prev) => prev + 1), []),
        activeTab: contentVisibleTab,
        tabName: "TimeLineVisibleTab",
    });

    return (
        <>
            {timelinePosts.length === 0 && loadingTimeline ? (
                <TimelineSkeleton />
            ) : (
                <div className="contentSectionDesignTimeline-Box">
                    {userProfileDataURL.searchUserTimeline ? (
                        <div className="timelineConectionContentMainBox">
                            <div className="connectionTimelineHeaderBar-Box">
                                <Users size={16} className="timelineHeaderIcon" />
                                <span className="spanTimelineHeaderBox">
                                    Connected with{" "}
                                    <span className="usernameTimelineBoxHiighlight">
                                        {userProfileDataURL.searchUserTimeline}
                                    </span>
                                </span>
                            </div>
                            <div>
                                <div className="connectionTimelinePostHeaderBox">
                                    <span className="spanTimeLinePostHeaderTextBox">Timeline Photos and Videos</span>
                                </div>
                                <div className="connectionTimelinePostListBox">
                                    <div className="connectionTimelinePostContainerBox grid-3x3">
                                        {timelinePosts && timelinePosts.length > 0 ? (
                                            timelinePosts.map((post) => (
                                                <div key={post.fetchPostId} className="grid-item" onClick={() => setActivePostForModal(post)} style={{ cursor: "pointer" }}>
                                                    {post.postType === "VIDEO" ? (
                                                        <>
                                                            <video src={post.fetchFileName} className="gridImagesList" muted playsInline />
                                                            <div className="gridItemVideoBadge">
                                                                <Play size={12} fill="white" color="white" />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <img src={post.fetchFileName} alt="Timeline Post" className="gridImagesList" />
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            !loadingTimeline && (
                                                <div className="timelineNoPostMsgBox">
                                                    <p className="timelineErrorMsgNoPost"><span>No Uploads</span></p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Pagination Loader */}
                            {loadingTimeline && timelinePosts.length > 0 && (
                                <div className="feed-loading-spinner-box">
                                    <Loader2 size={30} className="spinner-icon" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="errorCheckNoTimeline-Box">
                            <div className="errorCheckNoTimelineWrapper-Box">
                                <div className="errorCheckIconTimeline-Box">
                                    <HeartOff height="24" width="24" className="errorCheckIconNoTimeline" />
                                </div>
                                <p className="errorCheckTextTimeline-Box">No Connection Yet</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {/* Post Box Modal */}
            <PostBoxModal
                isOpen={activePostForModal !== null}
                onClose={() => setActivePostForModal(null)}
                post={activePostForModal}
                onPostUpdate={(updatedPost) => {
                    setTimelinePosts((prev) =>
                        prev.map((p) => (p.fetchPostId === updatedPost.fetchPostId ? updatedPost : p))
                    );
                    setActivePostForModal(updatedPost);
                }}
            />
        </>
    );
}

export default TimelinePosts;