// StatsCards Component - API Statistics Dashboard

import React from 'react';

export function StatsCards({ stats }) {
  const statCards = [
    {
      label: 'Total Tokens',
      value: stats.total,
      icon: '◇',
      color: 'amber',
    },
    {
      label: 'Active Tokens',
      value: stats.active,
      icon: '◉',
      color: 'emerald',
    },
    {
      label: 'Images Today',
      value: `${stats.imagesToday} / ${stats.imagesTotal}`,
      icon: '◫',
      color: 'blue',
    },
    {
      label: 'Videos Today',
      value: `${stats.videosToday} / ${stats.videosTotal}`,
      icon: '▶',
      color: 'violet',
    },
    {
      label: 'Errors Today',
      value: `${stats.errorsToday} / ${stats.errorsTotal}`,
      icon: '⚠',
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
