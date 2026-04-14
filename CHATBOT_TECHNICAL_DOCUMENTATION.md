# InvenIQ AI Chatbot — Technical Architecture & Enhancement Guide

**Document Version:** 1.0  
**Last Updated:** April 2026  
**Audience:** Development Team  
**Classification:** Technical Reference  

---

## Executive Summary

InvenIQ AI is a **professional, streaming AI chatbot** powering an enterprise inventory intelligence platform. It leverages:
- **Frontend**: React 18 with custom design system and streaming UI
- **Backend**: FastAPI with async MySQL and OpenAI GPT-4o integration
- **Intelligence**: Root Cause Analysis (RCA) engine with 5-Why framework
- **Data Flow**: Real-time MCP-style tools feeding live business context to the LLM

This document covers architecture, data flow, tech stack, and recommended enhancements.

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    INVENIQ AI PLATFORM                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┐      ┌──────────────────────────────────┐
│     FRONTEND (React 18.3.1)      │      │    BACKEND (FastAPI + Python)    │
├──────────────────────────────────┤      ├──────────────────────────────────┤
│                                  │      │                                  │
│  ┌────────────────────────────┐  │      │  ┌──────────────────────────┐   │
│  │  AIAssistant Component     │  │      │  │  Chat Router API         │   │
│  │  ├─ Input (query + mode)   │  │      │  │  ├─ /api/chat (sync)     │   │
│  │  ├─ Mode Selector (Ask/    │  │◄────┤  │  ├─ /api/chat/stream      │   │
│  │  │   Explain/Act)          │  │      │  │  └─ OpenAI Integration   │   │
│  │  ├─ Streaming UI           │  │      │  │                          │   │
│  │  ├─ Message History        │  │      │  ├──────────────────────────┤   │
│  │  └─ Follow-up Suggestions  │  │      │  │  Orchestrator Service    │   │
│  └────────────────────────────┘  │      │  │  ├─ Query Processing     │   │
│           │                       │      │  │  ├─ Tool Selection       │   │
│           ▼                       │      │  │  ├─ RCA Engine Call      │   │
│  ┌────────────────────────────┐  │      │  │  └─ LLM Streaming        │   │
│  │  Streaming UI Handler      │  │      │  │                          │   │
│  │  (SSE Event Processing)    │  │      │  ├──────────────────────────┤   │
│  │                            │  │      │  │  RCA Engine              │   │
│  │  • Real-time token display │  │      │  │  ├─ 5-Why Analysis       │   │
│  │  • Markdown rendering      │  │      │  │  ├─ Impact Quantification│   │
│  │  • Tool chip display       │  │      │  │  └─ Root Cause Detection │   │
│  │  • Emoji & formatting      │  │      │  │                          │   │
│  └────────────────────────────┘  │      │  ├──────────────────────────┤   │
│                                  │      │  │  Tool Selector           │   │
│  ┌────────────────────────────┐  │      │  │  └─ Dynamic tool choice  │   │
│  │  Custom Design System       │  │      │  │     based on query       │   │
│  │  ├─ CSS Variables           │  │      │  │                          │   │
│  │  │  (Ask/Explain/Act colors)│  │      │  ├──────────────────────────┤   │
│  │  ├─ Mode-specific theming   │  │      │  │  MCP Tools              │   │
│  │  ├─ Professional typography │  │      │  │  ├─ Stock Tool           │   │
│  │  └─ Responsive layout       │  │      │  │  ├─ Demand Tool          │   │
│  └────────────────────────────┘  │      │  │  ├─ Finance Tool         │   │
│                                  │      │  │  ├─ Supplier Tool        │   │
│                                  │      │  │  ├─ Customer Tool        │   │
│                                  │      │  │  ├─ Order Tool           │   │
│                                  │      │  │  ├─ Freight Tool         │   │
│                                  │      │  │  └─ Email Tool           │   │
│                                  │      │  └──────────────────────────┘   │
└──────────────────────────────────┘      └──────────────────────────────────┘
         │                                           │
         │ (HTTP/SSE)                                │
         └───────────┬─────────────────┬─────────────┘
                     │                 │
         ┌───────────▼──────┐  ┌──────▼─────────────┐
         │  OpenAI API      │  │  MySQL Database    │
         │  (GPT-4o /       │  │  ├─ Stock data     │
         │   GPT-4o-mini)   │  │  ├─ Demand history │
         │                  │  │  ├─ Customer data  │
         │  Models:         │  │  ├─ Orders         │
         │  ├─ GPT-4o       │  │  ├─ Finance        │
         │  │   (smart,     │  │  ├─ Supplier info  │
         │  │    slower)    │  │  └─ Metrics        │
         │  └─ GPT-4o-mini  │  │                    │
         │     (fast,       │  │  Data Source:      │
         │      streamed)   │  │  Primary (MySQL)   │
         └─────────┬────────┘  │  Fallback (Mock)   │
                   │            └────────────────────┘
         Streaming responses,
         Context injection
