import React, { useState, useEffect, useCallback } from 'react';
import PageLoader from '../components/PageLoader';
import ErrorState from '../components/ErrorState';
import DataSourceBadge from '../components/DataSourceBadge';

export default function POGRN({ onGoChat }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/po-grn');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreatePO = () => {
    if (onGoChat) {
      onGoChat('I want to create a new purchase order. Help me raise one.');
    }
  };

  const handleAskChatbot = (query) => {
    if (onGoChat) onGoChat(query);
  };

  if (loading) {
    return (
      <div className="view">
        <div className="ph">
          <div className="pg">PO &amp; GRN — End-to-End Procurement Lifecycle</div>
          <div className="psub">Fetching live procurement data…</div>
        </div>
        <PageLoader label="Loading purchase orders and GRN records…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="view">
        <div className="ph">
          <div className="pg">PO &amp; GRN — End-to-End Procurement Lifecycle</div>
        </div>
        <div className="card">
          <ErrorState message={`Could not load PO & GRN data: ${error}`} onRetry={fetchData} />
        </div>
      </div>
    );
  }

  const kpis   = data?.kpis           || {};
  const openPOs = data?.open_pos      || [];
  const discrepancies = data?.grn_discrepancies || [];
  const isLive  = data?.data_source === 'mysql';

  const fillColor = (pct) => {
    if (pct >= 100) return '#16a34a';
    if (pct >= 70)  return '#d97706';
    return '#dc2626';
  };

  const statusBadge = (status, overdueDays) => {
    if (status === 'OVERDUE')   return { cls: 'br', label: `OVERDUE +${overdueDays}d` };
    if (status === 'RECEIVED')  return { cls: 'bg', label: 'COMPLETE' };
    if (status === 'PARTIAL')   return { cls: 'ba', label: 'IN PROGRESS' };
    if (status === 'OPEN')      return { cls: 'ba', label: 'OPEN' };
    return { cls: 'bs', label: status };
  };

  return (
    <div className="view">
      {/* Page header */}
      <div className="ph" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="pg">PO &amp; GRN — End-to-End Procurement Lifecycle</div>
          <div className="psub" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Purchase orders · Goods received · 3-way match · AI discrepancy detection
            {' '}<DataSourceBadge source={isLive ? 'mysql' : 'mock'} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => handleAskChatbot('Show me the status of all open and overdue purchase orders')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, fontWeight: 600, color: 'var(--text)', cursor: 'pointer' }}
          >
            🤖 Ask AI
          </button>
          <button
            onClick={handleCreatePO}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: 'var(--b2)', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer' }}
          >
            + Create PO
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kg g5">
        {[
          {
            cls: 'sb', l: 'Open POs',
            v: String(kpis.open_pos ?? 8),
            d: `${kpis.open_po_value ?? '₹12.4L'} total`,
            s: `${kpis.ai_auto_pos ?? 4} AI auto-generated`,
          },
          {
            cls: 'sr', l: 'Overdue POs',
            v: String(kpis.overdue_pos ?? 2),
            d: kpis.overdue_po_list ? `▼ ${kpis.overdue_po_list.slice(0, 40)}` : '▼ 2 suppliers behind',
            s: 'Follow up required today',
          },
          {
            cls: 'sg', l: 'GRN Match Rate',
            v: kpis.grn_match_rate ?? '96%',
            d: `▲ ${kpis.grn_mismatches_mtd ?? 3} mismatches MTD`,
            s: `${kpis.grn_variance_value ?? '₹8,400'} variance flagged`,
          },
          {
            cls: 'sa', l: 'Partial POs',
            v: String(kpis.partial_pos ?? 3),
            d: '▲ Partially delivered',
            s: 'Check fill rates below',
          },
          {
            cls: 'st', l: 'GRN Issues',
            v: String(discrepancies.length),
            d: '▲ AI flagged',
            s: 'Review discrepancy log',
          },
        ].map(k => (
          <div key={k.l} className={`kc ${k.cls}`}>
            <div className="kt"><div className="kl">{k.l}</div></div>
            <div className="kv">{k.v}</div>
            <div className="kd wn">{k.d}</div>
            <div className="ks">{k.s}</div>
          </div>
        ))}
      </div>

      {/* Open Purchase Orders Table */}
      <div className="card">
        <div className="ch">
          <div className="ctit">Open Purchase Orders</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="bdg ba">{openPOs.length} Open</span>
            <button
              onClick={handleCreatePO}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'var(--b2)', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#fff', cursor: 'pointer' }}
            >
              + New PO
            </button>
          </div>
        </div>
        {openPOs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)', fontSize: 13 }}>
            No open purchase orders at this time.
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>PO#</th><th>Supplier</th><th>SKU</th>
                <th>Ordered</th><th>Received</th><th>Fill %</th>
                <th>Value</th><th>ETA</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {openPOs.map((po) => {
                const badge = statusBadge(po.status, po.overdue_days);
                return (
                  <tr key={po.po_number}>
                    <td style={{ fontFamily: 'var(--mono)', color: 'var(--b2)', fontWeight: 600 }}>
                      {po.po_number}
                    </td>
                    <td style={{ fontWeight: 600 }}>{po.supplier}</td>
                    <td>{po.sku}</td>
                    <td style={{ fontFamily: 'var(--mono)' }}>{po.qty_ordered}</td>
                    <td style={{ fontFamily: 'var(--mono)' }}>{po.qty_received}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: fillColor(po.fill_pct) }}>
                      {po.fill_pct}%
                    </td>
                    <td style={{ fontFamily: 'var(--mono)' }}>{po.value}</td>
                    <td><span className={`bdg ${badge.cls}`}>{po.eta}</span></td>
                    <td><span className={`bdg ${badge.cls}`}>{badge.label}</span></td>
                    <td>
                      <button
                        onClick={() => handleAskChatbot(`What is the status of ${po.po_number} from ${po.supplier}?`)}
                        style={{ fontSize: 10, padding: '2px 7px', background: 'none', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', color: 'var(--b2)', fontWeight: 600 }}
                      >
                        Ask AI
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* GRN Discrepancy Log */}
      <div className="card" style={{ marginTop: '12px' }}>
        <div className="ch">
          <div className="ctit">GRN Discrepancy Log — AI Flagged</div>
          <span className={`bdg ${discrepancies.length > 0 ? 'br' : 'bg'}`}>
            {discrepancies.length} {discrepancies.length === 1 ? 'Mismatch' : 'Mismatches'}
          </span>
        </div>
        {discrepancies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#16a34a', fontSize: 13 }}>
            ✓ No GRN discrepancies — all receipts matched.
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>GRN#</th><th>PO#</th><th>Supplier</th>
                <th>Invoice Value</th><th>GRN Value</th>
                <th>Variance</th><th>Issue</th><th>Action</th><th>RCA</th>
              </tr>
            </thead>
            <tbody>
              {discrepancies.map((g) => (
                <tr key={g.grn_number}>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--b2)' }}>{g.grn_number}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>{g.po_number}</td>
                  <td>{g.supplier}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>{g.invoice_value}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: '#dc2626' }}>{g.grn_value}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: '#dc2626' }}>{g.discrepancy_amt}</td>
                  <td style={{ fontSize: 11 }}>{g.notes}</td>
                  <td style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>{g.action}</td>
                  <td>
                    <button
                      onClick={() => handleAskChatbot(`Explain the GRN discrepancy ${g.grn_number} for ${g.supplier} and give me a step-by-step action plan`)}
                      style={{ fontSize: 10, padding: '2px 7px', background: 'none', border: '1px solid #dc2626', borderRadius: 4, cursor: 'pointer', color: '#dc2626', fontWeight: 600 }}
                    >
                      RCA + Fix
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reload note */}
      <div style={{ textAlign: 'right', marginTop: 8, fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
        <DataSourceBadge source={isLive ? 'mysql' : 'mock'} />
        <button onClick={fetchData} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 5, cursor: 'pointer', color: 'var(--text3)', fontSize: 11, padding: '3px 9px', fontFamily: 'var(--mono)' }}>
          ↻ Refresh
        </button>
        <span style={{ fontFamily: 'var(--mono)' }}>Updated {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
}
