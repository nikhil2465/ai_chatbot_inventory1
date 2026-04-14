# InvenIQ AI Chatbot — Quick Reference Guide for Developers

**For:** Your development team member  
**Purpose:** Understand the chatbot architecture at a glance  
**Time to read:** 10 minutes  

---

## 1. System Overview in 60 Seconds

```
USER QUESTION (in React frontend)
    ↓
SENT TO BACKEND (FastAPI on port 8000)
    ↓
TOOL SELECTION (which data tool to call?)
    ↓
DATABASE QUERY (MySQL — or mock data if offline)
    ↓
RCA ANALYSIS (detect root causes automatically)
    ↓
LLM STREAMING (GPT-4o generates response token-by-token)
    ↓
REAL-TIME DISPLAY (tokens appear in chat bubble)
    ↓
USER READS FORMATTED RESPONSE (with emojis, formatting, badges)
```

---

## 2. Tech Stack (What We're Using)

| Component | Technology | Version |
|-----------|-----------|---------|
| **Frontend** | React | 18.3.1 |
| **Backend Framework** | FastAPI | 0.115.0 |
| **ASGI Server** | Uvicorn | 0.30.6 |
| **LLM** | OpenAI (GPT-4o) | Latest |
| **Database** | MySQL | (aiomysql 0.2.0) |
| **Async IO** | Python async/await | Native |
| **Streaming** | Server-Sent Events (SSE) | HTTP standard |

**Why This Stack?**
- FastAPI: Fast, async, built-in validation
- React: Component-based, real-time updates
- OpenAI: Best LLM available, streaming support
- MySQL: Reliable persistence, our data lives here

---

## 3. File Structure

```
backend/
├── app/
│   ├── main.py ........................ FastAPI app entry point
│   ├── api/
│   │   └── chat.py ................... Routes: /api/chat, /api/chat/stream
│   ├── core/
│   │   └── config.py ................. Environment config
│   ├── services/
│   │   ├── orchestrator.py ........... LLM + tool coordination
│   │   ├── selector.py ............... Which tools to use?
│   │   ├── tools.py .................. 8 MCP-style tools
│   │   └── rca.py .................... Root cause analysis
│   └── db/
│       ├── connection.py ............. MySQL async pool
│       └── queries.py ................ Database queries
└── requirements.txt ................... Dependencies

frontend/
├── src/
│   ├── App.js ........................ Main app router
│   ├── views/
│   │   └── AIAssistant.jsx ........... Chat component (all logic)
│   └── App.css ....................... Global styles
└── package.json
```

---

## 4. Data Flow: Step By Step

### Step 1: User Types Message
```
Frontend (AIAssistant.jsx):
  input = "Which SKUs need reorder?"
  mode = "ask"
  history = [...]  // past messages
```

### Step 2: Send to Backend
```
POST /api/chat/stream

{
  "message": "Which SKUs need reorder?",
  "mode": "ask",
  "history": [...]
}
```

### Step 3: Backend Processing
```python
# orchestrator.py - process_query_stream()

1. select_tools(query)
   → Detects "reorder" keyword
   → Returns ["stock_tool"]

2. Invoke tools
   stock_tool() returns:
   {
     "critical_low": [
       {"sku": "18mm BWP", "stock": 140, "days_cover": 8}
     ],
     "data_source": "mysql"
   }

3. Run RCA
   rca.py detects:
   - High severity: Critical stockout risk
   - Why chain: Supply chain not optimized
   - Impact: ₹1.9L revenue at risk

4. Build LLM context
   System prompt + tool results + RCA narrative

5. Stream from OpenAI
   for chunk in gpt4o_stream:
     yield SSE event with token
```

### Step 4: Frontend Renders Streaming Response
```javascript
// AIAssistant.jsx

eventSource.onmessage = (event) => {
  const { type, content } = JSON.parse(event.data)
  
  if (type === 'token') {
    // Append token to message
    setMessage(prev => prev + content)
  }
  if (type === 'done') {
    // Response complete
    setIsStreaming(false)
  }
}

// MarkdownRenderer converts:
// "**18mm BWP**" → <strong>18mm BWP</strong>
// "## Root Cause" → <h2>Root Cause</h2>
```

