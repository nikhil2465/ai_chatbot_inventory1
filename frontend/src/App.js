import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Overview from './views/Overview';
import Inventory from './views/Inventory';
import DeadStock from './views/DeadStock';
import Inward from './views/Inward';
import Sales from './views/Sales';
import Customers from './views/Customers';
import Orders from './views/Orders';
import Procurement from './views/Procurement';
import POGRN from './views/POGRN';
import Freight from './views/Freight';
import Finance from './views/Finance';
import Demand from './views/Demand';
import AIAssistant from './views/AIAssistant';
import DevGuide from './views/DevGuide';
import About from './views/About';

const VIEW_TITLES = {
  overview:    'Business Overview — AI Intelligence Dashboard',
  inventory:   'Stock Intelligence — AI Inventory Analysis',
  deadstock:   'Dead Stock & Ageing — Cash Recovery Plan',
  inward:      'Inward & Outward — Stock Movement Intelligence',
  sales:       'Sales Performance — Revenue & Margin Intelligence',
  customers:   'Customer Intelligence — Know Every Account',
  orders:      'Orders & Fulfilment Intelligence',
  procurement: 'Supplier & Procurement Intelligence',
  pogrn:       'PO & GRN — End-to-End Procurement Lifecycle',
  freight:     'Freight Planning — AI-Optimized Logistics',
  finance:     'Profitability & Cash Intelligence — Owner View',
  demand:      'Demand Forecasting — What Will Sell Next?',
  chatbot:     'InvenIQ AI — Ask Anything About Your Business',
  devguide:    'Developer Guide — Architecture, APIs & Best Practices',
  about:       'About InvenIQ — AI Inventory Intelligence Platform',
};

export default function App() {
  const [activeView, setActiveView]             = useState('overview');
  const [period, setPeriod]                     = useState('Today');
  const [pendingChatQuery, setPendingChatQuery] = useState('');
  const [dbStatus, setDbStatus]                 = useState({ status: 'checking', source: null, checkedAt: null });

  // Poll /api/health every 60 s to know if MySQL is live or demo mode
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch('/api/health');
        if (!res.ok) throw new Error('non-2xx');
        const data = await res.json();
        if (!cancelled) {
          setDbStatus({
            status: data.mysql_connected ? 'live' : 'demo',
            source: data.data_source || 'mock',
            checkedAt: new Date().toISOString(),
          });
        }
      } catch {
        if (!cancelled) {
          setDbStatus({ status: 'demo', source: 'mock', checkedAt: new Date().toISOString() });
        }
      }
    };
    check();
    const id = setInterval(check, 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const goChat = useCallback((query) => {
    setPendingChatQuery(query);
    setActiveView('chatbot');
  }, []);

  const clearPendingQuery = useCallback(() => setPendingChatQuery(''), []);

  return (
    <div>
      <Sidebar activeView={activeView} onNavigate={setActiveView} dbStatus={dbStatus} />
      <Topbar title={VIEW_TITLES[activeView]} period={period} onPeriodChange={setPeriod} />
      <main className="main">
        {activeView === 'overview'    && <Overview     onGoChat={goChat} dbStatus={dbStatus} />}
        {activeView === 'inventory'   && <Inventory    onGoChat={goChat} dbStatus={dbStatus} />}
        {activeView === 'deadstock'   && <DeadStock    onGoChat={goChat} dbStatus={dbStatus} />}
        {activeView === 'inward'      && <Inward       onGoChat={goChat} dbStatus={dbStatus} />}
        {activeView === 'sales'       && <Sales        onGoChat={goChat} dbStatus={dbStatus} />}
        {activeView === 'customers'   && <Customers    onGoChat={goChat} dbStatus={dbStatus} />}
        {activeView === 'orders'      && <Orders       onGoChat={goChat} dbStatus={dbStatus} />}
        {activeView === 'procurement' && <Procurement  onGoChat={goChat} dbStatus={dbStatus} />}
        {activeView === 'pogrn'       && <POGRN        onGoChat={goChat} dbStatus={dbStatus} />}
        {activeView === 'freight'     && <Freight      onGoChat={goChat} dbStatus={dbStatus} />}
        {activeView === 'finance'     && <Finance      onGoChat={goChat} dbStatus={dbStatus} />}
        {activeView === 'demand'      && <Demand       onGoChat={goChat} dbStatus={dbStatus} />}
        {activeView === 'chatbot'     && (
          <AIAssistant
            pendingQuery={pendingChatQuery}
            onPendingQueryConsumed={clearPendingQuery}
          />
        )}
        {activeView === 'devguide'    && <DevGuide />}
        {activeView === 'about'       && <About />}
      </main>
    </div>
  );
}
