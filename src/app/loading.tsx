import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container grid gap-4 py-16">
      <Skeleton className="h-10 max-w-md" />
      <Skeleton className="h-5 max-w-xl" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
}