### Step 5: Display Final Message
```
┌──────────────────────────────────────┐
│ 💬 ASK | 🔎 RCA | 📦 Stock           │
├──────────────────────────────────────┤
│ 18mm BWP is critically low...        │
│ ₹1.9L revenue at risk.              │
├──────────────────────────────────────┤
│ 👍 👎   📋 Copy                      │
│                                      │
│ ✨ Suggested follow-ups:            │
│ → "How do I reorder safely?"        │
└──────────────────────────────────────┘
```

---

## 5. The Three Modes Explained

### Mode 1: ASK (💬)
- **Purpose**: Quick answer
- **Response**: 1-2 paragraphs, plain text
- **Example**: "18mm BWP at 8 days cover, call Century now"
- **Use when**: User needs facts fast

### Mode 2: EXPLAIN (🔍)
- **Purpose**: Understanding
- **Response**: Structured with headers + 5-Why chains
- **Example**: Shows why margin dropped, multiple factors
- **Use when**: User asks "Why is X happening?"

### Mode 3: ACT (⚡)
- **Purpose**: Executable plan
- **Response**: Time-bound sections (IMMEDIATE/THIS WEEK/FOLLOW-UP)
- **Example**: "Today: Call Century. This week: Negotiate terms"
- **Use when**: User needs action steps

---

## 6. The 8 Tools (MCP-Style)

Each tool returns business context to the LLM:

| Tool | What It Returns | Example Output |
|------|-----------------|-----------------|
| **stock_tool** | Inventory levels | `{critical_low: [...], dead_stock: [...]}` |
| **demand_tool** | Forecasts & trends | `{forecast_30d: [...], fast_movers: [...]}` |
| **finance_tool** | Margins & cash | `{working_capital_days: 48, margin: 22.4%}` |
| **supplier_tool** | Vendor scorecard | `{on_time_pct: 96, lead_time: 6}` |
| **customer_tool** | Account health | `{credit_risk: low, churn_probability: 5%}` |
| **order_tool** | Fulfillment status | `{pending: 6, delayed_hours: 24}` |
| **freight_tool** | Logistics optimization | `{cost_per_delivery: 850}` |
| **email_tool** | Draft & send messages | `{draft: "Dear customer..."}` |

**How tool selection works:**
```python
# selector.py
if "reorder" or "stock" in query:
    tools.append("stock_tool")
if "margin" or "profit" in query:
    tools.append("finance_tool")
# ... more patterns
```

---

## 7. RCA Engine (Root Cause Analysis)

**Purpose**: Automatically detect business problems

**Process**:
```
Input: {stock_data, finance_data, supplier_data, ...}
    ↓
Detects Issues:
  - Stock: critical_low < 10 days cover? → HIGH severity
  - Margin: true_margin < stated_margin? → HIGH severity
  - Supplier: on_time_pct < 80%? → HIGH severity
    ↓
Builds 5-Why Chains:
  Why low? → Reorder not actioned
  Why missed? → No automated alert
  Why? → Supplier lead time not factored
    ↓
Quantifies Impact:
  "₹1.9L revenue at risk if stockout"
    ↓
Output: [
  {
    type: "Critical Stockout Risk",
    severity: "HIGH",
    root_cause: "...",
    why_chain: [...],
    business_impact: "₹1.9L",
    fix: "Place PO with Century TODAY"
  }
]
```

**Injected into LLM context:**
```
"=== RCA ENGINE OUTPUT ===
HIGH SEVERITY (1 issue):
  ISSUE: Critical Stockout Risk — 18mm BWP
  ROOT CAUSE: 8 days cover at 17 sheets/day demand
  BUSINESS IMPACT: ₹1.9L revenue at risk
  FIX: Place PO with Century Plyboards TODAY"
```

---

## 8. Streaming Architecture

**Why Streaming?**
```
Without streaming:          With streaming:
User waits 3 seconds  →   User sees tokens appear
Then sees full answer      in real-time (500ms first)
Bad UX, feels slow         Better UX, feels smart
```

