import { useCallback, useEffect, useRef } from 'react'

/**
 * Reusable infinite scroll hook using Intersection Observer.
 * Fires onLoadMore when the sentinel element becomes visible, unless loading or no more data.
 * Prevents duplicate requests and cleans up observer on unmount.
 *
 * Why Intersection Observer over scroll events: Better performance (no scroll throttling),
 * built-in visibility detection, and automatic cleanup when element is visible.
 */
export function useInfiniteScroll(options) {
  const {
    onLoadMore,
    hasMore,
    loading,
    rootMargin = '200px',
    threshold = 0,
  } = options

  const sentinelRef = useRef(null)
  const loadingRef = useRef(false)
  loadingRef.current = loading

  const loadMoreRef = useRef(onLoadMore)
  loadMoreRef.current = onLoadMore

  const hasMoreRef = useRef(hasMore)
  hasMoreRef.current = hasMore

  const handleIntersect = useCallback((entries) => {
    const [entry] = entries
    if (!entry?.isIntersecting) return
    if (loadingRef.current || !hasMoreRef.current) return
    loadMoreRef.current()
  }, [])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin,
      threshold,
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [handleIntersect, rootMargin, threshold])

  return { sentinelRef }
}
