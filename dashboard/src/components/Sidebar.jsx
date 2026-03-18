// Sidebar Component - Midnight Luxe Aesthetic

import React from 'react';

const tabs = [
  { id: 'tokens', label: 'Token Management', icon: 'key' },
  { id: 'stats', label: 'API Statistics', icon: 'chart' },
  { id: 'settings', label: 'System Settings', icon: 'settings' },
  { id: 'logs', label: 'Request Logs', icon: 'logs' },
];

export function Sidebar({ activeTab, onTabChange, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">◈</span>
        <span className="logo-text">Flow2API</span>
      </div>

      <nav className="sidebar-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="nav-icon">{getIcon(tab.icon)}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <span>⎋</span>
          Logout
        </button>
      </div>
    </aside>
  );
}

function getIcon(name) {
  const icons = {
    key: '◇',
    chart: '◎',
    settings: '⚙',
    logs: '☰',
  };
  return icons[name] || '○';
}
