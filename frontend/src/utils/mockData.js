/**
 * Centralised fallback mock data for InvenIQ.
 *
 * All static demo data that was previously scattered across individual
 * view components is consolidated here. Every view imports from this
 * file so there is ONE source of truth for the demo dataset.
 *
 * When MySQL is connected these values are never rendered — the live
 * API response replaces them completely. They only appear when the
 * backend is in "demo mode" (no MySQL configured) or when an API call
 * fails and the view shows a warning banner.
 *
 * Data context: mid-sized plywood & building-materials dealer,
 * Bangalore, India. Revenue ~₹28–30 L/month.
 */

// ── Month labels ────────────────────────────────────────────────────────────
export const MONTHS_12 = ['May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr'];

// ── Overview ─────────────────────────────────────────────────────────────────
export const MOCK_MONTHLY_REVENUE   = [19.2, 20.1, 21.4, 22.8, 21.6, 20.4, 22.1, 23.8, 24.4, 25.2, 26.0, 28.4];
export const MOCK_MONTHLY_PROFIT    = [4.1,  4.4,  4.6,  5.0,  4.8,  4.2,  4.8,  5.4,  5.5,  5.7,  5.8,  6.36];
export const MOCK_REVENUE_TARGET    = [21,   21.5, 22,   22.5, 23,   23.5, 24,   24.5, 25,   25.5, 26,   26.5];
export const MOCK_PRODUCT_MIX       = { labels: ['BWP', 'MR', 'Commercial', 'Laminates', 'Others'], data: [38, 28, 18, 11, 5] };
export const MOCK_CUSTOMER_SEGMENTS = { labels: ['Contractors', 'Interior Firms', 'Retailers', 'Carpenters'], data: [44, 26, 18, 12] };
export const MOCK_TOP_SKUS_TODAY    = [
  { name: '18mm BWP',    pct: 92, color: '#0f766e', sheets: '46 sheets', delta: '+18%', trend: 'up' },
  { name: '12mm MR',     pct: 76, color: '#2563eb', sheets: '38 sheets', delta: '+6%',  trend: 'up' },
  { name: '12mm BWP',    pct: 62, color: '#0f766e', sheets: '31 sheets', delta: '+9%',  trend: 'up' },
  { name: '18mm MR',     pct: 48, color: '#d97706', sheets: '24 sheets', delta: '0%',   trend: 'fl' },
  { name: 'Laminates',   pct: 36, color: '#9333ea', sheets: '18 sheets', delta: '-4%',  trend: 'dn' },
];

// ── Inventory / Stock Intelligence ───────────────────────────────────────────
export const MOCK_SKUS = [
  { n: '18mm BWP (8×4)',     b: 'Century',   stk: 140, buy: 1420, sell: 1920, d: 8,  s30: 480, st: 'critical' },
  { n: '12mm BWP (8×4)',     b: 'Century',   stk: 220, buy: 1180, sell: 1620, d: 11, s30: 380, st: 'critical' },
  { n: '12mm MR Plain',      b: 'Greenply',  stk: 385, buy: 720,  sell: 940,  d: 18, s30: 420, st: 'ok'       },
  { n: '18mm MR Plain',      b: 'Greenply',  stk: 290, buy: 780,  sell: 1040, d: 22, s30: 310, st: 'ok'       },
  { n: 'Laminate Teak 1mm',  b: 'Greenlam',  stk: 620, buy: 240,  sell: 340,  d: 32, s30: 320, st: 'ok'       },
  { n: '8mm Flexi BWP',      b: 'Gauri',     stk: 110, buy: 640,  sell: 840,  d: 28, s30: 72,  st: 'over'     },
  { n: '6mm Gurjan BWP',     b: 'Gauri',     stk: 186, buy: 960,  sell: 1280, d: 118,s30: 0,   st: 'dead'     },
  { n: '4mm MR Plain',       b: 'Greenply',  stk: 240, buy: 580,  sell: 760,  d: 97, s30: 4,   st: 'dead'     },
  { n: '19mm Commercial',    b: 'Greenply',  stk: 102, buy: 620,  sell: 820,  d: 91, s30: 2,   st: 'dead'     },
  { n: '10mm Flexi BWP',     b: 'Gauri',     stk: 88,  buy: 560,  sell: 740,  d: 74, s30: 22,  st: 'over'     },
];

