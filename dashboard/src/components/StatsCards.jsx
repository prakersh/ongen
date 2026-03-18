// StatsCards Component - API Statistics Dashboard

import React from 'react';

const DiamondIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12l4 6-10 13L2 9l4-6z" />
    <path d="M2 9h20" />
    <path d="M12 22V9" />
    <path d="M6 3l6 6 6-6" />
  </svg>
);

const ActiveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" fill="currentColor" />
  </svg>
);

const ImageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export function StatsCards({ stats }) {
  const statCards = [
    {
      label: 'Total Tokens',
      value: stats.total,
      icon: <DiamondIcon />,
      color: 'indigo',
    },
    {
      label: 'Active Tokens',
      value: stats.active,
      icon: <ActiveIcon />,
      color: 'emerald',
    },
    {
      label: 'Images Today',
      value: `${stats.imagesToday} / ${stats.imagesTotal}`,
      icon: <ImageIcon />,
      color: 'blue',
    },
    {
      label: 'Videos Today',
      value: `${stats.videosToday} / ${stats.videosTotal}`,
      icon: <VideoIcon />,
      color: 'violet',
    },
    {
      label: 'Errors Today',
      value: `${stats.errorsToday} / ${stats.errorsTotal}`,
      icon: <AlertIcon />,
      color: 'rose',
    },
  ];

  return (
    <div className="stats-panel">
      <div className="panel-header">
        <h3>API Statistics</h3>
        <span className="last-updated">Last updated: just now</span>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div
            key={stat.label}
            className={`stat-card ${stat.color}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h4>Usage Overview</h4>
          <div className="usage-bars">
            <div className="usage-bar">
              <span className="bar-label">Images</span>
              <div className="bar-track">
                <div
                  className="bar-fill blue"
                  style={{ width: `${stats.imagesTotal > 0 ? Math.min((stats.imagesToday / stats.imagesTotal) * 100, 100) : 0}%` }}
                />
              </div>
              <span className="bar-value">{stats.imagesToday}</span>
            </div>
            <div className="usage-bar">
              <span className="bar-label">Videos</span>
              <div className="bar-track">
                <div
                  className="bar-fill violet"
                  style={{ width: `${stats.videosTotal > 0 ? Math.min((stats.videosToday / stats.videosTotal) * 100, 100) : 0}%` }}
                />
              </div>
              <span className="bar-value">{stats.videosToday}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
