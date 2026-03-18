// TokenPanel Component - Token Management View

import React, { useState } from 'react';

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

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
            <RefreshIcon /> Refresh
          </button>
          <button className="btn-primary"><PlusIcon /> Add Token</button>
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
            <button className="btn-primary"><PlusIcon /> Add your first token</button>
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
                <button className="btn-icon" title="Edit"><EditIcon /></button>
                <button className="btn-icon" title="Refresh"><RefreshIcon /></button>
                <button className="btn-icon danger" title="Delete"><TrashIcon /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
