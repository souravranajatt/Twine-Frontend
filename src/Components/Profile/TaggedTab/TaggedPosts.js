import React, { useState, useEffect, useCallback } from "react";
import useInfiniteScroll from "../../../Lib/useInfiniteScroll.js";
import { searchUserTaggedPostsAPI } from "../../../utils/userProfileAPI.js";
import { CircleUser, Loader2, Play } from "lucide-react";
import "./TaggedPosts.css";

function TaggedPosts({ username, contentVisibleTab }) {

    const [taggedPosts, setTaggedPosts] = useState([]);
    const [taggedPage, setTaggedPage] = useState(0);
    const [loadingTagged, setLoadingTagged] = useState(false);
    const [hasMoreTagged, setHasMoreTagged] = useState(true);

    // Initial Load
    useEffect(() => {
        setTaggedPosts([]);
        setTaggedPage(0);
        setHasMoreTagged(true);

        const fetchInitial = async () => {
            try {
                const data = await searchUserTaggedPostsAPI(username, 0);
                if (!data || data.length === 0) setHasMoreTagged(false);
                else setTaggedPosts(data);
            } catch (err) {
                console.log("Error loading tagged posts!", err);
            }
        };

        fetchInitial();
    }, [username]);

    // Pagination
    useEffect(() => {
        if (taggedPage === 0) return;

        const fetchMore = async () => {
            setLoadingTagged(true);
            try {
                const data = await searchUserTaggedPostsAPI(username, taggedPage);
                if (!data || data.length === 0) {
                    setHasMoreTagged(false);
                } else {
                    setTaggedPosts((prev) => {
                        const existingIds = new Set(prev.map((p) => p.fetchPostId));
                        return [...prev, ...data.filter((p) => !existingIds.has(p.fetchPostId))];
                    });
                }
            } catch (err) {
                console.log("Error loading more tagged posts!", err);
            } finally {
                setLoadingTagged(false);
            }
        };

        fetchMore();
    }, [username, taggedPage]);

    useInfiniteScroll({
        loading: loadingTagged,
        hasMore: hasMoreTagged,
        onLoadMore: useCallback(() => setTaggedPage((prev) => prev + 1), []),
        activeTab: contentVisibleTab,
        tabName: "TaggedVisibleTab",
    });

    return (
        <div className="contentSectionDesignTagged-Box">
            <div className="connectionTaggedPostListBox">
                {taggedPosts && taggedPosts.length > 0 ? (
                    <div className="connectionTaggedPostContainerBox grid-3x3">
                        {taggedPosts.map((post) => (
                            <div key={post.fetchPostId} className="grid-item">
                                {post.postType === "VIDEO" ? (
                                    <>
                                        <video src={post.fetchFileName} className="gridImagesList" muted playsInline />
                                        <div className="gridItemVideoBadge">
                                            <Play size={12} fill="white" color="white" />
                                        </div>
                                    </>
                                ) : (
                                    <img src={post.fetchFileName} alt="Tagged Post" className="gridImagesList" />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    !loadingTagged && (
                        <div className="errorCheckNoTagged-Box">
                            <div className="errorCheckNoTaggedWrapper-Box">
                                <div className="errorCheckIconTagged-Box">
                                    <CircleUser height="24" width="24" className="errorCheckIconNoTagged" />
                                </div>
                                <p className="errorCheckTextTagged-Box">No Tagged Post</p>
                            </div>
                        </div>
                    )
                )}
            </div>
            {loadingTagged && (
                <div className="feed-loading-spinner-box">
                    <Loader2 size={30} className="spinner-icon" />
                </div>
            )}
        </div>
    );
}

export default TaggedPosts;