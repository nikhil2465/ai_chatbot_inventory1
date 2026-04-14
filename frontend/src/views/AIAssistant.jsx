/**
 * InvenIQ — AI Assistant
 * Professional streaming chat component with Ask / Explain / Act modes,
 * MCP tool chips, RCA badge, follow-up suggestions, and markdown rendering.
 */
import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';
import './AIAssistant.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const MODES = [
  {
    id: 'ask',
    label: 'Ask',
    icon: '💬',
    kbd: '1',
    color: 'ask',
    desc: 'Get instant, data-backed answers from your inventory.',
  },
  {
    id: 'explain',
    label: 'Explain',
    icon: '🔍',
    kbd: '2',
    color: 'explain',
    desc: 'Understand root causes with detailed analysis.',
  },
  {
    id: 'act',
    label: 'Act',
    icon: '⚡',
    kbd: '3',
    color: 'act',
    desc: 'Generate step-by-step action plans you can execute today.',
  },
];

const MODE_DESC = {
  ask:     'Get instant, data-backed answers from your inventory.',
  explain: 'Understand root causes with detailed analysis.',
  act:     'Generate step-by-step action plans you can execute today.',
};

const SUGGESTIONS = [
  {
    category: '📦 Stock',
    color: '#3b82f6',
    items: [
      'Which SKUs need immediate reorder?',
      'What items are overstocked right now?',
      'Show me slow-moving inventory this quarter',
    ],
  },
  {
    category: '📋 Orders',
    color: '#7c3aed',
    items: [
      'Which orders are at risk of delay?',
      'Show my top 5 customers by revenue',
      'What is my current order fulfilment rate?',
    ],
  },
  {
    category: '💰 Finance',
    color: '#d97706',
    items: [
      'What is my working capital situation?',
      'Which invoices are overdue today?',
      'Show gross margin by product category',
    ],
  },
  {
    category: '🚚 Logistics',
    color: '#06b6d4',
    items: [
      'Optimize my freight costs this week',
      'Which supplier has the best lead time?',
      'What is my dead stock value?',
    ],
  },
];

const TOOL_CHIP_CLASS = {
  stock: 'tool-stock', finance: 'tool-finance', supplier: 'tool-supplier',
  customer: 'tool-customer', order: 'tool-order', demand: 'tool-demand',
  freight: 'tool-freight', email: 'tool-email',
};

// ─── Tiny Markdown Renderer ───────────────────────────────────────────────────
function MarkdownRenderer({ text }) {
  const rendered = useMemo(() => {
    if (!text) return '';
    const lines = text.split('\n');
    const out = [];
    let inUl = false, inOl = false;

    const closeList = () => {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (inOl) { out.push('</ol>'); inOl = false; }
    };

    lines.forEach((raw, i) => {
      const line = raw;
      if (/^### (.+)/.test(line)) {
        closeList();
        out.push(`<h3>${line.replace(/^### /, '')}</h3>`);
      } else if (/^## (.+)/.test(line)) {
        closeList();
        out.push(`<h2>${line.replace(/^## /, '')}</h2>`);
      } else if (/^#### (.+)/.test(line)) {
        closeList();
        out.push(`<h4>${line.replace(/^#### /, '')}</h4>`);
      } else if (/^\*\*(.+)\*\*$/.test(line.trim())) {
        closeList();
        out.push(`<p><strong>${line.trim().replace(/^\*\*|\*\*$/g, '')}</strong></p>`);
      } else if (/^---+$/.test(line.trim())) {
        closeList(); out.push('<hr />');
      } else if (/^[-•*] (.+)/.test(line)) {
        if (!inUl) { out.push('<ul>'); inUl = true; }
        const item = line.replace(/^[-•*] /, '');
        out.push(`<li>${formatInline(item)}</li>`);
      } else if (/^\d+\. (.+)/.test(line)) {
        if (!inOl) { out.push('<ol>'); inOl = true; }
        const item = line.replace(/^\d+\. /, '');
        out.push(`<li>${formatInline(item)}</li>`);
      } else if (line.trim() === '') {
        closeList();
        out.push('<div class="spacer"></div>');
      } else {
        closeList();
        out.push(`<p>${formatInline(line)}</p>`);
      }
    });
    closeList();
    return out.join('');
  }, [text]);

  return (
    <div
      className="iq-md"
      dangerouslySetInnerHTML={{ __html: rendered }}  // eslint-disable-line react/no-danger
    />
  );
}

function formatInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

// ─── Icon Components ──────────────────────────────────────────────────────────
const IconSend = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const IconCopy = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const IconArrow = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconBot = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"
    stroke="white" strokeWidth="0">
    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.38-1 1.72V7h3a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h3V5.72A2 2 0 0 1 10 4a2 2 0 0 1 2-2zm-3 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-3 5a4 4 0 0 0-3.46 2h6.92A4 4 0 0 0 12 16z" />
  </svg>
);
const IconUser = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="white"
    stroke="white" strokeWidth="0">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
  </svg>
);
const IconPlus = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconSpark = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L9.1 9.1 2 12l7.1 2.9L12 22l2.9-7.1L22 12l-7.1-2.9z" />
  </svg>
);

// ─── Tool Chips Helper ────────────────────────────────────────────────────────
function parseToolChips(tools) {
  if (!tools || !tools.length) return [];
  return tools.map((t) => {
    const key = typeof t === 'string' ? t : t.tool || '';
    const label = key.replace('query_', '').replace(/_/g, ' ');
    const cls = TOOL_CHIP_CLASS[label.split(' ')[0]] || 'tool-order';
    const emoji = {
      stock: '📦', finance: '💰', supplier: '🏭', customer: '👥',
      order: '📋', demand: '📈', freight: '🚚', email: '📧',
    }[label.split(' ')[0]] || '🔧';
    return { key, label, cls, emoji };
  });
}

