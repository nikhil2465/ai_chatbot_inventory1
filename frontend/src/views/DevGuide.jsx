import React, { useState } from 'react';

const SECTION = ({ id, title, children }) => (
  <div id={id} className="card" style={{ marginBottom: 16 }}>
    <div className="ch"><div className="ctit" style={{ fontSize: 14, fontWeight: 700 }}>{title}</div></div>
    <div style={{ padding: '4px 0 8px' }}>{children}</div>
  </div>
);

const Tag = ({ c, children }) => (
  <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)', background: c || 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', marginRight: 4, marginBottom: 4 }}>{children}</span>
);

const Code = ({ children }) => (
  <code style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 7px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--b2)' }}>{children}</code>
);

const Row = ({ label, val, sub, color }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
    <div style={{ minWidth: 180, fontFamily: 'var(--mono)', fontSize: 12, color: color || 'var(--b2)', fontWeight: 600 }}>{label}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{val}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);

export default function DevGuide() {
  const [tab, setTab] = useState('setup');

  const tabs = [
    { id: 'setup',    label: '🚀 Quick Start' },
    { id: 'arch',     label: '🏗️ Architecture' },
    { id: 'api',      label: '📡 API Reference' },
    { id: 'db',       label: '🗄️ Database' },
    { id: 'ai',       label: '🤖 AI Pipeline' },
    { id: 'best',     label: '⭐ Best Practices' },
  ];

  return (
    <div className="view">
      {/* Header */}
      <div className="ph" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="pg">Developer Guide — InvenIQ Platform</div>
          <div className="psub" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            Technical reference for developers building on or maintaining InvenIQ
            {[['Python 3.11+','#3776AB'],['FastAPI','#009688'],['React 18','#61DAFB'],['GPT-4o','#10a37f'],['MySQL 8','#4479A1']].map(([t,c])=>(
              <span key={t} style={{ padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:700, background:c+'22', border:`1px solid ${c}55`, color:c, fontFamily:'var(--mono)' }}>{t}</span>
            ))}
          </div>
        </div>
        <a href="https://github.com/nikhil2465/ai_chatbot_inventory1" target="_blank" rel="noopener noreferrer"
          style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 14px', background:'#24292e', border:'none', borderRadius:8, fontSize:12, fontWeight:700, color:'#fff', textDecoration:'none', cursor:'pointer' }}>
          ⭐ GitHub Repo
        </a>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', gap:4, marginBottom:16, flexWrap:'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding:'6px 14px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer',
              background: tab===t.id ? 'var(--b2)' : 'var(--bg2)',
              color: tab===t.id ? '#fff' : 'var(--text2)',
              border: tab===t.id ? 'none' : '1px solid var(--border)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── QUICK START ── */}
      {tab === 'setup' && <>
        <SECTION id="prereqs" title="Prerequisites">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
            {[
              ['Python 3.11+','pip install ready'],['Node.js 18+','npm / npx ready'],
              ['MySQL 8.0+','Database server running'],['OpenAI API Key','sk-proj-... format'],
              ['Git 2.x','For cloning the repo'],['4 GB RAM min','8 GB recommended'],
            ].map(([n,d])=>(
              <div key={n} style={{ padding:'10px 12px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8 }}>
                <div style={{ fontWeight:700, fontSize:13 }}>{n}</div>
                <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{d}</div>
              </div>
            ))}
          </div>
        </SECTION>

        <SECTION id="clone" title="1 — Clone & Configure">
          <div style={{ background:'#0d1117', borderRadius:8, padding:'14px 16px', fontFamily:'var(--mono)', fontSize:12, color:'#e6edf3', lineHeight:1.8, marginBottom:12 }}>
            <span style={{color:'#7ee787'}}># Clone the repository</span><br/>
            git clone https://github.com/nikhil2465/ai_chatbot_inventory1.git<br/>
            cd ai_chatbot_inventory1<br/><br/>
            <span style={{color:'#7ee787'}}># Set up backend environment</span><br/>
            cd backend<br/>
            cp .env.example .env<br/>
            <span style={{color:'#79c0ff'}}># Edit .env — add OPENAI_API_KEY + MySQL credentials</span><br/>
            <br/>
            <span style={{color:'#7ee787'}}># Install Python dependencies</span><br/>
            pip install -r requirements.txt
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div style={{ padding:'10px 12px', background:'var(--r3)', border:'1px solid var(--r4)', borderRadius:8 }}>
              <div style={{ fontWeight:700, fontSize:12, color:'var(--red)' }}>⚠️ Required in .env</div>
              <div style={{ fontFamily:'var(--mono)', fontSize:11, marginTop:6, lineHeight:1.8 }}>
                OPENAI_API_KEY=sk-proj-...<br/>
                MYSQL_HOST=localhost<br/>
                MYSQL_USER=stocksense<br/>
                MYSQL_PASSWORD=••••<br/>
                MYSQL_DB=stocksense_inventory
              </div>
            </div>
            <div style={{ padding:'10px 12px', background:'var(--g3)', border:'1px solid var(--g4)', borderRadius:8 }}>
              <div style={{ fontWeight:700, fontSize:12, color:'var(--green)' }}>✓ Demo Mode (no MySQL)</div>
              <div style={{ fontSize:11, color:'var(--text2)', marginTop:6, lineHeight:1.7 }}>
                Omit MYSQL_HOST from .env. All 12 dashboard pages + AI Assistant work with rich mock data. Only OPENAI_API_KEY is required to enable chat.
              </div>
            </div>
          </div>
        </SECTION>

        <SECTION id="db-setup" title="2 — Database Setup (optional)">
          <div style={{ background:'#0d1117', borderRadius:8, padding:'14px 16px', fontFamily:'var(--mono)', fontSize:12, color:'#e6edf3', lineHeight:1.8 }}>
            <span style={{color:'#7ee787'}}># Create MySQL database + user</span><br/>
            mysql -u root -p<br/>
            CREATE DATABASE stocksense_inventory CHARACTER SET utf8mb4;<br/>
            CREATE USER 'stocksense'@'localhost' IDENTIFIED BY 'StockPass123!';<br/>
            GRANT ALL PRIVILEGES ON stocksense_inventory.* TO 'stocksense'@'localhost';<br/>
            EXIT;<br/><br/>
            <span style={{color:'#7ee787'}}># Load schema + seed data</span><br/>
            mysql -u stocksense -p stocksense_inventory {'<'} database/schema.sql<br/>
            mysql -u stocksense -p stocksense_inventory {'<'} database/seed_complete.sql
          </div>
        </SECTION>

        <SECTION id="run" title="3 — Run the Application">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:12, marginBottom:8, color:'var(--text2)' }}>Backend (FastAPI)</div>
              <div style={{ background:'#0d1117', borderRadius:8, padding:'12px 14px', fontFamily:'var(--mono)', fontSize:12, color:'#e6edf3', lineHeight:1.8 }}>
                cd backend<br/>
                uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
              </div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:6 }}>
                API available at <Code>http://localhost:8000</Code><br/>
                Swagger docs at <Code>http://localhost:8000/docs</Code>
              </div>
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:12, marginBottom:8, color:'var(--text2)' }}>Frontend (React)</div>
              <div style={{ background:'#0d1117', borderRadius:8, padding:'12px 14px', fontFamily:'var(--mono)', fontSize:12, color:'#e6edf3', lineHeight:1.8 }}>
                cd frontend<br/>
                npm install<br/>
                npm start
              </div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:6 }}>
                App at <Code>http://localhost:3000</Code><br/>
                Proxies <Code>/api/*</Code> → <Code>:8000</Code>
              </div>
            </div>
          </div>
        </SECTION>

        <SECTION id="verify" title="4 — Verify Everything Works">
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {[
              ['GET /api/health','Should return mysql_connected: true (or false in demo)','curl http://localhost:8000/api/health'],
              ['GET /api/overview','Should return revenue_mtd, monthly_revenue array, data_source','curl http://localhost:8000/api/overview'],
              ['GET /api/data-status','All 12 pages show mysql or mock source','curl http://localhost:8000/api/data-status'],
              ['POST /api/chat','Send {message, mode} — should stream back tokens','Use the AI Assistant in the UI'],
            ].map(([ep,desc,cmd])=>(
              <div key={ep} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'8px 12px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8 }}>
                <Code>{ep}</Code>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color:'var(--text)', fontWeight:600 }}>{desc}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)', marginTop:2 }}>{cmd}</div>
                </div>
              </div>
            ))}
          </div>
        </SECTION>
      </>}

      {/* ── ARCHITECTURE ── */}
      {tab === 'arch' && <>
        <SECTION id="stack" title="Technology Stack">
          <div style={{ overflowX:'auto' }}>
            <table className="tbl">
              <thead><tr><th>Layer</th><th>Technology</th><th>Version</th><th>Purpose</th></tr></thead>
              <tbody>
                {[
                  ['Frontend','React','18.3.1','SPA — 12 dashboard views + chat'],
                  ['Frontend','Chart.js','4.4.1','Interactive charts (line, bar, doughnut)'],
                  ['Frontend','React Scripts','5.0.1','Build tooling (Webpack, Babel, ESLint)'],
                  ['Backend','FastAPI','0.115.0','Async REST API + SSE streaming'],
                  ['Backend','Uvicorn','0.30.6','ASGI server with hot reload'],
                  ['Backend','OpenAI SDK','1.51.0','GPT-4o function calling + streaming'],
                  ['Backend','aiomysql','0.2.0','Async MySQL connection pool'],
                  ['Backend','Pydantic Settings','2.5.2','Config management via .env'],
                  ['Database','MySQL','8.0+','Primary data store (13 tables)'],
                  ['AI','GPT-4o','latest','LLM with function calling + SSE'],
                ].map(r=><tr key={r[0]+r[1]}><td style={{color:'var(--text3)'}}>{r[0]}</td><td style={{fontWeight:700}}>{r[1]}</td><td style={{fontFamily:'var(--mono)',color:'var(--b2)'}}>{r[2]}</td><td>{r[3]}</td></tr>)}
              </tbody>
            </table>
          </div>
        </SECTION>

        <SECTION id="data-flow" title="System Architecture — Data Flow">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0, flexWrap:'wrap', padding:'12px 0' }}>
            {[
              { label:'React SPA', sub:'port 3000', bg:'#0ea5e922' },
              null,
              { label:'FastAPI', sub:'port 8000', bg:'#10b98122' },
              null,
              { label:'MySQL', sub:'port 3306', bg:'#3b82f622' },
            ].map((node, i) => node === null ? (
              <div key={i} style={{ fontSize:20, color:'var(--text3)', padding:'0 8px' }}>→</div>
            ) : (
              <div key={node.label} style={{ textAlign:'center', padding:'12px 20px', background:node.bg, border:'1px solid var(--border)', borderRadius:10, minWidth:110 }}>
                <div style={{ fontWeight:700, fontSize:13 }}>{node.label}</div>
                <div style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)' }}>{node.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0, flexWrap:'wrap', padding:'8px 0 0' }}>
            {[
              { label:'AI Orchestrator', sub:'orchestrator.py', bg:'#10b98122' },
              null,
              { label:'OpenAI GPT-4o', sub:'streaming + tools', bg:'#10a37f22' },
              null,
              { label:'Mock Fallback', sub:'no DB needed', bg:'#f59e0b22' },
            ].map((node, i) => node === null ? (
              <div key={i} style={{ fontSize:20, color:'var(--text3)', padding:'0 8px' }}>↔</div>
            ) : (
              <div key={node.label} style={{ textAlign:'center', padding:'12px 20px', background:node.bg, border:'1px solid var(--border)', borderRadius:10, minWidth:110 }}>
                <div style={{ fontWeight:700, fontSize:13 }}>{node.label}</div>
                <div style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)' }}>{node.sub}</div>
              </div>
            ))}
          </div>
        </SECTION>

        <SECTION id="files" title="Key File Map">
          {[
            { group:'Backend — API Layer', files:[
              ['backend/app/main.py','FastAPI entry point, CORS, lifespan, router registration'],
              ['backend/app/api/dashboard.py','11 dashboard endpoints + /api/health + /api/data-status'],
              ['backend/app/api/chat.py','POST /api/chat + POST /api/chat/stream (SSE)'],
              ['backend/app/api/po_grn.py','GET /api/po-grn + POST /api/po'],
            ]},
            { group:'Backend — Service Layer (AI Brain)', files:[
              ['backend/app/services/orchestrator.py','Main LLM pipeline: query → tools → GPT-4o → stream'],
              ['backend/app/services/selector.py','Keyword-based tool routing (9 tools, 40+ keywords each)'],
              ['backend/app/services/tools.py','9 MCP tools: stock, demand, supplier, finance, order, freight…'],
              ['backend/app/services/rca.py','Root Cause Analysis engine: 5-Why, fishbone, action plans'],
              ['backend/app/services/knowledge.py','Inventory KB: EOQ, safety stock, ABC, GMROI formulas'],
              ['backend/app/services/insights_engine.py','Proactive insights: 10 pattern types ranked by ₹ impact'],
            ]},
            { group:'Backend — Database Layer', files:[
              ['backend/app/db/connection.py','Async MySQL pool (aiomysql, minsize=2, maxsize=10)'],
              ['backend/app/db/queries.py','9 query functions, each returning dict for tool consumption'],
              ['backend/app/db/po_grn_queries.py','PO/GRN specific queries + create_purchase_order()'],
            ]},
            { group:'Frontend — Views (12 pages)', files:[
              ['frontend/src/App.js','Root: state-based routing, health polling, dbStatus prop chain'],
              ['frontend/src/views/AIAssistant.jsx','Chat UI: 3 modes, SSE streaming, PO create card, markdown tables'],
              ['frontend/src/views/Overview.jsx','Executive dashboard with data-driven revenue chart'],
              ['frontend/src/views/POGRN.jsx','PO lifecycle + GRN discrepancy log with AI RCA button'],
            ]},
            { group:'Frontend — Shared Components', files:[
              ['frontend/src/components/DataSourceBadge.jsx','Live/Demo pill used in all 12 pages'],
              ['frontend/src/components/PageLoader.jsx','Spinner (full-page + mini)'],
              ['frontend/src/components/ErrorState.jsx','Error card with retry (full + compact)'],
              ['frontend/src/utils/chartHelpers.js','gradientFill(), PALETTE, dark tooltip config for Chart.js'],
            ]},
            { group:'Database', files:[
              ['database/schema.sql','13 tables + 2 views definition (CREATE TABLE statements)'],
              ['database/seed_complete.sql','12-month historical data: 149 orders, 17 GRN, 35 freight trips'],
            ]},
          ].map(({ group, files }) => (
            <div key={group} style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.7px', marginBottom:6, fontFamily:'var(--mono)' }}>{group}</div>
              {files.map(([path, desc]) => (
                <div key={path} style={{ display:'flex', gap:12, padding:'5px 0', borderBottom:'1px solid var(--border)' }}>
                  <Code>{path}</Code>
                  <div style={{ fontSize:12, color:'var(--text2)' }}>{desc}</div>
                </div>
              ))}
            </div>
          ))}
        </SECTION>
      </>}

      {/* ── API REFERENCE ── */}
      {tab === 'api' && <>
        <SECTION id="health" title="Health & Status Endpoints">
          {[
            ['GET','/api/health','Health check','Returns mysql_connected, openai_configured, data_source'],
            ['GET','/api/db/status','DB status','Detailed database connection info'],
            ['GET','/api/data-status','Page sources','Per-page data source (mysql or mock)'],
            ['GET','/api/validate','Full validation','Tests all components: DB, LLM, tools, endpoints'],
          ].map(([m,p,t,d])=>(
            <div key={p} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)', alignItems:'flex-start' }}>
              <span style={{ minWidth:44, padding:'2px 6px', background:m==='GET'?'#0ea5e920':'#f59e0b20', border:`1px solid ${m==='GET'?'#0ea5e9':'#f59e0b'}40`, borderRadius:4, fontSize:10, fontWeight:700, color:m==='GET'?'#0ea5e9':'#f59e0b', fontFamily:'var(--mono)', textAlign:'center' }}>{m}</span>
              <Code>{p}</Code>
              <div style={{ flex:1 }}>
                <span style={{ fontWeight:600, fontSize:12 }}>{t}</span>
                <span style={{ fontSize:11, color:'var(--text3)', marginLeft:8 }}>{d}</span>
              </div>
            </div>
          ))}
        </SECTION>

        <SECTION id="dashboard-api" title="Dashboard Endpoints (all GET, DB-first / mock-fallback)">
          {[
            ['/api/overview','KPIs: revenue, margin, dead stock, at-risk customers, monthly_revenue[]'],
            ['/api/inventory','Stock levels, critical SKUs, dead stock summary, godown breakdown'],
            ['/api/dead-stock','Detailed dead stock items with recovery recommendations'],
            ['/api/inward','GRN pipeline, inward/outward movements, shrinkage MTD'],
            ['/api/sales','Revenue trend (12 months), margin by SKU, day-of-week patterns'],
            ['/api/customers','Customer list with segments, outstanding, risk scores'],
            ['/api/orders','Order counts, fulfillment SLA, pending details, delay reasons'],
            ['/api/procurement','Supplier scorecards: on-time %, lead time, GRN match rate'],
            ['/api/freight','Outbound lanes, cost per sheet, vehicle utilization'],
            ['/api/finance','Cash cycle, GST summary, working capital, overdue receivables'],
            ['/api/demand','Demand forecasts, seasonal signals, 30/60/90-day projections'],
            ['/api/po-grn','Open POs, GRN discrepancies, KPIs (match rate, variance)'],
          ].map(([p,d])=>(
            <Row key={p} label={p} val="" sub={d} color="var(--b2)" />
          ))}
        </SECTION>

        <SECTION id="chat-api" title="AI Chat Endpoints">
          <div style={{ marginBottom:12, padding:'10px 14px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8 }}>
            <div style={{ fontWeight:700, fontSize:12, marginBottom:6 }}>POST /api/chat — Non-streaming response</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <div style={{ fontSize:11, color:'var(--text3)', marginBottom:4, fontWeight:600 }}>Request Body</div>
                <div style={{ background:'#0d1117', borderRadius:6, padding:'10px 12px', fontFamily:'var(--mono)', fontSize:11, color:'#e6edf3', lineHeight:1.7 }}>
                  {'{'}<br/>
                  &nbsp; "message": "Which products are low stock?",<br/>
                  &nbsp; "mode": "ask",  <span style={{color:'#8b949e'}}>// ask | explain | act</span><br/>
                  &nbsp; "history": []   <span style={{color:'#8b949e'}}>// last 16 messages</span><br/>
                  {'}'}
                </div>
              </div>
              <div>
                <div style={{ fontSize:11, color:'var(--text3)', marginBottom:4, fontWeight:600 }}>Response</div>
                <div style={{ background:'#0d1117', borderRadius:6, padding:'10px 12px', fontFamily:'var(--mono)', fontSize:11, color:'#e6edf3', lineHeight:1.7 }}>
                  {'{'}<br/>
                  &nbsp; "response": "Based on live data...",<br/>
                  &nbsp; "mode": "ask",<br/>
                  &nbsp; "tools_used": ["stock_tool"],<br/>
                  &nbsp; "rca_performed": false<br/>
                  {'}'}
                </div>
              </div>
            </div>
          </div>
          <div style={{ padding:'10px 14px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8 }}>
            <div style={{ fontWeight:700, fontSize:12, marginBottom:6 }}>POST /api/chat/stream — Server-Sent Events (SSE)</div>
            <div style={{ fontSize:11, color:'var(--text2)', lineHeight:1.7 }}>
              Streams <Code>text/event-stream</Code>. Event types:<br/>
              <Code>meta</Code> — tools_used, rca_performed &nbsp;
              <Code>token</Code> — streaming text chunk &nbsp;
              <Code>action</Code> — action_type="create_po", po_data={'{…}'} &nbsp;
              <Code>done</Code> — follow_ups[] &nbsp;
              <Code>error</Code> — message string
            </div>
          </div>
        </SECTION>
      </>}

      {/* ── DATABASE ── */}
      {tab === 'db' && <>
        <SECTION id="tables" title="Database Tables — stocksense_inventory">
          <div style={{ overflowX:'auto' }}>
            <table className="tbl">
              <thead><tr><th>Table</th><th>Rows (seed)</th><th>Purpose</th><th>Key Columns</th></tr></thead>
              <tbody>
                {[
                  ['products','18','Product catalogue','sku_name, brand, category, buy_price, sell_price, abc_class'],
                  ['stock_levels','28','Current stock by product × godown','product_id, godown_id, quantity'],
                  ['stock_movements','46+','Audit trail of every stock move','movement_type (IN/OUT/ADJUSTMENT), quantity, moved_at'],
                  ['godowns','3','Warehouse locations','godown_name, location, capacity_sheets'],
                  ['customers','10','Customer master with risk scoring','segment, credit_limit, risk_status, last_order_date'],
                  ['customer_orders','149','12-month sales order history','order_date, total_value, status, discount_pct'],
                  ['order_items','43+','Order line items','order_id, product_id, quantity, unit_price'],
                  ['invoices','9','Accounts receivable','due_date, outstanding, status (UNPAID/OVERDUE/PAID)'],
                  ['suppliers','4','Supplier master with scorecards','on_time_pct, grn_match_rate, lead_time_days'],
                  ['purchase_orders','7','PO header','po_number, expected_date, status (OPEN/PARTIAL/RECEIVED)'],
                  ['po_items','11','PO line items','qty_ordered, qty_received, unit_price'],
                  ['grn','17','Goods Receipt Notes','match_status (MATCH/MISMATCH), discrepancy_amt'],
                  ['freight_lanes','5','Delivery route definitions','zone, cost_per_sheet, avg_fill_pct'],
                  ['freight_trips','35','Trip-level logistics data','trip_date, fill_pct, cost_per_sheet'],
                  ['demand_forecast','35','AI demand projections','forecast_month, demand_signal (SURGE/GROWING/DEAD)'],
                  ['finance_monthly','13','Monthly P&L snapshots','revenue, gross_margin_pct, working_capital_days'],
                ].map(r=>(
                  <tr key={r[0]}>
                    <td style={{fontFamily:'var(--mono)',fontWeight:700,color:'var(--b2)'}}>{r[0]}</td>
                    <td style={{fontFamily:'var(--mono)',textAlign:'center'}}>{r[1]}</td>
                    <td>{r[2]}</td>
                    <td style={{fontSize:11,color:'var(--text3)'}}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SECTION>

        <SECTION id="views" title="Database Views">
          <Row label="v_stock_summary" val="Denormalized stock view" sub="Joins products + stock_levels + godowns. Adds calculated fields: days_cover, margin_pct, abc_class, status (critical/ok/dead)" />
          <Row label="v_overdue_invoices" val="Overdue receivables" sub="Customers with outstanding invoices past due date. Adds days_overdue, risk_level classification" />
        </SECTION>

        <SECTION id="connection" title="Connection & Pool Config">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={{ padding:'10px 14px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8 }}>
              <div style={{ fontWeight:700, fontSize:12, marginBottom:8 }}>Pool Settings</div>
              {[['minsize','2 connections (always alive)'],['maxsize','10 connections (burst capacity)'],['autocommit','True'],['charset','utf8mb4'],['Driver','aiomysql (async)']].map(([k,v])=>(
                <div key={k} style={{ display:'flex', gap:8, fontSize:12, marginBottom:4 }}>
                  <Code>{k}</Code><span style={{color:'var(--text2)'}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ padding:'10px 14px', background:'var(--g3)', border:'1px solid var(--g4)', borderRadius:8 }}>
              <div style={{ fontWeight:700, fontSize:12, color:'var(--green)', marginBottom:8 }}>Graceful Degradation</div>
              <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.7 }}>
                If <Code>MYSQL_HOST</Code> is not set in .env, all 11 queries fall back to mock data. The app is fully functional without a database — ideal for demos and development.
              </div>
            </div>
          </div>
        </SECTION>
      </>}

      {/* ── AI PIPELINE ── */}
      {tab === 'ai' && <>
        <SECTION id="routing" title="Query Routing — 4 Paths">
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { step:'1', label:'Generic / Conversational', color:'#6b7280', desc:'Detected by is_generic_query() — greetings, help requests, off-topic. No tools fetched. Short, friendly response.' },
              { step:'2', label:'Knowledge Query', color:'#0ea5e9', desc:'Detected by is_knowledge_query() — "what is EOQ?", "explain safety stock". Fetches relevant live data, applies formula to real numbers, explains concept with benchmarks.' },
              { step:'3', label:'Insights / Briefing', color:'#10b981', desc:'Detected by is_insights_query() — "give me today\'s briefing", "what should I act on?". Fetches ALL 8 tools, runs 10-type rule engine, ranks by ₹ impact, formats as morning briefing.' },
              { step:'4', label:'Normal Query', color:'var(--b2)', desc:'Everything else. selector.py picks 1-3 relevant tools. Tools fetch DB/mock data. RCA templates injected. Mode-specific (ask/explain/act) system prompt.' },
            ].map(r=>(
              <div key={r.step} style={{ display:'flex', gap:12, padding:'10px 14px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, alignItems:'flex-start' }}>
                <div style={{ minWidth:24, height:24, borderRadius:12, background:r.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:12, flexShrink:0 }}>{r.step}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:r.color }}>{r.label}</div>
                  <div style={{ fontSize:12, color:'var(--text2)', marginTop:3 }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </SECTION>

        <SECTION id="modes" title="Chat Modes — Ask / Explain / Act">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            {[
              { mode:'Ask', icon:'🔎', color:'#0ea5e9', desc:'Concise, data-backed answers. Specific ₹ figures. Ends with 1 key action. Best for quick lookups.' },
              { mode:'Explain', icon:'🔬', color:'#8b5cf6', desc:'Deep RCA analysis. 5-Why chain. Full fishbone causes. Prevention plan. Best for understanding root causes.' },
              { mode:'Act', icon:'⚡', color:'#f59e0b', desc:'Step-by-step executable plan. Assign tasks, set deadlines. Includes RCA template at end. Best for taking action.' },
            ].map(m=>(
              <div key={m.mode} style={{ padding:'14px 16px', background:'var(--bg2)', border:`1px solid ${m.color}40`, borderRadius:10, borderTop:`3px solid ${m.color}` }}>
                <div style={{ fontSize:20, marginBottom:6 }}>{m.icon}</div>
                <div style={{ fontWeight:800, color:m.color, marginBottom:4 }}>{m.mode}</div>
                <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6 }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </SECTION>

        <SECTION id="tools" title="9 MCP Tools">
          <div style={{ overflowX:'auto' }}>
            <table className="tbl">
              <thead><tr><th>Tool</th><th>Data Source</th><th>Key Data Points</th></tr></thead>
              <tbody>
                {[
                  ['stock_tool','stock_levels + products','Critical SKUs, dead stock, ABC class, godown breakdown, true landed cost'],
                  ['demand_tool','demand_forecast','30/60/90-day forecasts, SURGE/DEAD signals, seasonal index'],
                  ['supplier_tool','suppliers + po_grn','On-time %, lead time, GRN match rate, freight cost, recommendation'],
                  ['customer_tool','customers + invoices','Risk scoring, segments, overdue receivables, at-risk accounts'],
                  ['finance_tool','finance_monthly + invoices','Cash cycle (DIO+DSO-DPO), GST, working capital, margin by grade'],
                  ['order_tool','customer_orders','Today\'s orders, fulfillment SLA, pending details, delay analysis'],
                  ['freight_tool','freight_trips + lanes','Lane optimization, cost per sheet, vehicle fill %, recommendations'],
                  ['email_tool','(context-driven)','Draft supplier follow-ups, payment reminders, overdue notices'],
                  ['po_grn_tool','purchase_orders + grn','Open POs, match rate, variance alerts, discrepancy log'],
                ].map(r=>(
                  <tr key={r[0]}>
                    <td style={{fontFamily:'var(--mono)',fontWeight:700,color:'var(--b2)'}}>{r[0]}</td>
                    <td style={{fontSize:11,color:'var(--text3)'}}>{r[1]}</td>
                    <td style={{fontSize:12}}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SECTION>
      </>}

      {/* ── BEST PRACTICES ── */}
      {tab === 'best' && <>
        <div className="card" style={{ marginBottom:12, background:'var(--b3)', border:'1px solid var(--b4)' }}>
          <div style={{ padding:'10px 16px', display:'flex', gap:12, alignItems:'center' }}>
            <div style={{ fontSize:28 }}>⭐</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:'var(--b2)' }}>Current Setup vs. World-Class Setup</div>
              <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>Professional recommendations from full-stack AI + Python architecture perspective</div>
            </div>
          </div>
        </div>

        {[
          {
            title:'🐳 Containerisation — Docker + Compose (Priority: HIGH)',
            current:'Runs directly with uvicorn + npm start. No isolation between environments.',
            best:`Add docker-compose.yml with 3 services: backend (Python 3.11-slim), frontend (node:18-alpine build → nginx serve), mysql (8.0 with healthcheck). Use .env.docker for container-specific config. Result: one-command setup: "docker compose up".`,
            tags:['Docker','docker-compose','nginx','multi-stage build'],
          },
          {
            title:'🔐 Authentication & Security (Priority: HIGH)',
            current:'No auth layer. CORS only allows localhost:3000. Trusted network assumption.',
            best:`Add JWT auth via FastAPI dependency injection (python-jose + passlib). Create /api/auth/login endpoint. Protect all /api/* routes with Depends(get_current_user). Rate limit with slowapi (100 req/min). Add input validation on all POST endpoints. Use HTTPS in production.`,
            tags:['JWT','python-jose','slowapi','HTTPS','input validation'],
          },
          {
            title:'⚡ Caching Layer — Redis (Priority: HIGH)',
            current:'Every API call hits MySQL directly. Repeated identical queries on dashboard refresh.',
            best:`Add Redis for dashboard caching (TTL 60s for KPI data, 300s for historical data). Use fastapi-cache2 decorator: @cache(expire=60). Dramatically reduces DB load + latency. Also use Redis for session storage and rate limiting.`,
            tags:['Redis','fastapi-cache2','TTL','session storage'],
          },
          {
            title:'🗃️ Database Migrations — Alembic (Priority: MEDIUM)',
            current:'Schema changes require manual SQL ALTER TABLE statements. No migration history.',
            best:`Add Alembic for schema version control. alembic init alembic → versions/ folder. Each change tracked as a migration file. Run "alembic upgrade head" on deploy. Enables rollback, team collaboration, and CI/CD integration.`,
            tags:['Alembic','schema versioning','migrations','SQLAlchemy'],
          },
          {
            title:'📘 TypeScript Migration — Frontend (Priority: MEDIUM)',
            current:'Pure JavaScript. No type safety. Runtime errors possible with API response changes.',
            best:`Migrate to TypeScript (.tsx). Define interfaces for all API responses (OverviewResponse, SalesData, etc.). Enables IDE autocomplete, catch API contract changes at compile time. Phased migration: add tsconfig.json, rename .jsx → .tsx, add types incrementally.`,
            tags:['TypeScript','tsx','interfaces','type safety'],
          },
          {
            title:'🔄 State Management — TanStack Query (Priority: MEDIUM)',
            current:'Each component has local useState + useEffect for fetching. No cache sharing between views.',
            best:`Use TanStack Query (React Query v5) for server state. useQuery for all API calls with automatic background refetch, stale-while-revalidate, and shared cache. Replace all manual fetch() + useState patterns. Reduces code by ~40% in views.`,
            tags:['TanStack Query','useQuery','server state','cache'],
          },
          {
            title:'🧪 Testing — pytest + React Testing Library (Priority: MEDIUM)',
            current:'No test suite. No CI pipeline. Manual verification only.',
            best:`Backend: pytest + httpx for API tests, pytest-asyncio for async. Target: all 13 endpoints tested with mock DB. Frontend: React Testing Library for component tests. E2E: Playwright for golden path flows. GitHub Actions: test on every PR.`,
            tags:['pytest','httpx','React Testing Library','Playwright','GitHub Actions'],
          },
          {
            title:'🤖 AI Architecture — LangChain + Vector DB (Priority: LOW/FUTURE)',
            current:'Custom orchestrator with keyword-based tool selection. Knowledge base is in-memory Python.',
            best:`Consider LangChain agents for tool orchestration (more flexible tool chaining). Add vector DB (ChromaDB or Pinecone) for knowledge base — enables semantic search across product history, orders, and supplier data. Use RAG pattern for more accurate contextual responses. Add LLM caching with semantic deduplication.`,
            tags:['LangChain','ChromaDB','RAG','vector embeddings','semantic search'],
          },
          {
            title:'📦 Frontend Build — React Router + Code Splitting (Priority: LOW)',
            current:'Custom activeView state routing. All 12 views bundled into one JS file.',
            best:`Add React Router v6 for proper URL-based navigation (/overview, /sales, etc.). Enables browser back/forward, bookmarkable URLs, deep linking. Add React.lazy() + Suspense for each view → reduces initial bundle size from 147kB to ~40kB. Add code splitting per route.`,
            tags:['React Router v6','lazy loading','code splitting','Suspense'],
          },
          {
            title:'📊 Monitoring & Observability (Priority: LOW)',
            current:'console.log + Python logging only. No structured logging. No error tracking.',
            best:`Add Sentry (both Python and JS SDKs) for error tracking. Add structured logging with loguru (Python). Add Prometheus metrics endpoint + Grafana dashboard for API latency, error rates, DB pool usage. Add OpenTelemetry tracing for end-to-end request visibility.`,
            tags:['Sentry','loguru','Prometheus','Grafana','OpenTelemetry'],
          },
        ].map(rec => (
          <div key={rec.title} className="card" style={{ marginBottom:12 }}>
            <div style={{ padding:'10px 16px 4px' }}>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:8 }}>{rec.title}</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:8 }}>
                <div style={{ padding:'8px 12px', background:'var(--r3)', border:'1px solid var(--r4)', borderRadius:6 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'var(--red)', textTransform:'uppercase', marginBottom:4 }}>Current</div>
                  <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6 }}>{rec.current}</div>
                </div>
                <div style={{ padding:'8px 12px', background:'var(--g3)', border:'1px solid var(--g4)', borderRadius:6 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'var(--green)', textTransform:'uppercase', marginBottom:4 }}>Recommended</div>
                  <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6 }}>{rec.best}</div>
                </div>
              </div>
              <div>{rec.tags.map(t => <Tag key={t}>{t}</Tag>)}</div>
            </div>
          </div>
        ))}
      </>}
    </div>
  );
}
