"use client";

import { useEffect, useRef } from "react";

export function LoadMoreSentinel({ onLoadMore, disabled = false }: { onLoadMore: () => void; disabled?: boolean }) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || disabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMoreRef.current();
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [disabled]);

  return <div ref={sentinelRef} aria-hidden="true" className="h-px" />;
}
