import React from 'react';

/**
 * ErrorState — inline error display with optional retry button.
 * Props:
 *   message  : string   — human-readable error text
 *   onRetry  : function — called on Retry click (omit to hide button)
 *   compact  : bool     — smaller card variant for use inside panels
 */
export default function ErrorState({ message, onRetry, compact = false }) {
  const msg = message || 'Something went wrong. Please try again.';

  if (compact) {
    return (
      <div className="es-compact">
        <span className="es-icon-sm">!</span>
        <span className="es-msg-sm">{msg}</span>
        {onRetry && (
          <button className="es-retry-sm" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="es-wrap">
      <div className="es-ic">!</div>
      <h3 className="es-title">Unable to load data</h3>
      <p className="es-msg">{msg}</p>
      {onRetry && (
        <button className="es-retry" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}
