'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Save, RotateCcw } from 'lucide-react';

interface TaskUpdatePageProps {
  onSave?: (data: TaskUpdateData) => void;
}

export interface TaskUpdateData {
  lineNo: string;
  ocNo: string;
  processStage: string;
  actualStartDate: string;
  actualEndDate: string;
  delayReason: string;
}

export default function TaskUpdatePage({ onSave }: TaskUpdatePageProps) {
  const [formData, setFormData] = useState<TaskUpdateData>({
    lineNo: '',
    ocNo: '',
    processStage: '',
    actualStartDate: '',
    actualEndDate: '',
    delayReason: '',
  });

  const [targetDates, setTargetDates] = useState<{ targetStartDate: string; targetEndDate: string } | null>(null);
  const [targetDatesError, setTargetDatesError] = useState<string | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [ocNumbers, setOcNumbers] = useState<string[]>([]);
  const [processStages, setProcessStages] = useState<string[]>([]);
  const [delayReasons, setDelayReasons] = useState<string[]>([]);
  const [loadingOcNumbers, setLoadingOcNumbers] = useState(false);
  const [loadingDelayReasons, setLoadingDelayReasons] = useState(false);
  const [loadingTargetDates, setLoadingTargetDates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Fetch lines and process stages on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch lines
        const linesResponse = await fetch('/api/lines');
        const linesResult = await linesResponse.json();
        if (linesResult.success) {
          setLines(linesResult.data);
        }

        // Fetch process stages
        const processResponse = await fetch('/api/process-stages');
        const processResult = await processResponse.json();
        if (processResult.success) {
          setProcessStages(processResult.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Fetch OC numbers when line is selected
  useEffect(() => {
    const fetchOcNumbers = async () => {
      if (!formData.lineNo) {
        setOcNumbers([]);
        return;
      }

      setLoadingOcNumbers(true);
      try {
        const response = await fetch(`/api/oc-numbers?line=${encodeURIComponent(formData.lineNo)}`);
        const result = await response.json();
        if (result.success) {
          setOcNumbers(result.data);
        }
      } catch (error) {
        console.error('Error fetching OC numbers:', error);
      } finally {
        setLoadingOcNumbers(false);
      }
    };

    fetchOcNumbers();
  }, [formData.lineNo]);

  // Fetch delay reasons when process stage is selected
  useEffect(() => {
    const fetchDelayReasons = async () => {
      if (!formData.processStage) {
        setDelayReasons([]);
        return;
      }

      setLoadingDelayReasons(true);
      try {
        const response = await fetch(`/api/delay-reasons?process=${encodeURIComponent(formData.processStage)}`);
        const result = await response.json();
        if (result.success) {
          setDelayReasons(result.data);
        }
      } catch (error) {
        console.error('Error fetching delay reasons:', error);
      } finally {
        setLoadingDelayReasons(false);
      }
    };

    fetchDelayReasons();
  }, [formData.processStage]);

  // Fetch target dates when OC No and Process Stage are selected
  useEffect(() => {
    const fetchTargetDates = async () => {
      if (!formData.ocNo || !formData.processStage) {
        setTargetDates(null);
        setTargetDatesError(null);
        return;
      }

      setLoadingTargetDates(true);
      setTargetDatesError(null);
      try {
        const response = await fetch(`/api/target-dates?ocNo=${encodeURIComponent(formData.ocNo)}&processStage=${encodeURIComponent(formData.processStage)}`);
        const result = await response.json();
        if (result.success) {
          setTargetDates(result.data);
          // Show info message if it's a new entry
          if (result.message) {
            setTargetDatesError(result.message);
          }
        } else {
          setTargetDatesError(result.error || 'Could not fetch target dates');
          setTargetDates(null);
        }
      } catch (error) {
        console.error('Error fetching target dates:', error);
        setTargetDatesError('Error fetching target dates. You can still create a new entry.');
        setTargetDates(null);
      } finally {
        setLoadingTargetDates(false);
      }
    };

    fetchTargetDates();
  }, [formData.ocNo, formData.processStage]);

  const handleChange = (field: keyof TaskUpdateData, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Reset OC NO when line changes
      if (field === 'lineNo') {
        newData.ocNo = '';
      }
      // Reset delay reason when process stage changes
      if (field === 'processStage') {
        newData.delayReason = '';
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/update-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSaveMessage({ type: 'success', text: 'Task saved successfully!' });
        onSave?.(formData);

        // Reset form after successful save
        setTimeout(() => {
          handleReset();
          setSaveMessage(null);
        }, 2000);
      } else {
        setSaveMessage({ type: 'error', text: result.error || 'Failed to update task' });
      }
    } catch (error) {
      console.error('Error saving task:', error);
      setSaveMessage({ type: 'error', text: 'Failed to save task. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      lineNo: '',
      ocNo: '',
      processStage: '',
      actualStartDate: '',
      actualEndDate: '',
      delayReason: '',
    });
    setTargetDates(null);
    setTargetDatesError(null);
    setSaveMessage(null);
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-primary-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-primary-950 to-primary-900 text-white p-6">
            <h2 className="text-2xl font-bold">Task Details</h2>
            <p className="text-primary-100 text-sm mt-1">Update production status and track progress</p>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Success/Error/Info Message */}
            {saveMessage && (
              <div className={`p-4 rounded-lg border ${saveMessage.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : saveMessage.type === 'info'
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                <p className="font-semibold">{saveMessage.text}</p>
              </div>
            )}

            {/* Target Dates Info/Error Message */}
            {targetDatesError && formData.ocNo && formData.processStage && (
              <div className="p-4 rounded-lg border bg-blue-50 border-blue-200 text-blue-800">
                <p className="text-sm">ℹ️ {targetDatesError}</p>
              </div>
            )}

            {/* Line No */}
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">
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

            {/* OC NO */}
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">
                OC NO<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.ocNo}
                onChange={(e) => handleChange('ocNo', e.target.value)}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white text-primary-950 font-medium disabled:bg-primary-50 disabled:cursor-not-allowed"
                required
                disabled={!formData.lineNo || loadingOcNumbers}
              >
                <option value="">
                  {!formData.lineNo
                    ? 'Select line first...'
                    : loadingOcNumbers
                      ? 'Loading OC numbers...'
                      : 'Select OC number...'}
                </option>
                {ocNumbers.map((ocNo) => (
                  <option key={ocNo} value={ocNo}>
                    {ocNo}
                  </option>
                ))}
              </select>
            </div>

            {/* Process Stage */}
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">
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

            {/* Target Dates Display (Read-only) - Shows when OC and Process Stage selected */}
            {formData.ocNo && formData.processStage && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-primary-50 p-6 rounded-lg border-2 border-primary-200">
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">
                    Target Start Date
                  </label>
                  {loadingTargetDates ? (
                    <div className="w-full px-4 py-3 border border-primary-200 rounded-lg bg-white text-primary-600 flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={targetDates?.targetStartDate || 'N/A'}
                      readOnly
                      className="w-full px-4 py-3 border border-primary-200 rounded-lg bg-white text-primary-900 cursor-not-allowed opacity-80"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">
                    Target End Date
                  </label>
                  {loadingTargetDates ? (
                    <div className="w-full px-4 py-3 border border-primary-200 rounded-lg bg-white text-primary-600 flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={targetDates?.targetEndDate || 'N/A'}
                      readOnly
                      className="w-full px-4 py-3 border border-primary-200 rounded-lg bg-white text-primary-900 cursor-not-allowed opacity-80"
                    />
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Actual Start Date */}
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">
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
                <label className="block text-sm font-semibold text-primary-900 mb-2">
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
            </div>

            {/* Delay Reason */}
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">
                Delay Reason
              </label>
              <select
                value={formData.delayReason}
                onChange={(e) => handleChange('delayReason', e.target.value)}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white text-primary-950 font-medium disabled:bg-primary-50 disabled:cursor-not-allowed"
                disabled={!formData.processStage || loadingDelayReasons}
              >
                <option value="">
                  {!formData.processStage
                    ? 'Select process stage first...'
                    : loadingDelayReasons
                      ? 'Loading delay reasons...'
                      : 'Select delay reason...'}
                </option>
                {delayReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-primary-100">
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-[#6a91cc] hover:bg-[#5a7fb5] text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-[#6a91cc] hover:bg-[#5a7fb5] text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Task
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