// ── Sales Performance ─────────────────────────────────────────────────────────
export const MOCK_SALES_REVENUE = [19.2, 20.1, 21.4, 22.8, 21.6, 20.4, 22.1, 23.8, 24.4, 25.2, 26.0, 28.4];
export const MOCK_SALES_PROFIT  = [4.1,  4.4,  4.6,  5.0,  4.8,  4.2,  4.8,  5.4,  5.5,  5.7,  5.8,  6.36];
export const MOCK_MARGIN_BY_SKU = {
  labels: ['18mm BWP', '12mm BWP', '12mm MR', '18mm MR', 'Laminates', '8mm Flexi', 'Commercial'],
  data:   [22.2, 25.6, 15.4, 20.8, 28.4, 6.7, 8.2],
};
export const MOCK_DAY_OF_WEEK = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  data:   [5.8, 4.2, 4.6, 4.8, 6.2, 7.8, 0.4],
};

// ── Finance / Profitability ───────────────────────────────────────────────────
export const MOCK_MARGIN_LABELS = ['18mm BWP', '12mm BWP', '12mm MR', '18mm MR', 'Laminates', '8mm Flexi', 'Dead Stock Impact'];
export const MOCK_MARGIN_DATA   = [22.2, 25.6, 15.4, 20.8, 28.4, 6.7, -12];
export const MOCK_CF_LABELS     = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
export const MOCK_CF_COLLECTIONS = [18.4, 21.2, 22.6, 23.8, 24.6, 26.8];
export const MOCK_CF_PURCHASES   = [16.2, 19.4, 20.2, 21.4, 22.0, 24.2];
export const MOCK_OVERDUE_RECEIVABLES = [
  { customer: 'Sharma Constructions', amount: '₹3.4L', days_overdue: 78, risk: 'HIGH'   },
  { customer: 'Mehta Brothers',        amount: '₹2.1L', days_overdue: 52, risk: 'MEDIUM' },
  { customer: 'Patel Contractors',     amount: '₹1.8L', days_overdue: 44, risk: 'MEDIUM' },
  { customer: 'Rajan Interior',        amount: '₹1.2L', days_overdue: 31, risk: 'LOW'    },
  { customer: 'Others (12 accounts)',  amount: '₹4.3L', days_overdue: null, risk: 'LOW'  },
];

// ── Customers ────────────────────────────────────────────────────────────────
export const MOCK_CUSTOMERS = [
  { name: 'Mehta Constructions', segment: 'Contractor',    monthly_value: '₹3.8L', score: 92, outstanding: '₹0.8L', days_since_order: 3,  risk: 'LOW'    },
  { name: 'Design Studio Patel', segment: 'Interior Firm', monthly_value: '₹2.4L', score: 88, outstanding: '₹0.4L', days_since_order: 7,  risk: 'LOW'    },
  { name: 'Kumar & Sons',        segment: 'Retailer',      monthly_value: '₹2.1L', score: 79, outstanding: '₹1.8L', days_since_order: 12, risk: 'MEDIUM' },
  { name: 'Sharma Constructions',segment: 'Contractor',    monthly_value: '₹1.6L', score: 42, outstanding: '₹3.4L', days_since_order: 78, risk: 'HIGH'   },
  { name: 'City Interiors',      segment: 'Interior Firm', monthly_value: '₹1.8L', score: 55, outstanding: '₹0.6L', days_since_order: 47, risk: 'MEDIUM' },
  { name: 'Raj Carpentry Works', segment: 'Carpenter',     monthly_value: '₹0.9L', score: 85, outstanding: '₹0.2L', days_since_order: 5,  risk: 'LOW'    },
  { name: 'Gupta Materials',     segment: 'Retailer',      monthly_value: '₹0.8L', score: 60, outstanding: '₹0.4L', days_since_order: 38, risk: 'MEDIUM' },
  { name: 'Patel Contractors',   segment: 'Contractor',    monthly_value: '₹1.2L', score: 48, outstanding: '₹1.8L', days_since_order: 44, risk: 'HIGH'   },
];

// ── Orders ───────────────────────────────────────────────────────────────────
export const MOCK_ORDER_TREND = [18, 22, 19, 24, 20, 26, 22, 28, 24, 21, 25, 23, 27, 24, 20, 26, 22, 24, 28, 24, 21, 26, 23, 25, 24, 28, 22, 24, 26, 24];
export const MOCK_PENDING_ORDERS = [
  { order: 'ORD-2847', customer: 'Mehta Constructions', value: '₹3.8L', delayed: '30 hours', reason: '18mm BWP stock low',              action: 'Place emergency PO with Century'   },
  { order: 'ORD-2852', customer: 'Patel Contractors',   value: '₹1.2L', delayed: '4 hours',  reason: 'QC pending on MR grade',          action: 'Expedite QC — 2 inspectors needed' },
  { order: 'ORD-2849', customer: 'Design Studio Patel', value: '₹0.8L', delayed: '2 hours',  reason: 'Laminates picking error — rescan', action: 'Re-pick and verify with bin card'  },
  { order: 'ORD-2845', customer: 'Kumar & Sons',        value: '₹0.6L', delayed: '1 hour',   reason: 'Awaiting vehicle assignment',     action: 'Assign vehicle from pool'          },
];

