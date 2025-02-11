"use client";
import { trpc } from "@/trpc/client";
export const PageClient = () => {
  const [data] = trpc.hello.useSuspenseQuery({ text: "casmanny" });
  return <div className="">{data.greeting}</div>;
};
