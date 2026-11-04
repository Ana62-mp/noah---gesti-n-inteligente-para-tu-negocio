import React from 'react';

interface SkeletonLoaderProps {
  rows?: number;
  cols?: number;
  variant?: 'table' | 'cards';
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  rows = 5,
  cols = 5,
  variant = 'table',
  className = '',
}) => {
  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-[#E7E5E0] animate-pulse space-y-3"
          >
            <div className="h-4 bg-[#E7E5E0] rounded w-1/3" />
            <div className="h-8 bg-[#E7E5E0] rounded w-2/3" />
            <div className="h-3 bg-[#E7E5E0] rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-[#E7E5E0] p-4 animate-pulse space-y-4 ${className}`}>
      {/* Table header skeleton */}
      <div className="flex gap-4 border-b border-[#E7E5E0] pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-[#E7E5E0] rounded flex-1" />
        ))}
      </div>
      {/* Table rows skeleton */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-2 border-b border-[#E7E5E0]/40">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-4 bg-[#F5F4F1] rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};