// ── Procurement / Suppliers ───────────────────────────────────────────────────
export const MOCK_SUPPLIERS = [
  { name: 'Century Plyboards', on_time_pct: 96, avg_delay_days: 0.4, grn_match_rate: 100, recommendation: 'PREFERRED', open_pos: 2, overdue_pos: 0, lead_time: '5-6 days', freight_cost: '₹8.4/sheet', price_vs_market: '-3% (below market)' },
  { name: 'Greenply Industries', on_time_pct: 88, avg_delay_days: 1.2, grn_match_rate: 94, recommendation: 'GOOD',      open_pos: 1, overdue_pos: 1, lead_time: '7 days',   freight_cost: '₹12.6/sheet', price_vs_market: '+1% (slight premium)' },
  { name: 'Gauri Laminates',    on_time_pct: 68, avg_delay_days: 3.2, grn_match_rate: 82, recommendation: 'REVIEW',    open_pos: 1, overdue_pos: 1, lead_time: '10-11 days', freight_cost: '₹22/sheet',  price_vs_market: '+11% true landed cost' },
];
export const MOCK_PROCUREMENT_ALERTS = [
  { type: 'danger',  icon: '!', title: 'Gauri Laminates — PO-7731 Overdue +4 Days', detail: '8mm Flexi order delayed — 76 of 200 sheets received. Escalate immediately.', meta: 'PO · CRITICAL' },
  { type: 'warning', icon: '!', title: 'Greenply Industries — PO-7734 Overdue +2 Days', detail: '12mm MR Plain: 180 of 300 sheets received. Follow up for balance.', meta: 'PO · MEDIUM' },
  { type: 'success', icon: '✓', title: 'Century Plyboards — GRN-4424 Matched 100%', detail: '18mm BWP: 250 sheets received, invoice matched, ITC claimable.', meta: 'GRN · COMPLETE' },
  { type: 'info',    icon: '₹', title: '3 Gauri GRN Invoices Missing from GSTR-2B', detail: 'ITC of ₹14,000 unclaimed. Upload invoices in GSTIN portal before 20 Apr.', meta: 'GST · PENDING' },
];

// ── Freight ──────────────────────────────────────────────────────────────────
export const MOCK_FREIGHT_LANES = [
  { lane: 'Whitefield',       cost_per_sheet: 14, fill_pct: 78, status: 'BEST'  },
  { lane: 'Koramangala',      cost_per_sheet: 16, fill_pct: 72, status: 'OK'    },
  { lane: 'HSR Layout',       cost_per_sheet: 17, fill_pct: 65, status: 'OK'    },
  { lane: 'BTM Layout',       cost_per_sheet: 19, fill_pct: 58, status: 'HIGH'  },
  { lane: 'Electronic City',  cost_per_sheet: 24, fill_pct: 54, status: 'WORST' },
  { lane: 'Indiranagar',      cost_per_sheet: 18, fill_pct: 61, status: 'OK'    },
];
export const MOCK_FREIGHT_TREND   = [18.2, 19.4, 17.8, 18.6, 19.2, 18.4, 20.1, 19.6, 18.8, 19.4, 18.6, 18.2, 19.8, 18.4, 19.2, 18.8, 18.4, 18.6, 19.4, 18.2, 18.8, 19.4, 18.6, 18.2, 19.2, 18.4, 19.6, 18.8, 18.4, 18.4];
export const MOCK_INBOUND_TREND   = [8.4,  9.2,  8.6,  22,   8.8,  9.4,  8.4,  22,   9.2,  8.8,  9.4,  8.6,  8.4,  9.2,  22,   8.8,  9.0,  8.4,  9.2,  8.8,  8.6,  9.4,  8.4,  9.2,  22,   8.6,  9.0,  8.4,  9.2,  8.6];