// ─── Single Message ───────────────────────────────────────────────────────────
function AiMessage({ msg, isStreaming, onFollowUp }) {
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState(null); // 'up' | 'dn' | null

  const modeInfo = MODES.find((m) => m.id === msg.mode) || MODES[0];
  const toolChips = parseToolChips(msg.tools);
  const rcaFlag  = msg.rca_applied;
  const showFooter = !isStreaming;

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content || '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const ts = msg.timestamp
    ? new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="iq-msg ai">
      <div className="iq-msg-wrap">
        <div className="iq-avatar ai"><IconBot /></div>
        <div className="iq-ai-bubble-wrap">
          {/* Chips row */}
          <div className="iq-chips-row">
            <span className={`iq-chip mode-${modeInfo.color}`}>
              {modeInfo.icon} {modeInfo.label.toUpperCase()}
            </span>
            {rcaFlag && <span className="iq-chip rca">🔎 RCA</span>}
            {toolChips.map((c) => (
              <span key={c.key} className={`iq-chip ${c.cls}`}>
                {c.emoji} {c.label}
              </span>
            ))}
          </div>

          {/* Bubble */}
          <div className="iq-ai-bubble">
            <MarkdownRenderer text={msg.content} />
            {isStreaming && <span className="iq-stream-cursor" />}

            {showFooter && (
              <>
                <div className="iq-msg-footer">
                  <div className="iq-msg-meta">
                    <span>InvenIQ AI</span>
                    {msg.model && <><span>·</span><span>{msg.model}</span></>}
                    {ts && <><span>·</span><span>{ts}</span></>}
                    {msg.data_source === 'mysql' && (
                      <><span>·</span><span style={{ color: '#16a34a' }}>● Live DB</span></>
                    )}
                  </div>
                  <div className="iq-msg-actions">
                    <div className="iq-reactions">
                      <button
                        className={`iq-reaction up ${reaction === 'up' ? 'on' : ''}`}
                        onClick={() => setReaction(reaction === 'up' ? null : 'up')}
                        title="Helpful"
                      >👍</button>
                      <button
                        className={`iq-reaction dn ${reaction === 'dn' ? 'on' : ''}`}
                        onClick={() => setReaction(reaction === 'dn' ? null : 'dn')}
                        title="Not helpful"
                      >👎</button>
                    </div>
                    <div className="iq-divider" />
                    <button
                      className={`iq-action-btn ${copied ? 'copied' : ''}`}
                      onClick={handleCopy}
                    >
                      <IconCopy />{copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Follow-up suggestions */}
                {msg.follow_ups?.length > 0 && (
                  <div className="iq-followups">
                    <div className="iq-followup-label">
                      <span>✨</span> Suggested follow-ups
                    </div>
                    {msg.follow_ups.map((q, i) => (
                      <button key={i} className="iq-followup-chip" onClick={() => onFollowUp(q)}>
                        {q} <IconArrow />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AIAssistant({ pendingQuery, onPendingQueryConsumed }) {
  const [mode, setMode]           = useState('ask');
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingId, setStreamingId] = useState(null);
  const [error, setError]         = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);
  const abortRef       = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Consume pending query from parent (e.g. clicking a suggestion card)
  useEffect(() => {
    if (pendingQuery) {
      setInput(pendingQuery);
      onPendingQueryConsumed?.();
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [pendingQuery, onPendingQueryConsumed]);

  // Keyboard shortcuts for mode switching
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'TEXTAREA') return;
      if (e.key === '1') setMode('ask');
      if (e.key === '2') setMode('explain');
      if (e.key === '3') setMode('act');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Auto-grow textarea
  const handleInputChange = (e) => {
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
    setInput(el.value);
  };

  // ── Send message ─────────────────────────────────────────
  const sendMessage = useCallback(async (query) => {
    const text = (query || input).trim();
    if (!text || streaming) return;

    setError(null);
    const userMsgId = `u-${Date.now()}`;
    const aiMsgId   = `a-${Date.now() + 1}`;

    const userMsg = {
      id: userMsgId, role: 'user', mode,
      content: text, timestamp: new Date().toISOString(),
    };
    const aiMsg = {
      id: aiMsgId, role: 'ai', mode,
      content: '', tools: [], rca_applied: false,
      follow_ups: [], model: null, data_source: null,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setStreaming(true);
    setStreamingId(aiMsgId);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, mode }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(errBody.detail || `HTTP ${resp.status}`);
      }

      const reader  = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') continue;

          try {
            const evt = JSON.parse(raw);
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== aiMsgId) return m;
                // orchestrator emits: meta | token | done | error
                if (evt.type === 'token') {
                  return { ...m, content: m.content + (evt.content || '') };
                }
                if (evt.type === 'meta') {
                  return {
                    ...m,
                    tools:       evt.tools_used   ?? m.tools,
                    rca_applied: evt.rca_performed ?? m.rca_applied,
                    model:       evt.model         ?? m.model,
                    data_source: evt.data_source   ?? m.data_source,
                  };
                }
                if (evt.type === 'done') {
                  return { ...m, follow_ups: evt.follow_ups ?? m.follow_ups };
                }
                if (evt.type === 'error') {
                  return { ...m, content: m.content || `Error: ${evt.message}` };
                }
                return m;
              })
            );
          } catch {
            // skip malformed event
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Unexpected error. Please try again.');
        setMessages((prev) => prev.filter((m) => m.id !== aiMsgId || m.content.length > 0));
      }
    } finally {
      setStreaming(false);
      setStreamingId(null);
    }
  }, [input, mode, streaming]);

  // Keyboard submit
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Follow-up click
  const handleFollowUp = useCallback((q) => {
    setInput(q);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  // New chat
  const handleNewChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setInput('');
    setStreaming(false);
    setStreamingId(null);
    setError(null);
  };

  const canSend = input.trim().length > 0 && !streaming;
  const activeModeInfo = MODES.find((m) => m.id === mode);

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="iq-chat-view">
      {/* Header */}
      <div className="iq-header">
        <div className="iq-header-left">
          <div className="iq-header-logo"><IconSpark /></div>
          <div>
            <div className="iq-header-title">InvenIQ AI Assistant</div>
            <div className="iq-header-sub">GPT-4o · MCP Tools · RCA Engine</div>
          </div>
        </div>
        <div className="iq-header-right">
          <div className="iq-badge">
            <span className="iq-badge-dot live" />
            Live
          </div>
          <div className="iq-badge">
            <span className="iq-badge-dot model" />
            GPT-4o
          </div>
          <button className="iq-new-chat-btn" onClick={handleNewChat}>
            <IconPlus /> New chat
          </button>
        </div>
      </div>

      {/* Mode Bar */}
      <div className="iq-mode-bar">
        <div className="iq-mode-pills">
          {MODES.map((m) => (
            <button
              key={m.id}
              className={`iq-mode-pill ${m.color} ${mode === m.id ? 'active' : ''}`}
              onClick={() => setMode(m.id)}
              title={`${m.desc} (press ${m.kbd})`}
            >
              {m.icon} {m.label}
              <span className="iq-pill-kbd">{m.kbd}</span>
            </button>
          ))}
        </div>
        <div className="iq-mode-desc">{MODE_DESC[mode]}</div>
      </div>

      {/* Chat Container */}
      <div className="iq-chat-container">
        <div className="iq-messages">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="iq-empty">
              <div className="iq-empty-hero">
                <div className="iq-empty-icon"><IconSpark /></div>
                <div className="iq-empty-title">Ask anything about your inventory</div>
                <div className="iq-empty-sub">
                  InvenIQ AI analyses real-time stock, orders, finance & logistics data to give you
                  precise, actionable answers.
                </div>
                <div className="iq-empty-pills">
                  {[
                    { label: '📦 Stock Intelligence', color: '#3b82f6' },
                    { label: '💰 Finance Insights', color: '#16a34a' },
                    { label: '🚚 Logistics Optimization', color: '#06b6d4' },
                    { label: '📈 Demand Forecast', color: '#d97706' },
                  ].map((p) => (
                    <span key={p.label} className="iq-empty-pill">
                      <span className="iq-empty-pill-dot" style={{ background: p.color }} />
                      {p.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="iq-suggestion-grid">
                {SUGGESTIONS.map((cat) => (
                  <div key={cat.category} className="iq-suggestion-card">
                    <div className="iq-suggestion-card-header" style={{ color: cat.color }}>
                      {cat.category}
                    </div>
                    {cat.items.map((q) => (
                      <button
                        key={q}
                        className="iq-suggestion-item"
                        onClick={() => sendMessage(q)}
                      >
                        <span>{q}</span>
                        <IconArrow />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            messages.map((msg) =>
              msg.role === 'user' ? (
                <div key={msg.id} className="iq-msg user">
                  <div className="iq-msg-wrap user-wrap">
                    <div className="iq-avatar user"><IconUser /></div>
                    <div className="iq-user-bubble">
                      <div className="iq-user-meta">
                        <span className="iq-user-mode-tag">
                          {MODES.find((m) => m.id === msg.mode)?.icon}{' '}
                          {msg.mode?.toUpperCase()}
                        </span>
                      </div>
                      <div className="iq-user-text">{msg.content}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <AiMessage
                  key={msg.id}
                  msg={msg}
                  isStreaming={msg.id === streamingId}
                  onFollowUp={handleFollowUp}
                />
              )
            )
          )}

          {/* Typing Indicator (before first token arrives) */}
          {streaming && messages[messages.length - 1]?.role === 'ai' &&
           messages[messages.length - 1]?.content === '' && (
            <div className="iq-typing">
              <div className="iq-avatar ai"><IconBot /></div>
              <div className="iq-typing-bubble">
                <div className="iq-typing-dots">
                  <span /><span /><span />
                </div>
                <div className="iq-typing-label">Analysing your data…</div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="iq-error">
            <div className="iq-error-inner">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            <button className="iq-error-close" onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Input Area */}
        <div className="iq-input-area">
          <div className="iq-input-row">
            <textarea
              ref={textareaRef}
              className="iq-textarea"
              rows={1}
              placeholder={`${activeModeInfo?.icon} ${activeModeInfo?.label} mode — ask anything about your business…`}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={streaming}
            />
            <button
              className={`iq-send-btn ${mode}`}
              disabled={!canSend}
              onClick={() => sendMessage()}
              title="Send (Enter)"
            >
              <IconSend />
            </button>
          </div>
          <div className="iq-input-hint">
            <div className="iq-hint-keys">
              <span><kbd>Enter</kbd> Send</span>
              <span><kbd>Shift+Enter</kbd> New line</span>
              <span><kbd>1/2/3</kbd> Switch mode</span>
            </div>
            <span>Powered by GPT-4o · Inventory context-aware</span>
          </div>
        </div>
      </div>
    </div>
  );
}
