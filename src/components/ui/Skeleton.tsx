import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-md ${className || ''}`} />
  );
};

export const DashboardSkeleton = () => (
  <div className="space-y-8 max-w-5xl mx-auto w-full pb-10">
    <Skeleton className="w-full h-32 rounded-2xl" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Skeleton className="w-full h-48 rounded-xl" />
      <Skeleton className="w-full h-48 rounded-xl" />
      <Skeleton className="w-full h-48 rounded-xl" />
    </div>
    <Skeleton className="w-full h-64 rounded-xl mt-8" />
  </div>
);
