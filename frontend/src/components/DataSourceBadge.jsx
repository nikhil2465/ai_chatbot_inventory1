import React from 'react';

/**
 * DataSourceBadge — shows LIVE DATA vs DEMO MODE inline in page headers.
 * Props:
 *   source  : "mysql" | "mock" | "live" | "demo"  (default "mock")
 *   updatedAt: ISO string or null — shows "Updated Xs ago" when live
 */
export default function DataSourceBadge({ source = 'mock', updatedAt = null }) {
  const isLive = source === 'mysql' || source === 'live';

  const elapsed = React.useMemo(() => {
    if (!updatedAt) return null;
    const diff = Math.floor((Date.now() - new Date(updatedAt).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }, [updatedAt]);

  if (isLive) {
    return (
      <span className="dsb dsb-live">
        <span className="dsb-dot" />
        Live Data
        {elapsed && <span className="dsb-ts">{elapsed}</span>}
      </span>
    );
  }

  return (
    <span className="dsb dsb-demo">
      <span className="dsb-dot" />
      Demo Mode
    </span>
  );
}
