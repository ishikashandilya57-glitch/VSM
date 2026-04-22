'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, ComposedChart, Line, Area,
  ScatterChart, Scatter, ZAxis, FunnelChart, Funnel, LabelList,
  Sankey, Rectangle
} from 'recharts';
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, TrendingUp, Package, Users, Activity, Zap, Target, Calendar, GitBranch, BarChart3, FileText, Edit3, LayoutDashboard, Download, ChevronLeft, ChevronRight, RotateCcw, ChevronDown, Filter, Search } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Sidebar, Header, TabNavigation, KPICard, FilterBar, ChartCard, StatusBadge, DataTable } from '@/components';
import TaskUpdatePageEnhanced from '@/components/TaskUpdatePageEnhanced';
import UploadPlan from '@/components/UploadPlan';
import { getFactoryConfig } from '@/lib/factory';
import { apiGet } from '@/lib/api';

// Global lock to prevent concurrent initialization fetches in Dev (Strict Mode)
let globalInitialFetchPromise: Promise<any> | null = null;

type FetchOptions = {
  bypassCache?: boolean;
};

interface ProductionData {
  ocNo: string;
  orderNo: string;
  productType: string;
  deliveryDate: string;
  processSeq: number;
  processStage: string;
  vaNva: string;
  sopLeadTime: number;
  targetStartDate: string;
  targetEndDate: string;
  actualStartDate: string;
  actualEndDate: string;
  processStatus: string;
  processTime: number;
  waitingTime: number;
  variance: number;
  delayReasonCategory: string;
  alertTriggered: string;
  delayFlag: string;
  delayReason: string;
  riskLevel: string;
  execKey: string;
  lineNo?: string;
  sm1?: number;
  sm2?: number;
  sm3?: number;
  sm4?: number;
  sm5?: number;
  sm6?: number;
  totalSupermarket?: number;
  qtyAchievedToday?: number;
  orderQty?: number;
  cumAchieved?: number;
  wipQty?: number;
  completionStatus?: string;
  inheritedDelay?: number;
  processDelay?: number;
  delayType?: string;
  delayRemark?: string;
  vaTime?: number;
  nvaTime?: number;
  audit?: string;
  isTentative?: boolean;
}

interface ProductionDashboardProps {
  factory?: string;
}

const normalizeStage = (s: string) => 
  String(s || '').toUpperCase().replace(/^[\d\s\W]+/, '').replace(/\s+/g, '');

// Robust helper to parse dates including DD/MM/YYYY format
const parseDateSafe = (val: any) => {
  if (!val || val === '' || val === 'N/A') return null;
  const d = new Date(val);
  if (!isNaN(d.getTime())) return d;
  
  // Try DD/MM/YYYY
  const parts = String(val).split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const d2 = new Date(year, month, day);
    if (!isNaN(d2.getTime())) return d2;
  }
  return null;
};

