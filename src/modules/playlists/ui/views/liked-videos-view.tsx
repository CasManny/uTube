import React from "react";
import { LikedVideosSection } from "../sections/liked-video-section";

export const LikedVideoViews = () => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div className="">
        <h1 className="text-2xl font-bold">Liked Videos</h1>
        <p className="text-xs text-muted-foreground">Videos you have liked</p>
      </div>
      <LikedVideosSection />
    </div>
  );
};
