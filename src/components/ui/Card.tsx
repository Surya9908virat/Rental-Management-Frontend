import React, { type HTMLAttributes } from 'react';

export const Card: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-[var(--color-bg-card)]/80 dark:bg-[var(--color-bg-card)]/35 backdrop-blur-sm rounded-[12px] border border-[var(--color-border)] shadow-card transition-all duration-200 overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-5 border-b border-[#E5E7EB] dark:border-slate-700 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 bg-[#F8FAFC] dark:bg-slate-900/60 border-t border-[#E5E7EB] dark:border-slate-700 ${className}`} {...props}>
      {children}
    </div>
  );
};
