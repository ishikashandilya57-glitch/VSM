'use client';

import React from 'react';

interface StatusBadgeProps {
  status: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

const statusStyles = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100',
  error: 'bg-red-50 text-red-700 border-red-200 ring-red-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100',
  info: 'bg-primary-50 text-primary-700 border-primary-200 ring-primary-100',
};

export default function StatusBadge({ status, children, size = 'sm' }: StatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';
  
  return (
    <span className={`inline-flex items-center font-bold rounded-full border ring-2 ${statusStyles[status]} ${sizeClasses}`}>
      {children}
    </span>
  );
}