// ── Demand Forecast ───────────────────────────────────────────────────────────
export const MOCK_SEASONAL_INDEX = [88, 84, 90, 96, 105, 118, 128, 114, 106, 98, 95, 100];
export const MOCK_DEMAND_FORECAST = [
  { sku: '18mm BWP',    curr: 480, f30: 596, f60: 680, f90: 712, signal: 'SURGE +24%',    action: 'Pre-order 300 extra sheets NOW' },
  { sku: '12mm MR',     curr: 420, f30: 448, f60: 436, f90: 380, signal: 'STABLE +6.7%',  action: 'Normal ordering cycle'          },
  { sku: '12mm BWP',    curr: 380, f30: 432, f60: 498, f90: 524, signal: 'GROWING +13.7%',action: 'Increase stock by 25%'          },
  { sku: 'Laminates',   curr: 320, f30: 298, f60: 274, f90: 250, signal: 'DECLINING -6.9%',action: 'Reduce next order quantity'    },
  { sku: '8mm Flexi',   curr: 72,  f30: 68,  f60: 64,  f90: 58,  signal: 'SLOW -5.6%',    action: 'No new order — clear current'  },
  { sku: '18mm MR',     curr: 310, f30: 328, f60: 342, f90: 356, signal: 'GROWING +5.8%', action: 'Slight stock increase'          },
  { sku: 'Commercial',  curr: 140, f30: 118, f60: 102, f90: 88,  signal: 'DECLINING -16%',action: 'Stop ordering — clear stock'   },
];

// ── Dead Stock ────────────────────────────────────────────────────────────────
export const MOCK_DEAD_STOCK = [
  { sku: '6mm Gurjan BWP',  days_old: 118, stock: 186, value: '₹1.79L', action: '12% discount to contractors', recovery: 90 },
  { sku: '4mm MR Plain',    days_old: 97,  stock: 240, value: '₹1.39L', action: 'Bundle with 18mm BWP orders', recovery: 75 },
  { sku: '19mm Commercial', days_old: 91,  stock: 102, value: '₹0.99L', action: 'Return to supplier if <90d policy applies', recovery: 85 },
  { sku: '10mm Flexi BWP',  days_old: 74,  stock: 88,  value: '₹0.49L', action: 'Auto-discount 10% — slow mover', recovery: 60 },
  { sku: '8mm Commercial',  days_old: 68,  stock: 64,  value: '₹0.32L', action: 'Bundle clearance offer',       recovery: 55 },
];

// ── Inward / GRN ──────────────────────────────────────────────────────────────
export const MOCK_RECENT_GRN = [
  { grn: 'GRN-4424', supplier: 'Century Plyboards',   value: '₹3.8L', status: 'MATCH',    date: 'Today'    },
  { grn: 'GRN-4423', supplier: 'Greenply Industries', value: '₹1.6L', status: 'MATCH',    date: 'Today'    },
  { grn: 'GRN-4422', supplier: 'Gauri Laminates',     value: '₹1.4L', status: 'MISMATCH', date: 'Today'    },
  { grn: 'GRN-4419', supplier: 'Century Plyboards',   value: '₹2.2L', status: 'MATCH',    date: 'Yesterday'},
  { grn: 'GRN-4418', supplier: 'Gauri Laminates',     value: '₹0.8L', status: 'MISMATCH', date: 'Yesterday'},
];

/** Convenience: return mock data keyed by endpoint name */
export const getMockForView = (view) => {
  const map = {
    inventory:   { skus: MOCK_SKUS },
    sales:       { monthly_revenue: MOCK_SALES_REVENUE.map((r, i) => ({ month: MONTHS_12[i], revenue: r })), margin_by_sku: MOCK_MARGIN_BY_SKU.labels.map((l, i) => ({ sku: l, margin: MOCK_MARGIN_BY_SKU.data[i] })), day_of_week: MOCK_DAY_OF_WEEK.labels.map((l, i) => ({ day: l, avg: MOCK_DAY_OF_WEEK.data[i] })) },
    finance:     { margin_by_sku: MOCK_MARGIN_LABELS.map((l, i) => ({ sku: l, margin: MOCK_MARGIN_DATA[i] })), cash_flow_6m: MOCK_CF_LABELS.map((l, i) => ({ month: l, collections: MOCK_CF_COLLECTIONS[i], purchases: MOCK_CF_PURCHASES[i] })), overdue_receivables: MOCK_OVERDUE_RECEIVABLES },
    customers:   { customers: MOCK_CUSTOMERS },
    orders:      { pending_details: MOCK_PENDING_ORDERS, order_trend_30d: MOCK_ORDER_TREND },
    procurement: { suppliers: MOCK_SUPPLIERS, alerts: MOCK_PROCUREMENT_ALERTS },
    freight:     { outbound_lanes: MOCK_FREIGHT_LANES, freight_trend_30d: MOCK_FREIGHT_TREND },
    demand:      { forecast: MOCK_DEMAND_FORECAST, seasonal_index: MOCK_SEASONAL_INDEX },
    deadstock:   { items: MOCK_DEAD_STOCK },
    inward:      { recent_grn: MOCK_RECENT_GRN },
  };
  return map[view] ?? {};
};
