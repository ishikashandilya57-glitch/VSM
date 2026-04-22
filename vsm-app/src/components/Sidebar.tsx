'use client';

import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  ClipboardList,
  MapPin,
  CircleDot,
  CheckSquare,
  FileText,
  Settings,
  HelpCircle,
  Edit3,
  Home
} from 'lucide-react';

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (item: 'home' | 'dashboard' | 'update-task' | 'upload-plan') => void;
}

const menuItems = [
  { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
  { id: 'update-task', icon: CheckSquare, label: 'Update Task' },
  { id: 'upload-plan', label: 'Upload Plan', icon: FileText },
];

export default function Sidebar({ activeItem = 'home', onItemClick }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 bg-white border-r border-gray-200 flex flex-col z-40 overflow-y-auto">
      {/* Sidebar Header Space */}
      <div className="px-6 py-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Task tracking</h2>
            <p className="text-xs text-gray-500">Business project</p>
          </div>
        </div>
      </div>

      {/* Main Menu Items */}
      <nav className="flex-1 py-4 flex flex-col">
        <ul className="space-y-1 px-4">
          {menuItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onItemClick?.(item.id as 'home' | 'dashboard' | 'update-task' | 'upload-plan')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${isActive
                    ? 'bg-[#DEEBFF] text-[#0052CC] font-medium'
                    : 'text-[#42526E] hover:bg-[#EBECF0] hover:text-[#172B4D]'
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