```

### 1.2 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend Framework** | React | 18.3.1 | UI component library |
| **Frontend Build** | react-scripts | 5.0.1 | Build tooling & dev server |
| **Charting** | Chart.js | 4.4.1 | Dashboard visualizations |
| **Backend Framework** | FastAPI | 0.115.0 | Async web server |
| **ASGI Server** | Uvicorn | 0.30.6 | Production-grade HTTP server |
| **LLM Provider** | OpenAI | 1.51.0 | GPT-4o / GPT-4o-mini models |
| **LLM Models** | gpt-4o, gpt-4o-mini | Latest | Smart reasoning & fast streaming |
| **Database** | MySQL | (client 0.2.0) | Persistent business data |
| **Async MySQL** | aiomysql | 0.2.0 | Non-blocking DB access |
| **Config Management** | python-dotenv | 1.0.1 | Environment variables |
| **Config Framework** | pydantic-settings | 2.5.2 | Typed config validation |
| **Validation** | AJV | 8.18.0 | JSON schema validation (Frontend) |

---

## 2. Data Flow Architecture

### 2.1 Chat Request Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: USER INITIATES CHAT                                         │
└─────────────────────────────────────────────────────────────────────┘

User Types: "Which SKUs need reorder?" + Mode: "Ask"
    │
    ├─ Frontend: AIAssistant.jsx captures input
    ├─ Mode selection (💬 Ask / 🔍 Explain / ⚡ Act)
    ├─ Message history (if any) passed along
    └─ Pending query cleared from app state


┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: HTTP REQUEST VIA SSE                                        │
└─────────────────────────────────────────────────────────────────────┘

Frontend POST Request:
  URL: http://localhost:8000/api/chat/stream
  Headers: Content-Type: application/json
  Body: ChatRequest {
    message: "Which SKUs need reorder?",
    mode: "ask",
    history: [
      { role: "user", content: "..." },
      { role: "assistant", content: "..." }
    ]
  }

Backend triggers: chat_stream() endpoint
  └─ Validates message & mode
  └─ Calls process_query_stream()


┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: ORCHESTRATOR LAYER                                          │
└─────────────────────────────────────────────────────────────────────┘

process_query_stream() in Orchestrator Service:

  a) Tool Selection (selector.py)
     ├─ Analyzes query: "Which SKUs need reorder?"
     ├─ Determines is_generic_query? (No — business-specific)
     └─ Calls select_tools() → Returns ["stock_tool"]

  b) Tool Execution (tools.py)
     ├─ Invokes: stock_tool()
     │    ├─ Tries MySQL first (if available)
     │    └─ Falls back to mock data if DB unavailable
     ├─ Returns: {
     │    "critical_low": [
     │      {
     │        "sku": "18mm BWP (8x4)",
     │        "stock": 140,
     │        "days_cover": 8,
     │        "daily_sale": 17,
     │        "reorder_level": 120,
     │        ...
     │      }
     │    ],
     │    "data_source": "mysql" | "mock"
     │  }

  c) RCA Analysis (rca.py)
     ├─ Analyzes stock data for issues
     ├─ Detects: 18mm BWP at critical low
     ├─ Generates 5-Why chain:
     │   - Why low? Reorder trigger wasn't actioned
     │   - Why missed? No automated alerting
     │   - Why? Supplier lead time not factored in
     └─ Builds RCA narrative for LLM context


┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: LLM CONTEXT INJECTION                                       │
└─────────────────────────────────────────────────────────────────────┘

System Prompt (SYSTEM_BASE) includes:
  ├─ Live DMS Snapshot (real-time KPIs)
  ├─ Indian business context (₹, GST, credit terms)
  ├─ Non-negotiable rules (cite data, specific numbers)
  └─ Mode-specific instructions (Ask/Explain/Act formatting)

Tool Results Injected:
  └─ Stock data + RCA narrative → GPT-4o context window

Chat History:
  └─ Previous messages provide continuity


┌─────────────────────────────────────────────────────────────────────┐
│ STEP 5: STREAMING RESPONSE GENERATION                               │
└─────────────────────────────────────────────────────────────────────┘

OpenAI Streaming (process_query_stream):

  for chunk in openai_stream:
    └─ Each chunk = event {
         type: 'token',
         content: partial_text,
         accumulated: full_response_so_far
       }

  Yield to Frontend via SSE:
    └─ data: {json_event}\n\n


┌─────────────────────────────────────────────────────────────────────┐
│ STEP 6: FRONTEND STREAMING DISPLAY                                  │
└─────────────────────────────────────────────────────────────────────┘

EventSource listener (AIAssistant.jsx):
  │
  ├─ onmessage(event) {
  │    const { type, content } = JSON.parse(event.data)
  │    ├─ If type === 'token' → Append to message
  │    ├─ If type === 'done' → Finalize response
  │    ├─ If type === 'error' → Display error
  │   └─ Render real-time in bubble
  │  }
  │
  ├─ Markdown Rendering:
  │  └─ MarkdownRenderer component converts:
  │     **bold** → <strong>
  │     *italic* → <em>
  │     ## Headers → <h2>
  │     - Lists → <ul><li>
  │
  ├─ Tool Chips Display:
  │  └─ parseToolChips() renders:
  │     📦 stock | 💰 finance | 🏭 supplier | ...
  │
  ├─ RCA Badge:
  │  └─ If rca_applied: true → Show 🔎 RCA chip
  │
  └─ Follow-up Suggestions:
     └─ Display AI-generated next questions


┌─────────────────────────────────────────────────────────────────────┐
│ STEP 7: MESSAGE COMPLETION & INTERACTION                            │
└─────────────────────────────────────────────────────────────────────┘

Message Footer shows:
  ├─ Model: gpt-4o | gpt-4o-mini
  ├─ Timestamp: HH:MM (India timezone)
  ├─ Data source: ● Live DB (green) | Mock
  └─ Actions:
     ├─ 👍 Helpful / 👎 Not helpful (feedback)
     ├─ 📋 Copy
     └─ Follow-up suggestions (clickable)
```

