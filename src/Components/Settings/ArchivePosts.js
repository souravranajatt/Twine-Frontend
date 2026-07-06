import React, { useState, useEffect, useCallback, useRef } from 'react';
import "../../Assets/Bundle/Settings.css";
import { fetchArchivePostsAPI } from "../../Utils/SettingDataAPI.js";
import { unarchivePostAPI } from "../../Utils/PostActionAPI.js";
import useInfiniteScroll from "../../Lib/useInfiniteScroll.js";
import formatPostTime from "../../Lib/formatPostTime.js";

function ArchivePosts() {
  const [archivedPosts, setArchivedPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const hasFetchedInitialRef = useRef(false);
  const isFetchingMoreRef = useRef(false);

  // States for Unarchive Loader
  const [isUnarchiving, setIsUnarchiving] = useState({});
  const isUnarchivingRef = useRef(false);

  // Initial Load of Archived Posts
  useEffect(() => {
    if (hasFetchedInitialRef.current) return;
    hasFetchedInitialRef.current = true;

    const fetchInitial = async () => {
      setLoading(true);
      try {
        const data = await fetchArchivePostsAPI(0);
        if (!data || data.length === 0) {
          setHasMorePosts(false);
        } else {
          setArchivedPosts(data);
          if (data.length < 12) {
            setHasMorePosts(false);
          }
        }
      } catch (err) {
        console.error("Error loading archived posts!", err);
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
      if (!hasMorePosts) {
        isFetchingMoreRef.current = false;
        return;
      }
      setLoading(true);
      try {
        const data = await fetchArchivePostsAPI(page);
        if (!data || data.length === 0) {
          setHasMorePosts(false);
        } else {
          setArchivedPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.postId));
            const newPosts = data.filter((p) => !existingIds.has(p.postId));
            if (newPosts.length === 0) {
              setHasMorePosts(false);
            }
            return [...prev, ...newPosts];
          });
          if (data.length < 12) {
            setHasMorePosts(false);
          }
        }
      } catch (err) {
        console.error("Error loading more archived posts!", err);
        setPage((prev) => prev - 1);
      } finally {
        setLoading(false);
        isFetchingMoreRef.current = false;
      }
    };

    fetchMore();
  }, [page, hasMorePosts]);

  // Hook up reusable infinite scroll listener
  useInfiniteScroll({
    loading: loading,
    hasMore: hasMorePosts,
    onLoadMore: useCallback(() => {
      setPage((prev) => prev + 1);
    }, []),
    activeTab: "archive-posts",
    tabName: "archive-posts",
  });

  // Placeholder Unarchive click handler
  const handleUnarchivePlaceholder = async (postId) => {
    if (isUnarchivingRef.current || !postId || isUnarchiving[postId]) {
      return;
    }
    isUnarchivingRef.current = true;
    setIsUnarchiving((prev) => ({ ...prev, [postId]: true }));

    try {
      await unarchivePostAPI(postId);

      // Remove from UI
      setArchivedPosts((prev) => prev.filter((p) => p.postId !== postId));
    } catch (err) {
      console.error("Error unarchiving post!", err);
    } finally {
      isUnarchivingRef.current = false;
      setIsUnarchiving((prev) => ({ ...prev, [postId]: false }));
    }

  };

  return (
    <div className="ap-main-container">
      <h2 className="sf-section-title">Archive</h2>
      <p className="ap-description">
        View your archived posts. Only you can see what you've saved to your archive.
      </p>

      {archivedPosts.length === 0 && loading ? (
        /* Skeleton loading cards */
        <div className="ap-feed-container">
          {[1, 2].map((i) => (
            <div key={i} className="ap-skeleton-card">
              <div className="ap-skeleton-media" />
              <div className="ap-skeleton-body">
                <div className="ap-skeleton-line" />
                <div className="ap-skeleton-line short" />
                <div className="ap-skeleton-button" />
              </div>
            </div>
          ))}
        </div>
      ) : archivedPosts.length > 0 ? (
        /* Archived Posts Feed List */
        <div className="ap-feed-container">
          {archivedPosts.map((post) => (
            <div key={post.postId} className="ap-post-card">
              {/* Post Media (Image/Video) */}
              <div className="ap-post-media-container">
                {post.postType === "VIDEO" ? (
                  <video
                    src={post.postContent}
                    className="ap-post-media"
                    controls
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={post.postContent}
                    alt="Archived Post"
                    className="ap-post-media"
                    loading="lazy"
                  />
                )}
              </div>

              {/* Post Body, Caption and Unarchive Button */}
              <div className="ap-post-body">
                {post.postCaption && (
                  <p className="ap-post-caption">
                    {post.postCaption}
                  </p>
                )}
                <div className="ap-post-meta-row">
                  <span className="ap-post-date">{formatPostTime(post.uploadAt)}</span>
                </div>
                <button
                  className="ap-unarchive-btn"
                  onClick={() => handleUnarchivePlaceholder(post.postId)}
                  disabled={isUnarchiving[post.postId]}
                >
                  {isUnarchiving[post.postId] ? <div className="ap-spinner-circle" /> : "Unarchive"}
                </button>
              </div>
            </div>
          ))}

          {/* Load-more indicator */}
          {loading && (
            <div className="ap-loadmore-spinner">
              <div className="ap-spinner-circle" />
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="ap-empty-state" style={{ marginTop: '50px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '15px' }}>
            <polyline points="21 8 21 21 3 21 3 8"></polyline>
            <rect x="1" y="3" width="22" height="5"></rect>
            <line x1="10" y1="12" x2="14" y2="12"></line>
          </svg>
          <p className="ap-empty-title">No archived posts yet</p>
          <p className="ap-empty-text">Only you can see what you've saved to your archive.</p>
        </div>
      )}
    </div>
  );
}

export default ArchivePosts;