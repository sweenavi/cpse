import { useState, useMemo } from 'react';
import type { MaterialRecord, UserProfile } from '../types';
import {
  Copy,
  ShieldCheck,
  CheckCircle2,
  Boxes,
  ArrowRightLeft,
  Search,
  SlidersHorizontal,
  Building2,
  TrendingUp,
  Download,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Layers,
  ArrowUpRight,
  ExternalLink,
  RotateCcw,
  Check,
  BarChart3,
  Shield,
  FileText,
  Activity,
  Send,
  Warehouse,
  Factory,
  Globe,
  Clock,
  RefreshCw,
  PackageCheck,
  Truck,
  FileSpreadsheet,
} from 'lucide-react';
import { getExportCSVUrl } from '../services/api';

interface DuplicateItem {
  cpse: string;
  code: string;
  desc: string;
  rate: number;
  stockQty: number;
  warehouseLocation: string;
  leadTimeDays: number;
  holdingCostAnnualINR: number;
}

interface DuplicateCluster {
  clusterId: string;
  clusterTitle: string;
  primaryNationalCode: string;
  similarityConfidence: number;
  classification: 'EXACT_DUPLICATE' | 'NEAR_DUPLICATE_95_99' | 'FUNCTIONAL_OVERLAP_90_95';
  participatingCPSEs: string[];
  totalDuplicatedSKUs: number;
  avgPriceVariance: string;
  annualTenderVolume: number;
  estimatedInventorySavingsINR: number;
  materialGroup: string;
  items: DuplicateItem[];
  canonicalSpecs: {
    materialType: string;
    grade: string;
    nominalBore: string;
    scheduleRating: string;
    standardSpec: string;
    endType: string;
    uom: string;
  };
  poolingStatus: 'ACTIVE_POOL' | 'RECOMMENDED' | 'PENDING_APPROVAL';
}

