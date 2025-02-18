"use client";
import { InfiniteScroll } from "@/components/infinite-scroll";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const VideoSection = () => {
  return (
    <Suspense fallback={"loading"}>
      <ErrorBoundary fallback={"loading"}>
        <VideoSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const VideoSectionSuspense = () => {
  const [videos, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastpage) => lastpage.nextCursor,
    }
  );
  return (
    <div className="">
      <div className="border-y">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 w-[510px]">Video</TableHead>
              <TableHead className="pl-6">Visibity</TableHead>
              <TableHead className="pl-6">status</TableHead>
              <TableHead className="pl-6">Date</TableHead>
              <TableHead className="text-right ">Views</TableHead>
              <TableHead className="text-right ">Comments</TableHead>
              <TableHead className="text-right pr-6">Likes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.pages
              .flatMap((page) => page.items)
              .map((video) => (
                <Link href={`/studio/videos/${video.id}`} key={video.id} legacyBehavior>
                  <TableRow className="cursor-pointer">
                    <TableCell>{video.title}</TableCell>
                    <TableCell>"visibility"</TableCell>
                    <TableCell>'status</TableCell>
                    <TableCell>"date"</TableCell>
                    <TableCell>"views"</TableCell>
                    <TableCell>"Comments"</TableCell>
                    <TableCell>"likes"</TableCell>
                  </TableRow>
                </Link>
              ))}
          </TableBody>
        </Table>
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  );
};
