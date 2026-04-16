import React from 'react';

/**
 * PageLoader — full-width centered spinner shown while API data loads.
 * Props:
 *   label : string — optional message (default "Loading data…")
 *   mini  : bool  — compact inline variant for cards (default false)
 */
export default function PageLoader({ label = 'Loading data…', mini = false }) {
  if (mini) {
    return (
      <div className="pl-mini">
        <span className="pl-spin" />
        <span className="pl-lbl">{label}</span>
      </div>
    );
  }

  return (
    <div className="pl-wrap">
      <div className="pl-inner">
        <span className="pl-spin pl-spin-lg" />
        <p className="pl-msg">{label}</p>
      </div>
    </div>
  );
}
