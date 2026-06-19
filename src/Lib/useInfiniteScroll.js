import { useEffect, useRef } from "react";

/**
 * useInfiniteScroll — Reusable infinite scroll hook.
 *
 * Attaches a scroll listener that triggers `onLoadMore` when user
 * scrolls near the bottom. Only active when `activeTab === tabName`.
 *
 * @param {boolean}  loading   - Whether data is currently being fetched
 * @param {boolean}  hasMore   - Whether more pages are available
 * @param {Function} onLoadMore - Callback to load next page
 * @param {string}   activeTab  - Currently active tab
 * @param {string}   tabName    - Tab this scroll belongs to
 */
function useInfiniteScroll({ loading, hasMore, onLoadMore, activeTab, tabName }) {

  const isFetchingRef = useRef(false);

  useEffect(() => {
    isFetchingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    if (activeTab !== tabName) return;

    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
        document.documentElement.scrollHeight
      ) {
        if (!isFetchingRef.current && hasMore) {
          isFetchingRef.current = true;
          onLoadMore();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, activeTab, tabName, onLoadMore]);
}

export default useInfiniteScroll;
