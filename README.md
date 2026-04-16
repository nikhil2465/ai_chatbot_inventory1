# InvenIQ — AI Inventory Intelligence Platform

> **An AI-powered inventory intelligence layer for dealers and distributors.**  
> 12 live dashboards + GPT-4o chatbot + real-time MySQL integration. Works in full Demo Mode with zero database setup.

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react)](https://reactjs.org)
[![OpenAI](https://img.shields.io/badge/GPT--4o-Powered-10a37f?style=flat&logo=openai)](https://openai.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql&logoColor=white)](https://mysql.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## What Is InvenIQ?

InvenIQ is a full-stack AI intelligence platform built for **building materials dealers and distributors** (plywood, laminates, hardware, electrical, etc.). It turns raw inventory, sales, procurement, and finance data into clear, actionable decisions — delivered through 12 specialised dashboards and a GPT-4o-powered AI assistant.

**Core capabilities:**
- Live dashboards for every business function (stock, sales, customers, procurement, freight, finance, demand)
- AI chatbot with 3 modes: Ask (quick answers), Explain (deep RCA), Act (step-by-step plans)
- Root Cause Analysis engine with 5-Why chains and fishbone diagrams
- Proactive insights engine that ranks issues by ₹ impact
- Inventory management knowledge base (EOQ, safety stock, ABC, GMROI)
- Works 100% in Demo Mode — no database required

---

## Screenshots & Demo

| Business Overview | AI Assistant | PO & GRN |
|:---:|:---:|:---:|
| 12-month revenue chart | 3-mode chat with streaming | GRN discrepancy log |

Open the app → **About InvenIQ** page for a full feature walkthrough.  
Open **Developer Guide** for architecture details and API reference.

---

## Quick Start

### Option A — Demo Mode (No Database Required)

```bash
# 1. Clone
git clone https://github.com/nikhil2465/ai_chatbot_inventory1.git
cd ai_chatbot_inventory1

# 2. Backend setup
cd backend
cp .env.example .env
# Edit .env: add your OPENAI_API_KEY (only this is needed for demo mode)
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 3. Frontend setup (new terminal)
cd ../frontend
npm install
npm start
```

Open **http://localhost:3000** — all 12 dashboards load with rich demo data.

---

### Option B — Full Mode with MySQL

```bash
# 1. Create MySQL database
mysql -u root -p
CREATE DATABASE stocksense_inventory CHARACTER SET utf8mb4;
CREATE USER 'stocksense'@'localhost' IDENTIFIED BY 'StockPass123!';
GRANT ALL PRIVILEGES ON stocksense_inventory.* TO 'stocksense'@'localhost';
EXIT;

# 2. Load schema and seed data
mysql -u stocksense -p stocksense_inventory < database/schema.sql
mysql -u stocksense -p stocksense_inventory < database/seed_complete.sql

# 3. Configure .env
OPENAI_API_KEY=sk-proj-...
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=stocksense
MYSQL_PASSWORD=StockPass123!
MYSQL_DB=stocksense_inventory

# 4. Start backend + frontend (same as above)
```

The UI shows a **🟢 Live Data** badge when MySQL is connected, **🟡 Demo Mode** otherwise.

---

## Project Structure

```
inveniq/
├── backend/
│   ├── app/
│   │   ├── main.py                  FastAPI entry, CORS, router registration
│   │   ├── api/
│   │   │   ├── dashboard.py         11 dashboard endpoints + health + data-status
│   │   │   ├── chat.py              POST /api/chat + /api/chat/stream (SSE)
│   │   │   └── po_grn.py            PO lifecycle + GRN endpoints
│   │   ├── db/
│   │   │   ├── connection.py        Async MySQL pool (aiomysql)
│   │   │   ├── queries.py           9 query functions (stock, sales, finance…)
│   │   │   └── po_grn_queries.py    PO/GRN specific SQL
│   │   └── services/
│   │       ├── orchestrator.py      Main LLM pipeline — 4 routing paths
│   │       ├── selector.py          Keyword-based tool routing
│   │       ├── tools.py             9 MCP-style data tools
│   │       ├── rca.py               Root Cause Analysis engine
│   │       ├── knowledge.py         Inventory management knowledge base
│   │       └── insights_engine.py   Proactive insights — ranked by ₹ impact
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   └── src/
│       ├── App.js                   State-based routing, health polling
│       ├── views/                   12 dashboard pages + chat + docs
│       │   ├── Overview.jsx
│       │   ├── Inventory.jsx
│       │   ├── Sales.jsx
│       │   ├── Customers.jsx
│       │   ├── Finance.jsx
│       │   ├── Orders.jsx
│       │   ├── Procurement.jsx
│       │   ├── POGRN.jsx
│       │   ├── Freight.jsx
│       │   ├── Demand.jsx
│       │   ├── DeadStock.jsx
│       │   ├── Inward.jsx
│       │   ├── AIAssistant.jsx      Chat UI with streaming + 3 modes
│       │   ├── DevGuide.jsx         Developer documentation page
│       │   └── About.jsx            Public showcase page
│       └── components/
│           ├── Sidebar.jsx
│           ├── DataSourceBadge.jsx  Live/Demo indicator
│           ├── PageLoader.jsx
│           └── ErrorState.jsx
└── database/
    ├── schema.sql                   13 tables + 2 views
    └── seed_complete.sql            12-month historical data
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check — DB + OpenAI status |
| GET | `/api/data-status` | Per-page data source (mysql / mock) |
| GET | `/api/overview` | Executive KPIs + 12-month revenue |
| GET | `/api/inventory` | Stock intelligence + critical SKUs |
| GET | `/api/sales` | Revenue trend, margin, day-of-week |
| GET | `/api/customers` | Customer list + risk scores |
| GET | `/api/orders` | Order pipeline + fulfilment SLA |
| GET | `/api/procurement` | Supplier scorecards |
| GET | `/api/finance` | Cash cycle, GST, working capital |
| GET | `/api/freight` | Lane costs, vehicle utilization |
| GET | `/api/demand` | 30/60/90-day demand forecasts |
| GET | `/api/dead-stock` | Aged inventory + recovery plan |
| GET | `/api/inward` | GRN pipeline + shrinkage |
| GET | `/api/po-grn` | PO lifecycle + GRN discrepancies |
| POST | `/api/po` | Create purchase order |
| POST | `/api/chat` | Non-streaming chat |
| POST | `/api/chat/stream` | SSE streaming chat |

All dashboard endpoints follow **DB-first / mock-fallback pattern** — live data when MySQL is available, rich mock data otherwise.

---

## AI Architecture

```
User Query
    │
    ├── is_generic_query()      → Conversational response (no tools)
    ├── is_knowledge_query()    → Knowledge Base (EOQ, safety stock, ABC…)
    ├── is_insights_query()     → All 8 tools → 10-type rule engine → ranked by ₹
    └── Normal Query
            │
            ├── selector.py     → Pick 1-3 relevant tools from 9 available
            ├── tools.py        → Fetch DB/mock data in parallel
            ├── rca.py          → Inject RCA template (ask/explain/act mode)
            └── GPT-4o          → Stream response with tool context
```

**Chat modes:**
- `ask` — Quick, data-backed answers with specific ₹ figures
- `explain` — Deep RCA with 5-Why chain and fishbone analysis  
- `act` — Step-by-step executable plan with assigned owners and deadlines

---

## Database Schema

**13 tables covering the full distribution workflow:**

| Category | Tables |
|----------|--------|
| Inventory | `products`, `godowns`, `stock_levels`, `stock_movements` |
| Procurement | `suppliers`, `purchase_orders`, `po_items`, `grn` |
| Sales | `customers`, `customer_orders`, `order_items`, `invoices` |
| Logistics & Finance | `freight_lanes`, `freight_trips`, `demand_forecast`, `finance_monthly` |
| Views | `v_stock_summary`, `v_overdue_invoices` |

**Seed data** (`seed_complete.sql`):
- 149 customer orders across 12 months (Apr 2025 – Apr 2026)
- 17 GRN records with realistic MATCH/MISMATCH distribution
- 35 freight trips covering last 30 days
- 35 demand forecasts for all 18 SKUs (30/60/90 day)
- 13 months of finance snapshots

---

## Environment Variables

```env
# Required for AI chat
OPENAI_API_KEY=sk-proj-...

# Optional — enables live MySQL data (omit for demo mode)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=stocksense
MYSQL_PASSWORD=StockPass123!
MYSQL_DB=stocksense_inventory
```

---

## Dependencies

**Backend (Python)**
```
fastapi==0.115.0
uvicorn[standard]==0.30.6
openai==1.51.0
aiomysql==0.2.0
python-dotenv==1.0.1
pydantic-settings==2.5.2
```

**Frontend (Node)**
```
react@18.3.1
react-dom@18.3.1
react-scripts@5.0.1
chart.js@4.4.1
```

---

## Architecture Recommendations (Next Steps)

For teams scaling this platform, here are the key improvements in priority order:

1. **Docker + Compose** — Containerise all 3 services for reproducible deployments
2. **JWT Authentication** — Add auth layer with `python-jose` + FastAPI `Depends()`
3. **Redis Caching** — Cache dashboard responses (60s TTL) to reduce DB load
4. **Alembic Migrations** — Version-controlled schema changes instead of manual SQL
5. **TypeScript** — Migrate frontend for type safety and better DX
6. **TanStack Query** — Replace manual `useEffect` fetching with smart server state
7. **Testing** — pytest for API, React Testing Library for UI, Playwright for E2E
8. **GitHub Actions CI** — Run tests + build on every pull request

See the **Developer Guide** page inside the app for detailed recommendations.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes + test locally
4. Submit a pull request with a clear description

**Code style:**
- Python: Follow FastAPI async patterns. All DB operations must use `async/await`.
- React: Functional components only. Inline styles using CSS variables (`var(--b2)`, etc.).
- New dashboard pages: Follow the existing `DB-first / mock-fallback` pattern.
- New AI tools: Add to `tools.py` + register in `selector.py` keyword map.

---

## License

MIT License — free to use, modify, and distribute.

---

*Built for India's 15 lakh+ building materials dealers. Adaptable to any distribution business worldwide.*
