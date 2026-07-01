import React, { useState, useEffect, useCallback, useRef } from "react";
import "../../Assets/Bundle/Settings.css";
import { Heart, MessageCircle, Play, Bookmark } from "lucide-react";
import { fetchSavedPostsAPI } from "../../Utils/SettingDataAPI.js";
import useInfiniteScroll from "../../Lib/useInfiniteScroll.js";
import PostBoxModal from "../PostModal/PostBoxModal.js";

function SavedPosts() {
  const [savedPosts, setSavedPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activePostForModal, setActivePostForModal] = useState(null);

  const hasFetchedInitialRef = useRef(false);
  const isFetchingMoreRef = useRef(false);

  // Initial Load
  useEffect(() => {
    if (hasFetchedInitialRef.current) return;
    hasFetchedInitialRef.current = true;

    const fetchInitial = async () => {
      setLoading(true);
      try {
        const data = await fetchSavedPostsAPI(0);
        if (!data || data.length === 0) {
          setHasMore(false);
        } else {
          setSavedPosts(data);
          // Standard page size check (e.g. if we get less than 9 posts, there might be no more posts)
          if (data.length < 12) {
            setHasMore(false);
          }
        }
      } catch (err) {
        console.error("Error loading saved posts!", err);
        hasFetchedInitialRef.current = false;
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, []);

  // Pagination Loading
  useEffect(() => {
    if (page === 0) return;
    if (isFetchingMoreRef.current) return;
    isFetchingMoreRef.current = true;

    const fetchMore = async () => {
      if (!hasMore) {
        isFetchingMoreRef.current = false;
        return;
      }
      setLoading(true);
      try {
        const data = await fetchSavedPostsAPI(page);
        if (!data || data.length === 0) {
          setHasMore(false);
        } else {
          setSavedPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.fetchPostId));
            const newPosts = data.filter((p) => !existingIds.has(p.fetchPostId));
            if (newPosts.length === 0) {
              setHasMore(false);
            }
            return [...prev, ...newPosts];
          });
          if (data.length < 12) {
            setHasMore(false);
          }
        }
      } catch (err) {
        console.error("Error loading more saved posts!", err);
        // Rollback page state update on failure
        setPage((prev) => prev - 1);
      } finally {
        setLoading(false);
        isFetchingMoreRef.current = false;
      }
    };

    fetchMore();
  }, [page, hasMore]);

  // Hook up reusable infinite scroll listener
  useInfiniteScroll({
    loading: loading,
    hasMore: hasMore,
    onLoadMore: useCallback(() => {
      setPage((prev) => prev + 1);
    }, []),
    activeTab: "saved-posts",
    tabName: "saved-posts",
  });

  return (
    <div className="sp-main-container">
      <h2 className="sf-section-title sp-title">Saved Posts</h2>
      <p className="sp-description">
        View and manage the posts you have saved.
      </p>

      {/* Render 3x3 Skeleton Loader for Initial Fetch */}
      {savedPosts.length === 0 && loading ? (
        <div className="sp-grid-container">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className="sp-skeleton-card" />
          ))}
        </div>
      ) : savedPosts.length > 0 ? (
        <>
          <div className="sp-grid-container">
            {savedPosts.map((post) => (
              <div
                key={post.fetchPostId}
                className="sp-grid-item"
                onClick={() => setActivePostForModal(post)}
              >
                {post.postType === "VIDEO" ? (
                  <>
                    <video
                      src={post.fetchFileName}
                      className="sp-grid-media"
                      muted
                      playsInline
                    />
                    <div className="sp-grid-video-badge">
                      <Play size={12} fill="white" color="white" />
                    </div>
                  </>
                ) : (
                  <img
                    src={post.fetchFileName}
                    alt="Saved Post"
                    className="sp-grid-media"
                    loading="lazy"
                  />
                )}

                {/* Hover overlay with likes and comments statistics */}
                <div className="sp-grid-overlay">
                  <div className="sp-overlay-stat">
                    <Heart size={20} fill="white" color="white" />
                    <span>{post.likeCount || 0}</span>
                  </div>
                  <div className="sp-overlay-stat">
                    <MessageCircle size={20} fill="white" color="white" />
                    <span>{post.commentCount || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load-More Skeleton Row */}
          {loading && (
            <div className="sp-loadmore-skeleton">
              {[1, 2, 3].map((i) => (
                <div key={i} className="sp-skeleton-card" />
              ))}
            </div>
          )}

        </>
      ) : (
        /* Empty State */
        <div className="sp-empty-state">
          <div className="sp-empty-icon-box">
            <Bookmark size={32} />
          </div>
          <h3 className="sp-empty-title">No Saved Posts</h3>
          <p className="sp-empty-text">
            When you save photos and videos, they will appear here.
          </p>
        </div>
      )}

      {/* Post Box Modal details */}
      <PostBoxModal
        isOpen={activePostForModal !== null}
        onClose={() => setActivePostForModal(null)}
        post={activePostForModal}
        onPostUpdate={(updatedPost) => {
          setSavedPosts((prev) =>
            prev.map((p) =>
              p.fetchPostId === updatedPost.fetchPostId ? updatedPost : p
            )
          );
          setActivePostForModal(updatedPost);
        }}
      />
    </div>
  );
}

export default SavedPosts;
