// Header Component - Displays system status and quick stats

import React from 'react';

export function Header({ stats }) {
  const uptime = calculateUptime();

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h2>Dashboard Overview</h2>
        <p className="header-subtitle">Real-time system monitoring</p>
      </div>
      <div className="header-right">
        <div className="status-badge">
          <span className="status-dot" />
          <span>System Online</span>
        </div>
        <div className="uptime-display">
          <span className="uptime-label">Uptime</span>
          <span className="uptime-value">{uptime}</span>
        </div>
      </div>
    </header>
  );
}

function calculateUptime() {
  // In production, fetch from API
  const hours = Math.floor(Math.random() * 24) + 1;
  const mins = Math.floor(Math.random() * 60);
  return `${hours}h ${mins}m`;
}
