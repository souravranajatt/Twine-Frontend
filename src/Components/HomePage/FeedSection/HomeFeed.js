import React, { useState, useEffect, useRef } from "react";
import "./HomeFeed.css";
import "../../../Assets/Bundle/GlobalSpinner.css";
import { homeFeedFetch } from "../../../Utils/homePageAPI.js";
import PostsSkeleton from "../../Profile/SkeletonBody/PostsSkeleton.js";
import PostBoxModal from "../../PostModal/PostBoxModal.js";
import PostCard from "../../PostContainer/Structure/PostCard.js";

function HomeFeed() {

    const [activePostForModal, setActivePostForModal] = useState(null);
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const isFetchingRef = useRef(false);

    // Lock body scroll when modal open
    useEffect(() => {
        if (activePostForModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [activePostForModal]);

    // Fetch Feed
    useEffect(() => {
        const fetchFeed = async () => {
            if (isFetchingRef.current || !hasMore) return;
            setLoadingPosts(true);
            isFetchingRef.current = true;
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
                isFetchingRef.current = false;
            }
        };
        fetchFeed();
    }, [page, hasMore]);

    // Infinite Scroll
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop + 100 >=
                document.documentElement.scrollHeight
            ) {
                if (!isFetchingRef.current && hasMore) {
                    isFetchingRef.current = true;
                    setPage(prev => prev + 1);
                }
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [hasMore]);

    // Called by PostCard when post state changes (like, dropdown action etc)
    const handlePostUpdate = (updatedPost) => {
        setPosts(prev =>
            prev.map(p => p.fetchPostId === updatedPost.fetchPostId ? updatedPost : p)
        );
    };

    return (
        <>
            {posts.length === 0 && loadingPosts ? (
                <div className="feed-wrapper">
                    <PostsSkeleton />
                </div>
            ) : (
                <div className="feed-wrapper">
                    {posts.map(post => (
                        <PostCard
                            key={post.fetchPostId}
                            post={post}
                            onPostUpdate={handlePostUpdate}
                            onCommentClick={(p) => setActivePostForModal(p)}
                            isParentModalOpen={activePostForModal !== null}
                        />
                    ))}

                    {loadingPosts && (
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
                    setPosts((prev) =>
                        prev.map((p) => (p.fetchPostId === updatedPost.fetchPostId ? updatedPost : p))
                    );
                    setActivePostForModal(updatedPost);
                }}
            />
        </>
    );
}

export default HomeFeed;