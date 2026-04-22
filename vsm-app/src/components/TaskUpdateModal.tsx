'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';

interface TaskUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: TaskUpdateData) => void;
}

export interface TaskUpdateData {
  lineNo: string;
  processStage: string;
  actualStartDate: string;
  actualEndDate: string;
  delayReason: string;
}

export default function TaskUpdateModal({ isOpen, onClose, onSave }: TaskUpdateModalProps) {
  const [formData, setFormData] = useState<TaskUpdateData>({
    lineNo: '',
    processStage: '',
    actualStartDate: '',
    actualEndDate: '',
    delayReason: '',
  });

  const [lines, setLines] = useState<string[]>([]);
  const [processStages, setProcessStages] = useState<string[]>([]);

  // Mock data - in production, fetch from API
  useEffect(() => {
    // Fetch available lines and process stages
    setLines(['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5']);
    setProcessStages([
      'Fabric Inspection',
      'Spreading',
      'Cutting',
      'Bundling',
      'Sewing',
      'Finishing',
      'Quality Check',
      'Packing'
    ]);
  }, []);

  const handleChange = (field: keyof TaskUpdateData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-950 to-primary-900 text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Task Entry</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Line No */}
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-2">
              Line No.
            </label>
            <select
              value={formData.lineNo}
              onChange={(e) => handleChange('lineNo', e.target.value)}
              className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white text-primary-950 font-medium"
              required
            >
              <option value="">Select line...</option>
              {lines.map((line) => (
                <option key={line} value={line}>
                  {line}
                </option>
              ))}
            </select>
          </div>

          {/* Process Stage */}
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-2">
              Process Stage
            </label>
            <select
              value={formData.processStage}
              onChange={(e) => handleChange('processStage', e.target.value)}
              className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white text-primary-950 font-medium"
              required
            >
              <option value="">Select process stage...</option>
              {processStages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>

          {/* Actual Start Date */}
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-2">
              Actual Start Date<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.actualStartDate}
                onChange={(e) => handleChange('actualStartDate', e.target.value)}
                className="w-full px-4 py-3 pr-10 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-primary-950 font-medium"
                required
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400 pointer-events-none" />
            </div>
          </div>

          {/* Actual End Date */}
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-2">
              Actual End Date<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.actualEndDate}
                onChange={(e) => handleChange('actualEndDate', e.target.value)}
                className="w-full px-4 py-3 pr-10 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-primary-950 font-medium"
                required
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400 pointer-events-none" />
            </div>
          </div>

          {/* Delay Reason */}
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-2">
              Delay Reason
            </label>
            <textarea
              value={formData.delayReason}
              onChange={(e) => handleChange('delayReason', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none text-primary-950 font-medium placeholder-primary-400"
              placeholder="Enter delay reason if applicable..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-primary-200 text-primary-700 rounded-lg hover:bg-primary-50 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#6a91cc] hover:bg-[#5a7fb5] text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