### 2.2 Data Sources & Fallback Strategy

**Priority Order:**
1. **MySQL Database** (Primary)
   - Real-time business data
   - Connected via `aiomysql` pool
   - Server: `MYSQL_HOST` (from .env)
   - Database: `stocksense_inventory`

2. **Mock Data** (Fallback)
   - Hardcoded realistic data in `tools.py`
   - Used if MySQL unavailable or connection fails
   - Ensures chatbot always works, even without DB

**Data Health Check:**  
`GET /api/db/status` returns:
```json
{
  "mysql_available": true,
  "host": "localhost",
  "database": "stocksense_inventory",
  "data_source": "mysql",
  "reason": "Connected"
}
```

### 2.3 MCP-Style Tools

Each tool is an async function returning business context to the LLM:

| Tool | Function | Output | Example |
|------|----------|--------|---------|
| **stock_tool()** | Real-time inventory levels | Critical low, dead stock, ABC analysis | `critical_low`, `dead_stock`, `godowns` |
| **demand_tool()** | Forecasting & trends | 30-day outlook, seasonal patterns | `forecast_30d`, `fast_movers`, `seasonal` |
| **finance_tool()** | Margin & cash flow | Working capital, DSO, margin by SKU | `working_capital_days`, `true_margin` |
| **supplier_tool()** | Vendor scorecard | On-time %, lead times, cost | `on_time_pct`, `avg_delay_days` |
| **customer_tool()** | Account intelligence | Churn risk, credit rating | `credit_risk`, `churn_probability` |
| **order_tool()** | Fulfillment status | Pending, delayed, dispatch rate | `pending_orders`, `avg_delay_hours` |
| **freight_tool()** | Logistics optimization | Cost per delivery, routing | `avg_cost_per_delivery` |
| **email_tool()** | Draft & sending | Generate payment reminders, POs | `draft_reminder`, `send_email` |

**Tool Selection Logic:**
```python
# In selector.py → select_tools(query)
if "reorder" in query → return ["stock_tool"]
if "margin" in query → return ["finance_tool", "stock_tool"]
if "delay" in query → return ["supplier_tool", "order_tool"]
# ... pattern matching
```

---

## 3. Chat Modes & Response Strategies

### 3.1 Three Operational Modes

#### **Mode 1: ASK (💬 Data-Backed Answers)**
- **User Intent:** "What is my current situation?"
- **System Behavior:**
  - Concise, 1-2 paragraph response
  - Lead with direct answer (no preamble)
  - Cite real numbers: SKU names, ₹ amounts, exact days
  - Format: Plain prose with ** bolding** for key metrics
- **Example Response:**
  ```
  **18mm BWP is critically low at 140 sheets (8 days cover)** at 17 sheets/day demand pace. 
  **Reorder now with Century Plyboards** — they have 96% on-time delivery and can ship in 6 days.
  Missing this reorder window risks **₹1.9L revenue loss** if you stock out.
  ```

#### **Mode 2: EXPLAIN (🔍 Root Cause Analysis)**
- **User Intent:** "Why is this happening?"
- **System Behavior:**
  - Multi-paragraph with markdown structure
  - ## Headings for sections:
    - Root Cause
    - Contributing Factors
    - Business Impact (₹ quantified)
    - Fix Plan
  - 5-Why chains showing cascading root causes
  - Formatted as markdown (headers, bullets, bold)
