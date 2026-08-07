import React from "react";

interface SkeletonProps {
  className?: string;
}

/** Generic pulse block for loading placeholders. */
export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`}
      aria-hidden
    />
  );
}
