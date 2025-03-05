import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CategoriesSectionProps {
  categoryId: string | undefined;
}
export const CategoriesSection = ({ categoryId }: CategoriesSectionProps) => {
  return (
    <Suspense fallback={<CategoriesSectionSkeleton />}>
      <ErrorBoundary fallback={"error"}>
        <CategoriesSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const CategoriesSectionSkeleton = () => {
  return <div className=""></div>;
};

const CategoriesSectionSuspense = ({ categoryId }: CategoriesSectionProps) => {
  const [categories] = trpc.categories.getMany.useSuspenseQuery();
  return <div className=""></div>;
};
