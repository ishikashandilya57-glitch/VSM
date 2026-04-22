'use client';

import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export default function ChartCard({
  title,
  subtitle,
  children,
  action,
  className = ''
}: ChartCardProps) {
  return (
    <div className={`bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-gray-200 bg-white flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-[#172B4D] truncate">{title}</h3>
          {subtitle && <p className="text-xs text-[#5E6C84] mt-1 truncate">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-6 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
