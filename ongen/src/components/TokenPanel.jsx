// TokenPanel Component - Token Management View

import React, { useState } from 'react';

export function TokenPanel({ tokens, onRefresh }) {
  const [filter, setFilter] = useState('all');

  const filteredTokens = tokens.filter((token) => {
    if (filter === 'all') return true;
    if (filter === 'active') return token.status === 'active';
    if (filter === 'inactive') return token.status === 'inactive';
    return true;
  });

  return (
    <div className="token-panel">
      <div className="panel-header">
        <h3>Token Management</h3>
        <div className="panel-actions">
          <button className="btn-secondary" onClick={onRefresh}>
            ↻ Refresh
          </button>
          <button className="btn-primary">+ Add Token</button>
        </div>
      </div>

      <div className="filter-bar">
        {['all', 'active', 'inactive'].map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="token-grid">
        {filteredTokens.length === 0 ? (
          <div className="empty-state">
            <p>No tokens found</p>
            <button className="btn-primary">Add your first token</button>
          </div>
        ) : (
          filteredTokens.map((token) => (
            <div key={token.id} className="token-card">
              <div className="token-header">
                <span className={`token-status ${token.status}`}>
                  {token.status}
                </span>
                <span className="token-email">{token.email}</span>
              </div>
              <div className="token-details">
                <div className="detail-row">
                  <span className="label">Balance</span>
                  <span className="value">{token.credits || 0}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Expires</span>
                  <span className="value">
                    {token.at_expires ? new Date(token.at_expires).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Images</span>
                  <span className="value">{token.images || 0}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Videos</span>
                  <span className="value">{token.videos || 0}</span>
                </div>
              </div>
              <div className="token-actions">
                <button className="btn-icon" title="Edit">✎</button>
                <button className="btn-icon" title="Refresh">↻</button>
                <button className="btn-icon danger" title="Delete">✕</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
