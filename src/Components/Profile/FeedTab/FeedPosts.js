import React, { useState, useEffect, useRef, useCallback } from "react";
import { Aperture } from "lucide-react";
import useInfiniteScroll from "../../../Lib/useInfiniteScroll.js";
import { searchUserPostsAPI } from "../../../Utils/userProfileAPI.js";
import "./FeedPosts.css";
import "../../../Assets/Bundle/GlobalSpinner.css";
import PostsSkeleton from "../SkeletonBody/PostsSkeleton.js";
import PostBoxModal from "../../PostModal/PostBoxModal.js";
import PostCard from "../../PostContainer/Structure/PostCard.js";

function FeedPosts({ username, userProfileDataURL, contentVisibleTab }) {

    const [profilePosts, setProfilePosts] = useState([]);
    const [postPage, setPostPage] = useState(0);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const hasFetchedInitialRef = useRef(false);

    const [activePostForModal, setActivePostForModal] = useState(null);

    // Reset on user change
    useEffect(() => {
        setProfilePosts([]);
        setPostPage(0);
        setHasMorePosts(true);
        hasFetchedInitialRef.current = false;
    }, [username]);

    // Lock body scroll when modal open
    useEffect(() => {
        if (activePostForModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [activePostForModal]);

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

    // Called by PostCard when like/dropdown changes the post object
    const handlePostUpdate = (updatedPost) => {
        setProfilePosts((prev) =>
            prev.map((p) => (p.fetchPostId === updatedPost.fetchPostId ? updatedPost : p))
        );
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
                            <PostCard
                                key={post.fetchPostId}
                                post={post}
                                onPostUpdate={handlePostUpdate}
                                onCommentClick={(p) => setActivePostForModal(p)}
                                isParentModalOpen={activePostForModal !== null}
                            />
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
                        <div className="twine-loader-spinner-center">
                            <span className="twine-loader-spinner"></span>
                        </div>
                    )}
                </div>
            )}

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