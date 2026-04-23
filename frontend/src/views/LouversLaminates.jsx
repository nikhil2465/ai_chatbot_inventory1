import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DataSourceBadge from '../components/DataSourceBadge';
import PageLoader from '../components/PageLoader';
import ErrorState from '../components/ErrorState';
import DiscountAIPanel from './DiscountAIPanel';

// ── Formatters ────────────────────────────────────────────────────────────────
const fmt    = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const fmtL   = (n) => { const v = Number(n); return v >= 100000 ? `₹${(v/100000).toFixed(2)}L` : fmt(v); };
const fmtPct = (n) => `${Number(n).toFixed(1)}%`;

// ── Status configs ────────────────────────────────────────────────────────────
const ORDER_STATUS = {
  DRAFT:         { label:'Draft',         cls:'ba', next:'CONFIRMED' },
  CONFIRMED:     { label:'Confirmed',     cls:'bb', next:'IN_PRODUCTION' },
  IN_PRODUCTION: { label:'In Production', cls:'bt', next:'DISPATCHED' },
  DISPATCHED:    { label:'Dispatched',    cls:'bp', next:'DELIVERED' },
  DELIVERED:     { label:'Delivered',     cls:'bg', next:null },
  CANCELLED:     { label:'Cancelled',     cls:'br', next:null },
};
const CLAIM_STATUS = {
  DRAFT:        { label:'Draft',        cls:'ba' },
  SUBMITTED:    { label:'Submitted',    cls:'bb' },
  UNDER_REVIEW: { label:'Under Review', cls:'bt' },
  APPROVED:     { label:'Approved',     cls:'bg' },
  PARTIAL:      { label:'Partial',      cls:'bp' },
  REJECTED:     { label:'Rejected',     cls:'br' },
};
const REBATE_STATUS = {
  ACTIVE:           { label:'Active',           cls:'bb' },
  ACHIEVED:         { label:'Achieved',         cls:'bg' },
  PENDING_APPROVAL: { label:'Pending Approval', cls:'bt' },
  PAID:             { label:'Paid',             cls:'bsl' },
  LAPSED:           { label:'Lapsed',           cls:'br' },
};
const CLAIM_TYPES  = ['PRICE_DIFF','DAMAGE','FREIGHT_EXCESS','PROMO_SUPPORT','SHORTAGE'];
const REBATE_TYPES = ['VOLUME','LOYALTY','PROJECT','ANNUAL_TARGET'];
const CUST_TYPES   = ['Architect','Contractor','Interior Firm','Developer','Retailer'];
const CLAIM_TYPE_LABELS = {
  PRICE_DIFF:'Price Difference', DAMAGE:'Transit Damage',
  FREIGHT_EXCESS:'Freight Excess', PROMO_SUPPORT:'Promo Support', SHORTAGE:'Shortage',
};
const REBATE_TYPE_LABELS = {
  VOLUME:'Volume Rebate', LOYALTY:'Loyalty Rebate',
  PROJECT:'Project Rebate', ANNUAL_TARGET:'Annual Target',
};

// ── Reusable badge ────────────────────────────────────────────────────────────
function StatusBadge({ status, map }) {
  const cfg = map[status] || { label: status, cls: 'ba' };
  return <span className={`bdg ${cfg.cls}`}>{cfg.label}</span>;
}

