import React, { useState, useEffect, useCallback, useRef } from "react";
import useInfiniteScroll from "../../../Lib/useInfiniteScroll.js";
import { searchUserTaggedPostsAPI } from "../../../Utils/userProfileAPI.js";
import { CircleUser, Play } from "lucide-react";
import "./TaggedPosts.css";
import "../../../Assets/Bundle/GlobalSpinner.css";
import TaggedSkeleton from "../SkeletonBody/TaggedSkeleton.js";
import PostBoxModal from "../../PostModal/PostBoxModal.js";

function TaggedPosts({ username, userProfileDataURL, contentVisibleTab }) {

    const [taggedPosts, setTaggedPosts] = useState([]);
    const [activePostForModal, setActivePostForModal] = useState(null);
    const [taggedPage, setTaggedPage] = useState(0);
    const [loadingTagged, setLoadingTagged] = useState(false);
    const [hasMoreTagged, setHasMoreTagged] = useState(true);
    const hasFetchedInitialRef = useRef(false);

    // Reset on user Change
    useEffect(() => {
        setTaggedPosts([]);
        setTaggedPage(0);
        setHasMoreTagged(true);
        hasFetchedInitialRef.current = false;
    }, [username]);

    // Initial Load
    useEffect(() => {

        if (contentVisibleTab !== "TaggedVisibleTab") return;
        if (!userProfileDataURL?.searchPrivateShow) return;

        if (hasFetchedInitialRef.current) return;
        hasFetchedInitialRef.current = true;

        const fetchInitial = async () => {
            setLoadingTagged(true);
            try {
                const data = await searchUserTaggedPostsAPI(username, 0);
                if (!data || data.length === 0) setHasMoreTagged(false);
                else setTaggedPosts(data);
            } catch (err) {
                console.log("Error loading tagged posts!", err);
                hasFetchedInitialRef.current = false;
            } finally {
                setLoadingTagged(false);
            }
        };

        fetchInitial();
    }, [username, userProfileDataURL, contentVisibleTab]);

    // Pagination
    useEffect(() => {

        if (taggedPage === 0) return;
        if (!userProfileDataURL?.searchPrivateShow) return;

        const fetchMore = async () => {
            if (!hasMoreTagged) return;
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
                setTaggedPage((prev) => prev - 1);
            } finally {
                setLoadingTagged(false);
            }
        };

        fetchMore();
    }, [username, taggedPage, hasMoreTagged, userProfileDataURL]);

    useInfiniteScroll({
        loading: loadingTagged,
        hasMore: hasMoreTagged,
        onLoadMore: useCallback(() => setTaggedPage((prev) => prev + 1), []),
        activeTab: contentVisibleTab,
        tabName: "TaggedVisibleTab",
    });

    return (
        <>
            {taggedPosts.length === 0 && loadingTagged ? (
                <TaggedSkeleton />
            ) : (
                <div className="contentSectionDesignTagged-Box">
                    <div className="connectionTaggedPostListBox">
                        {taggedPosts && taggedPosts.length > 0 ? (
                            <div className="connectionTaggedPostContainerBox grid-3x3">
                                {taggedPosts.map((post) => (
                                    <div key={post.fetchPostId} className="grid-item" onClick={() => setActivePostForModal(post)} style={{ cursor: "pointer" }}>
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
                    {/* Pagination Loader */}
                    {loadingTagged && taggedPosts.length > 0 && (
                        <div className="twine-loader-spinner-center">
                            <span className="twine-loader-spinner"></span>
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
                    setTaggedPosts((prev) =>
                        prev.map((p) => (p.fetchPostId === updatedPost.fetchPostId ? updatedPost : p))
                    );
                    setActivePostForModal(updatedPost);
                }}
            />
        </>
    );
}

export default TaggedPosts;