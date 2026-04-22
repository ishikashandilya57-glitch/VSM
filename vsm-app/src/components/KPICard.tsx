'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  valueColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  clickable?: boolean;
}

export default function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary-500',
  valueColor = 'text-primary-950',
  trend,
  onClick,
  clickable = false,
}: KPICardProps) {
  const cardClasses = `relative bg-white rounded-md shadow-sm border border-gray-200 p-6 transition-all duration-300 group overflow-hidden min-w-0 ${clickable ? 'cursor-pointer hover:border-blue-400 hover:shadow-md' : ''
    }`;

  return (
    <div className={cardClasses} onClick={onClick}>
      {/* Subtle background gradient effect removed for flatter layout */}

      {/* Clickable indicator */}
      {clickable && (
        <div className="absolute top-2 right-2 text-primary-300 group-hover:text-primary-600 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-[#5E6C84] uppercase tracking-wide mb-2 truncate">{title}</p>
          <div className="flex items-baseline gap-2 flex-wrap mb-1">
            <h3 className={`text-3xl sm:text-4xl font-bold tracking-tight ${valueColor === 'text-primary-950' ? 'text-primary-950' : valueColor}`}>{value}</h3>
            {trend && (
              <span className={`text-sm font-semibold px-2 py-1 rounded-md ${trend.isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[#5E6C84] font-medium truncate">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-md bg-gray-50 group-hover:bg-blue-50 transition-colors duration-300 shrink-0 border border-gray-100 ${iconColor}`}>
            <Icon className="w-6 h-6" strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  );
}
