'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, Save, RotateCcw, Calculator, ChevronDown, ChevronUp, CheckCircle2, Clock, Battery, Anchor, ArrowRight, AlertTriangle } from 'lucide-react';

import { apiGet, apiPost, buildQueryString } from '@/lib/api';
import cache from '@/lib/cache';

/**
 * Debounce helper function
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Safely parse dates in both YYYY-MM-DD (ISO) and DD/MM/YYYY formats
 */
function parseDateRobustly(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  
  // Try direct parse (works for YYYY-MM-DD)
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;
  
  // Try DD/MM/YYYY (common in spreadsheet responses)
  const slashParts = dateStr.split('/');
  if (slashParts.length === 3) {
    const day = parseInt(slashParts[0], 10);
    const month = parseInt(slashParts[1], 10) - 1; // 0-indexed
    const year = parseInt(slashParts[2], 10);
    date = new Date(year, month, day);
    if (!isNaN(date.getTime())) return date;
  }

  // Try numeric Excel date (fallback just in case)
  const numericDate = parseFloat(dateStr);
  if (!isNaN(numericDate) && numericDate > 40000) {
    const excelEpoch = new Date(1899, 11, 30);
    date = new Date(excelEpoch.getTime() + numericDate * 86400000);
    if (!isNaN(date.getTime())) return date;
  }
  
  return null;
}

interface TaskUpdatePageProps {
  onSave?: (data: TaskUpdateData) => void;
  factory?: string;
}

export interface TaskUpdateData {
  lineNo: string;
  ocNo: string;
  processStage: string;
  productType: string; // Product Type for SOP lookup (Pre-Production)
  orderType: string;   // Order Type: Repeat / Non-Repeat (File Release)
  actualStartDate: string;
  actualEndDate: string;
  delayReason: string;
  delayRemark?: string;
  actualQuantity?: number;
  revisedQty?: number;
  inspectionReceivedQty?: number;
  // Enriched fields for backend recording
  washCategory?: string;
  deliveryDate?: string;
  orderQty?: number;
  sopLeadTime?: number;
  targetStartDate?: string;
  targetEndDate?: string;
  processSeq?: number;
  vaNva?: string;
  variance?: number;
  riskLevel?: string;
  processStatus?: string;
  completionStatus?: string;
  cumAchieved?: number;
  wipQty?: number;
  vaTime?: number;
  nvaTime?: number;
}

interface CalculationResult {
  success: boolean;
  error?: string;
  orderDetails?: {
    ocNo: string;
    washCategory: string;
    deliveryDate: string;
    qtyOrder: number;
    qtyBand: string;
    productType?: string;
    orderType?: string;
  };
  timeline?: Array<{
    seq: number;
    stage: string;
    targetStart: string;
    targetEnd: string;
    sopLt: number;
    matchLevel: string;
    va: number;
    nnva: number;
    nva: number;
  }>;
  steps?: string[];
  currentProcess?: {
    stage: string;
    targetStart: string;
    targetEnd: string;
    sopLt: number;
    matchLevel: string;
    va: number;
    nnva: number;
    nva: number;
  };
  currentProgress?: {
    isTransactional: boolean;
    orderQty?: number;
    cumAchieved?: number;
    wipQty?: number;
    completionPercentage?: number;
  };
  allProcesses?: Array<{
    seq: number;
    stage: string;
    sopLt: number;
    targetStart: string;
    targetEnd: string;
  }>;
  totalSopLt?: number;
}


interface ProcessStatusData {
  processStage: string;
  processSeq: number;
  actualStartDate: string;
  actualEndDate: string;
  processStatus: string;
}

interface AvailableProcess {
  stage: string;
  seq: number;
  status: 'completed' | 'in-progress' | 'available' | 'locked';
  canEdit: boolean;
}

