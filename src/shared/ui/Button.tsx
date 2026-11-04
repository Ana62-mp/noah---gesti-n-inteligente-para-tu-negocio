import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'cinnamon';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CF6811] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-xl text-center leading-tight min-w-0';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-8',
    md: 'text-sm px-4 py-2 gap-2 min-h-10',
    lg: 'text-base px-6 py-2.5 gap-2.5 min-h-12',
  }[size];

  const variantClasses = {
    primary:
      'gradient-primary text-white hover:brightness-110 shadow-sm hover:shadow-md active:brightness-95',
    secondary:
      'bg-white text-[#111111] border border-[#E7E5E0] hover:bg-[#F5F4F1] hover:border-[#D59F3F]/40 text-[#111111]',
    cinnamon:
      'gradient-brand text-white hover:brightness-110 shadow-sm hover:shadow-md active:brightness-95',
    ghost:
      'bg-transparent text-[#111111] hover:bg-[#F5F4F1] active:bg-[#E7E5E0]',
    danger:
      'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 active:bg-red-200',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