// ── AI trigger button ─────────────────────────────────────────────────────────
function AiBtn({ label, onClick, full, sm }) {
  return (
    <button
      className={`dap-trigger-btn${sm ? ' sm' : ''}`}
      style={full ? { width: '100%', justifyContent: 'center' } : {}}
      onClick={onClick}
    >✨ {label}</button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1: SALES ORDERS
// ─────────────────────────────────────────────────────────────────────────────

function SalesOrdersTab({ data, onRefresh, openAI }) {
  const products  = data?.products  || [];
  const quotations= data?.quotations || {};
  const [orders, setOrders] = useState(data?.orders || []);
  const [filter, setFilter] = useState('ALL');

  const [form, setForm] = useState({
    customer_name:'', customer_type:'Architect',
    product_id:'', quantity:1, supplier_id:'', delivery_date:'', site_location:'', notes:'',
  });
  const [saving, setSaving]     = useState(false);
  const [savedOrder, setSavedOrder] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeQuotes, setActiveQuotes] = useState([]);

  useEffect(() => { setOrders(data?.orders || []); }, [data]);

  const handleProductChange = (pid) => {
    const p = products.find(x => String(x.product_id) === String(pid));
    setSelectedProduct(p || null);
    setActiveQuotes(quotations[String(pid)] || []);
    setForm(f => ({ ...f, product_id: pid, supplier_id: '' }));
  };

  const selectedSupplier = activeQuotes.find(q => String(q.supplier_id) === String(form.supplier_id));
  const orderTotal = selectedProduct && form.quantity > 0
    ? selectedProduct.sell_price * Number(form.quantity) : 0;

  const handleSubmitOrder = async () => {
    if (!form.customer_name || !form.product_id || !form.quantity) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        product_id:   Number(form.product_id),
        quantity:     Number(form.quantity),
        product_name: selectedProduct?.sku_name || '',
        category:     selectedProduct?.category || '',
        unit:         selectedProduct?.unit || '',
        sell_price:   selectedProduct?.sell_price || 0,
        buy_price:    selectedSupplier?.rate || selectedProduct?.buy_price || 0,
        supplier_name: selectedSupplier?.name || '',
      };
      const res = await fetch('/api/louvers/orders', {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload),
      });
      const json = await res.json();
      setSavedOrder(json);
      setShowForm(false);
      setForm({ customer_name:'', customer_type:'Architect', product_id:'', quantity:1,
                supplier_id:'', delivery_date:'', site_location:'', notes:'' });
      onRefresh();
    } catch(e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleAdvanceStatus = async (orderId, newStatus) => {
    try {
      await fetch(`/api/louvers/orders/${orderId}/status`, {
        method:'PUT', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));
    } catch(e) { console.error(e); }
  };

  const filteredOrders = useMemo(() =>
    filter === 'ALL' ? orders : orders.filter(o => o.status === filter),
  [orders, filter]);

  return (
    <div>
      {/* ── Create Sales Order — prominent action card ──────────────────────── */}
      <div className="ll-create-order-bar">
        <div className="ll-create-order-bar-left">
          <div className="ll-create-order-bar-icon">
            <svg viewBox="0 0 20 20" fill="none" width="22" height="22">
              <rect x="2" y="3" width="16" height="14" rx="2.5" stroke="white" strokeWidth="1.6"/>
              <path d="M10 7v6M7 10h6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className="ll-create-order-bar-title">Create New Sales Order</div>
            <div className="ll-create-order-bar-sub">Place a new louvers or laminates order — select product, supplier &amp; customer details</div>
          </div>
        </div>
        <button
          className="ll-create-order-bar-btn"
          onClick={() => {
            setShowForm(true);
            setSelectedProduct(null);
            setActiveQuotes([]);
            setForm(f => ({ ...f, product_id:'', supplier_id:'' }));
            setTimeout(() => document.getElementById('ll-order-form')?.scrollIntoView({ behavior:'smooth', block:'start' }), 80);
          }}
        >
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          New Sales Order
        </button>
      </div>

      {/* Product Catalogue */}
      <div className="ll-section-hdr">
        <div>
          <div className="ctit">Product Catalogue</div>
          <div className="csub">7 products · click a card to pre-select, or use the button above to start blank</div>
        </div>
        <AiBtn sm label="Catalogue insights"
          onClick={() => openAI(
            `Give me an overview of the louvers and laminates product range: HPL laminates (₹1,300/sheet), `+
            `Compact 6mm (₹3,600/sheet), Acrylic (₹2,100/sheet), Aluminium 100mm Anodized (₹2,100/RM), `+
            `80mm Powder Coated (₹1,680/RM), PVC Blades (₹580/RM), Motorised Louvre System (₹12,000/SQM). `+
            `Which products give the best margins? Which should I push for Architects vs Contractors vs Developers?`
          )} />
      </div>

      <div className="ll-product-grid">
        {products.map(p => {
          const quotes = quotations[String(p.product_id)] || [];
          const best   = quotes.find(q => q.is_best);
          const isSelected = String(form.product_id) === String(p.product_id);
          return (
            <div
              key={p.product_id}
              className={`ll-product-card${isSelected ? ' selected' : ''}`}
              onClick={() => { handleProductChange(p.product_id); setShowForm(true); }}
            >
              <div className="ll-prod-cat">{p.category}</div>
              <div className="ll-prod-name">{p.sku_name}</div>
              <div className="ll-prod-meta">{p.brand} · {p.unit}</div>
              <div className="ll-prod-prices">
                <span className="ll-sell">{fmt(p.sell_price)}</span>
                <span className="ll-margin">{fmtPct(p.margin_pct)} margin</span>
              </div>
              {best && (
                <div className="ll-prod-supplier">
                  Best supply: <strong>{best.name}</strong> @ {fmt(best.rate)}/{p.unit}
                </div>
              )}
              <div className="ll-prod-apps">{p.applications}</div>
              <div className="ll-prod-footer">
                <button className="dap-trigger-btn sm" style={{fontSize:9}} onClick={e => {
                  e.stopPropagation();
                  openAI(
                    `Tell me about ${p.sku_name} (${p.category}): sell price ${fmt(p.sell_price)}/${p.unit}, `+
                    `margin ${fmtPct(p.margin_pct)}, ${quotes.length} suppliers quoting. `+
                    `Applications: ${p.applications}. `+
                    `Which customer segment should I target for this product? What are the key selling points?`
                  );
                }}>✨ AI insights</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Order Form */}
      {showForm && (
        <div id="ll-order-form" className="card" style={{ marginTop: 14, borderTop: '3px solid var(--accent)' }}>
          <div className="ch">
            <div>
              <div className="ctit">
                {selectedProduct ? `New Sales Order — ${selectedProduct.sku_name}` : 'New Sales Order'}
              </div>
              <div className="csub">
                {selectedProduct
                  ? `${selectedProduct.category} · ${fmt(selectedProduct.sell_price)}/${selectedProduct.unit}`
                  : 'Select a product to begin'}
              </div>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              {savedOrder && <span className="bdg bg">✓ {savedOrder.order_number}</span>}
              <AiBtn sm label="Pricing advice"
                onClick={() => openAI(
                  `I'm creating a sales order for ${selectedProduct.sku_name} at ${fmt(selectedProduct.sell_price)}/${selectedProduct.unit}. `+
                  `Margin: ${fmtPct(selectedProduct.margin_pct)}. `+
                  `Customer type: ${form.customer_type}. Quantity: ${form.quantity} ${selectedProduct.unit}. `+
                  `Is this a good deal? Any pricing or margin tips for this product + customer combination?`
                )} />
              <button className="dc-ai-btn" onClick={() => setShowForm(false)}>✕ Close</button>
            </div>
          </div>

          <div className="ll-form-grid">
            {/* Product selector — shown when form opened via button (no card click) */}
            {!selectedProduct && (
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="dc-lbl">Select Product *</div>
                <select className="dc-inp"
                  value={form.product_id}
                  onChange={e => handleProductChange(e.target.value)}>
                  <option value="">— Choose a product —</option>
                  {products.map(p => (
                    <option key={p.product_id} value={p.product_id}>
                      {p.sku_name} ({p.category}) — {fmt(p.sell_price)}/{p.unit} · {fmtPct(p.margin_pct)} margin
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <div className="dc-lbl">Customer Name *</div>
              <input className="dc-inp" placeholder="e.g. Prestige Developers"
                value={form.customer_name} onChange={e => setForm(f=>({...f,customer_name:e.target.value}))} />
            </div>
            <div>
              <div className="dc-lbl">Customer Type</div>
              <select className="dc-inp" value={form.customer_type}
                onChange={e => setForm(f=>({...f,customer_type:e.target.value}))}>
                {CUST_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <div className="dc-lbl">Quantity ({selectedProduct.unit}) *</div>
              <input type="number" min={1} className="dc-inp" value={form.quantity}
                onChange={e => setForm(f=>({...f,quantity:Math.max(1,Number(e.target.value)||1)}))} />
            </div>
            <div>
              <div className="dc-lbl">Delivery Date</div>
              <input type="date" className="dc-inp" value={form.delivery_date}
                onChange={e => setForm(f=>({...f,delivery_date:e.target.value}))} />
            </div>
            <div>
              <div className="dc-lbl">Site Location</div>
              <input className="dc-inp" placeholder="e.g. Whitefield, Bangalore"
                value={form.site_location} onChange={e => setForm(f=>({...f,site_location:e.target.value}))} />
            </div>
            <div>
              <div className="dc-lbl">Notes</div>
              <input className="dc-inp" placeholder="Colour, finish, special requirements…"
                value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} />
            </div>
          </div>

          {/* Supplier selection */}
          {activeQuotes.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div className="dc-lbl" style={{ margin:0 }}>Select Supplier ({activeQuotes.length} quoting)</div>
                <AiBtn sm label="Compare suppliers"
                  onClick={() => {
                    const lines = activeQuotes.map(q=>
                      `${q.name} (${q.city}): ₹${q.rate}/${selectedProduct.unit} + ₹${q.freight} freight, ${q.lead}d lead, ${q.rel}% reliability`
                    ).join('; ');
                    openAI(
                      `Compare suppliers for ${selectedProduct.sku_name}: ${lines}. `+
                      `Which supplier should I choose for a ${form.quantity}-unit order? `+
                      `Balance rate, reliability and lead time.`
                    );
                  }} />
              </div>
              <div className="ll-supplier-grid">
                {activeQuotes.map(q => {
                  const landed  = q.rate + q.freight;
                  const isChosen= String(form.supplier_id) === String(q.supplier_id);
                  const recCls  = q.rec==='PREFERRED'?'bg': q.rec==='REVIEW'?'br':'bb';
                  return (
                    <div key={q.supplier_id}
                      className={`ll-supplier-card${isChosen?' chosen':''}${q.is_best?' ll-best':''}`}
                      onClick={() => setForm(f=>({...f,supplier_id:q.supplier_id}))}>
                      <div className="ll-sup-name">{q.name} <span className={`bdg ${recCls}`} style={{fontSize:9}}>{q.rec}</span></div>
                      <div className="ll-sup-city">{q.city} · {q.lead}d lead · {q.rel}% reliable · MOQ {q.moq}</div>
                      <div className="ll-sup-rates">
                        <span>{fmt(q.rate)}/{selectedProduct.unit}</span>
                        <span style={{color:'var(--text3)'}}>+{fmt(q.freight)} freight</span>
                        <span style={{fontWeight:700}}>= {fmt(landed)} landed</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order summary */}
          {orderTotal > 0 && (
            <div className="ll-order-summary">
              <span>Order Value: <strong>{fmtL(orderTotal)}</strong></span>
              <span>Est. Margin: <strong style={{color:selectedProduct.margin_pct>=18?'var(--green)':'var(--a2)'}}>{fmtPct(selectedProduct.margin_pct)}</strong></span>
            </div>
          )}

          <div className="dc-actions" style={{ marginTop: 12 }}>
            <button className="dc-save-btn" onClick={handleSubmitOrder} disabled={saving || !form.customer_name || !form.product_id || !selectedProduct}>
              {saving ? 'Creating…' : '✓ Confirm Sales Order'}
            </button>
            <AiBtn label="Analyse before confirming"
              onClick={() => openAI(
                `Before I confirm this sales order: ${form.quantity} ${selectedProduct.unit} of ${selectedProduct.sku_name} `+
                `for ${form.customer_name||'unnamed'} (${form.customer_type}), `+
                `${selectedSupplier?`sourcing from ${selectedSupplier.name} at ₹${selectedSupplier.rate}/${selectedProduct.unit}`:'no supplier selected yet'}. `+
                `Total value: ${fmtL(orderTotal)}. Margin: ${fmtPct(selectedProduct.margin_pct)}. `+
                `What should I check before confirming? Any risks or red flags?`
              )} />
          </div>
        </div>
      )}

      {/* Order History */}
      <div className="card" style={{ marginTop: 14 }}>
        <div className="ch">
          <div>
            <div className="ctit">Order History</div>
            <div className="csub">{orders.length} orders · click row to advance status</div>
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
            <AiBtn sm label="Analyse pipeline"
              onClick={() => {
                const active = orders.filter(o=>o.status!=='DELIVERED'&&o.status!=='CANCELLED');
                const total  = orders.reduce((a,o)=>a+o.total_value,0);
                openAI(
                  `Analyse my louvers & laminates order pipeline: ${orders.length} total orders, `+
                  `${active.length} active, total value ${fmtL(total)}, avg margin ${fmtPct(orders.reduce((a,o)=>a+o.margin_pct,0)/orders.length)}. `+
                  `Orders by status: DRAFT (${orders.filter(o=>o.status==='DRAFT').length}), `+
                  `CONFIRMED (${orders.filter(o=>o.status==='CONFIRMED').length}), `+
                  `IN_PRODUCTION (${orders.filter(o=>o.status==='IN_PRODUCTION').length}), `+
                  `DISPATCHED (${orders.filter(o=>o.status==='DISPATCHED').length}). `+
                  `Which orders need urgent attention? What should I focus on today?`
                );
              }} />
            {['ALL','DRAFT','CONFIRMED','IN_PRODUCTION','DISPATCHED','DELIVERED'].map(f=>(
              <button key={f} className={`dc-filter-btn${filter===f?' active':''}`}
                onClick={()=>setFilter(f)} style={{fontSize:9}}>
                {f.replace('_',' ')}
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="tbl">
            <thead><tr>
              <th>Order #</th><th>Customer</th><th>Type</th>
              <th>Product</th><th style={{textAlign:'right'}}>Qty</th>
              <th style={{textAlign:'right'}}>Value</th><th style={{textAlign:'right'}}>Margin</th>
              <th>Delivery</th><th>Status</th><th>Action</th>
            </tr></thead>
            <tbody>
              {filteredOrders.map(o => {
                const sc   = ORDER_STATUS[o.status] || ORDER_STATUS.DRAFT;
                const past = o.delivery_date && new Date(o.delivery_date) < new Date();
                return (
                  <tr key={o.order_id} style={{cursor:'pointer'}} title="Click row to ask AI"
                    onClick={() => openAI(
                      `Analyse order ${o.order_number} for ${o.customer_name} (${o.customer_type}): `+
                      `${o.quantity} ${o.unit} of ${o.product_name}, value ${fmtL(o.total_value)}, `+
                      `margin ${fmtPct(o.margin_pct)}, supplier ${o.supplier_name}, `+
                      `delivery ${o.delivery_date||'not set'}, status ${o.status}. `+
                      `What action should I take on this order? Any risks?`
                    )}>
                    <td><span style={{fontFamily:'var(--mono)',fontSize:10,fontWeight:700}}>{o.order_number}</span></td>
                    <td style={{maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.customer_name}</td>
                    <td><span className="bdg ba" style={{fontSize:9}}>{o.customer_type}</span></td>
                    <td style={{maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:11}}>{o.product_name}</td>
                    <td style={{textAlign:'right',fontFamily:'var(--mono)',fontSize:11}}>{Number(o.quantity).toLocaleString('en-IN')} {o.unit}</td>
                    <td style={{textAlign:'right',fontFamily:'var(--mono)',fontWeight:700,fontSize:11}}>{fmtL(o.total_value)}</td>
                    <td style={{textAlign:'right'}}>
                      <span style={{fontFamily:'var(--mono)',fontSize:11,fontWeight:700,
                        color:o.margin_pct>=20?'var(--green)':o.margin_pct>=15?'var(--a2)':'var(--r2)'}}>
                        {fmtPct(o.margin_pct)}
                      </span>
                    </td>
                    <td style={{fontFamily:'var(--mono)',fontSize:10,color:past&&o.status!=='DELIVERED'?'var(--r2)':'var(--text3)'}}>
                      {o.delivery_date||'—'}
                    </td>
                    <td><StatusBadge status={o.status} map={ORDER_STATUS} /></td>
                    <td onClick={e=>e.stopPropagation()}>
                      <div style={{display:'flex',gap:4}}>
                        {sc.next && (
                          <button className="dc-act-btn dc-act-green"
                            onClick={()=>handleAdvanceStatus(o.order_id, sc.next)}
                            title={`Advance to ${sc.next}`}>→ {ORDER_STATUS[sc.next]?.label}</button>
                        )}
                        <button className="dap-trigger-btn sm" style={{fontSize:9}}
                          onClick={()=>openAI(
                            `Quick AI check on order ${o.order_number}: ${o.product_name} for ${o.customer_name}, `+
                            `${o.status} status. Delivery: ${o.delivery_date||'not set'}. What's the next best action?`
                          )}>✨</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2: DISTRIBUTOR CLAIMS
// ─────────────────────────────────────────────────────────────────────────────

function DistributorClaimsTab({ data, onRefresh, openAI }) {
  const products = data?.products || [];
  const [claims, setClaims] = useState(data?.claims || []);
  const [filter, setFilter] = useState('ALL');
  const [showForm, setShowForm]   = useState(false);
  const [savedClaim, setSavedClaim] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    distributor_name:'', claim_type:'PRICE_DIFF', product_name:'', invoice_ref:'',
    invoice_date:'', quantity:1, unit:'sheet', claimed_rate:0, amount_claimed:0, notes:'',
  });

  useEffect(() => { setClaims(data?.claims || []); }, [data]);

  const handleSubmit = async () => {
    if (!form.distributor_name || !form.product_name || !form.invoice_ref) return;
    setSaving(true);
    try {
      const res  = await fetch('/api/louvers/claims', {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form),
      });
      const json = await res.json();
      setSavedClaim(json);
      setShowForm(false);
      setForm({ distributor_name:'', claim_type:'PRICE_DIFF', product_name:'', invoice_ref:'',
                invoice_date:'', quantity:1, unit:'sheet', claimed_rate:0, amount_claimed:0, notes:'' });
    } catch(e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleStatusUpdate = async (claimId, newStatus, approvedAmount) => {
    try {
      await fetch(`/api/louvers/claims/${claimId}/status`, {
        method:'PUT', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ status: newStatus, approved_amount: approvedAmount }),
      });
      setClaims(prev => prev.map(c => c.claim_id === claimId ? {...c, status: newStatus, amount_approved: approvedAmount} : c));
    } catch(e) { console.error(e); }
  };

  const filteredClaims = useMemo(() =>
    filter==='ALL' ? claims : claims.filter(c=>c.status===filter),
  [claims, filter]);

  const totalPending  = claims.filter(c=>['SUBMITTED','UNDER_REVIEW'].includes(c.status)).reduce((a,c)=>a+c.amount_claimed,0);
  const totalApproved = claims.filter(c=>['APPROVED','PARTIAL'].includes(c.status)).reduce((a,c)=>a+(c.amount_approved||0),0);

  return (
    <div>
      {/* KPI strip */}
      <div className="ll-claim-kpi-row">
        <div className="ll-claim-kpi" onClick={() => openAI(
          `My pending distributor claims total ${fmtL(totalPending)} across ${claims.filter(c=>['SUBMITTED','UNDER_REVIEW'].includes(c.status)).length} open claims. `+
          `What is the best process to resolve these quickly? What documentation should I have ready?`
        )}>
          <div className="ll-claim-kpi-lbl">Pending Claims ✨</div>
          <div className="ll-claim-kpi-val" style={{color:'var(--amber)'}}>{fmtL(totalPending)}</div>
          <div className="ll-claim-kpi-sub">{claims.filter(c=>['SUBMITTED','UNDER_REVIEW'].includes(c.status)).length} open</div>
        </div>
        <div className="ll-claim-kpi" onClick={() => openAI(
          `My approved distributor claims total ${fmtL(totalApproved)} this month. `+
          `How do I track and reconcile these against supplier credit notes? Best practice for claim accounting?`
        )}>
          <div className="ll-claim-kpi-lbl">Approved Claims ✨</div>
          <div className="ll-claim-kpi-val" style={{color:'var(--green)'}}>{fmtL(totalApproved)}</div>
          <div className="ll-claim-kpi-sub">{claims.filter(c=>['APPROVED','PARTIAL'].includes(c.status)).length} settled</div>
        </div>
        <div className="ll-claim-kpi" onClick={() => openAI(
          `I have ${claims.length} distributor claims: `+
          `${claims.filter(c=>c.claim_type==='PRICE_DIFF').length} price diff, `+
          `${claims.filter(c=>c.claim_type==='DAMAGE').length} damage, `+
          `${claims.filter(c=>c.claim_type==='FREIGHT_EXCESS').length} freight excess, `+
          `${claims.filter(c=>c.claim_type==='SHORTAGE').length} shortage, `+
          `${claims.filter(c=>c.claim_type==='PROMO_SUPPORT').length} promo support. `+
          `Which claim types are most common and how do I reduce them?`
        )}>
          <div className="ll-claim-kpi-lbl">Total Claims ✨</div>
          <div className="ll-claim-kpi-val">{claims.length}</div>
          <div className="ll-claim-kpi-sub">All time</div>
        </div>
        <div className="ll-claim-kpi">
          <AiBtn label="Full claims analysis"
            onClick={() => openAI(
              `Analyse distributor claims for my louvers & laminates business: `+
              `${claims.length} total claims, ${fmtL(totalPending)} pending, ${fmtL(totalApproved)} approved. `+
              `Claim types: price difference, transit damage, freight excess, promo support, shortage. `+
              `What's the industry benchmark for claim resolution? How do I build a watertight claims policy?`
            )} />
        </div>
      </div>

      {/* New claim form */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="ch">
          <div>
            <div className="ctit">Raise Distributor Claim</div>
            <div className="csub">Log price difference, damage, freight excess, promo support or shortage</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            {savedClaim && <span className="bdg bg">✓ {savedClaim.claim_number}</span>}
            <button className="dc-ai-btn" onClick={()=>setShowForm(!showForm)}>
              {showForm ? '▲ Hide Form' : '+ New Claim'}
            </button>
          </div>
        </div>
        {showForm && (
          <div>
            <div className="ll-form-grid" style={{marginTop:12}}>
              <div>
                <div className="dc-lbl">Distributor Name *</div>
                <input className="dc-inp" placeholder="e.g. Bangalore Building Supplies"
                  value={form.distributor_name} onChange={e=>setForm(f=>({...f,distributor_name:e.target.value}))} />
              </div>
              <div>
                <div className="dc-lbl">Claim Type *</div>
                <select className="dc-inp" value={form.claim_type}
                  onChange={e=>setForm(f=>({...f,claim_type:e.target.value}))}>
                  {CLAIM_TYPES.map(t=><option key={t} value={t}>{CLAIM_TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <div className="dc-lbl">Product</div>
                <select className="dc-inp" value={form.product_name}
                  onChange={e=>setForm(f=>({...f,product_name:e.target.value}))}>
                  <option value="">— select product —</option>
                  {products.map(p=><option key={p.product_id} value={p.sku_name}>{p.sku_name}</option>)}
                </select>
              </div>
              <div>
                <div className="dc-lbl">Invoice Reference *</div>
                <input className="dc-inp" placeholder="INV-2026-XXXX"
                  value={form.invoice_ref} onChange={e=>setForm(f=>({...f,invoice_ref:e.target.value}))} />
              </div>
              <div>
                <div className="dc-lbl">Invoice Date</div>
                <input type="date" className="dc-inp" value={form.invoice_date}
                  onChange={e=>setForm(f=>({...f,invoice_date:e.target.value}))} />
              </div>
              <div>
                <div className="dc-lbl">Quantity</div>
                <input type="number" min={1} className="dc-inp" value={form.quantity}
                  onChange={e=>setForm(f=>({...f,quantity:Number(e.target.value)||1}))} />
              </div>
              <div>
                <div className="dc-lbl">Claimed Rate (per unit)</div>
                <input type="number" min={0} className="dc-inp" value={form.claimed_rate}
                  onChange={e=>{
                    const rate=Number(e.target.value)||0;
                    setForm(f=>({...f,claimed_rate:rate,amount_claimed:Math.round(rate*f.quantity)}));
                  }} />
              </div>
              <div>
                <div className="dc-lbl">Total Amount Claimed</div>
                <input type="number" min={0} className="dc-inp" value={form.amount_claimed}
                  onChange={e=>setForm(f=>({...f,amount_claimed:Number(e.target.value)||0}))} />
              </div>
            </div>
            <div style={{marginTop:8}}>
              <div className="dc-lbl">Notes / Evidence</div>
              <input className="dc-inp" style={{width:'100%',boxSizing:'border-box'}}
                placeholder="Describe the issue, attach invoice reference…"
                value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} />
            </div>
            <div className="dc-actions" style={{marginTop:12}}>
              <button className="dc-save-btn" onClick={handleSubmit}
                disabled={saving||!form.distributor_name||!form.invoice_ref}>
                {saving?'Submitting…':'✓ Submit Claim'}
              </button>
              <AiBtn label="Is my claim valid?"
                onClick={() => openAI(
                  `I want to raise a ${CLAIM_TYPE_LABELS[form.claim_type]||form.claim_type} claim `+
                  `for ${form.product_name||'[product]'}, invoice ${form.invoice_ref||'[ref]'}, `+
                  `${form.quantity} units, amount ₹${form.amount_claimed.toLocaleString('en-IN')}. `+
                  `Is this a valid claim? What documentation and evidence do I need? `+
                  `What is a realistic approval rate for this claim type?`
                )} />
            </div>
          </div>
        )}
      </div>

      {/* Claims History Table */}
      <div className="card">
        <div className="ch">
          <div>
            <div className="ctit">Claims History</div>
            <div className="csub">{claims.length} claims · click row for AI analysis</div>
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
            {['ALL','DRAFT','SUBMITTED','UNDER_REVIEW','APPROVED','PARTIAL','REJECTED'].map(f=>(
              <button key={f} className={`dc-filter-btn${filter===f?' active':''}`}
                onClick={()=>setFilter(f)} style={{fontSize:9}}>
                {f.replace('_',' ')}
              </button>
            ))}
          </div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table className="tbl">
            <thead><tr>
              <th>Claim #</th><th>Distributor</th><th>Type</th><th>Product</th>
              <th>Invoice</th><th style={{textAlign:'right'}}>Claimed</th>
              <th style={{textAlign:'right'}}>Approved</th><th>Status</th><th>Action</th>
            </tr></thead>
            <tbody>
              {filteredClaims.map(c => (
                <tr key={c.claim_id} style={{cursor:'pointer'}}
                  onClick={() => openAI(
                    `Analyse distributor claim ${c.claim_number}: ${CLAIM_TYPE_LABELS[c.claim_type]} claim `+
                    `from ${c.distributor_name} for ${c.product_name}, invoice ${c.invoice_ref}, `+
                    `amount claimed ${fmt(c.amount_claimed)}, approved ${c.amount_approved?fmt(c.amount_approved):'pending'}, `+
                    `status ${c.status}. ${c.remarks||''}. `+
                    `Is the claim amount reasonable? What should I do next?`
                  )}>
                  <td><span style={{fontFamily:'var(--mono)',fontSize:10,fontWeight:700}}>{c.claim_number}</span></td>
                  <td style={{maxWidth:130,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.distributor_name}</td>
                  <td><span className="bdg ba" style={{fontSize:9}}>{CLAIM_TYPE_LABELS[c.claim_type]||c.claim_type}</span></td>
                  <td style={{maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:11}}>{c.product_name}</td>
                  <td style={{fontFamily:'var(--mono)',fontSize:10}}>{c.invoice_ref}</td>
                  <td style={{textAlign:'right',fontFamily:'var(--mono)',fontSize:11,fontWeight:700,color:'var(--r2)'}}>{fmt(c.amount_claimed)}</td>
                  <td style={{textAlign:'right',fontFamily:'var(--mono)',fontSize:11,fontWeight:700,color:'var(--green)'}}>
                    {c.amount_approved!=null ? fmt(c.amount_approved) : <span style={{color:'var(--text3)'}}>—</span>}
                  </td>
                  <td><StatusBadge status={c.status} map={CLAIM_STATUS} /></td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div style={{display:'flex',gap:4}}>
                      {c.status==='SUBMITTED'&&(
                        <button className="dc-act-btn" onClick={()=>handleStatusUpdate(c.claim_id,'UNDER_REVIEW',null)}>Review</button>
                      )}
                      {c.status==='UNDER_REVIEW'&&(
                        <>
                          <button className="dc-act-btn dc-act-green"
                            onClick={()=>handleStatusUpdate(c.claim_id,'APPROVED',c.amount_claimed)}>✓ Approve</button>
                          <button className="dc-act-btn dc-act-red"
                            onClick={()=>handleStatusUpdate(c.claim_id,'REJECTED',0)}>✗</button>
                        </>
                      )}
                      <button className="dap-trigger-btn sm" style={{fontSize:9}}
                        onClick={()=>openAI(
                          `Quick analysis: ${c.claim_number} — ${CLAIM_TYPE_LABELS[c.claim_type]} claim `+
                          `from ${c.distributor_name}, ${fmt(c.amount_claimed)}, status ${c.status}. Best next action?`
                        )}>✨</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3: CUSTOMER REBATES
// ─────────────────────────────────────────────────────────────────────────────

function CustomerRebatesTab({ data, onRefresh, openAI }) {
  const products = data?.products || [];
  const [rebates, setRebates] = useState(data?.rebates || []);
  const [filter, setFilter]   = useState('ALL');
  const [showForm, setShowForm]   = useState(false);
  const [savedRebate, setSavedRebate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customer_name:'', customer_type:'Developer',
    rebate_type:'VOLUME', category:'',
    target_amount:0, rebate_pct:2,
    period_start:'', period_end:'', notes:'',
  });

  useEffect(() => { setRebates(data?.rebates || []); }, [data]);

  const estimatedValue = form.target_amount > 0 ? Math.round(form.target_amount * form.rebate_pct / 100) : 0;

  const handleSubmit = async () => {
    if (!form.customer_name || !form.target_amount) return;
    setSaving(true);
    try {
      const res  = await fetch('/api/louvers/rebates', {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form),
      });
      const json = await res.json();
      setSavedRebate(json);
      setShowForm(false);
    } catch(e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleStatusUpdate = async (rebateId, newStatus, actualAmount) => {
    try {
      await fetch(`/api/louvers/rebates/${rebateId}/status`, {
        method:'PUT', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ status: newStatus, actual_amount: actualAmount }),
      });
      setRebates(prev => prev.map(r => r.rebate_id===rebateId ? {...r, status: newStatus} : r));
    } catch(e) { console.error(e); }
  };

  const filteredRebates = useMemo(() =>
    filter==='ALL' ? rebates : rebates.filter(r=>r.status===filter),
  [rebates, filter]);

  const totalLiability = rebates.filter(r=>['ACTIVE','PENDING_APPROVAL','ACHIEVED'].includes(r.status))
    .reduce((a,r)=>a+r.rebate_value,0);
  const totalActive    = rebates.filter(r=>r.status==='ACTIVE').length;

  return (
    <div>
      {/* Rebate KPI strip */}
      <div className="ll-claim-kpi-row">
        <div className="ll-claim-kpi" onClick={()=>openAI(
          `My total rebate liability is ${fmtL(totalLiability)} across ${totalActive} active rebate agreements. `+
          `How should I provision for this in my P&L? What accounting treatment is standard for customer rebates in India?`
        )}>
          <div className="ll-claim-kpi-lbl">Rebate Liability ✨</div>
          <div className="ll-claim-kpi-val" style={{color:'var(--r2)'}}>{fmtL(totalLiability)}</div>
          <div className="ll-claim-kpi-sub">Provisioned</div>
        </div>
        <div className="ll-claim-kpi" onClick={()=>openAI(
          `I have ${totalActive} active rebate agreements. How do I track customer progress against targets effectively? `+
          `What's the best way to communicate rebate status to customers to drive volumes?`
        )}>
          <div className="ll-claim-kpi-lbl">Active Schemes ✨</div>
          <div className="ll-claim-kpi-val">{totalActive}</div>
          <div className="ll-claim-kpi-sub">Running now</div>
        </div>
        <div className="ll-claim-kpi" onClick={()=>openAI(
          `${rebates.filter(r=>r.status==='ACHIEVED').length} rebate(s) achieved this period. `+
          `What is the best process to pay out rebates? Credit note vs bank transfer? GST implications?`
        )}>
          <div className="ll-claim-kpi-lbl">Achieved ✨</div>
          <div className="ll-claim-kpi-val" style={{color:'var(--green)'}}>{rebates.filter(r=>r.status==='ACHIEVED').length}</div>
          <div className="ll-claim-kpi-sub">Ready to pay</div>
        </div>
        <div className="ll-claim-kpi">
          <AiBtn label="Rebate strategy"
            onClick={()=>openAI(
              `Review my customer rebate programme for louvers & laminates: `+
              `${rebates.length} schemes total, ${fmtL(totalLiability)} total liability, `+
              `types: volume (${rebates.filter(r=>r.rebate_type==='VOLUME').length}), `+
              `loyalty (${rebates.filter(r=>r.rebate_type==='LOYALTY').length}), `+
              `project (${rebates.filter(r=>r.rebate_type==='PROJECT').length}), `+
              `annual target (${rebates.filter(r=>r.rebate_type==='ANNUAL_TARGET').length}). `+
              `Is my rebate structure effective? Benchmarks for louvers/laminates industry? How to improve ROI on rebates?`
            )} />
        </div>
      </div>

      {/* New Rebate Form */}
      <div className="card" style={{marginBottom:14}}>
        <div className="ch">
          <div>
            <div className="ctit">Create Customer Rebate</div>
            <div className="csub">Volume, loyalty, project or annual-target incentive schemes</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            {savedRebate && <span className="bdg bg">✓ {savedRebate.rebate_number}</span>}
            <button className="dc-ai-btn" onClick={()=>setShowForm(!showForm)}>
              {showForm?'▲ Hide Form':'+ New Rebate'}
            </button>
          </div>
        </div>

        {showForm && (
          <div>
            <div className="ll-form-grid" style={{marginTop:12}}>
              <div>
                <div className="dc-lbl">Customer Name *</div>
                <input className="dc-inp" placeholder="e.g. Prestige Developers"
                  value={form.customer_name} onChange={e=>setForm(f=>({...f,customer_name:e.target.value}))} />
              </div>
              <div>
                <div className="dc-lbl">Customer Type</div>
                <select className="dc-inp" value={form.customer_type}
                  onChange={e=>setForm(f=>({...f,customer_type:e.target.value}))}>
                  {CUST_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <div className="dc-lbl">Rebate Type</div>
                <select className="dc-inp" value={form.rebate_type}
                  onChange={e=>setForm(f=>({...f,rebate_type:e.target.value}))}>
                  {REBATE_TYPES.map(t=><option key={t} value={t}>{REBATE_TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <div className="dc-lbl">Product Category</div>
                <select className="dc-inp" value={form.category}
                  onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                  <option value="">All Products</option>
                  {['Louvers','High Pressure Laminate','Compact Laminate','Acrylic','Operable Louvre System'].map(c=>
                    <option key={c} value={c}>{c}</option>
                  )}
                </select>
              </div>
              <div>
                <div className="dc-lbl">Target Purchase Amount (₹)</div>
                <input type="number" min={0} step={10000} className="dc-inp"
                  value={form.target_amount}
                  onChange={e=>setForm(f=>({...f,target_amount:Number(e.target.value)||0}))} />
              </div>
              <div>
                <div className="dc-lbl">Rebate % on Target</div>
                <input type="number" min={0.1} max={10} step={0.1} className="dc-inp"
                  value={form.rebate_pct}
                  onChange={e=>setForm(f=>({...f,rebate_pct:Number(e.target.value)||0}))} />
              </div>
              <div>
                <div className="dc-lbl">Period Start</div>
                <input type="date" className="dc-inp" value={form.period_start}
                  onChange={e=>setForm(f=>({...f,period_start:e.target.value}))} />
              </div>
              <div>
                <div className="dc-lbl">Period End</div>
                <input type="date" className="dc-inp" value={form.period_end}
                  onChange={e=>setForm(f=>({...f,period_end:e.target.value}))} />
              </div>
            </div>
            {estimatedValue > 0 && (
              <div className="ll-order-summary" style={{marginTop:10}}>
                <span>If target met → Rebate payout: <strong style={{color:'var(--r2)'}}>{fmt(estimatedValue)}</strong></span>
                <span>As % of revenue: <strong>{fmtPct(form.rebate_pct)}</strong></span>
              </div>
            )}
            <div className="dc-actions" style={{marginTop:12}}>
              <button className="dc-save-btn" onClick={handleSubmit}
                disabled={saving||!form.customer_name||!form.target_amount}>
                {saving?'Creating…':'✓ Create Rebate Scheme'}
              </button>
              <AiBtn label="Is this rebate structure right?"
                onClick={()=>openAI(
                  `I'm creating a ${REBATE_TYPE_LABELS[form.rebate_type]} rebate for ${form.customer_name||'a customer'} `+
                  `(${form.customer_type}): target ${fmt(form.target_amount)}, `+
                  `${fmtPct(form.rebate_pct)} rebate = ${fmt(estimatedValue)} payout. `+
                  `Category: ${form.category||'all products'}. Period: ${form.period_start||'?'} to ${form.period_end||'?'}. `+
                  `Is this rebate structure competitive? What's the industry standard for louvers & laminates? `+
                  `How do I set targets that motivate without eroding margin?`
                )} />
            </div>
          </div>
        )}
      </div>

      {/* Rebates Table */}
      <div className="card">
        <div className="ch">
          <div>
            <div className="ctit">Rebate Schemes</div>
            <div className="csub">{rebates.length} schemes · click row for AI analysis</div>
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
            {['ALL','ACTIVE','ACHIEVED','PENDING_APPROVAL','PAID','LAPSED'].map(f=>(
              <button key={f} className={`dc-filter-btn${filter===f?' active':''}`}
                onClick={()=>setFilter(f)} style={{fontSize:9}}>
                {f.replace('_',' ')}
              </button>
            ))}
          </div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table className="tbl">
            <thead><tr>
              <th>Rebate #</th><th>Customer</th><th>Type</th><th>Category</th>
              <th style={{textAlign:'right'}}>Target</th><th style={{textAlign:'right'}}>Actual</th>
              <th style={{textAlign:'right'}}>Achievement</th>
              <th style={{textAlign:'right'}}>Rebate Value</th>
              <th>Period</th><th>Status</th><th>Action</th>
            </tr></thead>
            <tbody>
              {filteredRebates.map(r => {
                const pct = r.actual_amount>0 ? Math.round(r.actual_amount/r.target_amount*100) : 0;
                return (
                  <tr key={r.rebate_id} style={{cursor:'pointer'}}
                    onClick={()=>openAI(
                      `Analyse rebate ${r.rebate_number} for ${r.customer_name} (${r.customer_type}): `+
                      `${REBATE_TYPE_LABELS[r.rebate_type]}, target ${fmtL(r.target_amount)}, `+
                      `actual ${fmtL(r.actual_amount)} (${pct}% achieved), rebate value ${fmt(r.rebate_value)}, `+
                      `status ${r.status}, period ${r.period_start} to ${r.period_end}. `+
                      `Will they hit the target? What actions can I take to help them reach it?`
                    )}>
                    <td><span style={{fontFamily:'var(--mono)',fontSize:10,fontWeight:700}}>{r.rebate_number}</span></td>
                    <td style={{maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.customer_name}</td>
                    <td><span className="bdg ba" style={{fontSize:9}}>{REBATE_TYPE_LABELS[r.rebate_type]||r.rebate_type}</span></td>
                    <td style={{fontSize:10,color:'var(--text3)'}}>{r.category||'All'}</td>
                    <td style={{textAlign:'right',fontFamily:'var(--mono)',fontSize:11}}>{fmtL(r.target_amount)}</td>
                    <td style={{textAlign:'right',fontFamily:'var(--mono)',fontSize:11}}>{fmtL(r.actual_amount)}</td>
                    <td style={{textAlign:'right'}}>
                      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:2}}>
                        <span style={{fontFamily:'var(--mono)',fontSize:10,fontWeight:700,
                          color:pct>=100?'var(--green)':pct>=70?'var(--a2)':'var(--r2)'}}>
                          {pct}%
                        </span>
                        <div className="ll-rebate-progress">
                          <div className="ll-rebate-bar" style={{
                            width:`${Math.min(pct,100)}%`,
                            background:pct>=100?'var(--green)':pct>=70?'var(--a2)':'var(--r2)',
                          }}/>
                        </div>
                      </div>
                    </td>
                    <td style={{textAlign:'right',fontFamily:'var(--mono)',fontSize:11,fontWeight:700,color:'var(--r2)'}}>{fmt(r.rebate_value)}</td>
                    <td style={{fontSize:10,color:'var(--text3)',fontFamily:'var(--mono)'}}>{r.period_start}<br/>{r.period_end}</td>
                    <td><StatusBadge status={r.status} map={REBATE_STATUS} /></td>
                    <td onClick={e=>e.stopPropagation()}>
                      <div style={{display:'flex',gap:4}}>
                        {r.status==='ACHIEVED'&&(
                          <button className="dc-act-btn dc-act-green"
                            onClick={()=>handleStatusUpdate(r.rebate_id,'PENDING_APPROVAL',r.actual_amount)}>
                            Approve
                          </button>
                        )}
                        {r.status==='PENDING_APPROVAL'&&(
                          <button className="dc-act-btn dc-act-green"
                            onClick={()=>handleStatusUpdate(r.rebate_id,'PAID',r.actual_amount)}>
                            Pay
                          </button>
                        )}
                        <button className="dap-trigger-btn sm" style={{fontSize:9}}
                          onClick={()=>openAI(
                            `Quick analysis: ${r.rebate_number} — ${r.customer_name}, `+
                            `${pct}% of target achieved, ${fmt(r.rebate_value)} at stake, status ${r.status}. `+
                            `Should I pay this rebate? Any tax or accounting considerations?`
                          )}>✨</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id:'orders',  label:'📦 Sales Orders',         sub:'Place and track orders' },
  { id:'claims',  label:'📋 Distributor Claims',    sub:'Price diff, damage, freight' },
  { id:'rebates', label:'💰 Customer Rebates',      sub:'Volume and loyalty schemes' },
];

export default function LouversLaminates({ onGoChat, dbStatus }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tab,     setTab]     = useState('orders');

  const [aiOpen,    setAiOpen]    = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  const openAI = useCallback((msg) => { setAiMessage(msg); setAiOpen(true); }, []);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/louvers');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch(e) { setError(e.message); }
    finally    { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <PageLoader />;
  if (error)   return <ErrorState message={error} onRetry={fetchData} />;

  const kpis = data?.kpis || {};

  return (
    <div className="view">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="dc-page-header">
        <div>
          <div className="kl" style={{color:'var(--text3)',marginBottom:2}}>LOUVERS & LAMINATES</div>
          <div style={{fontSize:20,fontWeight:800,color:'var(--text)',letterSpacing:'-0.5px',marginBottom:2}}>
            Sales · Claims · Rebates
          </div>
          <div style={{fontSize:11,color:'var(--text3)',fontFamily:'var(--mono)'}}>
            HPL · Compact Laminate · Acrylic · Aluminium Louvers · PVC · Operable Systems
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <AiBtn label="Full business briefing"
            onClick={()=>openAI(
              `Give me a full business briefing for my louvers & laminates division: `+
              `${kpis.orders_this_month} orders this month, revenue ${fmtL(kpis.order_revenue||0)}, `+
              `avg margin ${fmtPct(kpis.avg_margin_pct||0)}, pipeline ${fmtL(kpis.pipeline_value||0)}, `+
              `distributor claims pending ${fmtL(kpis.claims_pending||0)}, `+
              `rebate liability ${fmtL(kpis.rebate_liability||0)}. `+
              `What are the top 3 priorities for this week? Where are the biggest risks and opportunities?`
            )} />
          <DataSourceBadge source={data?.data_source} updatedAt={dbStatus?.checkedAt} />
        </div>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────────────────── */}
      <div className="kg" style={{gridTemplateColumns:'repeat(6,1fr)',marginBottom:6}}>
        {[
          {label:'Orders (MTD)',    val:kpis.orders_this_month,       cls:'sg', fmt:'num',
           ai:`I have ${kpis.orders_this_month} sales orders this month. Is this a healthy order volume for a louvers & laminates distributor? What should I do to grow order count?`},
          {label:'Order Revenue',   val:kpis.order_revenue,           cls:'sb', fmt:'L',
           ai:`My louvers & laminates order revenue is ${fmtL(kpis.order_revenue||0)} this month. How does this compare to industry benchmarks? What product mix should I focus on to grow revenue?`},
          {label:'Avg Margin',      val:kpis.avg_margin_pct,          cls:'sg', fmt:'pct',
           ai:`My average order margin is ${fmtPct(kpis.avg_margin_pct||0)} across louvers & laminates. Which products give the highest margins? How can I improve the average?`},
          {label:'Pipeline Value',  val:kpis.pipeline_value,          cls:'st', fmt:'L',
           ai:`My active pipeline value is ${fmtL(kpis.pipeline_value||0)}. What conversion rate should I expect? How do I prioritise which orders to push to close?`},
          {label:'Claims Pending',  val:kpis.claims_pending,          cls:'sp', fmt:'L',
           ai:`I have ${fmtL(kpis.claims_pending||0)} in pending distributor claims. This is cash tied up. How do I resolve claims faster? What documentation reduces claim disputes?`},
          {label:'Rebate Liability',val:kpis.rebate_liability,        cls:'sb', fmt:'L',
           ai:`My rebate liability is ${fmtL(kpis.rebate_liability||0)}. How should I provision for this? What's the correct GST treatment for customer rebates in India under GST law?`},
        ].map(k => (
          <div key={k.label} className={`kc ${k.cls}`} style={{cursor:'pointer'}} onClick={()=>openAI(k.ai)}>
            <div className="kt"><span className="kl">{k.label}</span><span style={{fontSize:9,opacity:.5}}>✨</span></div>
            <div className="kv" style={{fontSize:16}}>
              {k.fmt==='num'  ? k.val :
               k.fmt==='pct'  ? fmtPct(k.val||0) : fmtL(k.val||0)}
            </div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:14}}>
        <AiBtn sm label="KPI scorecard"
          onClick={()=>openAI(
            `Give me a KPI scorecard for my louvers & laminates business: `+
            `${kpis.orders_this_month} orders, revenue ${fmtL(kpis.order_revenue||0)}, `+
            `margin ${fmtPct(kpis.avg_margin_pct||0)}, pipeline ${fmtL(kpis.pipeline_value||0)}, `+
            `claims ${fmtL(kpis.claims_pending||0)}, rebate liability ${fmtL(kpis.rebate_liability||0)}. `+
            `Rate each KPI green/amber/red and give one action per red/amber metric.`
          )} />
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="ll-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`ll-tab${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)}>
            <span className="ll-tab-label">{t.label}</span>
            <span className="ll-tab-sub">{t.sub}</span>
          </button>
        ))}
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────────── */}
      <div style={{marginTop:14}}>
        {tab==='orders'  && <SalesOrdersTab     data={data} onRefresh={fetchData} openAI={openAI} />}
        {tab==='claims'  && <DistributorClaimsTab data={data} onRefresh={fetchData} openAI={openAI} />}
        {tab==='rebates' && <CustomerRebatesTab   data={data} onRefresh={fetchData} openAI={openAI} />}
      </div>

      {/* ── AI Panel ─────────────────────────────────────────────────────────── */}
      <DiscountAIPanel isOpen={aiOpen} onClose={()=>setAiOpen(false)} initialMessage={aiMessage} />
    </div>
  );
}