- **Example Structure:**
  ```
  ## Root Cause
  Stock turnover dropping due to oversupply in Q3...
  
  ## Contributing Factors
  - Demand forecast underestimated seasonal shift
  - Dead stock value now ₹4.2L (11% of total inventory)
  - ...
  
  ## Business Impact
  **₹1L/year in opportunity cost** at 12% cost of capital...
  ```

#### **Mode 3: ACT (⚡ Executable Action Plans)**
- **User Intent:** "What should I do right now?"
- **System Behavior:**
  - Numbered, time-bound sections:
    - ### IMMEDIATE (today, next 2 hours)
    - ### THIS WEEK (by Friday)
    - ### FOLLOW-UP (next 2 weeks)
  - Each step includes:
    - Actionable instruction
    - → Arrow showing direct consequence
    - ₹ impact estimate
  - Format: Bullet points with clear owners/timelines
- **Example:**
  ```
  ### IMMEDIATE (Today)
  1. Call Century Plyboards sales rep → Confirm 300-sheet 18mm BWP order
     **→ ₹1.9L revenue protected**
  2. Email Sharma Constructions → Offer 1.5% early payment discount
     **→ Could recover ₹51K in 15 days**
  
  ### THIS WEEK
  1. Negotiate NET-15 payment terms with Century
     **→ Free up ₹4-5L working capital**
  ```

### 3.2 Emoji Usage Guidelines

**Professional placement (not everywhere):**

| Context | Emoji | Usage |
|---------|-------|-------|
| Mode badges | 💬 🔍 ⚡ | Mode header (always) |
| Tool chips | 📦 💰 🏭 👥 📋 📈 🚚 📧 | Next to tool names in chips |
| Alert flags | 🔴 🟡 🟢 | Severity indicators in RCA |
| Section headers | (depends on context) | Headline emoji support |
| Emphasis | ✅ ❌ | Checkpoint markers in plans |
| Brand | ✨ 🔎 | Features: "✨ Follow-ups", "🔎 RCA" |

**NO emojis in:**
- Prose text in response body
- Financial figures (₹ symbol only)
- Technical explanations
- Data citations

---

## 4. Frontend Architecture (React)

### 4.1 Component Hierarchy

```
App.js
├── Sidebar (Navigation)
├── Topbar (Title + Period selector)
└── main (Router)
    ├── Overview
    ├── Inventory
    ├── ... (other views)
    └── AIAssistant (Chat Component) ◄─── CHATBOT ENTRY POINT
        │
        ├── ModeSelector
        │   └── 3 mode buttons (Ask/Explain/Act)
        │
        ├── ChatMessageList
        │   ├── UserMessage
        │   │   ├── Input bubble
        │   │   └── Mode badge
        │   │
        │   └── AiMessage
        │       ├── Mode badge (💬/🔍/⚡)
        │       ├── RCA badge (🔎)
        │       ├── Tool chips (📦 💰 🏭...)
        │       ├── Markdown-rendered content
        │       ├── MarkdownRenderer
        │       │   └── HTML conversion (headers, lists, bold)
        │       ├── Streaming cursor (while generating)
        │       ├── Message footer
        │       │   ├── Metadata (Model, Timestamp, Data source)
        │       │   └─ Actions (👍👎 Copy)
        │       └── Follow-up suggestions
        │
        ├── SuggestionPanel (Initial state)
        │   └── Categorized quick-start prompts
        │
        └── InputBox
            ├── Text input
            ├── Send button
            └── Max length validation

MarkdownRenderer (Utility)
└── Converts markdown strings to safe HTML
    ├── **bold** → <strong>
    ├── *italic* → <em>
    ├── ## Header → <h2>
    ├── - List items → <ul><li>
    └── [Links supported]
```

### 4.2 Key React Features

| Feature | Implementation | Purpose |
|---------|----------------|---------|
| **Streaming SSE** | `EventSource` API | Real-time token delivery |
| **State Management** | `useState` | Message history, mode, input |
| **Side Effects** | `useEffect` | SSE listener setup, cleanup |
| **Callbacks** | `useCallback` | Mode switching, query submission |
| **Memoization** | `useMemo` | Markdown rendering (expensive) |
| **Message History** | Array state | Conversation continuity |
| **Pending Query** | App-level state | Cross-view navigation support |
| **Copy to Clipboard** | `navigator.clipboard` | Copy button functionality |

### 4.3 Styling System

**CSS Architecture:**
- **Design Tokens** (CSS Variables):
  ```css
  --iq-bg: #f8fafc              /* Background */
  --iq-surface: #ffffff          /* Cards & bubbles */
  --iq-ask-from: #2563eb         /* Ask mode color */
  --iq-explain-from: #7c3aed     /* Explain mode color */
  --iq-act-from: #d97706         /* Act mode color */
  --iq-radius: 12px              /* Border radius */
  --iq-shadow-md: 0 4px 6px...   /* Depth */
  ```

