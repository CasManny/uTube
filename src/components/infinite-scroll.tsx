import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import React, { useEffect } from "react";
import { Button } from "./ui/button";
interface InfiniteScrollProps {
  isManual?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export const InfiniteScroll = ({
  isManual = false,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: InfiniteScrollProps) => {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManual) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, isManual]);
  return (
    <div className="flex flex-col items-center p-4 gap-4">
      <div ref={targetRef} className="h-1" />
      {hasNextPage ? (
        <Button
          onClick={() => fetchNextPage()}
          variant={"secondary"}
          disabled={isFetchingNextPage || !hasNextPage}
        >
          {isFetchingNextPage ? "loading" : "loadmore"}
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">
          You have reached the end of the list
        </p>
      )}
    </div>
  );
};