const ProductionDashboard = ({ factory: factoryProp }: ProductionDashboardProps) => {
  const params = useParams();
  const factory = factoryProp || (params?.factory as string) || 'dbr';
  const factoryConfig = getFactoryConfig(factory);

  const [selectedProcess, setSelectedProcess] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedLine, setSelectedLine] = useState('All');
  const [selectedPlant, setSelectedPlant] = useState('All Plants');
  const [activeTab, setActiveTab] = useState('overview');
  const [activeViewTab, setActiveViewTab] = useState('chart');
  const [activeSidebarItem, setActiveSidebarItem] = useState<'dashboard' | 'update-task' | 'upload-plan' | 'home'>('home');
  const [rawData, setRawData] = useState<ProductionData[]>([]);
  const [wlpOcs, setWlpOcs] = useState<{ocNo: string, lineNo: string, productType: string, deliveryDate: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTime, setLoadingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lineOptions, setLineOptions] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchMessage, setFetchMessage] = useState<string | null>(null);
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [selectedKPIData, setSelectedKPIData] = useState<{ title: string; orders: string[] }>({ title: '', orders: [] });
  const [selectedQueueProcess, setSelectedQueueProcess] = useState('Cutting');
  const [selectedDelayDetail, setSelectedDelayDetail] = useState<{ ocNo: string; stage: string; status: string; reason: string; remark: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [queueTimeFilter, setQueueTimeFilter] = useState<'All' | 'Today' | 'Weekly' | 'Monthly' | 'Yearly'>('All');
  const [queueReferenceDate, setQueueReferenceDate] = useState(new Date());

  const isFetchingRef = React.useRef(false); // Ref to prevent overlapping fetches


  // Handle sidebar navigation
  const handleSidebarNavigation = (item: 'home' | 'dashboard' | 'update-task' | 'upload-plan') => {
    setActiveSidebarItem(item);
  };

  // Fetch data from Google Sheets via API
  const fetchData = async (isInitial = false, options: FetchOptions = {}) => {
    if (!factory || isFetchingRef.current) return;
    
    // Prevent double initial fetch in Strict Mode
    if (isInitial && !options.bypassCache && globalInitialFetchPromise && rawData.length === 0) {
      console.log('⏳ Waiting for already running initial fetch...');
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsRefreshing(true);
      
      // Only clear global error on initial load or if we had one
      if (isInitial || error) setError(null);
      setSyncError(null); 

      // Fetch production data - updated to be factory-aware with a 1000 record limit for speed
      const fetchUrl = `/api/${factory}/production_data?limit=1000${options.bypassCache ? '&refresh=1' : ''}`;
      console.log(`🔍 Fetching: ${fetchUrl}`);
      
      const fetchPromise = apiGet(fetchUrl, { timeout: 150000, retries: 0 }); // 150s, 0 retries
      
      if (isInitial && !options.bypassCache && rawData.length === 0) {
        globalInitialFetchPromise = fetchPromise;
      }

      const result = await fetchPromise;

      if (result.success) {
        // Decompress if in column/row format
        let finalData = result.data;
        if (result.data && result.data.columns && Array.isArray(result.data.rows)) {
          const { columns, rows } = result.data;
          
          // Robust helper to parse numerics even from formatted strings (e.g. "1,200", "$4.5")
          const parseFloatSafe = (val: any): number => {
            if (val === null || val === undefined || val === '') return 0;
            if (typeof val === 'number') return val;
            const sanitized = String(val).replace(/[^0-9.-]+/g, '');
            const parsed = parseFloat(sanitized);
            return isNaN(parsed) ? 0 : parsed;
          };

          // Robust helper to find index by header name with alias support (robust normalization)
          const getIdx = (name: string, aliases: string[] = [], silent: boolean = false) => {
            const normalize = (s: string) => String(s || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
            const searchTerms = [name, ...aliases].map(normalize);
            const idx = columns.findIndex((h: string) => searchTerms.includes(normalize(h)));
            if (idx === -1 && !silent) console.warn(`🔍 Column not found: "${name}" (Aliases: ${aliases.join(', ')})`);
            return idx;
          };

          console.log('📑 SYNC: Mapping Columns from detected headers:', columns);
          // DEBUG: Log first row to see data types
          if (rows.length > 0) console.log('📑 DEBUG: First raw row:', rows[0]);


          const ocIdx = getIdx('OC NO', ['OC #', 'ORDER CODE']);
          const ordIdx = getIdx('ORDER NO', ['ORDER #', 'ORD NO']);
          const lineIdx = getIdx('LINE NO', ['LINE NO.', 'LINE #', 'PRODUCTION LINE']);
          const washIdx = getIdx('WASH CATEGORY', ['WASH TYPE', 'WASH']);
          const delIdx = getIdx('DELIVERY DATE', ['DEL DATE', 'EX-FACTORY']);
          const stageIdx = getIdx('PROCESS STAGE', ['STAGE', 'CURRENT STAGE']);
          const statusIdx = getIdx('PROCESS STATUS', ['STATUS', 'CURRENT STATUS']);
          const varIdx = getIdx('VARIANCE', ['VAR', 'DELAY DAYS', 'VARIANCE (DAYS)']);
          const reasonIdx = getIdx('DELAY REASON', ['REASON', 'REASON FOR DELAY']);
          const riskIdx = getIdx('RISK LEVEL', ['RISK', 'CRITICALITY']);
          const timeIdx = getIdx('PROCESS TIME', ['LEAD TIME', 'PROCESS LT', 'PROCESS TIME (DAYS)']);
          const vaIdx = getIdx('VA / NVA', ['TYPE', 'VA TYPE']);
          const seqIdx = getIdx('PROCESS SEQ', ['SEQ', 'STAGE ORDER']);
          const sopIdx = getIdx('SOP LEAD TIME', ['SOP LT', 'TARGET DAYS']);
          const tsIdx = getIdx('TARGET START DATE', ['TSD', 'TARGET START']);
          const teIdx = getIdx('TARGET END DATE', ['TED', 'TARGET FINISH', 'TARGET DATE', 'FINISH DATE', 'END DATE']);
          const asIdx = getIdx('ACTUAL START DATE', ['ASD', 'ACTUAL START']);
          const aeIdx = getIdx('ACTUAL END DATE', ['AED', 'ACTUAL FINISH']);
          const remIdx = getIdx('DELAY REMARK', ['REMARK', 'REMARKS', 'COMMENTS', 'DELAY_REMARK']);
          const oQtyIdx = getIdx('ORDER QTY', ['QTY', 'ORDER QUANTITY', 'OR QTY', 'ORDER_QTY', 'ORDER QTY (DERIVED)']);
          const cumIdx = getIdx('TOTAL QTY', ['CUM ACHIEVED', 'TOTAL ACHIEVED', 'ACTUAL QTY', 'CUM QTY', 'CUM_ACHIEVED']);
          const wipIdx = getIdx('WIP QTY', ['WIP', 'WIP QUANTITY', 'TOTAL WIP', 'ON-FLOOR QTY', 'WIP_QTY']);
          const sm1Idx = getIdx('SM1', ['SUPERMARKET 1', 'PRE-PROD WAIT', 'SM1_QTY'], true);
          const sm2Idx = getIdx('SM2', ['SUPERMARKET 2', 'PRE-CUT WAIT', 'SM2_QTY'], true);
          const sm3Idx = getIdx('SM3', ['SUPERMARKET 3', 'CUTTING WIP', 'SM3_QTY'], true);
          const sm4Idx = getIdx('SM4', ['SUPERMARKET 4', 'SEWING WIP', 'SM4_QTY'], true);
          const sm5Idx = getIdx('SM5', ['SUPERMARKET 5', 'FINISHING WIP', 'SM5_QTY'], true);
          const sm6Idx = getIdx('SM6', ['SUPERMARKET 6', 'CARTON WAIT', 'SM6_QTY'], true);
          const tsmIdx = getIdx('TOTAL SUPERMARKET', ['TOTAL SM', 'SM TOTAL', 'ACCUMULATED SM', 'TOTAL_SUPERMARKET'], true);
          const vaTimeIdx = getIdx('VA TIME', ['VA', 'VA_TIME', 'VALUE ADD TIME', 'VA TIME (DAYS)']);
          const nvaTimeIdx = getIdx('NVA TIME', ['NVA', 'NVA_TIME', 'NON VALUE ADD TIME', 'NVA TIME (DAYS)']);


          finalData = rows.map((r: any[]) => ({
            ocNo: String(r[ocIdx] || ''),
            orderNo: String(r[ordIdx] || ''),
            lineNo: String(r[lineIdx] || ''),
            washCategory: String(r[washIdx] || ''),
            deliveryDate: String(r[delIdx] || ''),
            processStage: String(r[stageIdx] || ''),
            processStatus: String(r[statusIdx] || ''),
            variance: parseFloatSafe(r[varIdx]),
            delayReason: String(r[reasonIdx] || ''),
            riskLevel: String(r[riskIdx] || 'Low'),
            processTime: parseFloatSafe(r[timeIdx]),
            vaNva: String(r[vaIdx] || 'VA'),
            processSeq: parseFloatSafe(r[seqIdx]),
            sopLeadTime: parseFloatSafe(r[sopIdx]),
            targetStartDate: String(r[tsIdx] || ''),
            targetEndDate: String(r[teIdx] || ''),
            actualStartDate: String(r[asIdx] || ''),
            actualEndDate: String(r[aeIdx] || ''),
            delayRemark: String(r[remIdx] || ''),
            orderQty: parseFloatSafe(r[oQtyIdx]),
            cumAchieved: parseFloatSafe(r[cumIdx]),
            wipQty: parseFloatSafe(r[wipIdx]),
            sm1: parseFloatSafe(r[sm1Idx]),
            sm2: parseFloatSafe(r[sm2Idx]),
            sm3: parseFloatSafe(r[sm3Idx]),
            sm4: parseFloatSafe(r[sm4Idx]),
            sm5: parseFloatSafe(r[sm5Idx]),
            sm6: parseFloatSafe(r[sm6Idx]),
            totalSupermarket: parseFloatSafe(r[tsmIdx]),
            vaTime: parseFloatSafe(r[vaTimeIdx]),
            nvaTime: parseFloatSafe(r[nvaTimeIdx])

          }));
          
          console.log(`📦 Client-side decompressed and mapped ${rows.length} records`);
          // DEBUG: Check a few rows for targetEndDate values
          const sampleWithDates = finalData.slice(0, 10).map((d: any) => ({ stage: d.processStage, target: d.targetEndDate }));
          console.log('📑 DEBUG: Target Date Mapping Samples:', sampleWithDates);
        }
        
        setRawData(finalData);
        if (result.data && result.data.wlpOcs) {
          setWlpOcs(result.data.wlpOcs);
        }
        if (finalData && Array.isArray(finalData)) {
          const availableStages = [...new Set(finalData.map((d: any) => d.processStage))];
          console.log('📑 Available Stages in rawData:', availableStages);
          // DEBUG: Log if Fabric QC is found
          const fabricQcFound = finalData.some((d: any) => normalizeStage(d.processStage) === normalizeStage('Fabric QC'));
          console.log(`📑 DEBUG: Fabric QC found? ${fabricQcFound}`);
        }

        setFetchMessage(result.message || null);
        setError(null);
        setSyncError(null);
        setLastUpdated(new Date());

        // Update line options from production data as fallback or sync
        if (finalData && Array.isArray(finalData)) {
          const uniqueLines = [...new Set(finalData.map((d: ProductionData) => d.lineNo).filter(Boolean))] as string[];
          setLineOptions(['All', ...uniqueLines.sort()]);
        }
      } else {
        const errorMsg = result.error || 'Failed to fetch data';
        if (rawData.length === 0) {
          setError(errorMsg);
        } else {
          setSyncError(`Background update failed: ${errorMsg}`);
        }
      }

      // Fetch line options from API as source of truth for all lines
      try {
        const linesResult = await apiGet(`/api/${factory}/lines`);
        if (linesResult.success) {
          setLineOptions(['All', ...linesResult.data]);
        }
      } catch (lineErr) {
        console.warn('Failed to fetch full line list, using data from production feed');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      const isNetworkError = err instanceof TypeError && err.message.toLowerCase().includes('fetch');
      const isTimeout = err instanceof Error && (err.message.includes('timeout') || err.message.includes('Aborted'));

      // If we have existing data and this is a background refresh, don't alert about network blips
      if (!isInitial && rawData.length > 0 && isNetworkError) {
        console.warn('⚠️ Background refresh network error (suppressed, data still shown):', err);
        return;
      }
      
      const errorMsg = isTimeout
        ? '🕒 Connection Slow: The server is taking too long to respond. Google Sheets might be under heavy load.'
        : isNetworkError 
          ? '⚠️ Connection Error: Cannot reach the server. Please check your internet connection or local server status.' 
          : `❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
      
      if (rawData.length === 0) {
        setError(errorMsg);
      } else {
        setSyncError(errorMsg);
      }
    } finally {
      if (isInitial) globalInitialFetchPromise = null;
      setLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData(true);

    // Initial loading timer
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setInterval(() => {
        setLoadingTime(prev => prev + 1);
      }, 1000);
    }

    // Auto-refresh periodically
    const interval = setInterval(() => {
      fetchData(false);
    }, 60000); // 60 seconds

    // Cleanup interval on unmount
    return () => {
      clearInterval(interval);
      if (timer) clearInterval(timer);
    };
  }, []); // Run only on mount to prevent infinite loops

  const mainTabs = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'analytics', label: 'ANALYTICS' },
    { id: 'supermarket', label: 'SUPERMARKET' },
    { id: 'wip', label: 'WIP' },
    { id: 'process-queue', label: 'PROCESS QUEUE' },
    { id: 'reports', label: 'REPORTS' },
  ];

  // OC Context Map - Canonical data for each OC to fix missing metadata in specific rows
  const ocContextMap = useMemo(() => {
    const map = new Map<string, { lineNo: string; productType: string; deliveryDate: string }>();
    
    // 1. Seed from execution data first (actuals)
    rawData.forEach(item => {
      const existing = map.get(item.ocNo);
      if (!existing || (!existing.lineNo && item.lineNo)) {
        map.set(item.ocNo, {
          lineNo: item.lineNo || existing?.lineNo || '',
          productType: item.productType || existing?.productType || 'All',
          deliveryDate: item.deliveryDate || existing?.deliveryDate || ''
        });
      }
    });

    // 2. Supplement with WLP data (Master Plan)
    wlpOcs.forEach(oc => {
      const existing = map.get(oc.ocNo);
      map.set(oc.ocNo, {
        lineNo: oc.lineNo || existing?.lineNo || '',
        productType: oc.productType || existing?.productType || 'All',
        deliveryDate: oc.deliveryDate || existing?.deliveryDate || ''
      });
    });
    
    return map;
  }, [wlpOcs, rawData]);

  // Sync Queue Stage selection with Global Stage selection
  useEffect(() => {
    if (selectedProcess !== 'All') {
      setSelectedQueueProcess(selectedProcess);
    }
  }, [selectedProcess]);

  // 1. First, enrich ALL raw data with calculations & Context
  const allEnrichedData = useMemo(() => {
    return rawData.map(item => {
      let finalStatus = 'Not Started';
      let finalVariance = 0;
      let finalRiskLevel: 'High' | 'Medium' | 'Low' = 'Low';

      const actualStart = item.actualStartDate;
      const actualEnd = item.actualEndDate;
      const targetEnd = item.targetEndDate;
      const orderQty = item.orderQty || 0;
      const cumAchieved = item.cumAchieved || 0;

      // Completion check: either by date OR by quantity (for transactional processes)
      const isTransactional = ['Cutting', 'Sewing', 'Washing', 'Finishing', 'Inspection'].includes(item.processStage);
      const isQtyCompleted = isTransactional && orderQty > 0 && cumAchieved >= orderQty;
      const isActuallyCompleted = !!actualEnd || isQtyCompleted;

      const hasValidDates = actualEnd && targetEnd;
      let varianceFromDates: number | null = null;
      if (hasValidDates) {
        try {
          const actualEndDate = parseDateSafe(actualEnd);
          const targetEndDate = parseDateSafe(targetEnd);
          if (actualEndDate && targetEndDate) {
            varianceFromDates = Math.ceil((actualEndDate.getTime() - targetEndDate.getTime()) / (1000 * 60 * 60 * 24));
          }
        } catch { /* ignore */ }
      }

      if (varianceFromDates !== null) {
        finalVariance = varianceFromDates;
      } else if (item.variance !== undefined && item.variance !== null && !isNaN(item.variance)) {
        finalVariance = item.variance;
      }

      // If completed by quantity but no actualEnd is present, we estimate variance from today if past target, or 0
      if (isQtyCompleted && !actualEnd && targetEnd) {
         try {
           const targetEndDate = new Date(targetEnd);
           if (!isNaN(targetEndDate.getTime())) {
              const today = new Date();
              const variance = Math.ceil((today.getTime() - targetEndDate.getTime()) / (1000 * 60 * 60 * 24));
              finalVariance = Math.max(finalVariance, variance);
           }
         } catch {}
      }

      if (varianceFromDates !== null || isQtyCompleted) {
        if (!actualStart || actualStart === '' || actualStart === null) {
          finalStatus = 'Not Started';
        } else if (actualStart && !isActuallyCompleted) {
          finalStatus = 'In Progress';
        } else {
          if (item.processStage === 'Dispatch' && actualEnd) {
             finalStatus = finalVariance <= 0 ? 'Shipped - On Time' : 'Shipped - Delayed';
          } else {
             finalStatus = finalVariance <= 0 ? 'Completed - On Time' : 'Completed - Delayed';
          }
        }
      } else {
        const backendStatus = item.processStatus?.trim();
        const isValidBackendStatus = backendStatus && !backendStatus.includes('#ERROR!') && !backendStatus.includes('#REF!') && backendStatus !== '';
        
        if (isValidBackendStatus) {
           finalStatus = backendStatus.replace(/–/g, '-');
        } else {
          if (!actualStart || actualStart === '' || actualStart === null) {
            finalStatus = 'Not Started';
          } else if (actualStart && !actualEnd) {
            finalStatus = 'In Progress';
          } else if (actualEnd && targetEnd) {
            try {
              const actualEndDate = new Date(actualEnd);
              const targetEndDate = new Date(targetEnd);
              if (!isNaN(actualEndDate.getTime()) && !isNaN(targetEndDate.getTime())) {
                if (item.processStage === 'Dispatch') {
                  finalStatus = finalVariance <= 0 ? 'Shipped - On Time' : 'Shipped - Delayed';
                } else {
                  finalStatus = finalVariance <= 0 ? 'Completed - On Time' : 'Completed - Delayed';
                }
              }
            } catch { /* ignore */ }
          }
        }

        if (isQtyCompleted) {
          finalStatus = finalVariance <= 0 ? 'Completed - On Time' : 'Completed - Delayed';
        }
      }

      if (finalVariance > 7) finalRiskLevel = 'High';
      else if (finalVariance > 3) finalRiskLevel = 'Medium';
      else finalRiskLevel = 'Low';

      const context = ocContextMap.get(item.ocNo);

      return {
        ...item,
        lineNo: item.lineNo || context?.lineNo || '',
        productType: item.productType || context?.productType || 'All',
        calculatedStatus: finalStatus,
        calculatedVariance: finalVariance,
        calculatedRiskLevel: finalRiskLevel,
      };
    });
  }, [rawData, ocContextMap]);

  // 2. Base filter applied (Shared by all tabs - respects Line, Product, and Search)
  const baseFilteredData = useMemo(() => {
    return allEnrichedData.filter(item => {
      const lineMatch = selectedLine === 'All' || item.lineNo === selectedLine;
      const productMatch = selectedProduct === 'All' || item.productType === selectedProduct;
      const ocMatch = !searchTerm || item.ocNo.toLowerCase().includes(searchTerm.toLowerCase());
      return lineMatch && productMatch && ocMatch;
    });
  }, [allEnrichedData, selectedLine, selectedProduct, searchTerm]);

  // 3. Stage-only filter (For WIP & Supermarket - ignores Status)
  const stageFilteredData = useMemo(() => {
    return baseFilteredData.filter(item => {
      return selectedProcess === 'All' || item.processStage === selectedProcess;
    });
  }, [baseFilteredData, selectedProcess]);
  
  // 4. Global Dashboard Filter (Additionally respects Status)
  const globallyFilteredData = useMemo(() => {
    return stageFilteredData.filter(item => {
      return selectedStatus === 'All' || item.calculatedStatus === selectedStatus;
    });
  }, [stageFilteredData, selectedStatus]);

  // 5. Technical Tabs Data (For WIP & Supermarket - ignores ONLY Status filter)
  // This ensures Process Stage filtering still works for technical overview.
  const technicalTabsData = useMemo(() => {
    return stageFilteredData; 
  }, [stageFilteredData]);



  // Indexed data for O(1) lookup: ocNo -> stage -> item
  const indexedData = useMemo(() => {
    const map = new Map<string, Map<string, any>>();
    allEnrichedData.forEach(item => {
      if (!map.has(item.ocNo)) {
        map.set(item.ocNo, new Map<string, any>());
      }
      map.get(item.ocNo)!.set(item.processStage, item);
    });
    return map;
  }, [allEnrichedData]);



  // Supermarket metrics calculation (for SUPERMARKET tab)
  const supermarketMetrics = useMemo(() => {
    // Respects Line/Product/Search but ignores Stage/Status filters
    if (technicalTabsData.length === 0) {
      return {
        summary: { sm1: 0, sm2: 0, sm3: 0, sm4: 0, sm5: 0, sm6: 0, total: 0 },
        details: []
      };
    }


    const orderMap = new Map<string, {
      ocNo: string;
      orderNo: string;
      sm1: number; sm2: number; sm3: number; sm4: number; sm5: number; sm6: number; total: number;
    }>();

    // Aggregation logic: Derive supermarkets from process-level NVA_TIME 
    // or take saved values from the sheet as fallback.
    technicalTabsData.forEach(item => {
      const existing = orderMap.get(item.ocNo);
      if (!existing) {
        orderMap.set(item.ocNo, { 
          ocNo: item.ocNo,
          orderNo: item.orderNo || '',
          sm1: 0, sm2: 0, sm3: 3, sm4: 3, sm5: 0, sm6: 1, total: 7
        });
      }
      
      const current = orderMap.get(item.ocNo)!;
      const stage = normalizeStage(item.processStage);
      
      // Derive from NVA_TIME based on Stage
      if (stage === 'pre-production') current.sm1 = Math.max(current.sm1, item.nvaTime || item.sm1 || 0);
      if (stage === 'cutting')        current.sm2 = Math.max(current.sm2, item.nvaTime || item.sm2 || 0);
      if (stage === 'finishing')      current.sm5 = Math.max(current.sm5, item.nvaTime || item.sm5 || 0);
      
      // Fallback for fixed buffers if explicitly saved in sheet
      if (item.sm3 && item.sm3 > 0) current.sm3 = Math.max(current.sm3, item.sm3);
      if (item.sm4 && item.sm4 > 0) current.sm4 = Math.max(current.sm4, item.sm4);
      if (item.sm6 && item.sm6 > 0) current.sm6 = Math.max(current.sm6, item.sm6);

      // Recalculate total
      current.total = current.sm1 + current.sm2 + current.sm3 + current.sm4 + current.sm5 + current.sm6;
    });



    const details = Array.from(orderMap.values()).sort((a, b) => b.total - a.total);

    // Calculate averages
    const count = details.length || 1;
    const summary = {
      sm1: Math.round((details.reduce((sum, o) => sum + o.sm1, 0) / count) * 10) / 10,
      sm2: Math.round((details.reduce((sum, o) => sum + o.sm2, 0) / count) * 10) / 10,
      sm3: Math.round((details.reduce((sum, o) => sum + o.sm3, 0) / count) * 10) / 10,
      sm4: Math.round((details.reduce((sum, o) => sum + o.sm4, 0) / count) * 10) / 10,
      sm5: Math.round((details.reduce((sum, o) => sum + o.sm5, 0) / count) * 10) / 10,
      sm6: Math.round((details.reduce((sum, o) => sum + o.sm6, 0) / count) * 10) / 10,
      total: Math.round((details.reduce((sum, o) => sum + o.total, 0) / count) * 10) / 10,
    };

    return { summary, details };
  }, [technicalTabsData]);


  // KPI Click Handlers
  const handleKPIClick = (category: 'total' | 'onTime' | 'delayed' | 'highRisk') => {
    let orders: string[] = [];
    let title = '';

    const uniqueOrderIds = new Set(globallyFilteredData.map(d => d.ocNo));

    switch (category) {
      case 'total':
        title = 'All Orders';
        orders = Array.from(uniqueOrderIds);
        break;

      case 'onTime':
        title = 'On-Time Orders';
        orders = Array.from(new Set(
          globallyFilteredData.filter(d => d.calculatedStatus && d.calculatedStatus.includes('On Time')).map(d => d.ocNo)
        ));
        break;

      case 'delayed':
        title = 'Delayed Orders';
        orders = Array.from(new Set(
          globallyFilteredData.filter(d =>
            (d.calculatedStatus && (d.calculatedStatus.includes('Delayed') || d.calculatedStatus.includes('delayed'))) ||
            d.calculatedVariance > 0
          ).map(d => d.ocNo)
        ));
        break;

      case 'highRisk':
        title = 'High Risk Orders';
        orders = Array.from(new Set(
          globallyFilteredData.filter(d => d.calculatedRiskLevel === 'High').map(d => d.ocNo)
        ));
        break;
    }

    setSelectedKPIData({ title, orders: orders.sort() });
    setShowKPIModal(true);
  };

  // KPI Calculations
  const kpis = useMemo(() => {
    if (globallyFilteredData.length === 0) {
      return {
        total: 0,
        onTime: 0,
        delayed: 0,
        onTimeRate: '0.0',
        delayedRate: '0.0',
        avgVariance: '0.00',
        highRisk: 0,
        highRiskRate: '0.0'
      };
    }

    const uniqueOrderIds = new Set(globallyFilteredData.map(d => d.ocNo));
    const total = uniqueOrderIds.size;

    const onTimeOrders = new Set(
      globallyFilteredData.filter(d => d.calculatedStatus && d.calculatedStatus.includes('On Time')).map(d => d.ocNo)
    ).size;

    const delayedOrders = new Set(
      globallyFilteredData.filter(d => {
        const isDelayedStatus = d.calculatedStatus && (d.calculatedStatus.includes('Delayed') || d.calculatedStatus.includes('delayed'));
        const isDelayedByVariance = d.calculatedVariance > 0;
        return isDelayedStatus || isDelayedByVariance;
      }).map(d => d.ocNo)
    ).size;

    const highRiskOrders = new Set(
      globallyFilteredData.filter(d => d.calculatedRiskLevel === 'High').map(d => d.ocNo)
    ).size;

    const validVariances = globallyFilteredData.filter(d =>
      typeof d.calculatedVariance === 'number' &&
      !isNaN(d.calculatedVariance) &&
      d.calculatedStatus.includes('Completed')
    );
    const avgVariance = validVariances.length > 0
      ? validVariances.reduce((sum, d) => sum + d.calculatedVariance, 0) / validVariances.length
      : 0;

    return {
      total,
      onTime: onTimeOrders,
      delayed: delayedOrders,
      onTimeRate: total > 0 ? ((onTimeOrders / total) * 100).toFixed(1) : '0.0',
      delayedRate: total > 0 ? ((delayedOrders / total) * 100).toFixed(1) : '0.0',
      avgVariance: avgVariance.toFixed(2),
      highRisk: highRiskOrders,
      highRiskRate: total > 0 ? ((highRiskOrders / total) * 100).toFixed(1) : '0.0'
    };
  }, [globallyFilteredData]);

  // Lead Time & Efficiency Analysis
  const efficiencyMetrics = useMemo(() => {
    if (globallyFilteredData.length === 0) {
      return {
        totalProcessTime: 0,
        totalWaitingTime: 0,
        avgProcessTime: 0,
        avgWaitingTime: 0,
        vaTime: 0,
        nvaTime: 0,
        processEfficiency: 0,
        waitingRatio: 0,
        avgLeadTime: 0,
      };
    }

    let totalProcessTime = 0;
    let totalWaitingTime = 0;
    let vaTime = 0;
    let nvaTime = 0;
    let vaCount = 0;
    let nvaCount = 0;
    let validCount = 0;

    globallyFilteredData.forEach(item => {
      let processTime = item.processTime;
      if (!processTime || processTime === 0) {
        if (item.actualStartDate && item.actualEndDate) {
          const startDate = new Date(item.actualStartDate);
          const endDate = new Date(item.actualEndDate);
          processTime = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          if (processTime < 0 || processTime > 1000) processTime = 0;
        } else if (item.sopLeadTime) {
          processTime = item.sopLeadTime;
        }
      }

      let waitingTime = item.waitingTime;
      if (!waitingTime || waitingTime === 0) {
        if (item.targetStartDate && item.actualStartDate) {
          const targetStart = new Date(item.targetStartDate);
          const actualStart = new Date(item.actualStartDate);
          const delay = Math.ceil((actualStart.getTime() - targetStart.getTime()) / (1000 * 60 * 60 * 24));
          waitingTime = Math.max(0, delay);
        } else {
          waitingTime = processTime * 0.2;
        }
      }

      let isVA = item.vaNva === 'VA';
      if (!item.vaNva || item.vaNva === '') {
        const vaProcesses = ['Cutting', 'Sewing', 'Washing', 'Finishing', 'Inspection'];
        isVA = vaProcesses.includes(item.processStage);
      }

      if (processTime > 0) {
        totalProcessTime += processTime;
        validCount++;
        if (isVA) {
          vaTime += processTime;
          vaCount++;
        } else {
          nvaTime += processTime;
          nvaCount++;
        }
      }

      if (waitingTime > 0) {
        totalWaitingTime += waitingTime;
      }
    });

    const totalLeadTime = totalProcessTime + totalWaitingTime;
    const processEfficiency = totalLeadTime > 0 ? (totalProcessTime / totalLeadTime) * 100 : 0;
    const vaRatio = totalProcessTime > 0 ? (vaTime / totalProcessTime) * 100 : 0;
    const waitingRatio = totalLeadTime > 0 ? (totalWaitingTime / totalLeadTime) * 100 : 0;
    const count = Math.max(validCount, 1);

    const orderDateRanges = new Map<string, { earliestStart: Date | null; latestEnd: Date | null }>();
    globallyFilteredData.forEach(item => {
      if (!orderDateRanges.has(item.ocNo)) {
        orderDateRanges.set(item.ocNo, { earliestStart: null, latestEnd: null });
      }
      const orderData = orderDateRanges.get(item.ocNo)!;
      if (item.actualStartDate) {
        const startDate = new Date(item.actualStartDate);
        if (!isNaN(startDate.getTime())) {
          if (!orderData.earliestStart || startDate < orderData.earliestStart) {
            orderData.earliestStart = startDate;
          }
        }
      }
      if (item.actualEndDate) {
        const endDate = new Date(item.actualEndDate);
        if (!isNaN(endDate.getTime())) {
          if (!orderData.latestEnd || endDate > orderData.latestEnd) {
            orderData.latestEnd = endDate;
          }
        }
      }
    });

    let totalActualLeadTime = 0;
    let ordersWithValidDates = 0;
    orderDateRanges.forEach((orderData) => {
      if (orderData.earliestStart && orderData.latestEnd) {
        const leadTimeDays = Math.ceil((orderData.latestEnd.getTime() - orderData.earliestStart.getTime()) / (1000 * 60 * 60 * 24));
        if (leadTimeDays > 0 && leadTimeDays < 365) {
          totalActualLeadTime += leadTimeDays;
          ordersWithValidDates++;
        }
      }
    });

    const avgLeadTimePerOrder = ordersWithValidDates > 0 ? totalActualLeadTime / ordersWithValidDates : 0;

    return {
      totalProcessTime,
      totalWaitingTime,
      avgProcessTime: (totalProcessTime / count).toFixed(1),
      avgWaitingTime: (totalWaitingTime / count).toFixed(1),
      vaTime,
      nvaTime,
      vaCount,
      nvaCount,
      processEfficiency: processEfficiency.toFixed(1),
      vaRatio: vaRatio.toFixed(1),
      waitingRatio: waitingRatio.toFixed(1),
      avgLeadTime: avgLeadTimePerOrder.toFixed(1),
      totalLeadTime,
    };
  }, [globallyFilteredData]);

  // TREND ANALYSIS
  const trendAnalysis = useMemo(() => {
    const dailyData: Record<string, { date: string; total: number; onTime: number; delayed: number; variance: number; ocNumbers: string[] }> = {};

    globallyFilteredData.forEach(item => {
      let dateStr = '';
      if (item.deliveryDate && typeof item.deliveryDate === 'string') {
        dateStr = item.deliveryDate.split('T')[0];
      } else if (item.actualEndDate && typeof item.actualEndDate === 'string') {
        dateStr = item.actualEndDate.split('T')[0];
      }

      if (!dateStr) return;
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { date: dateStr, total: 0, onTime: 0, delayed: 0, variance: 0, ocNumbers: [] };
      }

      const calculatedStatus = item.calculatedStatus;

      dailyData[dateStr].total++;
      if (calculatedStatus === 'Completed - On Time') dailyData[dateStr].onTime++;
      else if (calculatedStatus === 'Completed - Delayed') dailyData[dateStr].delayed++;
      dailyData[dateStr].variance += item.calculatedVariance || 0;
      if (!dailyData[dateStr].ocNumbers.includes(item.ocNo)) dailyData[dateStr].ocNumbers.push(item.ocNo);
    });

    const sortedData = Object.values(dailyData)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(d => ({
        ...d,
        onTimeRate: d.total > 0 ? Math.round((d.onTime / d.total) * 100) : 0,
        delayRate: d.total > 0 ? Math.round((d.delayed / d.total) * 100) : 0,
        displayDate: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ocNumbersList: d.ocNumbers.join(', ')
      }));

    const recentDays = sortedData.slice(-7);
    const olderDays = sortedData.slice(-14, -7);
    const recentAvgDelay = recentDays.length > 0 ? recentDays.reduce((sum, d) => sum + d.delayRate, 0) / recentDays.length : 0;
    const olderAvgDelay = olderDays.length > 0 ? olderDays.reduce((sum, d) => sum + d.delayRate, 0) / olderDays.length : 0;

    return {
      dailyTrend: sortedData,
      trendDirection: recentAvgDelay > olderAvgDelay ? 'increasing' : recentAvgDelay < olderAvgDelay ? 'decreasing' : 'stable',
      recentAvgDelay: recentAvgDelay.toFixed(1),
    };
  }, [globallyFilteredData]);

  // CASCADING DELAY ANALYSIS
  const cascadingDelayAnalytics = useMemo(() => {
    const delayTypeCount = { onTime: 0, inherited: 0, ownDelay: 0, both: 0 };
    const delayDetails: any[] = [];

    globallyFilteredData.forEach(item => {
      if (item.calculatedVariance > 0) {
        const type = item.delayType || 'Own Delay';
        if (type.toLowerCase().includes('on time')) delayTypeCount.onTime++;
        else if (type === 'Inherited') delayTypeCount.inherited++;
        else if (type === 'Own Delay') delayTypeCount.ownDelay++;
        else if (type === 'Both') delayTypeCount.both++;

        if (!type.toLowerCase().includes('on time')) {
          delayDetails.push({
            ocNo: item.ocNo,
            processStage: item.processStage,
            delayType: type,
            inheritedDays: item.inheritedDelay || 0,
            processDelayDays: item.processDelay || 0,
            totalVariance: item.calculatedVariance,
          });
        }
      }
    });

    const chartData = [
      { name: 'On Time', value: delayTypeCount.onTime, color: '#10b981' },
      { name: 'Inherited Delay', value: delayTypeCount.inherited, color: '#f59e0b' },
      { name: 'Own Delay', value: delayTypeCount.ownDelay, color: '#ef4444' },
      { name: 'Both Delays', value: delayTypeCount.both, color: '#8b5cf6' },
    ].filter(item => item.value > 0);

    return {
      delayTypeDistribution: chartData,
      delayTypeCount,
      delayDetails: delayDetails.sort((a, b) => b.totalVariance - a.totalVariance),
      avgInheritedDelay: delayDetails.length > 0 ? (delayDetails.reduce((sum, d) => sum + d.inheritedDays, 0) / delayDetails.length).toFixed(1) : '0',
      avgProcessDelay: delayDetails.length > 0 ? (delayDetails.reduce((sum, d) => sum + d.processDelayDays, 0) / delayDetails.length).toFixed(1) : '0',
      totalDelayedProcesses: delayDetails.length,
    };
  }, [globallyFilteredData]);

  // PREDICTIVE RISK SCORING
  const predictiveRiskScoring = useMemo(() => {
    const orderRiskMap = new Map<string, any>();

    globallyFilteredData.forEach(item => {
      if (!orderRiskMap.has(item.ocNo)) {
        orderRiskMap.set(item.ocNo, {
          ocNo: item.ocNo, orderNo: item.orderNo, productType: item.productType, deliveryDate: item.deliveryDate,
          lineNo: item.lineNo || '', maxVariance: 0, totalVariance: 0, highRiskProcesses: 0,
          mediumRiskProcesses: 0, totalProcesses: 0, delayedProcesses: 0, worstStage: '', worstRiskLevel: 'Low'
        });
      }
      const orderRisk = orderRiskMap.get(item.ocNo)!;
      orderRisk.totalProcesses++;
      orderRisk.totalVariance += item.calculatedVariance || 0;
      if (item.calculatedVariance > orderRisk.maxVariance) {
        orderRisk.maxVariance = item.calculatedVariance;
        orderRisk.worstStage = item.processStage;
      }
      if (item.calculatedRiskLevel === 'High') {
        orderRisk.highRiskProcesses++;
        orderRisk.worstRiskLevel = 'High';
      } else if (item.calculatedRiskLevel === 'Medium' && orderRisk.worstRiskLevel !== 'High') {
        orderRisk.mediumRiskProcesses++;
        orderRisk.worstRiskLevel = 'Medium';
      }
      if (item.calculatedStatus && item.calculatedStatus.includes('Delayed')) orderRisk.delayedProcesses++;
    });

    const scoredOrders = Array.from(orderRiskMap.values()).map(order => {
      const vScore = Math.min(40, order.maxVariance * 5);
      const hrRatio = order.totalProcesses > 0 ? order.highRiskProcesses / order.totalProcesses : 0;
      const hrScore = Math.round(hrRatio * 30);
      const dRatio = order.totalProcesses > 0 ? order.delayedProcesses / order.totalProcesses : 0;
      const dScore = Math.round(dRatio * 20);
      const totalRiskScore = Math.min(100, vScore + hrScore + dScore);
      let predictedRisk: any = 'Low';
      if (order.worstRiskLevel === 'High' || totalRiskScore >= 60) predictedRisk = 'Critical';
      else if (order.worstRiskLevel === 'Medium' || totalRiskScore >= 40) predictedRisk = 'High';
      else if (totalRiskScore >= 20) predictedRisk = 'Medium';

      return { ...order, riskScore: totalRiskScore, predictedRisk };
    });

    const sortedByRisk = [...scoredOrders].sort((a, b) => b.riskScore - a.riskScore);
    const riskDist = {
      critical: scoredOrders.filter((o: any) => o.predictedRisk === 'Critical').length,
      high: scoredOrders.filter((o: any) => o.predictedRisk === 'High').length,
      medium: scoredOrders.filter((o: any) => o.predictedRisk === 'Medium').length,
      low: scoredOrders.filter((o: any) => o.predictedRisk === 'Low').length
    };

    return {
      scoredOrders, topRiskOrders: sortedByRisk.slice(0, 10), riskDistribution: riskDist,
      avgRiskScore: scoredOrders.length > 0 ? Math.round(scoredOrders.reduce((sum, o) => sum + o.riskScore, 0) / scoredOrders.length) : 0,
      riskDistributionChart: [
        { name: 'Critical', value: riskDist.critical, color: '#dc2626' },
        { name: 'High', value: riskDist.high, color: '#ef4444' },
        { name: 'Medium', value: riskDist.medium, color: '#f59e0b' },
        { name: 'Low', value: riskDist.low, color: '#10b981' }
      ].filter(d => d.value > 0)
    };
  }, [globallyFilteredData]);

  // Helper for Queue Time Filtering
  const applyQueueTimeFilter = (data: any[], range: string, refDate: Date) => {
    if (!range || range === 'All') return data;
    
    const today = new Date(refDate);
    today.setHours(0,0,0,0);

    return data.filter(row => {
      const targetEnd = parseDateSafe(row.targetEndDate);
      if (!targetEnd) return false;
      
      const checkDate = new Date(targetEnd);
      checkDate.setHours(0,0,0,0);

      switch (range) {
        case 'Today':
          return checkDate.getTime() === today.getTime();

        case 'Weekly': {
          const day = today.getDay();
          const diff = today.getDate() - (day === 0 ? 6 : day - 1);
          const startWeek = new Date(today); startWeek.setDate(diff);
          const endWeek = new Date(startWeek); endWeek.setDate(startWeek.getDate() + 6);
          endWeek.setHours(23, 59, 59, 999);
          return checkDate >= startWeek && checkDate <= endWeek;
        }

        case 'Monthly':
          return (
            checkDate.getMonth() === today.getMonth() &&
            checkDate.getFullYear() === today.getFullYear()
          );

        case 'Yearly':
          return checkDate.getFullYear() === today.getFullYear();

        default:
          return true;
      }
    });
  };

  // PROCESS QUEUE DATA WITH INDEPENDENT 4-STEP FILTERING (STAGE + STATUS + TIME + CONTEXT)
  const processQueueData = useMemo(() => {
    if (!allEnrichedData || allEnrichedData.length === 0) return { queueItems: [], rangeLabel: 'All Dates' };

    // STEP 1 — Filter by QUEUE-SPECIFIC stage selection
    let filtered = allEnrichedData.filter(row => {
       if (selectedQueueProcess === 'All') return true;
       return normalizeStage(row.processStage) === normalizeStage(selectedQueueProcess);
    });

    // STEP 2 — Apply status filter (Intersection)
    if (selectedStatus && selectedStatus !== 'All') {
      filtered = filtered.filter(row => 
        row.calculatedStatus === selectedStatus || 
        String(row.calculatedStatus || '').toUpperCase().includes(selectedStatus.toUpperCase())
      );
    }

    // STEP 3 — Apply queue-specific time filter
    if (queueTimeFilter !== 'All') {
      filtered = applyQueueTimeFilter(filtered, queueTimeFilter, queueReferenceDate);
    }

    // STEP 4 — Apply global context filters (Line, Product, Search)
    // These ensure the queue respects the Global Filter Bar's metadata selections
    filtered = filtered.filter(row => {
      const lineMatch = selectedLine === 'All' || row.lineNo === selectedLine;
      const productMatch = selectedProduct === 'All' || row.productType === selectedProduct;
      const ocMatch = !searchTerm || row.ocNo.toLowerCase().includes(searchTerm.toLowerCase());
      return lineMatch && productMatch && ocMatch;
    });

    // Mapping: Show specific process details
    const queueItems = filtered.map(row => {
      const ctx = ocContextMap.get(row.ocNo);
      
      // Robust date parsing for stage-specific vs delivery date fallback
      const targetEndObj = parseDateSafe(row.targetEndDate) || parseDateSafe(ctx?.deliveryDate);
      const deliveryDateObj = parseDateSafe(ctx?.deliveryDate);
      
      const today = new Date(); today.setHours(0,0,0,0);
      let daysRemaining = (targetEndObj && !isNaN(targetEndObj.getTime())) 
        ? Math.ceil((targetEndObj.getTime() - today.getTime()) / 86400000) 
        : null;

      return {
        ocNo: row.ocNo,
        stage: row.processStage,
        targetEndDate: row.targetEndDate || ctx?.deliveryDate || 'N/A',
        daysRemaining: daysRemaining,
        processStatus: row.calculatedStatus || 'Planned',
        isTentative: row.isTentative || false,
        audit: row.audit || 'Execution',
        targetEndObj: targetEndObj,
        deliveryDateObj: deliveryDateObj
      };
    });

    // Sorting: Most recent (target dates) first
    queueItems.sort((a, b) => {
      const dateA = a.targetEndObj || a.deliveryDateObj;
      const dateB = b.targetEndObj || b.deliveryDateObj;
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB.getTime() - dateA.getTime();
    });

    // UI Range Label calculation
    let rangeLabel = 'All Dates';
    const refDate = new Date(queueReferenceDate);
    if (queueTimeFilter === 'Today') rangeLabel = refDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    else if (queueTimeFilter === 'Weekly') {
      const day = refDate.getDay();
      const diff = refDate.getDate() - (day === 0 ? 6 : day - 1);
      const start = new Date(refDate); start.setDate(diff);
      const end = new Date(start); end.setDate(start.getDate() + 6);
      rangeLabel = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    else if (queueTimeFilter === 'Monthly') rangeLabel = refDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    else if (queueTimeFilter === 'Yearly') rangeLabel = `Year ${refDate.getFullYear()}`;

    return { queueItems, rangeLabel };
  }, [allEnrichedData, selectedQueueProcess, selectedStatus, queueTimeFilter, queueReferenceDate, selectedLine, selectedProduct, searchTerm, ocContextMap]);


  // Performance Views
  const processPerformance = useMemo(() => {
    const stages: Record<string, any> = {};
    globallyFilteredData.forEach(item => {
      if (!stages[item.processStage]) stages[item.processStage] = { stage: item.processStage, onTime: 0, delayed: 0, onTimeOrders: [], delayedOrders: [] };
      const status = indexedData.get(item.ocNo)?.get(item.processStage)?.calculatedStatus;
      if (status === 'Completed - On Time') {
        stages[item.processStage].onTime++;
        if (!stages[item.processStage].onTimeOrders.includes(item.ocNo)) stages[item.processStage].onTimeOrders.push(item.ocNo);
      } else if (status === 'Completed - Delayed') {
        stages[item.processStage].delayed++;
        if (!stages[item.processStage].delayedOrders.includes(item.ocNo)) stages[item.processStage].delayedOrders.push(item.ocNo);
      }
    });
    return Object.values(stages);
  }, [globallyFilteredData, indexedData]);

  const downloadOrderMatrixPDF = async () => {
    try {
      // Dynamic import to avoid SSR issues and content.js errors
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const today = new Date().toLocaleDateString();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(23, 43, 77); // #172B4D
    doc.text(`${factoryConfig?.name || factory.toUpperCase()} - Order Matrix Report`, 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${today}`, 14, 22);
    
    const activeProcesses = processes.filter(p => p !== 'All');
    const tableColumn = ["OC NO", ...activeProcesses];
    
    const tableRows = pivotTableData.map(r => {
      const rowData = [r.ocNo];
      activeProcesses.forEach(p => {
        const item = r[p];
        let statusText = item.status;
        if (statusText === '-') statusText = '-';
        else if (statusText.includes('On Time')) statusText = 'DONE';
        else if (statusText.includes('Delayed')) statusText = 'DELAYED';
        rowData.push(statusText);
      });
      return rowData;
    });

    autoTable(doc, {
      startY: 28,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 2,
        halign: 'center',
        valign: 'middle'
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold', cellWidth: 30 }
      },
      headStyles: {
        fillColor: [23, 43, 77],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        lineWidth: 0.1
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index > 0) {
          const val = data.cell.raw as string;
          if (val === 'DONE') {
            data.cell.styles.fillColor = [209, 250, 229]; // emerald-100
            data.cell.styles.textColor = [6, 78, 59]; // emerald-900
          } else if (val === 'DELAYED') {
            data.cell.styles.fillColor = [254, 226, 226]; // rose-100
            data.cell.styles.textColor = [153, 27, 27]; // rose-900
          } else if (val === 'In Progress') {
            data.cell.styles.fillColor = [239, 246, 255]; // blue-50
            data.cell.styles.textColor = [29, 78, 216]; // blue-700
          } else if (val === '-') {
            data.cell.styles.textColor = [200, 200, 200];
          }
        }
      }
    });

    doc.save(`Order_Matrix_${factory}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const pivotTableData = useMemo(() => {
    const allStages = ['Fabric Inhouse', 'Fabric QC', 'File Release', 'Pre-Production', 'CAD / Pattern', 'Cutting', 'Sewing', 'Washing', 'Finishing', 'Inspection', 'Dispatch'];
    
    // We only want to show orders that are in the globallyFilteredData (respecting filters)
    const uniqueOcNos = [...new Set(globallyFilteredData.map(d => d.ocNo))].filter(Boolean);
    
    return uniqueOcNos.map(ocNo => {
      const row: any = { ocNo };
      const stageMap = indexedData.get(ocNo);
      
      allStages.forEach(stage => {
        const item = stageMap?.get(stage);
        row[stage] = item ? { 
          status: item.calculatedStatus, 
          reason: item.delayReason || '', 
          remark: item.delayRemark || '' 
        } : { status: '-', reason: '', remark: '' };
      });
      return row;
    });
  }, [globallyFilteredData, indexedData]);

  const processes = ['All', 'Fabric Inhouse', 'Fabric QC', 'File Release', 'Pre-Production', 'CAD / Pattern', 'Cutting', 'Sewing', 'Washing', 'Finishing', 'Inspection', 'Dispatch'];
  const products = ['All', 'Enzyme Wash', 'Garment Dyed', 'Wash'];
  const statuses = ['All', 'In Progress', 'Not Started', 'Completed - On Time', 'Completed - Delayed', 'Shipped - On Time', 'Shipped - Delayed'];

  const filterConfig = [
    { id: 'line', label: 'Line', value: selectedLine, options: lineOptions.map(l => ({ value: l, label: l })), onChange: setSelectedLine },
    { id: 'process', label: 'Stage', value: selectedProcess, options: processes.map(p => ({ value: p, label: p })), onChange: setSelectedProcess },
    { id: 'product', label: 'Product', value: selectedProduct, options: products.map(p => ({ value: p, label: p })), onChange: setSelectedProduct },
    // Only show Status filter if not on technical tabs (Supermarket/WIP)
    ...((activeTab !== 'supermarket' && activeTab !== 'wip') ? [
      { id: 'status', label: 'Status', value: selectedStatus, options: statuses.map(s => ({ value: s, label: s })), onChange: setSelectedStatus }
    ] : [])
  ];


  if (loading && rawData.length === 0) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center p-6 max-w-sm">
        <div className="relative w-16 h-16 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#0052CC] border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter italic">Starting VSM Dash</h2>
        <p className="text-slate-500 font-bold mb-6 text-sm">CONNECTING TO GOOGLE RELAYS...</p>
        
        <div className="bg-white rounded-xl p-4 shadow-xl border border-slate-100 flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connection Time</span>
            <span className="text-sm font-black text-[#0052CC]">{loadingTime}s</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#0052CC] transition-all duration-500 ease-out" 
              style={{ width: `${Math.min((loadingTime / 60) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold italic leading-tight mt-1">
            {loadingTime < 10 ? 'Analyzing matrix protocols...' : 
             loadingTime < 30 ? 'Synchronizing factory records...' :
             loadingTime < 60 ? 'Compressing high-volume datasets...' :
             'Google Sheets is responding slowly. Please do not refresh...'}
          </p>
        </div>
        
        {loadingTime > 60 && (
          <div className="mt-8 p-3 bg-amber-50 rounded-lg border border-amber-200 animate-pulse">
            <p className="text-[10px] text-amber-800 font-black uppercase tracking-tighter">
              ⚠️ High Latency Detected
            </p>
            <p className="text-[9px] text-amber-700 font-bold uppercase tracking-tight mt-1 leading-none">
              The backend is processing a large volume of data.
            </p>
          </div>
        )}
        
        {loadingTime > 45 && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <button 
              onClick={() => window.location.reload()}
              className="text-xs font-black text-slate-400 hover:text-[#0052CC] underline uppercase tracking-tighter"
            >
              Force Reload
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (error && rawData.length === 0) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center p-6 max-w-md">
        <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-6 animate-pulse" />
        <h2 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tighter">System Offline</h2>
        <p className="text-slate-600 mb-8 font-medium leading-relaxed">{error}</p>
        <button 
          onClick={() => fetchData(true, { bypassCache: true })} 
          className="px-8 py-3 bg-[#0052CC] hover:bg-[#0747A6] text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95"
        >
          Try Reconnecting
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-[#172B4D]">
      <Header
        title={activeSidebarItem === 'update-task' ? 'Update Task' : activeSidebarItem === 'upload-plan' ? 'Upload Plan' : 'TRACK GRID'}
        lastUpdated={lastUpdated ? lastUpdated.toLocaleTimeString() : 'Loading...'}
        selectedPlant={selectedPlant}
        onPlantChange={setSelectedPlant}
        onRefresh={() => fetchData(false, { bypassCache: true })}
        isRefreshing={isRefreshing}
        factory={factory}
        fetchMessage={fetchMessage}
      />

      <div className="flex flex-1 pt-14">
        <Sidebar activeItem={activeSidebarItem} onItemClick={handleSidebarNavigation} />
        <div className="flex-1 ml-64 flex flex-col min-w-0 overflow-y-auto bg-white min-h-[calc(100vh-3.5rem)]">
          {activeSidebarItem === 'home' ? (
             <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-[#172B4D] via-[#0052CC] to-[#172B4D]">
              <div className="text-center max-w-4xl mx-auto w-full">
                <div className="mb-8 flex justify-center">
                  <div className="p-8 bg-white rounded-3xl shadow-xl">
                    <Activity className="w-16 h-16 text-[#0052CC]" />
                  </div>
                </div>
                <h1 className="text-6xl font-black text-white mb-4 tracking-tight uppercase">{factoryConfig?.name || factory} TRACK GRID</h1>
                <p className="text-white/90 text-xl mb-12 font-medium">Smart Schedule Monitoring System</p>
                <div className="bg-[#F4F5F7] rounded-xl shadow-2xl p-8 max-w-3xl mx-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <button onClick={() => handleSidebarNavigation('dashboard')} className="p-6 bg-[#4C9AFF] hover:bg-[#0052CC] rounded-xl transition-all shadow-md text-white">
                      <LayoutDashboard className="w-8 h-8 mx-auto mb-4" />
                      <h3 className="font-bold">Dashboard</h3>
                    </button>
                    <button onClick={() => handleSidebarNavigation('update-task')} className="p-6 bg-[#00A3BF] hover:bg-[#008DA6] rounded-xl transition-all shadow-md text-white">
                      <Edit3 className="w-8 h-8 mx-auto mb-4" />
                      <h3 className="font-bold">Update Task</h3>
                    </button>
                    <button onClick={() => handleSidebarNavigation('upload-plan')} className="p-6 bg-[#6554C0] hover:bg-[#5243AA] rounded-xl transition-all shadow-md text-white">
                      <FileText className="w-8 h-8 mx-auto mb-4" />
                      <h3 className="font-bold">Upload Plan</h3>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeSidebarItem === 'update-task' ? (
            <TaskUpdatePageEnhanced factory={factory} onSave={() => fetchData(false, { bypassCache: true })} />
          ) : activeSidebarItem === 'upload-plan' ? (
            <div className="flex-1 p-8 overflow-y-auto w-full">
              <UploadPlan selectedPlant={selectedPlant} factory={factory} />
            </div>
          ) : (
            <>
              <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm overflow-x-auto sticky top-0 z-20 flex items-center justify-between">
                <TabNavigation tabs={mainTabs} activeTab={activeTab} onTabChange={setActiveTab} />
                {syncError && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Sync Failed: Server Unreachable</span>
                    <button onClick={() => fetchData(false, { bypassCache: true })} className="ml-2 underline hover:text-red-800">Retry</button>
                  </div>
                )}
              </div>
              <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto min-w-0">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                  <FilterBar 
                    filters={filterConfig} 
                    showSearch={true}
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                  />
                </div>

                {activeTab === 'overview' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                      <KPICard title="Total Orders" value={kpis.total} subtitle="Active processes" icon={Package} onClick={() => handleKPIClick('total')} clickable={true} />
                      <KPICard title="On Time Rate" value={`${kpis.onTimeRate}%`} subtitle={`${kpis.onTime} orders`} icon={CheckCircle2} valueColor="text-emerald-600" onClick={() => handleKPIClick('onTime')} clickable={true} />
                      <KPICard title="Delayed Rate" value={`${kpis.delayedRate}%`} subtitle={`${kpis.delayed} orders`} icon={Clock} valueColor="text-red-600" onClick={() => handleKPIClick('delayed')} clickable={true} />
                      <KPICard title="High Risk" value={`${kpis.highRiskRate}%`} subtitle={`${kpis.highRisk} at risk`} icon={AlertCircle} valueColor="text-amber-600" onClick={() => handleKPIClick('highRisk')} clickable={true} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <KPICard title="Avg Lead Time" value={`${efficiencyMetrics.avgLeadTime} days`} icon={Clock} valueColor="text-purple-600" />
                      <KPICard title="Process Efficiency" value={`${efficiencyMetrics.processEfficiency}%`} icon={Activity} />
                      <KPICard title="VA Ratio" value={`${efficiencyMetrics.vaRatio}%`} icon={Target} valueColor="text-emerald-600" />
                      <KPICard title="Waiting Waste" value={`${efficiencyMetrics.waitingRatio}%`} icon={Clock} valueColor="text-red-600" />
                    </div>
                    <ChartCard title="Stage Performance" subtitle="On-time vs Delayed by stage">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={processPerformance}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="stage" angle={-45} textAnchor="end" height={80} fontSize={11} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="onTime" fill="#10b981" name="On Time" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="delayed" fill="#ef4444" name="Delayed" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </>
                )}

                {activeTab === 'analytics' && (
                  <>
                    <ChartCard title="Performance Trend">
                      <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart data={trendAnalysis.dailyTrend}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="displayDate" angle={-45} textAnchor="end" height={60} fontSize={11} />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Bar yAxisId="left" dataKey="onTime" fill="#10b981" name="On Time" />
                          <Bar yAxisId="left" dataKey="delayed" fill="#ef4444" name="Delayed" />
                          <Line yAxisId="right" type="monotone" dataKey="onTimeRate" stroke="#3b82f6" strokeWidth={3} name="On-Time Rate %" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </ChartCard>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                      <ChartCard title="Risk Scoring" subtitle={`Avg Score: ${predictiveRiskScoring.avgRiskScore}`}>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie data={predictiveRiskScoring.riskDistributionChart} cx="50%" cy="50%" label outerRadius={80} innerRadius={40} dataKey="value">
                              {predictiveRiskScoring.riskDistributionChart.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartCard>
                      <div className="lg:col-span-2">
                        <ChartCard title="High Risk Orders">
                          <div className="overflow-auto max-h-72 text-sm">
                            <table className="w-full">
                              <thead><tr className="border-b">
                                <th className="text-left p-2">OC No</th><th className="text-left p-2">Product</th><th className="text-center p-2">Score</th><th className="text-center p-2">Risk</th>
                              </tr></thead>
                              <tbody>
                                {predictiveRiskScoring.topRiskOrders.map((o: any, i: number) => (
                                  <tr key={i} className="border-b hover:bg-gray-50">
                                    <td className="p-2 font-bold">{o.ocNo}</td><td className="p-2">{o.productType}</td>
                                    <td className="p-2 text-center text-red-600 font-bold">{o.riskScore}</td>
                                    <td className="p-2 text-center font-bold">{o.predictedRisk}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </ChartCard>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'supermarket' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                      <KPICard title="SM1" value={supermarketMetrics.summary.sm1} subtitle="Pre-Prod" icon={Package} />
                      <KPICard title="SM2" value={supermarketMetrics.summary.sm2} subtitle="Pre-Cut" icon={Package} />
                      <KPICard title="SM3" value={supermarketMetrics.summary.sm3} subtitle="Cut WIP" icon={Zap} />
                      <KPICard title="SM4" value={supermarketMetrics.summary.sm4} subtitle="Sew WIP" icon={GitBranch} />
                      <KPICard title="SM5" value={supermarketMetrics.summary.sm5} subtitle="Fin WIP" icon={CheckCircle2} />
                      <KPICard title="SM6" value={supermarketMetrics.summary.sm6} subtitle="Cart WIP" icon={Package} />
                      <KPICard title="Total SM" value={supermarketMetrics.summary.total} valueColor="text-orange-600" icon={Activity} />
                    </div>

                    <ChartCard title="Supermarket Analysis by OC" subtitle="Detailed breakdown of supermarket days per order">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-[#F4F5F7] border-b-2 border-slate-200">
                             <tr>
                               <th className="p-4 text-left font-bold uppercase text-xs tracking-wider border-b">OC No</th>
                               <th className="p-4 text-center font-bold uppercase text-xs tracking-wider border-b">SM1</th>
                               <th className="p-4 text-center font-bold uppercase text-xs tracking-wider border-b">SM2</th>
                               <th className="p-4 text-center font-bold uppercase text-xs tracking-wider border-b">SM3</th>
                               <th className="p-4 text-center font-bold uppercase text-xs tracking-wider border-b">SM4</th>
                               <th className="p-4 text-center font-black uppercase text-xs tracking-wider border-b">SM5</th>
                               <th className="p-4 text-center font-bold uppercase text-xs tracking-wider border-b">SM6</th>
                               <th className="p-4 text-center font-bold uppercase text-xs tracking-wider bg-orange-50 text-orange-700 border-b">Total</th>
                             </tr>
                          </thead>
                          <tbody>
                            {supermarketMetrics.details.map((o, i) => (
                              <tr key={i} className="border-b hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-bold text-slate-900">{o.ocNo}</td>
                                <td className="p-4 text-center font-medium text-slate-600">{o.sm1}</td>
                                <td className="p-4 text-center font-medium text-slate-600">{o.sm2}</td>
                                <td className="p-4 text-center font-medium text-slate-600">{o.sm3}</td>
                                <td className="p-4 text-center font-medium text-slate-600">{o.sm4}</td>
                                <td className="p-4 text-center font-medium text-slate-600">{o.sm5}</td>
                                <td className="p-4 text-center font-medium text-slate-600">{o.sm6}</td>
                                <td className="p-4 text-center font-black text-orange-600 bg-orange-50/50">{o.total}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </ChartCard>
                  </div>
                )}

                {activeTab === 'wip' && (
                  <div className="space-y-6">
                    <ChartCard title="WIP by Process">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr><th className="text-left p-3">Process</th><th className="text-right p-3">Order Qty</th><th className="text-right p-3">WIP Qty</th><th className="text-right p-3">Comp %</th></tr>
                        </thead>
                        <tbody>
                                {['Cutting', 'Sewing', 'Finishing'].map(p => {
                                  // Use technicalTabsData for WIP to ignore ONLY Status filter
                                  // Normalise stage matching to handle "6 Cutting" or "Cutting WIP"
                                  const d = technicalTabsData.filter(x => 
                                    x.processStage.toUpperCase().includes(p.toUpperCase())
                                  );


                            const q = d.reduce((s, x) => s + (x.orderQty || 0), 0);
                            const w = d.reduce((s, x) => s + (x.wipQty || 0), 0);
                            const c = d.reduce((s, x) => s + (x.cumAchieved || 0), 0);
                            return (
                              <tr key={p} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-bold">{p}</td><td className="p-3 text-right">{q.toLocaleString()}</td>
                                <td className="p-3 text-right text-orange-600 font-bold">{w.toLocaleString()}</td>
                                <td className="p-3 text-right">{(q > 0 ? (c / q * 100).toFixed(1) : 0)}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </ChartCard>
                  </div>
                )}

                {activeTab === 'process-queue' && (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                          <Activity className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Process Filtering</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="relative flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tight ml-1">Stage Selection</label>
                            <div className="relative group">
                              <select 
                                value={selectedQueueProcess} 
                                onChange={e => setSelectedQueueProcess(e.target.value)} 
                                className="appearance-none pl-4 pr-10 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-[#0052CC]/10 focus:border-[#0052CC] cursor-pointer transition-all hover:border-slate-300 min-w-[200px]"
                              >
                                {processes.map(p => (
                               <option key={p} value={p}>
                                 {p === 'All' ? 'All Stages' : p}
                               </option>
                             ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" />
                            </div>
                          </div>

                          <div className="relative flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tight ml-1">Time Range</label>
                            <div className="flex items-center bg-white p-1 rounded-xl border-2 border-slate-200">
                              {(['All', 'Today', 'Weekly', 'Monthly', 'Yearly'] as const).map(type => (
                                <button
                                  key={type}
                                  onClick={() => {
                                    setQueueTimeFilter(type);
                                    if (type !== 'All') setQueueReferenceDate(new Date());
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    queueTimeFilter === type 
                                      ? 'bg-[#0052CC] text-white shadow-md' 
                                      : 'text-slate-500 hover:bg-slate-50'
                                  }`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center md:items-end gap-2">
                        <div className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                          <button 
                            onClick={() => {
                              const d = new Date(queueReferenceDate);
                              if (queueTimeFilter === 'All' || queueTimeFilter === 'Today') d.setDate(d.getDate() - 1);
                              else if (queueTimeFilter === 'Weekly') d.setDate(d.getDate() - 7);
                              else if (queueTimeFilter === 'Monthly') d.setMonth(d.getMonth() - 1);
                              else if (queueTimeFilter === 'Yearly') d.setFullYear(d.getFullYear() - 1);
                              
                              if (queueTimeFilter === 'All') setQueueTimeFilter('Weekly');
                              setQueueReferenceDate(d);
                            }}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-all active:scale-90"
                            title="Previous Range"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          
                          <div className="px-4 border-x border-slate-100 flex flex-col items-center min-w-[120px]">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">Timeline Context</span>
                            <span className="text-sm font-black text-[#0052CC] whitespace-nowrap">{processQueueData.rangeLabel}</span>
                          </div>

                          <button 
                            onClick={() => {
                              const d = new Date(queueReferenceDate);
                              if (queueTimeFilter === 'All' || queueTimeFilter === 'Today') d.setDate(d.getDate() + 1);
                              else if (queueTimeFilter === 'Weekly') d.setDate(d.getDate() + 7);
                              else if (queueTimeFilter === 'Monthly') d.setMonth(d.getMonth() + 1);
                              else if (queueTimeFilter === 'Yearly') d.setFullYear(d.getFullYear() + 1);
                              
                              if (queueTimeFilter === 'All') setQueueTimeFilter('Weekly');
                              setQueueReferenceDate(d);
                            }}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-all active:scale-90"
                            title="Next Range"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {queueTimeFilter !== 'All' && (
                            <button 
                              onClick={() => {
                                setQueueReferenceDate(new Date());
                              }}
                              className="flex items-center gap-1 text-[10px] font-black text-[#0052CC] uppercase tracking-widest hover:underline"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Reset to Today
                            </button>
                          )}
                          <span className="text-[9px] font-bold text-slate-400 italic">Timeline Selection</span>
                        </div>
                      </div>
                    </div>

                    {selectedStatus !== 'All' && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#0052CC] rounded-xl border border-blue-100 animate-in fade-in slide-in-from-left-2">
                        <Filter className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-tight">
                          Global Status Filter Active: <span className="underline">{selectedStatus}</span>
                        </span>
                      </div>
                    )}

                    <div className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b-2 border-slate-100">
                             <th className="p-4 text-left font-black text-slate-700 uppercase tracking-widest text-[10px]">Order Details</th>
                             <th className="p-4 text-left font-black text-slate-700 uppercase tracking-widest text-[10px]">Process Stage</th>
                             <th className="p-4 text-left font-black text-slate-700 uppercase tracking-widest text-[10px]">Target Completion</th>
                             <th className="p-4 text-center font-black text-slate-700 uppercase tracking-widest text-[10px]">Days Remaining</th>
                             <th className="p-4 text-center font-black text-slate-700 uppercase tracking-widest text-[10px]">Current Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {processQueueData.queueItems.length > 0 ? (
                            processQueueData.queueItems.map((o, i) => (
                              <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="p-4">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-900 text-lg tracking-tighter">{o.ocNo}</span>
                                    {o.isTentative && (
                                      <span className="text-[10px] text-amber-600 font-bold uppercase tracking-tighter">
                                        Tentative (Awaiting File Release)
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="text-xs font-black text-[#0052CC] bg-blue-50 px-2 py-1 rounded border border-blue-100 uppercase tracking-tight">
                                    {o.stage}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2 text-slate-600 font-medium">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {o.targetEndDate}
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  {o.daysRemaining !== null ? (
                                    <span className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-sm ${
                                      o.daysRemaining < 0 
                                        ? 'bg-red-600 text-white' 
                                        : o.daysRemaining === 0 
                                        ? 'bg-amber-500 text-white' 
                                        : 'bg-blue-50 text-[#0052CC] border border-blue-100'
                                    }`}>
                                      {o.daysRemaining}d
                                    </span>
                                  ) : (
                                    <span className="text-slate-300 text-xs italic">Schedule Unavailable</span>
                                  )}
                                </td>
                                <td className="p-4 text-center">
                                  <div className="flex flex-col items-center gap-1.5">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tight ${
                                      o.processStatus?.includes('Delayed') ? 'bg-rose-50 text-rose-700 border border-rose-100' : 
                                      o.processStatus?.includes('In Progress') ? 'bg-blue-50 text-blue-700 border border-blue-100' : 
                                      o.processStatus?.includes('On Time') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                      'bg-slate-100 text-slate-500'
                                    }`}>
                                      {o.processStatus}
                                    </span>
                                    {o.audit && o.audit !== 'Exact Match' && (
                                      <span className="text-[9px] text-slate-400 font-bold italic group-hover:text-slate-600 transition-colors">
                                        Source: {o.audit}
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="p-12 text-center">
                                <div className="flex flex-col items-center gap-4 text-slate-400">
                                  <div className="p-6 bg-slate-50 rounded-full">
                                    <Search className="w-12 h-12 opacity-20" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="font-black uppercase tracking-widest text-sm text-slate-500">No Orders Found</p>
                                    <p className="text-xs font-medium max-w-xs mx-auto">Try adjusting your Status, Stage, or Time Filters to find the data you're looking for.</p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'reports' && (
                  <ChartCard 
                    title="Order Matrix" 
                    subtitle="Click on any delayed process (X) to see reason"
                    action={
                      <button 
                        onClick={downloadOrderMatrixPDF}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF
                      </button>
                    }
                  >
                    <div className="overflow-auto max-h-[600px] text-xs border border-slate-200 rounded-xl shadow-inner bg-slate-50/20">
                      <table className="w-full border-separate border-spacing-0">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="p-4 text-left sticky top-0 left-0 bg-slate-50 border-b border-r border-slate-200 font-black text-slate-700 uppercase tracking-wider z-40 shadow-[0_2px_2px_-1px_rgba(0,0,0,0.05)]">OC NO</th>
                            {processes.filter(p => p !== 'All').map(p => (
                              <th key={p} className="p-4 text-center sticky top-0 bg-slate-50 border-b border-r border-slate-200 font-black text-slate-700 uppercase tracking-wider min-w-[140px] z-30 shadow-[0_2px_2px_-1px_rgba(0,0,0,0.05)]">
                                {p}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {pivotTableData.map((r, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 font-bold sticky left-0 bg-white border-b border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10 text-slate-800">{r.ocNo}</td>
                              {processes.filter(p => p !== 'All').map(p => {
                                const data = r[p];
                                const status = data.status;
                                const isDelayed = status.includes('Delayed');
                                const isOnTime = status.includes('On Time');
                                const isInProgress = status === 'In Progress';
                                
                                let bgClass = '';
                                if (isOnTime) bgClass = 'bg-emerald-100 text-emerald-900 border-emerald-200 font-bold';
                                else if (isDelayed) bgClass = 'bg-rose-100 text-rose-900 border-rose-200 font-bold cursor-pointer hover:bg-rose-200';
                                else if (isInProgress) bgClass = 'bg-blue-50 text-blue-700 border-blue-100 italic';

                                return (
                                  <td 
                                    key={p} 
                                    onClick={() => isDelayed && setSelectedDelayDetail({ 
                                      ocNo: r.ocNo, stage: p, status: status, reason: data.reason, remark: data.remark 
                                    })}
                                    className={`p-4 text-center border-b border-r border-slate-100 transition-all ${bgClass}`}
                                  >
                                    {isOnTime ? (
                                      <div className="flex items-center justify-center gap-2">
                                         <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                         <span className="text-[13px] font-black">Done</span>
                                      </div>
                                    ) : isDelayed ? (
                                      <div className="flex flex-col items-center gap-1">
                                         <span className="text-[16px] leading-none">✗</span>
                                         <span className="text-[10px] font-black uppercase tracking-widest text-rose-700">View Reason</span>
                                      </div>
                                    ) : status === '-' ? (
                                      <span className="text-gray-300 font-light">-</span>
                                    ) : <span className="text-[13px] font-black text-slate-600">{status}</span>}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ChartCard>
                )}
              </main>
            </>
          )}
        </div>
      </div>

      {showKPIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowKPIModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#0052CC] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{selectedKPIData.title}</h2>
              <button onClick={() => setShowKPIModal(false)} className="text-white hover:opacity-70">✕</button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)] space-y-2">
              {selectedKPIData.orders.map((ocNo, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg border flex justify-between items-center">
                  <span className="font-bold text-lg">{ocNo}</span>
                  <span className="text-sm text-gray-600">{globallyFilteredData.find(d => d.ocNo === ocNo)?.productType}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedDelayDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300" onClick={() => setSelectedDelayDetail(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="bg-rose-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Delay Analysis</h2>
                <p className="text-rose-100 text-xs font-bold">{selectedDelayDetail.ocNo} • {selectedDelayDetail.stage}</p>
              </div>
              <button onClick={() => setSelectedDelayDetail(null)} className="p-2 hover:bg-rose-700 rounded-full transition-colors font-bold text-lg leading-none">✕</button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-start gap-4 p-4 bg-rose-50 rounded-xl border border-rose-100">
                <AlertCircle className="w-8 h-8 text-rose-600 shrink-0" />
                <div>
                   <h4 className="text-rose-900 font-black text-[10px] uppercase tracking-widest mb-1">Root Cause Category</h4>
                   <p className="text-rose-700 font-bold">{selectedDelayDetail?.reason || 'Not documented'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 px-1">
                   <Edit3 className="w-3 h-3" />
                   Additional Remarks
                </h4>
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-sm leading-relaxed font-medium">
                  {selectedDelayDetail?.remark || 'No detailed remarks available for this delay.'}
                </div>
              </div>

              <button 
                onClick={() => setSelectedDelayDetail(null)}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-wider hover:bg-black transition-all shadow-lg active:scale-[0.98]"
              >
                Close Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionDashboard;