- **Professional Typography:**
  - Sans-serif font family
  - 14px base text, 16px headers
  - Line-height: 1.6 (readability)
  - Letter-spacing: -0.01em (modern look)

- **Responsive Layout:**
  - Flexbox for message containers
  - Grid for chip rows
  - Mobile-friendly touch targets (44px+ height)

---

## 5. Backend Architecture (FastAPI + Python)

### 5.1 Application Lifecycle

**Entry Point:** [backend/app/main.py](backend/app/main.py)

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize MySQL pool
    cfg = get_settings()
    if cfg.mysql_host:
        await get_pool()  # Async connection pool
    yield
    # Shutdown: Close all connections
    await close_pool()

app = FastAPI(
    title="InvenIQ API",
    lifespan=lifespan,
)

# CORS enabled for localhost:3000
app.add_middleware(CORSMiddleware, allow_origins=[...])

# Routes
app.include_router(chat_router, prefix="/api")
```

### 5.2 Chat Endpoints

**Endpoint 1: Non-Streaming (Fallback)**
```
POST /api/chat
Content-Type: application/json

Request:
{
  "message": "Which SKUs need reorder?",
  "mode": "ask",
  "history": [...]
}

Response:
{
  "response": "18mm BWP is critically low...",
  "mode": "ask",
  "tools_used": ["stock_tool"],
  "rca_performed": false
}

Latency: ~3-5 seconds (full response)
```

**Endpoint 2: Streaming (Primary)**
```
POST /api/chat/stream
Content-Type: application/json

Server-Sent Events (SSE):

event: message
data: {"type": "token", "content": "18mm"}

event: message
data: {"type": "token", "content": " BWP"}

...

event: message
data: {"type": "done", "metadata": {...}}

Latency: ~500ms to first token, streaming thereafter
```

### 5.3 Service Layer

**Orchestrator Service** (`app/services/orchestrator.py`)

```
process_query_stream(query, mode, history)
│
├─ 1. Call select_tools(query) → ["stock_tool", "finance_tool"]
│
├─ 2. Execute tools:
│    └─ results = await tool() → Dict with business data
│
├─ 3. Perform RCA:
│    └─ rca_output = run_rca(results) → Issue chains + fixes
│
├─ 4. Build LLM context:
│    ├─ system_prompt (SYSTEM_BASE + mode instructions)
│    ├─ tool results (as context)
│    ├─ rca_narrative (if issues detected)
│    └─ chat_history (for continuity)
│
└─ 5. Stream from OpenAI:
     └─ for chunk in response.stream:
        └─ yield {"type": "token", "content": chunk.choices[0].delta.content}
```

### 5.4 RCA Engine

**Purpose:** Detect and explain business problems before the LLM even generates responses.

**Input:** Raw business data (stock, finance, supplier, order data)

**Output:** Structured issues with:
- **Type**: Human-readable issue class
- **Severity**: HIGH | MEDIUM | LOW
- **Root Cause**: Direct cause statement
- **Why Chain**: 3-level 5-Why analysis
- **Contributing Factors**: Supporting reasons
- **Business Impact**: ₹ quantified consequences
- **Fix**: Recommended solution
- **Immediate Action**: First step to execute

**Example RCA Detection:**
```python
for item in stock_data["critical_low"]:
    if item["days_cover"] < 10:
        issues.append({
            "type": "Critical Stockout Risk",
            "severity": "HIGH",
            "root_cause": f"Only {days_cover} days cover at current demand",
            "why_chain": [
                "Why low? — Reorder trigger wasn't actioned",
                "Why missed? — No automated alert system",
                "Why? — Supplier lead time not factored in"
            ],
            ...
        })
```

### 5.5 Tool Selection Logic

**File:** `app/services/selector.py`

```python
def select_tools(query: str) -> List[str]:
    """
    Intelligently choose which tools to invoke based on query keywords.
    """
    
    tools = []
    
    # Stock-related queries
    if any(kw in query.lower() for kw in ["reorder", "stock", "low", "inventory"]):
        tools.append("stock_tool")
    
    # Finance-related queries
    if any(kw in query.lower() for kw in ["margin", "profit", "working capital", "cash"]):
        tools.append("finance_tool")
    
    # Supplier & procurement
    if any(kw in query.lower() for kw in ["supplier", "vendor", "lead time", "delay"]):
        tools.append("supplier_tool")
    
    # ... (more patterns)
    
    # Default: use stock tool if no specific match
    if not tools:
        tools = ["stock_tool"]
    
    return tools
```

### 5.6 OpenAI Integration

**Async Client:**
```python
from openai import AsyncOpenAI

