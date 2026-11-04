import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Sparkles } from 'lucide-react';

export type BadgeVariant = 'olive' | 'banana' | 'terracotta' | 'harvest' | 'cinnamon' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  icon,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  }[size];

  const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; defaultIcon: React.ReactNode }> = {
    olive: {
      bg: 'bg-[#5C5011]',
      text: 'text-white',
      border: 'border-[#5C5011]',
      defaultIcon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    banana: {
      bg: 'bg-[#D59F3F]',
      text: 'text-[#2B1A00]',
      border: 'border-[#B8862E]',
      defaultIcon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    terracotta: {
      bg: 'bg-[#A43108]',
      text: 'text-white',
      border: 'border-[#7A2105]',
      defaultIcon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    harvest: {
      bg: 'bg-[#E6DA9C]',
      text: 'text-[#4F4110]',
      border: 'border-[#8A7424]/55',
      defaultIcon: <Info className="w-3.5 h-3.5" />,
    },
    cinnamon: {
      bg: 'bg-[#B85B0E]',
      text: 'text-white',
      border: 'border-[#8F4608]',
      defaultIcon: <Sparkles className="w-3.5 h-3.5" />,
    },
    neutral: {
      bg: 'bg-[#E7E5E0]',
      text: 'text-[#2B2B2B]',
      border: 'border-[#C9C6BE]',
      defaultIcon: null,
    },
  };

  const style = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-lg border ${style.bg} ${style.text} ${style.border} ${sizeClasses} ${className}`}
    >
      <span className="shrink-0">{icon ?? style.defaultIcon}</span>
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
};
