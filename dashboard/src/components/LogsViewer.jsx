// LogsViewer Component - Request Logs Display

import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_FLOW2API_URL || 'http://localhost:38000';

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export function LogsViewer() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/api/logs`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      setLogs(getMockLogs());
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.level === filter;
  });

  const getLevelColor = (level) => {
    const colors = {
      info: 'blue',
      warning: 'amber',
      error: 'rose',
      success: 'emerald',
    };
    return colors[level] || 'gray';
  };

  return (
    <div className="logs-panel">
      <div className="panel-header">
        <h3>Request Logs</h3>
        <div className="panel-actions">
          <button className="btn-secondary" onClick={fetchLogs}>
            <RefreshIcon /> Refresh
          </button>
          <button className="btn-danger"><TrashIcon /> Clear All</button>
        </div>
      </div>

      <div className="filter-bar">
        {['all', 'info', 'warning', 'error', 'success'].map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="logs-container">
        {loading ? (
          <div className="loading-state">
            <div className="loader" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="empty-state">
            <p>No logs to display</p>
          </div>
        ) : (
          <table className="logs-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Level</th>
                <th>Message</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr key={index} className={`level-${log.level}`}>
                  <td className="timestamp">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <span className={`level-badge ${getLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="message">{log.message}</td>
                  <td className="details">{log.details || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function getMockLogs() {
  return [
    { timestamp: new Date(), level: 'info', message: 'API request received', details: 'POST /v1/chat/completions' },
    { timestamp: new Date(Date.now() - 60000), level: 'success', message: 'Token refreshed', details: 'AT updated successfully' },
    { timestamp: new Date(Date.now() - 120000), level: 'warning', message: 'Rate limit approached', details: '75% of limit used' },
    { timestamp: new Date(Date.now() - 180000), level: 'error', message: 'Image generation failed', details: 'Timeout after 300s' },
  ];
}