**How it works:**
```
Frontend:
  const es = new EventSource('/api/chat/stream')
  es.onmessage = (event) => {
    const { content } = JSON.parse(event.data)
    updateUI(content)  // Real-time update
  }

Backend:
  async for chunk in openai_response.stream():
    token = chunk.choices[0].delta.content
    yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
    # This happens ~100 times per response
    # Frontend updates UI after each

OpenAI:
  Returns tokens one at a time (streaming API)
  Instead of waiting for full response
```

---

## 9. Environment Setup (.env)

```bash
# REQUIRED
OPENAI_API_KEY=sk-proj-xxx...

# OPTIONAL (if DB offline, uses mock data)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DB=stocksense_inventory
```

**If MYSQL_HOST is not set:**
- Chatbot still works (graceful fallback)
- Uses hardcoded mock data from `tools.py`
- All features work identically
- Zero disruption

---

## 10. Key Design Decisions

### Why Streaming (SSE) Instead of Polling?
```
Polling:
- Frontend asks "done yet?" every 500ms
- Wasteful network calls
- Updates feel chunky

SSE (Server-Sent Events):
- Server pushes tokens as they arrive
- Efficient, one-way
- Smooth real-time experience
- Standard HTTP, no WebSocket needed
```

### Why 3 Modes (Ask/Explain/Act)?
```
Ask:     "What is the problem?"       → Speed, facts
Explain: "Why does this problem exist?" → Understanding
Act:     "What should I do about it?"  → Execution

One mode isn't enough. This covers all user intents.
```

### Why MCP-Style Tools?
```
Why not query MySQL directly in the LLM?
- LLMs can't execute SQL reliably
- Tool abstraction keeps logic in Python
- Can fall back to mock data seamlessly
- Easier to test & debug

How MCP works:
  LLM says "I need stock data"
  Our tool_selector sees that
  We call stock_tool()
  We inject results into context
  LLM continues reasoning with fresh data
```

### Why RCA Before LLM?
```
Without RCA:
  LLM: "Your stock is low. Here's a suggestion..."
  User: "But why is it low?"
  LLM: "Well, demand might be higher..."
  (Generic analysis, not specific to your data)

With RCA:
  RCA detects: "Lead time (6d) not factored into reorder point"
  RCA detects: "Demand velocity higher than forecast"
  Narrative sent to LLM: "You have 3 root causes: ..."
  LLM: "Your stock is low because your reorder point 
        doesn't account for lead time. Here's the fix..."
  (Specific, actionable, data-backed)
```

---

## 11. How to Test Locally

### Start Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
# Server runs on http://localhost:8000
```

### Start Frontend
```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

### Test Health
```bash
curl http://localhost:8000/api/health
# Response:
# {
#   "status": "healthy",
#   "openai_configured": true,
#   "mysql_connected": false,
#   "data_source": "mock"
# }
```

### Test Chat
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "hi", "mode": "ask"}'

# Response:
# {
#   "response": "Welcome! I'm StockSense AI...",
#   "mode": "ask",
#   "tools_used": [],
#   "rca_performed": false
# }
```

---

## 12. Current Limitations & Future Work

### What Works Great ✅
- Streaming responses
- Three modes (Ask/Explain/Act)
- Root cause detection
- Professional UI
- Real-time data (MySQL)
- Markdown formatting
- Follow-up suggestions

### What Doesn't Yet (To Add) 🚀
- [ ] Semantic memory (remember past conversations)
- [ ] Multi-language (Hindi, Marathi, etc.)
- [ ] Real-time KPI dashboard injection
- [ ] Advanced RCA diagrams (Ishikawa)
- [ ] Conversation persistence to DB
- [ ] PDF export
- [ ] Dark mode
- [ ] Voice input/output

**See CHATBOT_FEATURES_ROADMAP.md for full details on how to add these.**

---

## 13. Debugging Checklist

**Problem: Chatbot says "Error in API"**
1. Check `.env` — is `OPENAI_API_KEY` set?
2. Test endpoint: `curl http://localhost:8000/api/health`
3. Check logs: Any stack traces?

