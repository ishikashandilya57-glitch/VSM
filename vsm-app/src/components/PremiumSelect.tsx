'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface PremiumSelectProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  id: string;
}

const getStatusStyles = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'all') return 'bg-gray-100 text-gray-700 border-gray-200';
  if (s.includes('on time')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (s.includes('delayed')) return 'bg-red-50 text-red-700 border-red-200';
  if (s.includes('shipped')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (s.includes('in progress')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (s.includes('not started')) return 'bg-gray-50 text-gray-500 border-gray-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

const getStatusDot = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('on time')) return 'bg-emerald-500';
  if (s.includes('delayed')) return 'bg-red-500';
  if (s.includes('shipped')) return 'bg-indigo-500';
  if (s.includes('in progress')) return 'bg-blue-500';
  return 'bg-gray-400';
};

export default function PremiumSelect({ label, value, options, onChange, id }: PremiumSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex flex-col gap-1" ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold text-primary-700 uppercase tracking-wide px-1">
          {label}
        </label>
      )}
      
      <div className="relative min-w-[200px]">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border-2 rounded-xl text-sm font-bold transition-all hover:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 shadow-sm ${
            isOpen ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${getStatusDot(selectedOption.label)}`} />
            <span className="truncate">{selectedOption.label}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-full min-w-[240px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3 pb-2 mb-1 border-b border-gray-100">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Status</span>
            </div>
            <div className="max-h-64 overflow-y-auto px-2 space-y-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all text-left ${
                    value === option.value 
                      ? 'bg-primary-50 text-primary-700 font-bold' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase border tracking-tighter ${getStatusStyles(option.label)}`}>
                      {option.label}
                    </div>
                  </div>
                  {value === option.value && <Check className="w-4 h-4 text-primary-600" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