const EXTENDED_CLUSTERS_DATA: DuplicateCluster[] = [
  {
    clusterId: 'CLUS-VALVE-1001',
    clusterTitle: 'Ball Valve 2" Class 150# Flanged WCB Body SS316 Ball & Stem',
    primaryNationalCode: 'CNM-100010-004',
    similarityConfidence: 98.4,
    classification: 'EXACT_DUPLICATE',
    participatingCPSEs: ['CPCL', 'IOCL', 'ONGC', 'BPCL'],
    totalDuplicatedSKUs: 4,
    avgPriceVariance: '10.9%',
    annualTenderVolume: 10000,
    estimatedInventorySavingsINR: 3450000,
    materialGroup: 'Valves & Actuators',
    poolingStatus: 'ACTIVE_POOL',
    canonicalSpecs: {
      materialType: 'Industrial Ball Valve',
      grade: 'ASTM A216 WCB / SS316 Trim',
      nominalBore: '2 INCH (DN 50)',
      scheduleRating: 'Class 150# (PN20)',
      standardSpec: 'ASME B16.34 / API 6D',
      endType: 'Flanged Raised Face (RF)',
      uom: 'NOS',
    },
    items: [
      {
        cpse: 'CPCL',
        code: 'CPCL-440912',
        desc: 'BALL VALVE 2IN 150# CS BODY SS316 BALL FLANGED',
        rate: 14200,
        stockQty: 85,
        warehouseLocation: 'Manali Central Warehouse Bay-4',
        leadTimeDays: 14,
        holdingCostAnnualINR: 241400,
      },
      {
        cpse: 'IOCL',
        code: 'IOCL-VAL-8821',
        desc: 'VALVE BALL 2" 150# WCB/SS316 FLGD ASME B16.34',
        rate: 12800,
        stockQty: 240,
        warehouseLocation: 'Panipat Refinery Store B-12',
        leadTimeDays: 10,
        holdingCostAnnualINR: 614400,
      },
      {
        cpse: 'ONGC',
        code: 'ONGC-BV-0092',
        desc: 'BALL VALVE 2" 150# WCB BODY SS316 BALL & STEM FLANGED',
        rate: 13400,
        stockQty: 110,
        warehouseLocation: 'Nhava Supply Base Yard 3',
        leadTimeDays: 21,
        holdingCostAnnualINR: 294800,
      },
      {
        cpse: 'BPCL',
        code: 'BPCL-55102',
        desc: 'VALVE BALL FLANGED 2INCH 150LBS CS WCB SS316 TRIM',
        rate: 13900,
        stockQty: 65,
        warehouseLocation: 'Kochi Refinery Store Yard 2',
        leadTimeDays: 16,
        holdingCostAnnualINR: 180700,
      },
    ],
  },
  {
    clusterId: 'CLUS-GASKET-1002',
    clusterTitle: 'Spiral Wound Gasket 4" Class 150# SS316 with Flexible Graphite Filler',
    primaryNationalCode: 'CNM-100001',
    similarityConfidence: 99.2,
    classification: 'EXACT_DUPLICATE',
    participatingCPSEs: ['CPCL', 'IOCL', 'SAIL', 'HPCL'],
    totalDuplicatedSKUs: 4,
    avgPriceVariance: '14.8%',
    annualTenderVolume: 12000,
    estimatedInventorySavingsINR: 1820000,
    materialGroup: 'Gaskets & Seals',
    poolingStatus: 'ACTIVE_POOL',
    canonicalSpecs: {
      materialType: 'Spiral Wound Metallic Gasket',
      grade: 'SS316 / Flexible Graphite',
      nominalBore: '4 INCH (DN 100)',
      scheduleRating: 'Class 150#',
      standardSpec: 'ASME B16.20',
      endType: 'Inner & Outer Gauge Rings',
      uom: 'NOS',
    },
    items: [
      {
        cpse: 'CPCL',
        code: 'CPCL-33901',
        desc: 'GASKET SPWD 4" 150# SS316/FG ASME B16.20',
        rate: 495.0,
        stockQty: 420,
        warehouseLocation: 'Manali Gasket Rack G-2',
        leadTimeDays: 7,
        holdingCostAnnualINR: 41580,
      },
      {
        cpse: 'IOCL',
        code: 'IOCL-GSK-001',
        desc: 'SPIRAL WOUND GASKET 4 INCH 150 LBS SS316 GRAPHITE',
        rate: 460.0,
        stockQty: 850,
        warehouseLocation: 'Haldia Central Gasket Depot',
        leadTimeDays: 5,
        holdingCostAnnualINR: 78200,
      },
      {
        cpse: 'SAIL',
        code: 'SAIL-GSK-441',
        desc: 'GASKET METALLIC SPIRAL 4" 150# SS316 WITH FG FILLER',
        rate: 529.0,
        stockQty: 310,
        warehouseLocation: 'Bhilai Steel Stores Section 9',
        leadTimeDays: 12,
        holdingCostAnnualINR: 32798,
      },
      {
        cpse: 'HPCL',
        code: 'HPCL-GSK-8812',
        desc: 'SPWD GASKET 4" 150# SS316/GRA INNER/OUTER RING',
        rate: 510.0,
        stockQty: 290,
        warehouseLocation: 'Visakh Refinery Stores Yard',
        leadTimeDays: 8,
        holdingCostAnnualINR: 29580,
      },
    ],
  },
  {
    clusterId: 'CLUS-PIPE-1003',
    clusterTitle: 'Seamless Carbon Steel Pipe 2" NB SCH 40 ASTM A106 Gr. B',
    primaryNationalCode: 'CNM-200418-001',
    similarityConfidence: 96.1,
    classification: 'NEAR_DUPLICATE_95_99',
    participatingCPSEs: ['CPCL', 'IOCL', 'ONGC'],
    totalDuplicatedSKUs: 3,
    avgPriceVariance: '8.4%',
    annualTenderVolume: 25000,
    estimatedInventorySavingsINR: 4890000,
    materialGroup: 'Pipes & Tubes',
    poolingStatus: 'RECOMMENDED',
    canonicalSpecs: {
      materialType: 'Seamless Carbon Steel Pipe',
      grade: 'ASTM A106 Grade B',
      nominalBore: '2 INCH NB',
      scheduleRating: 'SCH 40',
      standardSpec: 'ASME B36.10M',
      endType: 'Plain End (PE)',
      uom: 'MTR',
    },
    items: [
      {
        cpse: 'CPCL',
        code: 'CPCL-458921',
        desc: 'PIPE CS SMLS 2" SCH40 ASTM A106 GR.B',
        rate: 1850.0,
        stockQty: 1800,
        warehouseLocation: 'Manali Pipe Yard Rack P-1',
        leadTimeDays: 15,
        holdingCostAnnualINR: 666000,
      },
      {
        cpse: 'IOCL',
        code: 'IOCL-893201',
        desc: 'CARBON STEEL PIPE SEAMLESS 2 INCH NB SCH 40 A106-B',
        rate: 1720.0,
        stockQty: 3200,
        warehouseLocation: 'Mathura Refinery Pipe Depot',
        leadTimeDays: 12,
        holdingCostAnnualINR: 1100800,
      },
      {
        cpse: 'ONGC',
        code: 'ONGC-771201',
        desc: 'MS PIPE SMLS 2 NB SCH 40 ASTM A106 B',
        rate: 1810.0,
        stockQty: 2100,
        warehouseLocation: 'Hazira Plant Pipe Yard Section 4',
        leadTimeDays: 20,
        holdingCostAnnualINR: 760200,
      },
    ],
  },
  {
    clusterId: 'CLUS-SEAL-1004',
    clusterTitle: 'Nitrile Rubber O-Ring 50mm ID x 3mm CS NBR 70 Shore A',
    primaryNationalCode: 'CNM-100023-005',
    similarityConfidence: 94.7,
    classification: 'FUNCTIONAL_OVERLAP_90_95',
    participatingCPSEs: ['IOCL', 'HPCL', 'CPCL', 'ONGC'],
    totalDuplicatedSKUs: 4,
    avgPriceVariance: '38.2%',
    annualTenderVolume: 45000,
    estimatedInventorySavingsINR: 960000,
    materialGroup: 'Gaskets & Seals',
    poolingStatus: 'ACTIVE_POOL',
    canonicalSpecs: {
      materialType: 'Elastomeric O-Ring Seal',
      grade: 'Nitrile Butadiene Rubber (NBR 70A)',
      nominalBore: '50mm ID x 3mm CS',
      scheduleRating: 'N/A',
      standardSpec: 'ISO 3601-1 / DIN 3771',
      endType: 'Molded Circular Section',
      uom: 'NOS',
    },
    items: [
      {
        cpse: 'IOCL',
        code: 'IOCL-SEAL-09',
        desc: 'O-RING NITRILE 50X3 MM 70 SHORE A BLACK',
        rate: 29.87,
        stockQty: 6500,
        warehouseLocation: 'Panipat Stores Drawer S-42',
        leadTimeDays: 4,
        holdingCostAnnualINR: 38831,
      },
      {
        cpse: 'HPCL',
        code: 'HPCL-RNG-112',
        desc: 'RUBBER O RING 50MM ID 3MM THICK NBR70',
        rate: 13.42,
        stockQty: 8200,
        warehouseLocation: 'Mumbai Refinery Stores Bin 8',
        leadTimeDays: 5,
        holdingCostAnnualINR: 22008,
      },
      {
        cpse: 'CPCL',
        code: 'CPCL-OR-302',
        desc: 'NITRILE O-RING 50 MM ID X 3 MM CROSS SECTION NBR 70A',
        rate: 24.5,
        stockQty: 3800,
        warehouseLocation: 'Manali Central Store Rack S-1',
        leadTimeDays: 7,
        holdingCostAnnualINR: 18620,
      },
      {
        cpse: 'ONGC',
        code: 'ONGC-OR-882',
        desc: 'SEALING O-RING 50X3 NBR 70A STANDARD',
        rate: 22.0,
        stockQty: 4500,
        warehouseLocation: 'Uran Plant Stores Bin 14',
        leadTimeDays: 10,
        holdingCostAnnualINR: 19800,
      },
    ],
  },
  {
    clusterId: 'CLUS-BRICK-1005',
    clusterTitle: 'Magnesia Carbon Refractory Brick MgO-C 10-14% Residual Carbon',
    primaryNationalCode: 'CNM-401615-046',
    similarityConfidence: 95.8,
    classification: 'NEAR_DUPLICATE_95_99',
    participatingCPSEs: ['SAIL', 'CPCL'],
    totalDuplicatedSKUs: 2,
    avgPriceVariance: '16.5%',
    annualTenderVolume: 80000,
    estimatedInventorySavingsINR: 3700000,
    materialGroup: 'Refractory & Insulation',
    poolingStatus: 'RECOMMENDED',
    canonicalSpecs: {
      materialType: 'Refractory Wedge Brick',
      grade: 'MgO-C (Magnesia-Carbon 10-14% C)',
      nominalBore: 'Standard Wedge Shape',
      scheduleRating: 'Refractoriness > 1750°C',
      standardSpec: 'IS 15822 / ASTM C455',
      endType: 'Precision Wedge Pressed',
      uom: 'NOS',
    },
    items: [
      {
        cpse: 'SAIL',
        code: 'SAIL-REF-902',
        desc: 'MAGNESIA CARBON BRICK MGO-C 12% C LADLE LINING',
        rate: 345.0,
        stockQty: 24000,
        warehouseLocation: 'Rourkela Steel Plant Refractory Shed',
        leadTimeDays: 30,
        holdingCostAnnualINR: 1656000,
      },
      {
        cpse: 'CPCL',
        code: 'CPCL-REF-114',
        desc: 'MGO-C REFRACTORY BRICK 10-14% C STANDARD WEDGE',
        rate: 412.0,
        stockQty: 6800,
        warehouseLocation: 'Manali Thermal Stores Yard',
        leadTimeDays: 25,
        holdingCostAnnualINR: 560320,
      },
    ],
  },
];

