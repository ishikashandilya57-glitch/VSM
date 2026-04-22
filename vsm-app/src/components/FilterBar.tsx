'use client';

import React from 'react';
import { ChevronDown, Calendar, Search, Filter } from 'lucide-react';
import { PremiumSelect } from '@/components';

interface SelectOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  filters: {
    id: string;
    label: string;
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
  }[];
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export default function FilterBar({
  filters,
  showSearch = false,
  searchValue = '',
  onSearchChange
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-primary-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 w-48 sm:w-64 transition-all hover:border-gray-300 shadow-sm"
          />
        </div>
      )}

      {filters.map((filter) => {
        if (filter.id === 'status') {
          return (
            <div key={filter.id} className="flex flex-col gap-1 w-auto">
              <label className="text-xs font-semibold text-primary-700 uppercase tracking-wide px-1">
                {filter.label}
              </label>
              <div className="flex flex-wrap bg-gray-100/50 p-1 rounded-xl w-fit border border-gray-200 shadow-inner">
                {filter.options.map((option) => {
                  const isSelected = filter.value === option.value;
                  const label = option.label.toLowerCase();
                  
                  let activeClass = 'bg-[#0052CC] text-white shadow-md border-[#0052CC]';
                  let baseClass = 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200';

                  if (label.includes('on time')) {
                    activeClass = 'bg-emerald-600 text-white shadow-md border-emerald-600';
                    baseClass = 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100';
                  } else if (label.includes('delayed')) {
                    activeClass = 'bg-red-600 text-white shadow-md border-red-600';
                    baseClass = 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100';
                  } else if (label.includes('shipped')) {
                    activeClass = 'bg-indigo-600 text-white shadow-md border-indigo-600';
                    baseClass = 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100';
                  } else if (label.includes('in progress')) {
                    activeClass = 'bg-blue-600 text-white shadow-md border-blue-600';
                    baseClass = 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100';
                  } else if (label === 'all') {
                    activeClass = 'bg-gray-800 text-white shadow-md border-gray-800';
                    baseClass = 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200';
                  }

                  return (
                    <button
                      key={option.value}
                      onClick={() => filter.onChange(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 whitespace-nowrap ${
                        isSelected ? activeClass : baseClass
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }
        
        return (
          <div key={filter.id} className="relative flex flex-col gap-1">
            <label className="text-xs font-semibold text-primary-700 uppercase tracking-wide px-1">
              {filter.label}
            </label>
            <div className="relative">
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-primary-900 font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 cursor-pointer transition-all hover:border-gray-300 min-w-[140px] shadow-sm"
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500 pointer-events-none" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
