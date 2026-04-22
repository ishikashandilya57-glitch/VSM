'use client';

import React, { useState, useEffect } from 'react';
import { Menu, Maximize2, Bell, RefreshCw, User, ChevronDown, Factory, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
  lastUpdated?: string;
  selectedPlant?: string;
  onPlantChange?: (plant: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  factory?: string;
  fetchMessage?: string | null;
}

export default function Header({ title, onMenuClick, lastUpdated, selectedPlant = 'All Plants', onPlantChange, onRefresh, isRefreshing = false, factory = 'dbr', fetchMessage }: HeaderProps) {
  const [plants, setPlants] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [isPlantDropdownOpen, setIsPlantDropdownOpen] = useState(false);

  useEffect(() => {
    // Fetch plants from API
    const fetchPlants = async () => {
      try {
        const response = await fetch(`/api/${factory}/factories`);
        if (!response.ok) {
          console.warn(`[Header] Failed to fetch plants: ${response.status}`);
          return;
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.warn('[Header] Received non-JSON response for plants');
          return;
        }

        const result = await response.json();
        if (result.success) {
          setPlants(result.data);
        }
      } catch (error) {
        console.error('Error fetching plants:', error);
      }
    };
    fetchPlants();
  }, []);

  const handlePlantSelect = (plant: string) => {
    onPlantChange?.(plant);
    setIsPlantDropdownOpen(false);
  };
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#172B4D] text-white flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center p-1 rounded-sm">
              <img
                src="/laguna_clothing_llp_logo.jpeg"
                alt="Laguna Clothing Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Plant Selection */}
        <div className="relative">
          <button
            onClick={() => setIsPlantDropdownOpen(!isPlantDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm border border-white/30 hover:bg-white/30 transition-all duration-200 text-white"
          >
            <Factory className="w-4 h-4" />
            <span className="font-medium hidden lg:inline">{selectedPlant}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isPlantDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isPlantDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 text-xs font-bold text-[#5E6C84] uppercase border-b border-gray-100">Select Plant</div>
              <button
                onClick={() => handlePlantSelect('All Plants')}
                className={`w-full text-left px-4 py-2.5 hover:bg-[#EBECF0] transition-colors ${selectedPlant === 'All Plants' ? 'bg-[#DEEBFF] text-[#0052CC] font-medium' : 'text-[#172B4D]'
                  }`}
              >
                All Plants
              </button>
              {plants.map((plant) => (
                <button
                  key={plant.id}
                  onClick={() => handlePlantSelect(plant.name)}
                  className={`w-full text-left px-4 py-2.5 hover:bg-[#EBECF0] transition-colors ${selectedPlant === plant.name ? 'bg-[#DEEBFF] text-[#0052CC] font-medium' : 'text-[#172B4D]'
                    }`}
                >
                  {plant.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="hidden md:flex flex-col items-end gap-0.5 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-xs border border-white/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
              <span className="font-bold text-white uppercase tracking-wider">System Live | {lastUpdated}</span>
            </div>
            {fetchMessage && (
              <span className="text-[10px] text-white/70 font-medium truncate max-w-[200px]">
                {fetchMessage}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button className="p-2.5 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105 text-white" title="Fullscreen">
            <Maximize2 className="w-5 h-5" />
          </button>
          <button className="relative p-2.5 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105 text-white" title="Notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-primary-900" />
          </button>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`p-2.5 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105 text-white ${isRefreshing ? 'animate-spin' : 'hover:rotate-180'}`}
            title={isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 ml-2 pl-4 border-l border-white/20 cursor-pointer hover:bg-white/5 rounded-lg pr-2 py-1 transition-all duration-200">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/20">
            <User className="w-5 h-5" />
          </div>
          <ChevronDown className="w-4 h-4 text-white/70" />
        </div>
      </div>
    </header>
  );
}
