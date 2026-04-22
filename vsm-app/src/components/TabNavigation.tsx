'use client';

import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'primary' | 'secondary';
}

export default function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
  variant = 'primary'
}: TabNavigationProps) {
  if (variant === 'secondary') {
    return (
      <div className="inline-flex bg-primary-50 rounded-xl p-1.5 shadow-inner border border-primary-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id
              ? 'bg-[#0052CC] text-white shadow-sm'
              : 'text-[#42526E] hover:bg-[#EBECF0] hover:text-[#172B4D]'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex bg-white border-b border-gray-200 gap-6 overflow-x-auto scrollbar-hide w-full">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`pb-3 text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 border-b-2 ${activeTab === tab.id
            ? 'border-[#0052CC] text-[#0052CC]'
            : 'border-transparent text-[#5E6C84] hover:text-[#172B4D]'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