_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
```

**Models Used:**
- **gpt-4o**: Full reasoning, complex analysis, RCA narratives (slower)
- **gpt-4o-mini**: Streaming responses, multi-turn (faster)

**Streaming Pattern:**
```python
async def process_query_stream(...) -> AsyncGenerator:
    response = await _client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_BASE + MODE_INSTRUCTIONS[mode]},
            {"role": "user", "content": query},
            ... # history
        ],
        stream=True,
    )
    
    async for chunk in response:
        if chunk.choices[0].delta.content:
            yield {
                "type": "token",
                "content": chunk.choices[0].delta.content,
                "accumulated": full_text_so_far
            }
    
    yield {
        "type": "done",
        "metadata": {"model": "gpt-4o", "tools": tools, "rca": rca_performed}
    }
```

---

## 6. Configuration & Environment

### 6.1 Environment Variables (.env)

```bash
# Required for chatbot functionality
OPENAI_API_KEY=sk-proj-xxx...

# Optional: MySQL Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DB=stocksense_inventory

# If MYSQL_HOST is not set or connection fails:
# → Chatbot still works with fallback mock data
```

### 6.2 Configuration Object

**File:** `app/core/config.py`

```python
class Settings(BaseSettings):
    openai_api_key: str = ""
    mysql_host: str = ""
    mysql_port: int = 3306
    mysql_user: str = "root"
    mysql_password: str = ""
    mysql_db: str = "stocksense_inventory"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Lazy-loaded singleton
settings = get_settings()
```

---

## 7. Advanced Features

### 7.1 Streaming Response Pipeline

**Why Streaming?**
- **UX**: Users see responses appearing in real-time (not waiting 3 seconds)
- **Transparency**: Build confidence as LLM "thinks" in front of user
- **Interactivity**: User can start reading while AI is still generating

**Technical Flow:**
1. Frontend: `EventSource('/api/chat/stream')`
2. Backend: FastAPI yields SSE events
3. OpenAI: Provides streaming token chunks
4. Frontend: Real-time DOM updates

### 7.2 Root Cause Analysis (RCA)

**Purpose:** Go beyond answering the question → explain *why* the problem exists.

**Example:**
```
User: "Why is my margin dropping?"

RCA Output:
├─ Root Cause: 8mm Flexi BWP has true landed cost ₹784/sheet 
│               but selling at ₹840 (6.7% margin vs stated 23.8%)
│
├─ Why Chain:
│  1. Why? — Freight from Gauri Laminates is ₹110/sheet (vs ₹42 from Century)
│  2. Why? — Supplier contract doesn't specify freight cost upfront
│  3. Why? — No procurement AI analyzing true landed cost
│
├─ Impact: Losing ₹110/sheet × 200 sheets/month = ₹2.2L annual margin leakage

└─ Fix: Dual-source with Century Plyboards → recover ₹16 margin/sheet
```

### 7.3 Follow-up Suggestions

After each response, AI generates contextual next questions:

```
✨ Suggested follow-ups

→ "What's the best reorder strategy for 18mm BWP?"
→ "How do I reduce supplier delays for Century orders?"
→ "Show me margin recovery plan for 8mm Flexi"
```

Implementation: LLM generates follow-ups as final streaming event.

### 7.4 Message Reactions & Feedback

**User Feedback Mechanism:**
```
👍 Helpful     👎 Not helpful     📋 Copy

```

Currently collected client-side (can be sent to backend for ML training).

---

## 8. Professional Design Features

### 8.1 Visual Identity

**Color Palette:**
- **Ask Mode**: Blue (#2563eb) — data-driven, analytical
- **Explain Mode**: Purple (#7c3aed) — deep reasoning
- **Act Mode**: Amber (#d97706) — action-oriented, urgent
- **Neutral**: Navy (#0f172a), calm gray (#64748b)

**Typography:**
- Sans-serif (system font stack)
- Professional hierarchy: h1 (28px) → p (14px)
- Line-height: 1.6 (desktop readability)
- Letter spacing: -0.01em (modern compact feel)

### 8.2 Accessibility

- Alt text for icons
- Semantic HTML (nav, main, section)
- Color not sole differentiator (mode icons + text labels)
- Touch targets: 44px minimum height
- Keyboard navigation: Tab, Enter supported

---

## 9. Error Handling & Health Checks

### 9.1 Error Scenarios

| Scenario | Handling |
|----------|----------|
| OpenAI API down | Return 503 Service Unavailable |
| Invalid message | Return 400 Bad Request + hint |
| Invalid mode | Return 400 Bad Request |
| MySQL unavailable | Fallback to mock data transparently |
| Token/streaming error | SSE event: `{"type": "error", "message": "..."}` |

### 9.2 Health Check Endpoints

```bash
# General health
curl http://localhost:8000/api/health
{
  "status": "healthy",
  "openai_configured": true,
  "mysql_connected": true,
  "data_source": "mysql"
}

