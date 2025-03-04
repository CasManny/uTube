import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { VideoRowCard } from "../components/video-row-card";

interface SuggestionsSectionProps {
  videoId: string;
}

export const SuggestionsSection = ({ videoId }: SuggestionsSectionProps) => {
  return (
    <Suspense fallback={<SuggestionsSectionSkeleton />}>
      <ErrorBoundary fallback={"error"}>
        <SuggestionsSection videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

export const SuggestionsSectionSkeleton = () => {
  return <h1>loading</h1>;
};

const SuggestionSectionSuspense = ({ videoId }: SuggestionsSectionProps) => {
  const [suggestions] = trpc.suggestions.getMany.useSuspenseInfiniteQuery(
    {
      videoId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastpage) => lastpage.nextCursor,
    }
  );
  return (
    <div className="">
      {suggestions.pages
        .flatMap((page) => page.items)
        .map((video) => (
          <VideoRowCard key={video.id} data={video} />
        ))}
    </div>
  );
};