export default function TaskUpdatePageEnhanced({ onSave, factory = 'dbr' }: TaskUpdatePageProps) {
  const [formData, setFormData] = useState<TaskUpdateData>({
    lineNo: '',
    ocNo: '',
    processStage: '',
    productType: '',
    orderType: '',
    actualStartDate: '',
    actualEndDate: '',
    delayReason: '',
    delayRemark: '',
    actualQuantity: undefined,
    revisedQty: undefined,
    inspectionReceivedQty: undefined,
  });

  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [showCalculationSteps, setShowCalculationSteps] = useState(true);
  const [lines, setLines] = useState<string[]>([]);
  const [ocNumbers, setOcNumbers] = useState<string[]>([]);
  const [filteredOcNumbers, setFilteredOcNumbers] = useState<string[]>([]);
  const [ocSearchTerm, setOcSearchTerm] = useState('');
  const [isOcDropdownOpen, setIsOcDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOcDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [processStages, setProcessStages] = useState<string[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]); // NEW: Product types from SOP_Cal
  const [delayReasons, setDelayReasons] = useState<string[]>([]);
  const [loadingOcNumbers, setLoadingOcNumbers] = useState(false);
  const [loadingProductTypes, setLoadingProductTypes] = useState(false); // NEW
  const [loadingDelayReasons, setLoadingDelayReasons] = useState(false);
  const [loadingCalculation, setLoadingCalculation] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [processTargets, setProcessTargets] = useState<{ today: number; week: number; month: number } | null>(null);
  
  // NEW: Process sequence enforcement
  const [existingProcesses, setExistingProcesses] = useState<ProcessStatusData[]>([]);
  const [availableProcesses, setAvailableProcesses] = useState<AvailableProcess[]>([]);
  const [loadingProcessStatus, setLoadingProcessStatus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NEW: Buyer filter state (used for Fabric Inhouse)
  const [allOcData, setAllOcData] = useState<{ ocNo: string; line: string; buyer: string }[]>([]);
  const [buyers, setBuyers] = useState<string[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState('');

  // Check if process uses transactional (daily) tracking
  const isTransactionalProcess = (processStage: string) => {
    return ['Cutting', 'Sewing', 'Washing', 'Finishing', 'Inspection'].includes(processStage);
  };

  // NEW: Check if process is a 1-day milestone process (Fabric Inhouse, File Release)
  const isOneDayProcess = (processStage: string) => {
    return ['Fabric Inhouse', 'Fabric QC', 'File Release'].includes(processStage);
  };

  // Define all processes in sequence
  const ALL_PROCESSES = [
    { seq: 1, stage: 'Fabric Inhouse', requiresComplete: [] },
    { seq: 2, stage: 'Fabric QC', requiresComplete: ['Fabric Inhouse'] },
    { seq: 3, stage: 'File Release', requiresComplete: ['Fabric Inhouse'] },
    { seq: 4, stage: 'Pre-Production', requiresComplete: ['File Release'] },
    { seq: 5, stage: 'CAD / Pattern', requiresComplete: ['Pre-Production'] },
    { seq: 6, stage: 'Cutting', requiresComplete: ['CAD / Pattern'] },
    { seq: 7, stage: 'Sewing', requiresPartialStart: ['Cutting'] }, // Can start when Cutting has started
    { seq: 8, stage: 'Washing', requiresPartialStart: ['Sewing'] }, // Can start when Sewing has started
    { seq: 9, stage: 'Finishing', requiresPartialStart: ['Washing'] }, // Can start when Washing has started
    { seq: 10, stage: 'Inspection', requiresPartialStart: ['Finishing'] }, // Can start when Finishing has started
    { seq: 11, stage: 'Dispatch', requiresComplete: ['Inspection'] },
  ];

  /**
   * Calculate which processes are available based on existing process status
   */
  const calculateAvailableProcesses = (existing: ProcessStatusData[]): AvailableProcess[] => {
    const available: AvailableProcess[] = [];

    for (const process of ALL_PROCESSES) {
      const existingEntry = existing.find(e => e.processStage === process.stage);

      // If process already exists, it can be edited
      if (existingEntry) {
        const status = existingEntry.actualEndDate 
          ? 'completed' 
          : existingEntry.actualStartDate 
            ? 'in-progress' 
            : 'available';
        
        available.push({
          stage: process.stage,
          seq: process.seq,
          status,
          canEdit: true
        });
        continue;
      }

      // Check if process is unlocked
      let isUnlocked = false;

      // Fabric Inhouse is always available for new OC
      if (process.seq === 1) {
        isUnlocked = true;
      }
      // Check strict dependencies (requires complete)
      else if (process.requiresComplete && process.requiresComplete.length > 0) {
        isUnlocked = process.requiresComplete.every(requiredStage => {
          const requiredProcess = existing.find(e => e.processStage === requiredStage);
          return requiredProcess && requiredProcess.actualEndDate; // Must have end date
        });
      }
      // Check partial dependencies (requires start)
      else if (process.requiresPartialStart && process.requiresPartialStart.length > 0) {
        isUnlocked = process.requiresPartialStart.every(requiredStage => {
          const requiredProcess = existing.find(e => e.processStage === requiredStage);
          return requiredProcess && requiredProcess.actualStartDate; // Just needs start date
        });
      }

      available.push({
        stage: process.stage,
        seq: process.seq,
        status: isUnlocked ? 'available' : 'locked',
        canEdit: false
      });
    }

    return available;
  };

  // Check if there's a delay
  const isDelayed = () => {
    if (!formData.actualEndDate || !calculation?.currentProcess?.targetEnd) {
      return false;
    }
    const actualEnd = new Date(formData.actualEndDate);
    const targetEnd = new Date(calculation.currentProcess.targetEnd);
    return actualEnd > targetEnd;
  };

  // Check for inherited delay (late start due to previous process)
  const getInheritedDelayInfo = () => {
    if (!formData.actualStartDate || !calculation?.currentProcess?.targetStart) {
      return { hasInheritedDelay: false, inheritedDays: 0 };
    }
    const actualStart = new Date(formData.actualStartDate);
    const targetStart = new Date(calculation.currentProcess.targetStart);
    const inheritedDays = Math.ceil((actualStart.getTime() - targetStart.getTime()) / (1000 * 60 * 60 * 24));

    return {
      hasInheritedDelay: inheritedDays > 0,
      inheritedDays: inheritedDays > 0 ? inheritedDays : 0
    };
  };

  // Check if process itself is late (independent of inherited delays)
  const getProcessSpecificDelay = () => {
    if (!formData.actualEndDate || !calculation?.currentProcess?.targetEnd) {
      return 0;
    }
    const inherited = getInheritedDelayInfo();
    const totalDelayDays = Math.ceil(
      (new Date(formData.actualEndDate).getTime() - new Date(calculation.currentProcess.targetEnd).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Process-specific delay = total delay - inherited delay
    const processSpecific = Math.max(0, totalDelayDays - inherited.inheritedDays);
    return processSpecific;
  };

  // Fetch lines and process stages on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch lines - with caching
        let linesData = cache.get<string[]>(`lines_${factory}`);
        if (!linesData) {
          const linesResult = await apiGet(`/api/${factory}/lines`);
          if (linesResult.success) {
            linesData = linesResult.data;
            cache.set(`lines_${factory}`, linesData);
          }
        }
        if (linesData) setLines(linesData);

        // Fetch process stages - with caching
        let stagesData = cache.get<string[]>(`process_stages_${factory}`);
        if (!stagesData) {
          const processResult = await apiGet(`/api/${factory}/process-stages`);
          if (processResult.success) {
            stagesData = processResult.data;
            cache.set(`process_stages_${factory}`, stagesData);
          }
        }
        if (stagesData) setProcessStages(stagesData);

        // Fetch product types - with caching
        let ptData = cache.get<string[]>(`product_types_${factory}`);
        if (!ptData) {
          const productTypesResult = await apiGet(`/api/${factory}/product-types`);
          if (productTypesResult.success) {
            ptData = productTypesResult.data;
            cache.set(`product_types_${factory}`, ptData);
          }
        }
        if (ptData) setProductTypes(ptData);
      } catch (error) {
        console.error('Error fetching core data:', error);
      }
    };

    fetchData();
  }, [factory]);

  // Fetch OC numbers logic
  const fetchOcNumbers = async (lineNo: string, processStage: string) => {
    const isFabricInhouse = processStage === 'Fabric Inhouse';

    if (!lineNo && !isFabricInhouse) {
      setOcNumbers([]);
      setFilteredOcNumbers([]);
      return;
    }

    setLoadingOcNumbers(true);
    try {
      let lineParam = lineNo;
      const isAllLines = lineNo === 'All lines';
      
      const cacheKey = isAllLines 
        ? `oc_numbers_all_${factory}`
        : isFabricInhouse 
          ? `oc_numbers_fabric_${factory}`
          : `oc_numbers_line_${factory}_${lineNo}`;

      // Try cache
      let ocData = cache.get<string[]>(cacheKey);
      
      if (!ocData) {
        const params: any = {};
        if (isFabricInhouse) params.process = 'Fabric Inhouse';
        else if (!isAllLines) params.line = lineNo;

        const url = `/api/${factory}/oc-numbers${buildQueryString(params)}`;
        const result = await apiGet(url);
        
        if (result.success) {
          ocData = result.data;
          cache.set(cacheKey, ocData);
        }
      }

      if (ocData) {
        setOcNumbers(ocData);
        setFilteredOcNumbers(ocData);
      }
    } catch (error) {
      console.error('Error fetching OC numbers:', error);
    } finally {
      setLoadingOcNumbers(false);
    }
  };

  // Fetch OC numbers logic - UPDATED for process-first flow
  const fetchOcNumbersByProcess = async (processStage: string) => {
    if (!processStage) {
      setOcNumbers([]);
      setFilteredOcNumbers([]);
      return;
    }

    setLoadingOcNumbers(true);
    try {
      const cacheKey = `oc_numbers_by_process_${factory}_${processStage}`;

      // Try cache
      let ocData = cache.get<any[]>(cacheKey);
      
      if (!ocData) {
        const url = `/api/${factory}/oc-numbers-by-process?process=${encodeURIComponent(processStage)}`;
        const result = await apiGet(url);
        
        if (result.success) {
          ocData = result.data;
          cache.set(cacheKey, ocData);
        }
      }

      if (ocData) {
        setAllOcData(ocData); // Store full data with buyer info

        // Extract unique buyers for the filter
        const uniqueBuyers = [...new Set(
          ocData
            .map((o: any) => (o.buyer || '').toString().trim())
            .filter(Boolean)
        )].sort() as string[];
        setBuyers(uniqueBuyers);

        // If a buyer is already selected, apply filter; else show all
        const filtered = (processStage === 'Fabric Inhouse' || processStage === 'Fabric QC') && selectedBuyer
          ? ocData.filter((o: any) => o.buyer === selectedBuyer)
          : ocData;

        const ocNos = filtered.map((o: any) => o.ocNo);
        setOcNumbers(ocNos);
        setFilteredOcNumbers(ocNos);
      }
    } catch (error) {
      console.error('Error fetching OC numbers:', error);
    } finally {
      setLoadingOcNumbers(false);
    }
  };

  // Trigger fetch when process changes
  useEffect(() => {
    setSelectedBuyer(''); // Reset buyer filter on process change
    fetchOcNumbersByProcess(formData.processStage);
  }, [formData.processStage, factory]);

  // Re-apply buyer filter when selectedBuyer changes (Fabric Inhouse only)
  useEffect(() => {
    if (formData.processStage !== 'Fabric Inhouse' && formData.processStage !== 'Fabric QC') return;
    const filtered = selectedBuyer
      ? allOcData.filter(o => o.buyer === selectedBuyer)
      : allOcData;
    const ocNos = filtered.map(o => o.ocNo);
    setOcNumbers(ocNos);
    setFilteredOcNumbers(ocNos);
    // Clear OC selection if the current one is no longer in the filtered list
    if (formData.ocNo && !ocNos.includes(formData.ocNo)) {
      setFormData(prev => ({ ...prev, ocNo: '', lineNo: '' }));
      setOcSearchTerm('');
    }
  }, [selectedBuyer, formData.processStage]);

  // Debounced OC Search
  const debouncedSearch = useCallback(
    debounce((term: string, numbers: string[]) => {
      if (!term) {
        setFilteredOcNumbers(numbers);
      } else {
        const filtered = numbers.filter(ocNo =>
          ocNo.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredOcNumbers(filtered);
      }
    }, 300),
    []
  );

  // Trigger debounced search when term or numbers change
  useEffect(() => {
    debouncedSearch(ocSearchTerm, ocNumbers);
  }, [ocSearchTerm, ocNumbers, debouncedSearch]);

  // Fetch delay reasons when process stage is selected
  useEffect(() => {
    const fetchDelayReasons = async () => {
      if (!formData.processStage) {
        setDelayReasons([]);
        return;
      }

      setLoadingDelayReasons(true);
      try {
        const cacheKey = `delay_reasons_${factory}_${formData.processStage}`;
        let drData = cache.get<string[]>(cacheKey);

        if (!drData) {
          const result = await apiGet(`/api/${factory}/delay-reasons?process=${encodeURIComponent(formData.processStage)}`);
          if (result.success) {
            drData = result.data;
            cache.set(cacheKey, drData);
          }
        }
        if (drData) setDelayReasons(drData);
      } catch (error) {
        console.error('Error fetching delay reasons:', error);
      } finally {
        setLoadingDelayReasons(false);
      }
    };

    fetchDelayReasons();
  }, [formData.processStage, factory]);

  // Compute process targets (Today/Week/Month) from production data
  useEffect(() => {
    if (!formData.processStage) {
      setProcessTargets(null);
      return;
    }
    const computeTargets = async () => {
      try {
        const result = await apiGet(`/api/${factory}/production_data`);
        if (!result.success) return;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7);
        const monthEnd = new Date(today); monthEnd.setDate(today.getDate() + 30);
        const stageRows: Array<{ targetEndDate: string; processStatus: string }> = (result.data as Array<{ processStage: string; targetEndDate: string; processStatus: string }>)
          .filter(d => d.processStage === formData.processStage && !d.processStatus?.toLowerCase().includes('completed'));
        const parse = (d: string) => { const t = new Date(d); return isNaN(t.getTime()) ? null : t; };
        const todayCount = stageRows.filter(r => { const t = parse(r.targetEndDate); return t && t.getTime() === today.getTime(); }).length;
        const weekCount = stageRows.filter(r => { const t = parse(r.targetEndDate); return t && t >= today && t <= weekEnd; }).length;
        const monthCount = stageRows.filter(r => { const t = parse(r.targetEndDate); return t && t >= today && t <= monthEnd; }).length;
        setProcessTargets({ today: todayCount, week: weekCount, month: monthCount });
      } catch { setProcessTargets(null); }
    };
    computeTargets();
  }, [formData.processStage]);

  // Fetch calculation when OC No and Process Stage are selected
  useEffect(() => {
    const fetchCalculation = async () => {
      // Basic validation
      if (!formData.ocNo || !formData.processStage) {
        setCalculation(null);
        return;
      }

      // NEW: Only fetch if it's a valid eligible OC number (prevents "Order not found" while typing)
      // We check if it's in the list of eligible OCs for the current process
      if (!ocNumbers.includes(formData.ocNo)) {
        return;
      }

      // For File Release, wait for Order Type to be selected
      if (formData.processStage === 'File Release' && !formData.orderType) {
        setCalculation(null);
        return;
      }

      setLoadingCalculation(true);
      try {
        const params = {
          ocNo: formData.ocNo,
          processStage: formData.processStage,
          productType: formData.productType,
          orderType: formData.orderType
        };

        const result = await apiGet(`/api/${factory}/calculate${buildQueryString(params)}`);
        // Ensure the calculation state includes the success flag for the UI to render correctly
        setCalculation(result.success && result.data ? { ...result.data, success: true } : result);
      } catch (error) {
        console.error('Error fetching calculation:', error);
        setCalculation({
          success: false,
          error: 'Failed to fetch calculation.'
        });
      } finally {
        setLoadingCalculation(false);
      }
    };

    // Debounce the calculation fetch to prevent spamming while typing
    const handler = setTimeout(() => {
      fetchCalculation();
    }, 400); // 400ms debounce

    return () => clearTimeout(handler);
  }, [formData.ocNo, formData.processStage, formData.productType, formData.orderType, ocNumbers, factory]);

  // Auto-populate Line No when OC NO is selected (especially for Fabric Inhouse)
  useEffect(() => {
    const fetchLineByOcNo = async () => {
      if (!formData.ocNo) {
        return;
      }

      try {
        const result = await apiGet(`/api/${factory}/line-by-oc?ocNo=${encodeURIComponent(formData.ocNo)}`);

        if (result.success && result.data.lineNo) {
          // Auto-populate the Line No field
          setFormData(prev => ({
            ...prev,
            lineNo: result.data.lineNo
          }));
        }
      } catch (error) {
        console.error('Error fetching line by OC NO:', error);
      }
    };

    fetchLineByOcNo();
  }, [formData.ocNo]);

  // NEW: Fetch process status when OC Number is selected
  useEffect(() => {
    const fetchProcessStatus = async () => {
      if (!formData.ocNo) {
        setExistingProcesses([]);
        setAvailableProcesses(calculateAvailableProcesses([]));
        return;
      }

      setLoadingProcessStatus(true);
      try {
        const result = await apiGet(`/api/${factory}/process-status?ocNo=${encodeURIComponent(formData.ocNo)}`);

        if (result.success) {
          setExistingProcesses(result.data || []);
          setAvailableProcesses(calculateAvailableProcesses(result.data || []));
        } else {
          console.error('Error fetching process status:', result.error);
          setExistingProcesses([]);
          setAvailableProcesses(calculateAvailableProcesses([]));
        }
      } catch (error) {
        console.error('Error fetching process status:', error);
        setExistingProcesses([]);
        setAvailableProcesses(calculateAvailableProcesses([]));
      } finally {
        setLoadingProcessStatus(false);
      }
    };

    fetchProcessStatus();
  }, [formData.ocNo]);

  const handleChange = (field: keyof TaskUpdateData, value: string) => {
    setFormData(prev => {
      const newData = { ...prev };

      // Handle number fields
      if (field === 'actualQuantity' || field === 'revisedQty' || field === 'inspectionReceivedQty') {
        newData[field] = value ? parseInt(value, 10) : undefined;
      } else {
        // Type assertion for string fields
        (newData as any)[field] = value;
      }

      if (field === 'processStage') {
        newData.ocNo = '';
        newData.lineNo = '';
        newData.delayReason = '';
        newData.productType = '';
        newData.orderType = '';
        setOcSearchTerm('');
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) {
      console.log('⚠️ Already submitting, please wait...');
      return;
    }

    // Validate required fields based on process type
    const isTransactional = isTransactionalProcess(formData.processStage);
    const isOneDay = isOneDayProcess(formData.processStage);
    const isFabricInhouse = formData.processStage === 'Fabric Inhouse';

    if (!formData.ocNo || !formData.processStage || !formData.actualStartDate) {
      const missing = [];
      if (!formData.ocNo) missing.push('OC NO');
      if (!formData.processStage) missing.push('Process Stage');
      if (!formData.actualStartDate) missing.push('Entry Date');

      // Line No is required ONLY if not Fabric Inhouse or Fabric QC
      if (!formData.lineNo && !isFabricInhouse && formData.processStage !== 'Fabric QC') {
        missing.push('Line No');
      }

      if (missing.length > 0) {
        setSaveMessage({ type: 'error', text: `Missing: ${missing.join(', ')}` });
        return;
      }
    }

    // Order Type is ONLY required for File Release
    if (formData.processStage === 'File Release' && !formData.orderType) {
      setSaveMessage({ type: 'error', text: 'Order Type is required for File Release process' });
      return;
    }

    // For non-transactional and non-1-day processes, actualEndDate is required
    if (!isTransactional && !isOneDay && !formData.actualEndDate) {
      setSaveMessage({ type: 'error', text: 'Actual End Date is required for this process' });
      return;
    }

    // For transactional processes, actualQuantity is required
    if (isTransactional && !formData.actualQuantity) {
      setSaveMessage({ type: 'error', text: 'Quantity Achieved Today is required' });
      return;
    }
    
    // For Inspection, Quantity Received is required
    if (formData.processStage === 'Inspection' && !formData.inspectionReceivedQty) {
      setSaveMessage({ type: 'error', text: 'Quantity Received is required for Inspection' });
      return;
    }

    setIsSubmitting(true);
    setSaveMessage({ type: 'info', text: 'Saving... Please wait, do not refresh or click again.' });

    try {
      // Enrichment logic: Merge master data and calculate derived fields
      const submissionData: TaskUpdateData = { ...formData };
      
      if (isOneDay) {
        submissionData.actualEndDate = formData.actualStartDate;
      }

      // Add Master Data from calculation result
      if (calculation?.orderDetails) {
        submissionData.washCategory = calculation.orderDetails.washCategory;
        submissionData.deliveryDate = calculation.orderDetails.deliveryDate;
        submissionData.orderQty = calculation.orderDetails.qtyOrder;
      }

      if (calculation?.currentProcess) {
        submissionData.sopLeadTime = calculation.currentProcess.sopLt;
        submissionData.targetStartDate = calculation.currentProcess.targetStart;
        submissionData.targetEndDate = calculation.currentProcess.targetEnd;
      }

      // Add Process Sequence
      const processInfo = ALL_PROCESSES.find(p => p.stage === formData.processStage);
      if (processInfo) {
        submissionData.processSeq = processInfo.seq;
      }

      // Calculate Variance and Risk
      if (submissionData.actualEndDate && submissionData.targetEndDate) {
        const actual = parseDateRobustly(submissionData.actualEndDate);
        const target = parseDateRobustly(submissionData.targetEndDate);
        
        if (actual && target) {
          const diffTime = actual.getTime() - target.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          submissionData.variance = diffDays;
          submissionData.riskLevel = diffDays > 7 ? 'High' : diffDays > 3 ? 'Medium' : 'Low';
          
          // Determine Process Status
          if (diffDays <= 0) {
            submissionData.processStatus = 'Completed - On Time';
          } else {
            submissionData.processStatus = 'Completed - Delayed';
          }
        }
      }

      // Set VA/NVA status
      submissionData.vaNva = isTransactional ? 'VA' : 'NVA';
      submissionData.vaTime = 0; // Defaults to avoid breakage
      submissionData.nvaTime = 0;

      // Handle Transactional Progress
      if (isTransactional && calculation?.currentProgress) {
        const currentCum = calculation.currentProgress.cumAchieved || 0;
        const todayQty = formData.actualQuantity || 0;
        const totalOrder = calculation.currentProgress.orderQty || calculation.orderDetails?.qtyOrder || 0;
        
        submissionData.cumAchieved = currentCum + todayQty;
        submissionData.wipQty = Math.max(0, totalOrder - submissionData.cumAchieved);
        submissionData.orderQty = totalOrder;
        
        if (submissionData.cumAchieved >= totalOrder && totalOrder > 0) {
          submissionData.completionStatus = 'Completed';
        } else {
          submissionData.completionStatus = 'In Progress';
          // Overwrite status for in-progress transactional tasks
          submissionData.processStatus = 'In Progress';
        }
      } else if (!isTransactional) {
        submissionData.completionStatus = 'Completed';
      }

      console.log('🚀 Enriched submission data:', submissionData);

      const result = await apiPost(`/api/${factory}/update-task`, submissionData);

      if (result.success) {
        setSaveMessage({ type: 'success', text: 'Task saved successfully! ✓' });
        
        // Invalidate relevant caches
        cache.remove(`oc_numbers_all_${factory}`);
        cache.remove(`oc_numbers_fabric_${factory}`);
        cache.remove(`oc_numbers_by_process_${factory}_${formData.processStage}`);

        onSave?.(formData);

        setTimeout(() => {
          handleReset();
          setSaveMessage(null);
        }, 2000);
      } else {
        setSaveMessage({ type: 'error', text: result.error || 'Failed to update task' });
      }
    } catch (error: any) {
      console.error('Error saving task:', error);
      setSaveMessage({ type: 'error', text: error.message || 'Failed to save task. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      lineNo: '',
      ocNo: '',
      processStage: '',
      productType: '',
      orderType: '',
      actualStartDate: '',
      actualEndDate: '',
      delayReason: '',
      delayRemark: '',
      actualQuantity: undefined,
      revisedQty: undefined,
      inspectionReceivedQty: undefined,
    });
    setCalculation(null);
    setSaveMessage(null);
    setOcSearchTerm('');
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50">
      {/* CRITICAL CHANGE: 
         - Changed to `px-4 pt-0 pb-8`. 
         - `pt-0` removes all top padding (0px). 
      */}
      <div className="max-w-7xl mx-auto px-4 pb-8 pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Card - Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-primary-100 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-950 to-primary-900 text-white p-6">
                <h2 className="text-2xl font-bold">Task Details</h2>
                <p className="text-primary-100 text-sm mt-1">Update production status and track progress</p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="px-6 pb-6 pt-0 space-y-4">
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

                {/* Form Title */}
                <div className="pb-3 mb-4 mt-6">
                  <h3 className="text-xl font-bold text-primary-950">Production Task Update Form</h3>
                  <p className="text-sm text-primary-700 mt-1">Fill in the details below to update task status</p>
                </div>

                {/* NEW PRIMARY FIELD: Process Stage */}
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">
                    1. Select Process Stage<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.processStage}
                    onChange={(e) => handleChange('processStage', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-primary-950 font-bold text-lg shadow-sm"
                    autoComplete="off"
                  >
                    <option value="">Select process stage...</option>
                    {ALL_PROCESSES.map((process) => (
                      <option key={process.stage} value={process.stage}>
                        {process.stage}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Process Targets (Today / Week / Month) - Shown immediately after process selection */}
                {formData.processStage && processTargets && (
                  <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-200 shadow-inner">
                    <div className="text-center">
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wide">Today</p>
                      <p className="text-3xl font-black text-red-700">{processTargets.today}</p>
                      <p className="text-xs text-red-500">orders due</p>
                    </div>
                    <div className="text-center border-x border-primary-200">
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">This Week</p>
                      <p className="text-3xl font-black text-amber-700">{processTargets.week}</p>
                      <p className="text-xs text-amber-500">orders due</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">This Month</p>
                      <p className="text-3xl font-black text-blue-700">{processTargets.month}</p>
                      <p className="text-xs text-blue-500">orders due</p>
                    </div>
                  </div>
                )}

                {/* BUYER FILTER - Only for Fabric Inhouse */}
                {formData.processStage === 'Fabric Inhouse' && buyers.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-primary-900 mb-2">
                      2. Filter by Buyer
                      <span className="text-purple-600 ml-2 text-xs font-normal">
                        (optional — narrows down OC list)
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedBuyer}
                        onChange={(e) => setSelectedBuyer(e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-primary-950 font-medium shadow-sm"
                      >
                        <option value="">All Buyers ({allOcData.length} OCs)</option>
                        {buyers.map(buyer => {
                          const count = allOcData.filter(o => o.buyer === buyer).length;
                          return (
                            <option key={buyer} value={buyer}>
                              {buyer} ({count} OCs)
                            </option>
                          );
                        })}
                      </select>
                      {selectedBuyer && (
                        <button
                          type="button"
                          onClick={() => setSelectedBuyer('')}
                          className="px-3 py-2 bg-purple-50 border-2 border-purple-200 rounded-lg text-purple-700 hover:bg-purple-100 transition-all text-sm font-semibold"
                          title="Clear buyer filter"
                        >
                          ✕ Clear
                        </button>
                      )}
                    </div>
                    {selectedBuyer && (
                      <p className="text-xs text-purple-600 mt-1">
                        Showing {ocNumbers.length} OCs for <strong>{selectedBuyer}</strong>
                      </p>
                    )}
                  </div>
                )}

                {/* OC NO - Filtered by Process Eligibility (and Buyer for Fabric Inhouse) */}
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">
                    {formData.processStage === 'Fabric Inhouse' ? '3.' : '2.'} Select OC Number<span className="text-red-500">*</span>
                    {formData.processStage && (
                      <span className="text-blue-600 ml-2 text-xs font-normal">
                        (Showing OCs eligible for {formData.processStage})
                      </span>
                    )}
                  </label>

                  <div className="relative" ref={dropdownRef}>
                    <input
                      type="text"
                      value={formData.ocNo}
                      onChange={(e) => {
                        handleChange('ocNo', e.target.value);
                        setOcSearchTerm(e.target.value);
                        setIsOcDropdownOpen(true);
                      }}
                      onFocus={() => setIsOcDropdownOpen(true)}
                      placeholder={!formData.processStage ? 'Select process stage first...' : loadingOcNumbers ? 'Loading eligible OCs...' : '🔍 Search or select OC number...'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-primary-950 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                      disabled={!formData.processStage || loadingOcNumbers}
                      autoComplete="off"
                    />
                    
                    {/* Custom Dropdown Menu */}
                    {isOcDropdownOpen && formData.processStage && !loadingOcNumbers && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {filteredOcNumbers.filter(ocNo => !ocNo.includes('#REF') && !ocNo.includes('#N/A') && !ocNo.includes('#ERROR')).length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">No matching OC numbers found</div>
                        ) : (
                          <ul className="py-1 m-0 list-none">
                            {filteredOcNumbers
                              .filter(ocNo => ocNo && !ocNo.includes('#REF') && !ocNo.includes('#N/A') && !ocNo.includes('#ERROR'))
                              .map((ocNo) => {
                                const buyer = allOcData.find(o => o.ocNo === ocNo)?.buyer;
                                const displayText = formData.processStage === 'Fabric Inhouse' && buyer ? `${ocNo} (${buyer})` : ocNo;
                                return (
                                  <li 
                                    key={ocNo}
                                    onClick={() => {
                                      handleChange('ocNo', ocNo);
                                      setOcSearchTerm(ocNo);
                                      setIsOcDropdownOpen(false);
                                    }}
                                    className="px-4 py-2 text-sm text-gray-800 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                                  >
                                    {displayText}
                                  </li>
                                );
                            })}
                          </ul>
                        )}
                      </div>
                    )}
                    
                    {formData.processStage && ocNumbers.length > 0 && ocSearchTerm && (
                      <p className="text-xs text-blue-600 mt-1">
                        {filteredOcNumbers.filter(ocNo => !ocNo.includes('#REF') && !ocNo.includes('#N/A') && !ocNo.includes('#ERROR')).length} eligible OC numbers
                      </p>
                    )}
                  </div>
                </div>

                {/* Buyer Display - Only for Fabric Inhouse and once OC is selected */}
                {formData.processStage === 'Fabric Inhouse' && formData.ocNo && (
                  <div>
                    <label className="block text-sm font-semibold text-purple-900 mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
                      Buyer Name
                    </label>
                    <div className="w-full px-4 py-3 border border-purple-200 rounded-lg bg-purple-50 text-purple-900 font-bold flex items-center gap-2">
                       <span className="text-lg">👤</span>
                       {allOcData.find(o => o.ocNo === formData.ocNo)?.buyer || 'N/A'}
                    </div>
                  </div>
                )}

                {/* Line No - Auto-populated, Read-only (hidden for Fabric Inhouse) */}
                {formData.processStage !== 'Fabric Inhouse' && (
                  <div>
                    <label className="block text-sm font-semibold text-primary-900 mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
                      Line No.
                    </label>
                    <input
                      type="text"
                      value={formData.lineNo || ''}
                      readOnly
                      placeholder={!formData.ocNo ? 'Select OC number to see line...' : 'Fetching line...'}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-primary-800 font-bold cursor-not-allowed opacity-90"
                    />
                  </div>
                )}

                {/* Process Progress Info legend - Now shown after OC is selected for confirmation */}
                {formData.ocNo && (
                   <div className="mt-3 p-4 bg-white border-2 border-primary-100 rounded-xl shadow-sm">
                      <p className="text-sm font-bold text-primary-900 mb-3 flex items-center gap-2">
                        <span className="text-blue-500">📜</span>
                        Process Status for {formData.ocNo}
                      </p>
                      
                      {loadingProcessStatus ? (
                        <div className="flex items-center gap-2 text-sm text-primary-600 animate-pulse">
                          <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                          Checking status...
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {availableProcesses.map(p => (
                            <div key={p.stage} className={"text-xs p-2 rounded border flex items-center justify-between " + (
                              p.stage === formData.processStage ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200' :
                              p.status === 'completed' ? 'bg-green-50 border-green-200 text-green-700' :
                              p.status === 'in-progress' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                              p.status === 'locked' ? 'bg-gray-50 border-gray-200 text-gray-400' : 'bg-white border-gray-200 text-gray-700'
                             )}>
                              <span className="truncate">{p.stage}</span>
                              <span>
                                {p.status === 'completed' ? '✓' : p.status === 'in-progress' ? '⏳' : p.status === 'locked' ? '🔒' : '🔓'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-3 flex gap-4 text-[10px] font-semibold text-primary-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1"><span className="text-green-600">✓</span> Done</div>
                        <div className="flex items-center gap-1"><span className="text-blue-600">⏳</span> Active</div>
                        <div className="flex items-center gap-1"><span className="text-yellow-600">🔓</span> Next</div>
                        <div className="flex items-center gap-1">🔒 Locked</div>
                      </div>
                   </div>
                )}


                {/* File Release Specific Fields */}
                {formData.processStage === 'File Release' && (
                  <div className="space-y-4">
                    {/* Order Type */}
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">
                        Order Type<span className="text-red-500">*</span>
                        <span className="text-primary-600 ml-2 text-xs font-normal">(Required — sets SOP Lead Time for ALL processes)</span>
                      </label>
                      <select
                        value={formData.orderType}
                        onChange={(e) => handleChange('orderType', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-primary-950 font-medium"
                      >
                        <option value="">Select order type...</option>
                        <option value="Repeat">Repeat Order</option>
                        <option value="Non-Repeat">Non-Repeat Order</option>
                      </select>
                    </div>

                    {/* Product Type */}
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">
                        Product Type<span className="text-red-500">*</span>
                        <span className="text-primary-600 ml-2 text-xs font-normal">(Affects ALL SOP calculations)</span>
                      </label>
                      <select
                        value={formData.productType}
                        onChange={(e) => handleChange('productType', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-primary-950 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                        disabled={loadingProductTypes}
                      >
                        <option value="">
                          {loadingProductTypes ? 'Loading...' : 'Select product type...'}
                        </option>
                        {productTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <p className="text-xs text-primary-700 mt-1 flex items-center gap-1">
                        <span>ℹ️</span>
                        This selection will be used for calculating SOP times for ALL processes (Cutting, Sewing, Washing, etc.)
                      </p>
                    </div>
                  </div>
                )}

                {/* Current Progress - Only for Transactional Processes */}
                {formData.ocNo && formData.processStage && isTransactionalProcess(formData.processStage) && calculation?.currentProgress?.isTransactional && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                      <span className="text-2xl">📊</span>
                      Current Progress for {formData.processStage}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-primary-600 mb-1">Order Quantity</p>
                        <p className="text-2xl font-bold text-blue-900">{calculation.currentProgress.orderQty || 0}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-primary-600 mb-1">Already Achieved</p>
                        <p className="text-2xl font-bold text-green-600">{calculation.currentProgress.cumAchieved || 0}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-primary-600 mb-1">Remaining WIP</p>
                        <p className="text-2xl font-bold text-orange-600">{calculation.currentProgress.wipQty || 0}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-gray-600 mb-1">Completion</p>
                        <p className="text-2xl font-bold text-purple-600">{calculation.currentProgress.completionPercentage || 0}%</p>
                      </div>
                    </div>
                    <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                      <p className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
                        <span>⚠️</span>
                        You are adding today's progress. This will create a new entry.
                      </p>
                    </div>
                  </div>
                )}


                {/* Target Dates Display */}
                {formData.ocNo && formData.processStage && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-primary-50 p-6 rounded-lg border-2 border-primary-200">
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Target Start Date</label>
                      {loadingCalculation ? (
                        <div className="w-full px-4 py-3 border border-primary-200 rounded-lg bg-white text-primary-600 flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                          Loading...
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={calculation?.currentProcess?.targetStart || 'N/A'}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed opacity-80"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Target End Date</label>
                      {loadingCalculation ? (
                        <div className="w-full px-4 py-3 border border-primary-200 rounded-lg bg-white text-primary-600 flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                          Loading...
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={calculation?.currentProcess?.targetEnd || 'N/A'}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed opacity-80"
                        />
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Entry Date / Actual Start Date */}
                  <div>
                    <label className="block text-sm font-semibold text-primary-900 mb-2">
                      {(isTransactionalProcess(formData.processStage) || isOneDayProcess(formData.processStage)) ? 'Entry Date' : 'Actual Start Date'}
                      <span className="text-red-500">*</span>
                      {(isTransactionalProcess(formData.processStage) || isOneDayProcess(formData.processStage)) && (
                        <span className="text-primary-600 ml-2 text-xs font-normal">(Today's date)</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.actualStartDate}
                        onChange={(e) => handleChange('actualStartDate', e.target.value)}
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-primary-950 font-medium"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Actual End Date - Only for non-transactional and non-1-day processes */}
                  {!isTransactionalProcess(formData.processStage) && !isOneDayProcess(formData.processStage) && (
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">
                        Actual End Date<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={formData.actualEndDate}
                          onChange={(e) => handleChange('actualEndDate', e.target.value)}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-primary-950 font-medium"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Revised Quantity - Only for Cutting */}
                {formData.processStage === 'Cutting' && (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Revised Quantity (Cut Quantity)
                      <span className="text-red-500 ml-1">*</span>
                      <span className="text-amber-600 ml-2 text-xs font-normal">(Required for Cutting)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.revisedQty || ''}
                      onChange={(e) => handleChange('revisedQty' as keyof TaskUpdateData, e.target.value)}
                      placeholder="Enter actual cut quantity..."
                      min="1"
                      step="1"
                      className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-gray-900 font-medium"
                    />
                    <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                      <span className="text-amber-500">ℹ️</span>
                      This quantity will be used for all subsequent processes (Sewing, Washing, Finishing, etc.)
                    </p>
                  </div>
                )}

                {/* Actual Quantity - For Transactional Processes (Cutting, Sewing, Washing, Finishing) */}
                {formData.processStage && isTransactionalProcess(formData.processStage) && formData.processStage !== 'Inspection' && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 shadow-lg">
                    <label className="block text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
                      <span className="text-2xl">📦</span>
                      Quantity Achieved Today
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.actualQuantity || ''}
                      onChange={(e) => handleChange('actualQuantity' as keyof TaskUpdateData, e.target.value)}
                      placeholder="Enter quantity completed today..."
                      min="1"
                      step="1"
                      className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-primary-950 font-medium text-lg"
                    />
                    <div className="mt-4 bg-white border border-green-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-green-800 mb-2">After this entry:</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-primary-700">Cumulative:</span>
                          <span className="ml-2 font-bold text-green-700">
                            {(calculation?.currentProgress?.cumAchieved || 0) + (formData.actualQuantity || 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-primary-700">Remaining:</span>
                          <span className="ml-2 font-bold text-orange-600">
                            {Math.max(0, (calculation?.currentProgress?.orderQty || 0) - (calculation?.currentProgress?.cumAchieved || 0) - (formData.actualQuantity || 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-green-700 mt-3 flex items-center gap-1">
                      <span className="text-green-500">ℹ️</span>
                      This creates a new daily entry. Previous entries remain unchanged.
                    </p>
                  </div>
                )}

                {/* Inspection Process - Tracks Cumulative Received + 10% Inspection */}
                {formData.processStage === 'Inspection' && (
                  <div className="space-y-4">
                    {/* Current Progress - Show cumulative received */}
                    {calculation?.currentProgress?.isTransactional && (
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                          <span className="text-2xl">📊</span>
                          Current Inspection Progress
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white rounded-lg p-4 border border-purple-200">
                            <p className="text-sm text-primary-600 mb-1">Total Received</p>
                            <p className="text-2xl font-bold text-blue-900">{calculation.currentProgress.cumAchieved || 0}</p>
                            <p className="text-xs text-blue-600 mt-1">from Finishing (cumulative)</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-purple-200">
                            <p className="text-sm text-primary-600 mb-1">Already Inspected</p>
                            <p className="text-2xl font-bold text-green-600">{calculation.currentProgress.wipQty || 0}</p>
                            <p className="text-xs text-green-600 mt-1">10% sample checked</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-purple-200">
                            <p className="text-sm text-primary-600 mb-1">Remaining</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {Math.max(0, (calculation.currentProgress.cumAchieved || 0) - (calculation.currentProgress.wipQty || 0))}
                            </p>
                            <p className="text-xs text-orange-600 mt-1">yet to inspect</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quantity Received Today from Finishing */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 shadow-lg">
                      <label className="block text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <span className="text-2xl">📥</span>
                        Quantity Received Today from Finishing
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.inspectionReceivedQty || ''}
                        onChange={(e) => handleChange('inspectionReceivedQty' as keyof TaskUpdateData, e.target.value)}
                        placeholder="Enter quantity received today from Finishing..."
                        min="1"
                        step="1"
                        className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-primary-950 font-medium text-lg"
                      />
                      <div className="mt-3 bg-white border border-blue-200 rounded-lg p-3">
                        <p className="text-sm font-semibold text-blue-800 mb-2">After this entry:</p>
                        <div className="text-sm">
                          <span className="text-primary-700">Cumulative Received:</span>
                          <span className="ml-2 font-bold text-blue-700">
                            {(calculation?.currentProgress?.cumAchieved || 0) + (formData.inspectionReceivedQty || 0)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-blue-700 mt-2 flex items-center gap-1">
                        <span className="text-blue-500">ℹ️</span>
                        This tracks the cumulative quantity received from Finishing department
                      </p>
                    </div>

                    {/* Quantity Inspected Today (10% of received) */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 shadow-lg">
                      <label className="block text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
                        <span className="text-2xl">✅</span>
                        Quantity Inspected Today
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.actualQuantity || ''}
                        onChange={(e) => handleChange('actualQuantity' as keyof TaskUpdateData, e.target.value)}
                        placeholder="Enter quantity inspected today..."
                        min="1"
                        step="1"
                        className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-primary-950 font-medium text-lg"
                      />
                      

                      <div className="mt-4 bg-white border border-green-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-green-800 mb-2">After this entry:</p>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-primary-700">Total Received:</span>
                            <span className="ml-2 font-bold text-blue-700">
                              {(calculation?.currentProgress?.cumAchieved || 0) + (formData.inspectionReceivedQty || 0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-primary-700">Total Inspected:</span>
                            <span className="ml-2 font-bold text-green-700">
                              {(calculation?.currentProgress?.wipQty || 0) + (formData.actualQuantity || 0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-primary-700">Remaining:</span>
                            <span className="ml-2 font-bold text-orange-600">
                              {Math.max(0, (calculation?.currentProgress?.cumAchieved || 0) + (formData.inspectionReceivedQty || 0) - (calculation?.currentProgress?.wipQty || 0) - (formData.actualQuantity || 0))}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-green-700 mt-3 flex items-center gap-1">
                        <span className="text-green-500">ℹ️</span>
                        This creates a new daily entry.
                      </p>
                    </div>
                  </div>
                )}

                {/* Inherited Delay Insight - Show analysis before delay reason */}
                {isDelayed() && (
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-5 mb-4">
                    <p className="text-sm font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                      <span className="text-lg">🔍</span>
                      Delay Analysis
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Inherited Delay Info */}
                      {getInheritedDelayInfo().hasInheritedDelay && (
                        <div className="bg-white border border-yellow-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-primary-700 mb-1">Inherited Delay</p>
                          <p className="text-2xl font-bold text-yellow-700">
                            {getInheritedDelayInfo().inheritedDays}
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            days from previous process
                          </p>
                        </div>
                      )}

                      {/* Process-Specific Delay Info */}
                      {getProcessSpecificDelay() > 0 && (
                        <div className="bg-white border border-red-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-primary-700 mb-1">Own Process Delay</p>
                          <p className="text-2xl font-bold text-red-700">
                            {getProcessSpecificDelay()}
                          </p>
                          <p className="text-xs text-red-700 mt-1">
                            days from this process
                          </p>
                        </div>
                      )}

                      {/* On-Time Despite Inherited */}
                      {getInheritedDelayInfo().hasInheritedDelay && getProcessSpecificDelay() === 0 && (
                        <div className="bg-white border border-green-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-primary-700 mb-1">Your Process Performance</p>
                          <p className="text-base font-bold text-green-700">
                            ✓ On Time
                          </p>
                          <p className="text-xs text-green-700 mt-1">
                            despite inherited delay
                          </p>
                        </div>
                      )}

                      {/* Summary */}
                      {!getInheritedDelayInfo().hasInheritedDelay && (
                        <div className="col-span-2 bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-red-700">
                            ⚠️ This process started on time but finished late. The delay is due to your process performance.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Delay Reason - Only show if delayed */}
                {isDelayed() && (
                  <div className="bg-red-600 border-2 border-red-700 rounded-xl p-6 shadow-lg">
                    <label className="block text-lg font-semibold text-white mb-3 flex items-center gap-3">
                      <span className="text-2xl">⚠️</span>
                      <span className="uppercase tracking-wide">PROCESS DELAYED - Reason Required</span>
                    </label>
                    <select
                      value={formData.delayReason}
                      onChange={(e) => handleChange('delayReason', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white text-gray-900 font-medium text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={loadingDelayReasons}
                    >
                      <option value="">
                        {loadingDelayReasons ? 'Loading...' : 'Select delay reason...'}
                      </option>
                      <option value="N.A">N.A (Not Applicable)</option>
                      {delayReasons.map((reason) => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>

                    {/* Delay Remark/Note - Show when reason is selected */}
                    {formData.delayReason && (
                      <div className="mt-4">
                        <label className="block text-sm font-semibold text-white mb-2">Add Remarks (Optional)</label>
                        <textarea
                          value={formData.delayRemark || ''}
                          onChange={(e) => handleChange('delayRemark', e.target.value)}
                          placeholder="Provide additional details or notes about the delay..."
                          className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white text-primary-950 font-medium placeholder-primary-400 resize-vertical"
                          rows={3}
                        />
                      </div>
                    )}

                    <p className="text-sm font-medium text-white mt-4 flex items-center gap-2">
                      <span className="text-xl">🔴</span>
                      Actual end date is later than target end date. Please provide a reason for the delay.
                    </p>
                  </div>
                )}

                {/* No Delay Message */}
                {formData.actualEndDate && calculation?.currentProcess?.targetEnd && !isDelayed() && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Great! This task is on time or ahead of schedule.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-3 border border-gray-300 rounded-xl font-bold text-primary-700 hover:bg-gray-50 flex items-center gap-2 transition-all"
                    disabled={isSubmitting}
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset Form
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.ocNo}
                    className={"px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95 " + (
                      isSubmitting || !formData.ocNo
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-600 hover:to-primary-500'
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Update Status
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Calculation Steps - Right Side */}
          <div className="lg:col-span-1">
            {formData.ocNo && formData.processStage ? (
              // Changed sticky offset from top-8 to top-2
              <div className="bg-white rounded-2xl shadow-xl border border-primary-100 overflow-hidden sticky top-2">
                <div className="bg-gradient-to-r from-primary-800 to-primary-900 text-white p-4 flex items-center justify-between cursor-pointer" onClick={() => setShowCalculationSteps(!showCalculationSteps)}>
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    <h3 className="font-bold">Calculation Steps</h3>
                  </div>
                  {showCalculationSteps ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>

                {showCalculationSteps && (
                  <div className="p-4 max-h-[600px] overflow-y-auto">
                    {loadingCalculation ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : calculation?.success ? (
                      <div className="mb-4 space-y-3">
                        {/* BUYER INFO HEADER - Specifically for Fabric Inhouse as requested */}
                        {formData.processStage === 'Fabric Inhouse' && (
                          <div className="p-3 bg-purple-50 border-2 border-purple-200 rounded-xl">
                            <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-1">Buyer Details</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">👤</span>
                              <div>
                                <p className="text-sm font-black text-purple-950">{allOcData.find(o => o.ocNo === formData.ocNo)?.buyer || 'N/A'}</p>
                                <p className="text-[10px] text-purple-700 font-bold uppercase">{formData.ocNo}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* LEAD TIME SUMMARY - Now always visible at top of sidebar */}
                        <div className="p-4 bg-[#F0FDF4] border-2 border-[#BBF7D0] rounded-xl shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">SOP CALCULATION</p>
                              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-md shadow-sm">
                                <Calculator className="w-3 h-3" />
                                <span>RESULT</span>
                              </div>
                          </div>
                          <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-black text-emerald-900 tracking-tighter">
                                {calculation.timeline?.reduce((sum: number, p: any) => sum + (p.sopLt || 0), 0) || 0}
                              </span>
                              <span className="text-sm font-black text-emerald-700 uppercase tracking-widest">Days Total</span>
                          </div>

                          <div className="mt-3 pt-3 border-t border-emerald-200/50 flex items-center justify-between">
                            <div>
                              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Target Duration</p>
                              <p className="text-[11px] font-bold text-emerald-800">
                                {(() => {
                                  const sorted = [...(calculation.timeline || [])].sort((a, b) => a.seq - b.seq);
                                  const unique = sorted.filter((v, i, a) => a.findIndex(t => t.stage === v.stage) === i);
                                  if (unique.length === 0) return 'N/A';
                                  const start = new Date(unique[0].targetStart).toLocaleDateString('en-GB');
                                  const end = new Date(unique[unique.length - 1].targetEnd).toLocaleDateString('en-GB');
                                  return `${start} — ${end}`;
                                })()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter text-right">Current Stage</p>
                              <p className="text-[11px] font-bold text-emerald-800 text-right">{formData.processStage || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Stage Specific Match Info (if found) */}
                        {calculation.currentProcess ? (
                          <div className="px-1">
                            <div className="flex items-center gap-2 text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold">Matched: {calculation.currentProcess.stage} ({calculation.currentProcess.sopLt}d)</span>
                            </div>
                          </div>
                        ) : (
                          <div className="px-1">
                            <div className="flex items-center gap-2 text-amber-600">
                              <Clock className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold italic">Process mapping tentative</span>
                            </div>
                          </div>
                        )}

                        {/* TIMELINE BREAKDOWN - Now always visible if calculation is successful */}
                          <div className="space-y-4 pt-2">
                             <div className="flex items-center gap-2 px-2">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Timeline Breakdown</p>
                               <div className="h-px flex-1 bg-slate-100"></div>
                             </div>
                             
                             {(() => {
                               console.log('📑 Calculation Steps:', calculation?.steps);
                               return null;
                             })()}

                             {(calculation?.timeline || calculation?.allProcesses || [])?.length > 0 && (
                               <div className="mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                 <div className="flex items-center gap-2 mb-3 text-slate-800">
                                   <Calculator className="w-4 h-4 text-emerald-600" />
                                   <span className="text-xs font-bold uppercase tracking-wider">SOP CALCULATION SUMMARY</span>
                                 </div>
                                 <div className="grid grid-cols-2 gap-3">
                                   <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                      <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total SOP LT</div>
                                      <div className="text-lg font-black text-emerald-700">
                                        {(calculation?.timeline || calculation?.allProcesses || []).reduce((sum, p) => sum + (Number(p.sopLt) || 0), 0)} <span className="text-xs font-medium">days</span>
                                      </div>
                                   </div>
                                   <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                      <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Target End</div>
                                      <div className="text-sm font-black text-slate-800">
                                        {(() => {
                                          const sorted = [...(calculation?.timeline || calculation?.allProcesses || [])].sort((a, b) => 
                                            new Date(b.targetEnd).getTime() - new Date(a.targetEnd).getTime()
                                          );
                                          const last = sorted[0];
                                          return last ? parseDateRobustly(last.targetEnd)?.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }) : 'N/A';
                                        })()}
                                      </div>
                                   </div>
                                 </div>
                               </div>
                             )}

                             <div className="space-y-1.5">
                               {calculation?.steps?.map((stepIn, index) => {
                                const step = String(stepIn || '');
                                // Detect types with robust matching
                                const isHoliday = step.includes('🗓️') || step.toUpperCase().includes('HOLIDAY') || step.toUpperCase().includes('SUNDAY');
                                const isSkip = step.includes('Skip') && !isHoliday;
                                const isSupermarket = step.includes('🔋') || step.toUpperCase().includes('SUPERMARKET') || step.toUpperCase().includes('BUFFER');
                                const isAnchor = step.includes('⚓') || step.includes('📌') || step.toUpperCase().includes('ANCHOR');
                                const isProcess = step.includes('⬇️') || step.includes('⬆️') || step.includes('◆');
                                
                                // 1. EXTRACT DATE: Robust check for [dd/mm - dd/mm] OR YYYY-MM-DD [arrow] YYYY-MM-DD
                                let dateDisplay = '';
                                const dateMatch = step.match(/\[(\d{2}\/\d{2}(?:\s*[\-\—]\s*\d{2}\/\d{2})?)\]/);
                                
                                if (dateMatch) {
                                  dateDisplay = dateMatch[1];
                                } else {
                                  const isoMatch = step.match(/(\d{4}-\d{2}-\d{2})\s*(?:-|>|->|—)\s*(\d{4}-\d{2}-\d{2})/);
                                  if (isoMatch) {
                                    try {
                                      const d1 = new Date(isoMatch[1]);
                                      const d2 = new Date(isoMatch[2]);
                                      if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
                                        dateDisplay = `${d1.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })} — ${d2.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}`;
                                      }
                                    } catch {}
                                  }
                                }

                                // Clean string for display while preserving key labels
                                let stepClean = step
                                  .replace(/\[\d{2}\/\d{2}\s*[\-\—]\s*\d{2}\/\d{2}\]/, '')
                                  .replace(/\[\d{2}\/\d{2}\]/, '')
                                  .replace(/\d{4}-\d{2}-\d{2}\s*(?:-|>|->|—)\s*\d{4}-\d{2}-\d{2}/, '')
                                  .replace(/[🗓️🔋⚓📌⬇️⬆️◆]/g, '')
                                  .trim();

                                // Format Match Trace
                                if (stepClean.includes('(') && stepClean.includes(')')) {
                                  stepClean = stepClean.replace(/\(([^)]+)\)/g, (match, content) => {
                                    return `\n${content.replace(/[\/\|]/g, ' • ')}`;
                                  });
                                }
                               
                               return (
                                 <div 
                                   key={index} 
                                   className={"group relative text-[11px] font-bold leading-tight px-3 py-2.5 rounded-xl border flex flex-col gap-1 transition-all hover:shadow-md " + (
                                     isHoliday ? 'text-rose-700 bg-rose-50 border-rose-100 italic' :
                                     isSkip ? 'text-amber-700 bg-amber-50 border-amber-100' :
                                     isSupermarket ? 'text-blue-700 bg-blue-50 border-blue-200 shadow-sm font-black' :
                                     isAnchor ? 'text-indigo-900 bg-indigo-50 border-indigo-200 font-extrabold' :
                                     isProcess ? 'text-emerald-900 bg-white border-emerald-100 shadow-sm' :
                                     'text-slate-700 bg-slate-50 border-slate-100'
                                   )}
                                 >
                                   <div className="flex items-start justify-between gap-3">
                                     <div className="flex items-center gap-2 flex-1">
                                       <div className={"p-1.5 rounded-lg shrink-0 " + (
                                         isHoliday ? 'bg-rose-100 text-rose-600' :
                                         isSupermarket ? 'bg-blue-100 text-blue-600' :
                                         isAnchor ? 'bg-indigo-100 text-indigo-600' :
                                         isProcess ? 'bg-emerald-100 text-emerald-600' :
                                         'bg-slate-100 text-slate-500'
                                        )}>
                                         {isHoliday ? <Calendar className="w-3 h-3" /> : 
                                          isSupermarket ? <Battery className="w-3 h-3" /> :
                                          isAnchor ? <Anchor className="w-3 h-3" /> :
                                          isProcess ? <CheckCircle2 className="w-3 h-3" /> :
                                          <ArrowRight className="w-3 h-3" />}
                                       </div>
                                         <span className="leading-snug whitespace-pre-line">{stepClean}</span>
                                     </div>
                                     
                                     {dateDisplay && (
                                       <div className={"shrink-0 px-2 py-1 rounded-lg text-[10px] font-black border tracking-tighter whitespace-nowrap " + (
                                         isHoliday ? 'bg-rose-600 text-white border-rose-500 animate-pulse' : 
                                         isProcess ? 'bg-emerald-600 text-white border-emerald-500' : 
                                         isSupermarket ? 'bg-blue-600 text-white border-blue-500' :
                                         'bg-slate-700 text-white border-slate-600'
                                        )}>
                                         {dateDisplay}
                                       </div>
                                     )}
                                   </div>
                                 </div>
                               );
                             })}
                          </div>

                          {!calculation?.currentProcess && (
                            <div className="text-amber-700 text-sm p-4 bg-amber-50 rounded-lg border border-amber-200 mt-2">
                              <p className="font-bold mb-1">⚠️ Mapping Issue</p>
                              <p className="text-xs">
                                Your plan is generated, but the stage "{formData.processStage}" doesn't have an exact target date match.
                              </p>
                              <p className="text-[10px] mt-2 text-amber-600">
                                Available stages: {[...new Set(calculation?.allProcesses?.map(p => p.stage) || [])].join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (calculation?.error) ? (
                      <div className="text-amber-800 text-sm p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <div className="flex items-center gap-2 font-bold mb-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>Calculation Preview Unavailable</span>
                        </div>
                        <p className="text-amber-700 leading-relaxed">{calculation.error}</p>
                      </div>
                    ) : (
                      <div className="text-primary-600 text-sm text-center py-8">
                        Select OC NO and Process Stage to see calculation steps
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-primary-100 overflow-hidden sticky top-2">
                <div className="bg-gradient-to-r from-primary-400 to-primary-500 text-white p-4">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    <h3 className="font-bold">Calculation Steps</h3>
                  </div>
                </div>
                <div className="p-8 text-center text-primary-400">
                  <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50 text-primary-400" />
                  <p className="text-sm text-primary-500">Select OC NO and Process Stage to preview calculation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}