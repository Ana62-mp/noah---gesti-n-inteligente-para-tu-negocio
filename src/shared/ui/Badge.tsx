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
      bg: 'bg-[#5C5011]/10',
      text: 'text-[#5C5011]',
      border: 'border-[#5C5011]/25',
      defaultIcon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    banana: {
      bg: 'bg-[#D59F3F]/15',
      text: 'text-[#8A6310]',
      border: 'border-[#D59F3F]/35',
      defaultIcon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    terracotta: {
      bg: 'bg-[#A43108]/10',
      text: 'text-[#A43108]',
      border: 'border-[#A43108]/25',
      defaultIcon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    harvest: {
      bg: 'bg-[#8A7424]/10',
      text: 'text-[#8A7424]',
      border: 'border-[#8A7424]/25',
      defaultIcon: <Info className="w-3.5 h-3.5" />,
    },
    cinnamon: {
      bg: 'bg-[#CF6811]/10',
      text: 'text-[#CF6811]',
      border: 'border-[#CF6811]/25',
      defaultIcon: <Sparkles className="w-3.5 h-3.5" />,
    },
    neutral: {
      bg: 'bg-[#F5F4F1]',
      text: 'text-[#6B6B6B]',
      border: 'border-[#E7E5E0]',
      defaultIcon: null,
    },
  };

  const style = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-lg border ${style.bg} ${style.text} ${style.border} ${sizeClasses} ${className}`}
    >
      <span className="shrink-0">{icon ?? style.defaultIcon}</span>
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
};