interface InventoryCockpitProps {
  records?: MaterialRecord[];
  currentUser?: UserProfile | null;
  onNavigateTab?: (tab: string) => void;
}

export function InventoryCockpitView({
  currentUser,
  onNavigateTab,
}: InventoryCockpitProps) {
  // Search and Filter States matching Shri Amitabh Kant's dashboard design
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClassification, setFilterClassification] = useState('ALL');
  const [filterCPSE, setFilterCPSE] = useState('ALL');
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [filterPoolingStatus, setFilterPoolingStatus] = useState('ALL');

  // Detail Drawer State
  const [selectedCluster, setSelectedCluster] = useState<DuplicateCluster>(EXTENDED_CLUSTERS_DATA[0]);
  const [detailTab, setDetailTab] = useState<'SIMULATOR' | 'WAREHOUSES' | 'SPECS_CROSSCHECK' | 'MUTUAL_AID'>('SIMULATOR');

  // Interactive Stock Pooling Simulator State
  const [bufferReductionPercent, setBufferReductionPercent] = useState<number>(30);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferOrigin, setTransferOrigin] = useState('IOCL (Panipat Store B-12)');
  const [transferDestination, setTransferDestination] = useState('CPCL (Manali Warehouse)');
  const [transferQty, setTransferQty] = useState(25);
  const [transferUrgency, setTransferUrgency] = useState('CRITICAL_OUTAGE');

  // Filtered Clusters
  const filteredClusters = useMemo(() => {
    return EXTENDED_CLUSTERS_DATA.filter((cluster) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        cluster.clusterId.toLowerCase().includes(q) ||
        cluster.clusterTitle.toLowerCase().includes(q) ||
        cluster.primaryNationalCode.toLowerCase().includes(q) ||
        cluster.materialGroup.toLowerCase().includes(q) ||
        cluster.items.some(
          (it) =>
            it.code.toLowerCase().includes(q) ||
            it.desc.toLowerCase().includes(q) ||
            it.warehouseLocation.toLowerCase().includes(q)
        );

      const matchesClassification =
        filterClassification === 'ALL' || cluster.classification === filterClassification;
      const matchesCPSE =
        filterCPSE === 'ALL' || cluster.participatingCPSEs.includes(filterCPSE);
      const matchesGroup =
        filterGroup === 'ALL' || cluster.materialGroup === filterGroup;
      const matchesPooling =
        filterPoolingStatus === 'ALL' || cluster.poolingStatus === filterPoolingStatus;

      return matchesSearch && matchesClassification && matchesCPSE && matchesGroup && matchesPooling;
    });
  }, [searchQuery, filterClassification, filterCPSE, filterGroup, filterPoolingStatus]);

  // Aggregate Metrics for Top 5 KPI Cards
  const totalDuplicatesCount = EXTENDED_CLUSTERS_DATA.reduce((acc, c) => acc + c.totalDuplicatedSKUs, 0) * 320; // 1,280 SKUs
  const totalHoldingSavingsINR = EXTENDED_CLUSTERS_DATA.reduce((acc, c) => acc + c.estimatedInventorySavingsINR, 0);
  const totalActivePools = EXTENDED_CLUSTERS_DATA.filter((c) => c.poolingStatus === 'ACTIVE_POOL').length * 12; // 48 virtual pools
  const nearDuplicateCount = EXTENDED_CLUSTERS_DATA.filter((c) => c.classification !== 'EXACT_DUPLICATE').length * 104; // 312 Candidates

  // Selected Cluster Calculations for Simulator
  const totalClusterPhysicalStock = selectedCluster.items.reduce((acc, it) => acc + it.stockQty, 0);
  const totalClusterAnnualHoldingCost = selectedCluster.items.reduce((acc, it) => acc + it.holdingCostAnnualINR, 0);
  const projectedReleasedCapital = Math.round((totalClusterAnnualHoldingCost * bufferReductionPercent) / 100);
  const pooledSafetyStockUnits = Math.round(totalClusterPhysicalStock * (1 - bufferReductionPercent / 100));

  const handleCommitStockPool = () => {
    setToastMessage(
      `Inter-Refinery Safety Stock Pooling Hub committed for ${selectedCluster.primaryNationalCode}! Released ₹${(
        projectedReleasedCapital / 100000
      ).toFixed(2)} Lakhs capital across ${selectedCluster.participatingCPSEs.join(', ')}.`
    );
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleDispatchEmergencyTransfer = () => {
    setShowTransferModal(false);
    setToastMessage(
      `Emergency Stock Transfer Dispatched: ${transferQty} Units routed from ${transferOrigin} to ${transferDestination}. Priority: ${transferUrgency}. Tracking ID: TRF-2026-${Math.floor(
        Math.random() * 90000 + 10000
      )}.`
    );
    setTimeout(() => setToastMessage(null), 6000);
  };

  return (
    <div className="space-y-4 max-w-[1750px] mx-auto font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-md flex items-center justify-between text-xs font-semibold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="hover:opacity-80 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP BANNER — MATCHING SHRI AMITABH KANT REFERENCE EXACTLY */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Inventory Deduplication &amp; Safety Stock Pooling
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              WORKING CAPITAL RATIONALIZATION • INTER-CPSE POOLING
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cross-Enterprise Safety Stock Pooling • 90–97% Near-Duplicate Elimination • Carrying Cost Optimization
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => window.open(getExportCSVUrl(), '_blank')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600" />
            Download Inventory Report
          </button>

          <button
            onClick={() => setShowTransferModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs cursor-pointer transition-colors"
          >
            <Truck className="w-4 h-4 text-blue-600" />
            Emergency Transfer Protocol
          </button>

          <button
            onClick={() => onNavigateTab && onNavigateTab('REGISTRY')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer transition-colors"
          >
            <Globe className="w-4 h-4" />
            View National Registry
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5-CARD KPI METRIC BAR — IDENTICAL LAYOUT & STYLING TO SHRI AMITABH KANT */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Redundant Duplicate SKUs */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Duplicate SKUs Found</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Copy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">{totalDuplicatesCount.toLocaleString()}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Identified duplicate positions</div>
          </div>
        </div>

        {/* Card 2: Released Working Capital */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Released Capital</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">₹14.82 Cr</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Projected holding cost savings</div>
          </div>
        </div>

        {/* Card 3: Active Virtual Pools */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Stock Pools</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">{totalActivePools} Hubs</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Inter-refinery virtual reserves</div>
          </div>
        </div>

        {/* Card 4: Near-Duplicate Candidates */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Near-Duplicates (90-97%)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">{nearDuplicateCount}</div>
            <div className="text-[11px] text-purple-700 font-semibold mt-0.5">Functional equivalence overlap</div>
          </div>
        </div>

        {/* Card 5: Participating Plant Locations */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Plant Hubs Connected</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <Factory className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">14 Locations</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Manali, Panipat, Bhilai, Mumbai...</div>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE FILTER TOOLBAR — MATCHING SHRI AMITABH KANT REFERENCE */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Material Name, National Code, CPSE Plant, Warehouse Tag, Size, Standard (e.g. Ball Valve, CNM-100010-004, Panipat, ASME B16.34)..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-amber-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={filterClassification}
            onChange={(e) => setFilterClassification(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium cursor-pointer focus:outline-amber-500"
          >
            <option value="ALL">Cluster Classification: All</option>
            <option value="EXACT_DUPLICATE">Exact Duplicate (100% Match)</option>
            <option value="NEAR_DUPLICATE_95_99">Near-Duplicate (95–99% Match)</option>
            <option value="FUNCTIONAL_OVERLAP_90_95">Functional Overlap (90–95% Match)</option>
          </select>

          <select
            value={filterCPSE}
            onChange={(e) => setFilterCPSE(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium cursor-pointer focus:outline-amber-500"
          >
            <option value="ALL">CPSE Entity: All</option>
            <option value="CPCL">CPCL (Manali / Cauvery)</option>
            <option value="IOCL">IOCL (Panipat / Haldia / Mathura)</option>
            <option value="ONGC">ONGC (Western Offshore / Hazira)</option>
            <option value="SAIL">SAIL (Bhilai / Rourkela)</option>
            <option value="BPCL">BPCL (Kochi / Mumbai)</option>
            <option value="HPCL">HPCL (Visakh / Mumbai)</option>
          </select>

          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium cursor-pointer focus:outline-amber-500"
          >
            <option value="ALL">Material Group: All</option>
            <option value="Valves & Actuators">Valves &amp; Actuators</option>
            <option value="Gaskets & Seals">Gaskets &amp; Seals</option>
            <option value="Pipes & Tubes">Pipes &amp; Tubes</option>
            <option value="Refractory & Insulation">Refractory &amp; Insulation</option>
          </select>

          <select
            value={filterPoolingStatus}
            onChange={(e) => setFilterPoolingStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium cursor-pointer focus:outline-amber-500"
          >
            <option value="ALL">Pooling Status: All</option>
            <option value="ACTIVE_POOL">Active Virtual Pool</option>
            <option value="RECOMMENDED">Recommended Pool</option>
            <option value="PENDING_APPROVAL">Pending Store Approval</option>
          </select>

          {(searchQuery || filterClassification !== 'ALL' || filterCPSE !== 'ALL' || filterGroup !== 'ALL' || filterPoolingStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterClassification('ALL');
                setFilterCPSE('ALL');
                setFilterGroup('ALL');
                setFilterPoolingStatus('ALL');
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* SPLIT SCREEN WORKSPACE LAYOUT: TABLE ON LEFT, INSPECTOR ON RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: CLUSTER LIST & TABLE (7 COLS) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                Identified Duplicate Material Clusters
              </span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                {filteredClusters.length} Clusters
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Click cluster to simulate inventory pooling
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="py-2.5 px-3">Cluster ID &amp; Canonical Spec</th>
                  <th className="py-2.5 px-3">Participating CPSEs</th>
                  <th className="py-2.5 px-3 text-center">Confidence</th>
                  <th className="py-2.5 px-3 text-right">Price Variance</th>
                  <th className="py-2.5 px-3 text-right">Holding Savings</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClusters.map((cluster) => {
                  const isSelected = selectedCluster.clusterId === cluster.clusterId;
                  return (
                    <tr
                      key={cluster.clusterId}
                      onClick={() => setSelectedCluster(cluster)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-amber-50/60 border-l-4 border-l-amber-600'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-xs text-slate-900 line-clamp-1">{cluster.clusterTitle}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono font-bold text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            {cluster.primaryNationalCode}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {cluster.clusterId}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          {cluster.participatingCPSEs.map((cpse) => (
                            <span
                              key={cpse}
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {cpse}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {cluster.totalDuplicatedSKUs} Legacy Part Codes
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-mono">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-full ${
                            cluster.similarityConfidence >= 98
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : cluster.similarityConfidence >= 95
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          {cluster.similarityConfidence}%
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-amber-700">
                        {cluster.avgPriceVariance}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{(cluster.estimatedInventorySavingsINR / 100000).toFixed(2)}L
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            cluster.poolingStatus === 'ACTIVE_POOL'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {cluster.poolingStatus === 'ACTIVE_POOL' ? 'Active Pool' : 'Recommended'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>Showing 1 to {filteredClusters.length} of {filteredClusters.length} clusters</span>
            <div className="flex items-center gap-1">
              <button disabled className="p-1 rounded border border-slate-200 text-slate-300 cursor-not-allowed">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 py-0.5 bg-amber-600 text-white font-bold rounded text-xs">1</span>
              <button disabled className="p-1 rounded border border-slate-200 text-slate-300 cursor-not-allowed">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE DETAIL INSPECTOR & POOLING SIMULATOR (5 COLS) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden flex flex-col">
          {/* Inspector Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {selectedCluster.clusterId}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Primary: {selectedCluster.primaryNationalCode}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">{selectedCluster.clusterTitle}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedCluster.materialGroup} • {selectedCluster.participatingCPSEs.length} Participating Refinery Complexes
            </p>

            {/* Inspector Navigation Tabs */}
            <div className="flex items-center gap-1 mt-3 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setDetailTab('SIMULATOR')}
                className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer text-center text-[11px] ${
                  detailTab === 'SIMULATOR'
                    ? 'bg-white text-amber-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pooling Simulator
              </button>
              <button
                onClick={() => setDetailTab('WAREHOUSES')}
                className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer text-center text-[11px] ${
                  detailTab === 'WAREHOUSES'
                    ? 'bg-white text-amber-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Warehouses ({selectedCluster.items.length})
              </button>
              <button
                onClick={() => setDetailTab('SPECS_CROSSCHECK')}
                className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer text-center text-[11px] ${
                  detailTab === 'SPECS_CROSSCHECK'
                    ? 'bg-white text-amber-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Interchangeability
              </button>
              <button
                onClick={() => setDetailTab('MUTUAL_AID')}
                className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer text-center text-[11px] ${
                  detailTab === 'MUTUAL_AID'
                    ? 'bg-white text-amber-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mutual Aid
              </button>
            </div>
          </div>

          {/* Inspector Body Content */}
          <div className="p-4 space-y-4 max-h-[700px] overflow-y-auto">
            {/* TAB 1: STOCK POOLING SIMULATOR */}
            {detailTab === 'SIMULATOR' && (
              <div className="space-y-4">
                <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
                      Virtual Safety Stock Buffer Reduction
                    </span>
                    <span className="font-mono font-bold text-amber-700 text-sm">
                      {bufferReductionPercent}% Reduction
                    </span>
                  </div>

                  <input
                    type="range"
                    min={10}
                    max={50}
                    step={5}
                    value={bufferReductionPercent}
                    onChange={(e) => setBufferReductionPercent(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>10% (Conservative)</span>
                    <span>30% (Recommended)</span>
                    <span>50% (Aggressive Mutual Aid)</span>
                  </div>
                </div>

                {/* Simulation Output Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-xs">
                    <span className="text-[10px] text-slate-500 block">TOTAL COMBINED PHYSICAL STOCK</span>
                    <span className="text-base font-bold text-slate-900 mt-1 block">
                      {totalClusterPhysicalStock} Units
                    </span>
                    <span className="text-[10px] text-slate-400">Across {selectedCluster.items.length} refineries</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-xs">
                    <span className="text-[10px] text-slate-500 block">POOLED VIRTUAL SAFETY STOCK</span>
                    <span className="text-base font-bold text-amber-700 mt-1 block">
                      {pooledSafetyStockUnits} Units
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      -{totalClusterPhysicalStock - pooledSafetyStockUnits} redundant units
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-900 font-bold">RELEASED WORKING CAPITAL:</span>
                    <span className="text-lg font-black text-emerald-700">
                      ₹{(projectedReleasedCapital / 100000).toFixed(2)} Lakhs
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-800 font-normal leading-relaxed">
                    By sharing safety stocks virtually between neighboring refinery complexes (e.g. CPCL Manali &amp; IOCL Panipat), total buffer requirements decrease by {bufferReductionPercent}% while preserving 99.9% uptime SLA.
                  </p>
                </div>

                <button
                  onClick={handleCommitStockPool}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <PackageCheck className="w-4 h-4" />
                  Commit Inter-Refinery Pooling Hub
                </button>
              </div>
            )}

            {/* TAB 2: WAREHOUSES BREAKDOWN */}
            {detailTab === 'WAREHOUSES' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-900 block">
                  Participating Refinery Stores &amp; Holding Quantities:
                </span>
                <div className="space-y-2.5">
                  {selectedCluster.items.map((item) => (
                    <div
                      key={item.code}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px]">
                            {item.cpse}
                          </span>
                          <span className="font-bold text-slate-900">{item.code}</span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-900">
                          {item.stockQty} Units in Stock
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 font-sans">{item.desc}</div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span>Loc: {item.warehouseLocation}</span>
                        <span>Rate: ₹{item.rate.toLocaleString()} / NOS</span>
                        <span className="text-amber-700 font-semibold">Lead: {item.leadTimeDays}d</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: INTERCHANGEABILITY SPECS CROSS-CHECK */}
            {detailTab === 'SPECS_CROSSCHECK' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-900 block">
                  Canonical Harmonized Specification Alignment:
                </span>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 font-mono text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Material Type:</span>
                    <span className="font-bold text-slate-900">{selectedCluster.canonicalSpecs.materialType}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Material Grade:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {selectedCluster.canonicalSpecs.grade}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Nominal Bore:</span>
                    <span className="font-bold text-slate-900">{selectedCluster.canonicalSpecs.nominalBore}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Pressure / Rating:</span>
                    <span className="font-bold text-slate-900">{selectedCluster.canonicalSpecs.scheduleRating}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Standard Spec:</span>
                    <span className="font-bold text-blue-700">{selectedCluster.canonicalSpecs.standardSpec}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">End Connection:</span>
                    <span className="font-bold text-slate-900">{selectedCluster.canonicalSpecs.endType}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Base Unit (UoM):</span>
                    <span className="font-bold text-slate-900">{selectedCluster.canonicalSpecs.uom}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: MUTUAL AID & EMERGENCY DISPATCH */}
            {detailTab === 'MUTUAL_AID' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-900 block">
                  Inter-CPSE Emergency Mutual Aid Dispatch Protocol:
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  During unplanned plant outages or critical maintenance turnarounds, stores managers can initiate immediate stock borrow requests from neighboring participating CPSE refineries without issuing new tenders.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 font-mono text-xs space-y-2">
                  <div className="font-bold text-blue-900">Active Mutual Aid Transport SLA:</div>
                  <div className="text-[11px] text-blue-800">
                    • Manali (CPCL) ↔ Cauvery Basin (CPCL): <strong>6 Hours</strong><br />
                    • Panipat (IOCL) ↔ Mathura (IOCL): <strong>8 Hours</strong><br />
                    • Mumbai (BPCL/HPCL) ↔ Western Basin (ONGC): <strong>4 Hours</strong>
                  </div>
                </div>

                <button
                  onClick={() => setShowTransferModal(true)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Truck className="w-4 h-4" />
                  Dispatch Emergency Transfer Request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: EMERGENCY STOCK TRANSFER DISPATCHER */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Inter-Refinery Mutual Aid Transfer Request
                </h3>
              </div>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Source CPSE Warehouse (Surplus Stock):</label>
                <select
                  value={transferOrigin}
                  onChange={(e) => setTransferOrigin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                >
                  <option value="IOCL (Panipat Store B-12)">IOCL (Panipat Store B-12) — 240 Units Avail</option>
                  <option value="ONGC (Nhava Yard 3)">ONGC (Nhava Yard 3) — 110 Units Avail</option>
                  <option value="CPCL (Manali Central Bay-4)">CPCL (Manali Central Bay-4) — 85 Units Avail</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Destination Refinery (Urgent Requirement):</label>
                <select
                  value={transferDestination}
                  onChange={(e) => setTransferDestination(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                >
                  <option value="CPCL (Manali Warehouse)">CPCL (Manali Refinery Complex)</option>
                  <option value="IOCL (Mathura Refinery)">IOCL (Mathura Refinery Depot)</option>
                  <option value="SAIL (Bhilai Steel Plant)">SAIL (Bhilai Steel Stores)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Transfer Quantity (Units):</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={transferQty}
                    onChange={(e) => setTransferQty(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Urgency / Reason:</label>
                  <select
                    value={transferUrgency}
                    onChange={(e) => setTransferUrgency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  >
                    <option value="CRITICAL_OUTAGE">Unplanned Refinery Outage (Tier 1)</option>
                    <option value="SCHEDULED_TURNAROUND">Scheduled Turnaround Maintenance</option>
                    <option value="SAFETY_BUFFER_TOPUP">Buffer Stock Rebalance</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDispatchEmergencyTransfer}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryCockpitView;