# Database status detail
curl http://localhost:8000/api/db/status
{
  "mysql_available": true,
  "host": "localhost",
  "database": "stocksense_inventory",
  "data_source": "mysql",
  "reason": "Connected"
}
```

---

## 10. Recommended Enhancements (Without Disruption)

### 10.1 ** Advanced Chatbot Features (Priority Order)**

#### **Tier 1: High-Impact, Low-Risk (Implement First)**

1. **Semantic Search & Long-term Memory**
   - Add vector database (e.g., Pinecone, Weaviate)
   - Store past conversations with embeddings
   - Enable: "Based on our discussion last week about..."
   - **Impact**: More contextual, personalized responses
   - **Effort**: 2-3 days
   - **Non-disruptive**: Parallel storage, no change to existing chat

2. **Real-time Data Streaming to Chatbot**
   - Subscribe to database events (MySQL triggers, message queues)
   - Inject live KPIs into system prompt dynamically
   - Enable: "📈 Stock updated 2 mins ago, margin trending..." badges
   - **Impact**: Always-fresh context, real-time alerts
   - **Effort**: 3-4 days
   - **Non-disruptive**: Additive feature, no change to core chat logic

3. **Multi-language Support (Hindi + Regional Languages)**
   - Wrapper function to detect language
   - Translate queries to English, responses back to Hindi
   - Use: Google Translate API or OpenAI translate_text tool
   - **Impact**: Reach 10x more dealers (India-specific advantage)
   - **Effort**: 2 days
   - **Non-disruptive**: Optional toggle, fallback to English

4. **Conversation Persistence & Export**
   - Store conversations in MySQL: `conversations` table
   - Export to PDF with formatting
   - Enable: "View past chats" | "Share analysis with team"
   - **Impact**: Compliance, team collaboration, knowledge base
   - **Effort**: 2 days
   - **Non-disruptive**: New table, optional feature

#### **Tier 2: Medium-Impact Features (Implement Next Sprint)**

5. **Advanced RCA with Ishikawa Diagrams (Fish Bone)**
   - Generate structured RCA diagrams (People, Process, Material, Method)
   - Visual rendering in UI
   - Enable: "Show root cause map" → Interactive diagram
   - **Impact**: Visual thinking, better problem understanding
   - **Effort**: 4 days
   - **Tech**: SVG rendering, diagram library (e.g., react-flow)

6. **Predictive Alerts & Notifications**
   - Analyze chat queries for brewing problems
   - Pro-active alerts: "⚠️ Your working capital is trending worse..."
   - Push notifications (optional)
   - **Impact**: Preventive action vs reactive answering
   - **Effort**: 3 days

7. **A/B Test Different Response Styles**
   - Try: Conservative vs aggressive recommendations
   - Track: Which style correlates with better business outcomes
   - **Impact**: Data-driven UI/UX improvement
   - **Effort**: 2 days

8. **Audit Trail & Explainability Dashboard**
   - Show: "This answer used stock_tool + finance_tool + RCA engine"
   - Provenance: Which data version, which LLM decision points
   - **Impact**: Trust, compliance, debugging
   - **Effort**: 3 days

#### **Tier 3: Nice-to-Have (Long-term)**

9. **Retrieval-Augmented Generation (RAG)**
   - Ground responses in your actual business documents (contracts, SOPs)
   - Reduce hallucinations
   - **Effort**: 5-7 days

10. **Custom Fine-tuning of GPT-4**
    - Fine-tune on past chat conversations + outcomes
    - Domain-specific knowledge baked into model
    - **Effort**: 10+ days, requires labeled data

11. **Voice Input/Output**
    - Speech-to-text (OpenAI Whisper)
    - Text-to-speech (Azure, ElevenLabs)
    - **Effort**: 4 days
    - **Use case**: Hands-free insights for warehouse staff

### 10.2 Design & UX Enhancements

1. **Dark Mode Toggle**
   - Add theme switcher in Topbar
   - CSS variables already support theming
   - **Effort**: 1 day

2. **Copy-to-Notion / CRM Integration**
   - One-click export to Notion, HubSpot, Freshdesk
   - **Effort**: 2 days

3. **Sentiment Indicator**
   - Analyze user mood from chat patterns
   - Show: "You seem frustrated about supplier reliability"
   - **Effort**: 1 day

4. **Response Quality Metrics Dashboard**
   - Show: "Answer was helpful 87% of the time" (aggregate feedback)
   - Help improve prompts over time
   - **Effort**: 2 days

### 10.3 Performance Optimizations

1. **Response Caching**
   - Cache FAQ answers (stock reorder, margin analysis, etc.)
   - Redis for quick retrieval
   - **Effort**: 2 days
   - **Benefit**: <100ms response for common queries

2. **LLM Token Optimization**
   - Compress system prompt using custom formatting
   - Reduces cost by ~20%
   - **Effort**: 1 day

3. **Database Query Optimization**
   - Index frequently accessed columns
   - Add materialized views for complex queries
   - **Effort**: 2-3 days
   - **Benefit**: Faster tool execution

---

## 11. Deployment Checklist

### Pre-Deployment

- [ ] `.env` file configured with `OPENAI_API_KEY` and optional `MYSQL_*`
- [ ] Backend dependencies installed: `pip install -r requirements.txt`
- [ ] Frontend dependencies installed: `npm install`
- [ ] Frontend built: `npm run build`
- [ ] OpenAI API key validated with `/api/health` endpoint
- [ ] (Optional) MySQL database initialized with schema
- [ ] CORS origins set appropriately (not `*` in production)

### Production Deployment

**Backend (FastAPI):**
```bash
# Using Uvicorn with production settings
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Frontend (React):**
```bash
# Build & serve with nginx or similar
npm run build
# Serve /frontend/build directory with reverse proxy to API
```

