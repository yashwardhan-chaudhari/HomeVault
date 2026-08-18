import React from 'react';

export const SkeletonLoader = ({ className = 'h-4 w-full' }) => {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm">
      <SkeletonLoader className="h-40 w-full rounded-xl" />
      <SkeletonLoader className="h-5 w-3/4" />
      <SkeletonLoader className="h-3 w-1/2" />
      <div className="flex justify-between pt-2">
        <SkeletonLoader className="h-6 w-20 rounded-lg" />
        <SkeletonLoader className="h-6 w-16 rounded-lg" />
      </div>
    </div>
  );
};
