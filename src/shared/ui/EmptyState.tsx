import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-[#E7E5E0] shadow-xs ${className}`}
    >
      {/* Friendly minimalist inline SVG illustration */}
      <div className="w-20 h-20 mb-4 rounded-full bg-[#FBF6E6] flex items-center justify-center text-[#CF6811]">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12"
        >
          <path
            d="M8 14C8 11.7909 9.79086 10 12 10H36C38.2091 10 40 11.7909 40 14V34C40 36.2091 38.2091 38 36 38H12C9.79086 38 8 36.2091 8 34V14Z"
            stroke="#D59F3F"
            strokeWidth="2.5"
            strokeDasharray="4 4"
          />
          <circle cx="24" cy="24" r="7" fill="#EBD48F" />
          <path
            d="M21 24H27M24 21V27"
            stroke="#421A05"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h3 className="text-base font-bold text-[#111111] mb-1">{title}</h3>
      <p className="text-sm text-[#6B6B6B] max-w-sm mb-5">{description}</p>

      {actionLabel && onAction && (
        <Button variant="cinnamon" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