**Environment (Production):**
```bash
OPENAI_API_KEY=sk-proj-xxx...
MYSQL_HOST=prod-db.example.com
MYSQL_USER=readonly_user
MYSQL_PASSWORD=***
MYSQL_DB=stocksense_inventory_prod
```

---

## 12. Troubleshooting Guide

### Problem 1: Chatbot Responses Are Slow

**Root Cause:**
- OpenAI API latency
- Tool execution slow (MySQL query hanging)
- Network latency

**Solutions:**
1. Use `gpt-4o-mini` for faster responses
2. Optimize MySQL queries with indexes
3. Enable response caching for common questions
4. Check OpenAI API status: https://status.openai.com

### Problem 2: Only Mock Data Appears (Not MySQL)

**Check:**
1. `.env` file has `MYSQL_HOST` set
2. MySQL service is running
3. Credentials are correct
4. Database `stocksense_inventory` exists

**Verify:**
```bash
curl http://localhost:8000/api/db/status
# If "mysql_connected": false, check logs
```

### Problem 3: Frontend Shows "Connection Refused"

**Check:**
1. Backend running on port 8000? `lsof -i :8000`
2. CORS headers correct in main.py?
3. `frontend/package.json` has `"proxy": "http://localhost:8000"`

### Problem 4: Streaming Not Working (Server-Sent Events)

**Check:**
1. Browser supports SSE (all modern browsers do)
2. Proxies/firewalls not blocking `Transfer-Encoding: chunked`
3. Backend correctly yielding SSE format: `data: {json}\n\n`

---

## 13. Security Considerations

### API Security

- **API Keys**: Store `OPENAI_API_KEY` only in `.env`, never commit
- **CORS**: Restrict to your frontend domain only
- **HTTPS**: Use in production (TLS 1.3)
- **Rate Limiting**: Consider for public deployments

### Database Security

- **MySQL User**: Create read-only user for chatbot queries
- **Connection Pool**: Set max connections limit
- **SQL Injection**: Not applicable (async ORM, parameterized queries)

### Data Privacy

- Conversations can be stored in MySQL (optional)
- Comply with local data protection (GDPR, DPDPA in India)
- Consider: Sensitive data (customer names, amounts) should be pseudonymized if logging

---

## 14. Maintenance & Monitoring

### Logs to Monitor

1. **Backend**: Check `/var/logs/inveniq-api.log`
   - OpenAI API errors
   - MySQL connection issues
   - Streaming failures

2. **Frontend**: Browser console
   - EventSource errors
   - Rendering issues
   - State management bugs

### Metrics to Track

- Average response time (goal: <2s first token)
- OpenAI API cost per query
- Cache hit rate (if implemented)
- User feedback thumbs-up ratio (goal: >80%)
- Error rate (goal: <1%)

---

## 15. Contact & Support

**Questions about this system?**
- Check health endpoint: `GET /api/health`
- Review logs for errors
- Validate `.env` configuration
- Check OpenAI API status

**Bug Reports:**
- Stack trace in logs
- Steps to reproduce
- Browser version (for frontend)

---

## Appendix A: Quick Start Commands

```bash
# Backend startup
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload

# Frontend startup
cd frontend
npm install
npm start

# Test API endpoints
curl http://localhost:8000/api/health
curl http://localhost:8000/api/db/status

# OpenAI API validation
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "hi", "mode": "ask"}'
```

## Appendix B: System Prompt Architecture

The system prompt is composed of:

1. **SYSTEM_GENERIC** (conversational greetings)
2. **SYSTEM_BASE** (core expertise + DMS snapshot + rules)
3. **MODE_INSTRUCTIONS[mode]** (Ask/Explain/Act specific)
4. **RCA_NARRATIVE** (detected business issues, if any)
5. **Tool Results** (stock, demand, finance data)

This layered approach allows:
- Consistent personality regardless of query
- Mode-specific formatting without prompt engineering
- Dynamic context injection (real-time data)
- Transparent RCA integration

---

**Document Status:** Final v1.0  
**Last Reviewed:** April 2026  
**Next Review:** Q3 2026

---
