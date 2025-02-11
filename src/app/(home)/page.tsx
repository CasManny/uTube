import { HydrateClient, trpc } from "@/trpc/server";
import { PageClient } from "./client";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

export default async function Home() {
  void trpc.hello.prefetch({ text: "" });
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<p>page loading</p>}>
          <PageClient />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