**Problem: Only mock data (not MySQL)**
1. Check `.env` — is `MYSQL_HOST` set?
2. Can you connect manually? `mysql -h localhost -u root`
3. Check if `stocksense_inventory` database exists
4. Check app logs for connection errors

**Problem: Streaming not working (whole response at once)**
1. Check browser — does it support EventSource? (All modern browsers)
2. Check backend — is it yielding `data: {json}\n\n`?
3. Check middleware — any CORS issues?
4. Try non-streaming endpoint: `POST /api/chat`

**Problem: Responses are slow (>3 seconds)**
1. Check OpenAI API status: https://status.openai.com
2. Try `gpt-4o-mini` model (faster, cheaper)
3. Check MySQL query time (add indexes)
4. Check network latency to OpenAI

---

## 14. Code Quality Standards

**When writing code for this project:**

✅ **DO:**
- Use type hints (`def func(x: str) -> dict:`)
- Follow PEP 8 (Python) & ESLint (JavaScript)
- Add docstrings to functions
- Test locally before pushing
- Keep async/await patterns consistent

❌ **DON'T:**
- Hardcode API keys (use .env)
- Make blocking calls in async code
- Change existing chat routes (breaking changes)
- Commit node_modules or __pycache__

**Testing:**
```bash
# Backend tests (if created)
pytest backend/tests/

# Frontend tests
npm test
```

---

## 15. Common Tasks & How To Do Them

### Add a New Business Tool
```python
# 1. Create function in tools.py
async def new_tool(query: str) -> dict:
    # Fetch data, return dict
    return {"data": [...], "data_source": "mysql"}

# 2. Add to TOOLS dict
TOOLS = {
    "stock_tool": stock_tool,
    ...
    "new_tool": new_tool,  # Add here
}

# 3. Update selector.py to use it
if "trigger_keyword" in query:
    tools.append("new_tool")

# 4. Done! Tool now available in chat
```

### Change System Prompt
```python
# In orchestrator.py, update SYSTEM_BASE string

SYSTEM_BASE = """
You are StockSense AI — ...
[modify text here]
"""

# Changes apply to all new chats immediately
```

### Modify Response Format
```javascript
// In AIAssistant.jsx, find MarkdownRenderer

function MarkdownRenderer({ text }) {
  // Add new pattern here
  // Example: Add support for tables
  if (/^\|/.test(line)) {
    // Parse markdown table syntax
  }
}
```

---

## 16. Performance Tips

**Backend:**
- Use connection pooling → `get_pool()` (already done ✅)
- Add MySQL indexes on frequently queried columns
- Cache tool results if same query asked twice
- Use `gpt-4o-mini` for faster responses

**Frontend:**
- Memoize MarkdownRenderer → `useMemo` (already done ✅)
- Lazy-load follow-up suggestions
- Don't update DOM on every token (batch updates)

---

## 17. Deployment Checklist

Before going live:

- [ ] `.env` has real `OPENAI_API_KEY` (not test key)
- [ ] `.env` has real `MYSQL_HOST` (not localhost)
- [ ] Backend: `uvicorn app.main:app --workers 4`
- [ ] Frontend: `npm run build` (production build)
- [ ] CORS origins set correctly (not `*`)
- [ ] Test `/api/health` — should say `mysql_connected: true`
- [ ] Test chat end-to-end
- [ ] Monitor logs for errors

---

## 18. Contact & Support

**Questions?**
1. Check the full documentation: `CHATBOT_TECHNICAL_DOCUMENTATION.md`
2. Check the features roadmap: `CHATBOT_FEATURES_ROADMAP.md`
3. Search code for similar patterns
4. Ask team members who built chat

**Found a bug?**
1. Reproduce locally
2. Check logs: browser console + backend logs
3. Check if it's a DB issue: `/api/db/status`
4. File issue with: Steps to reproduce, expected behavior, actual behavior

---

**Last Updated:** April 2026  
**Status:** v1.0 Complete  
**Audience:** Development Team
