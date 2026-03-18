// Flow2API Dashboard - Main App Component
// Aesthetic: Midnight Luxe - Dark, warm, refined

import React, { useState, useEffect } from 'react';
import { TokenPanel } from './components/TokenPanel';
import { StatsCards } from './components/StatsCards';
import { SettingsPanel } from './components/SettingsPanel';
import { LogsViewer } from './components/LogsViewer';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

const API_BASE = import.meta.env.VITE_FLOW2API_URL || 'http://localhost:38000';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('tokens');
  const [tokens, setTokens] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    imagesToday: 0,
    imagesTotal: 0,
    videosToday: 0,
    videosTotal: 0,
    errorsToday: 0,
    errorsTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));

  useEffect(() => {
    if (adminToken) {
      fetchData();
    }
  }, [adminToken]);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${adminToken}` };

      const [tokensRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/tokens`, { headers }),
        fetch(`${API_BASE}/api/stats`, { headers }),
      ]);

      const tokensData = await tokensRes.json();
      const statsData = await statsRes.json();

      setTokens(tokensData.tokens || []);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setAdminToken(data.token);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken(null);
  };

  if (!adminToken) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="dashboard-container">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
      <main className="main-content">
        <Header stats={stats} />
        <div className="content-area">
          {loading ? (
            <div className="loading-state">
              <div className="loader" />
              <p>Loading dashboard...</p>
            </div>
          ) : (
            <>
              {activeTab === 'tokens' && <TokenPanel tokens={tokens} onRefresh={fetchData} />}
              {activeTab === 'stats' && <StatsCards stats={stats} />}
              {activeTab === 'settings' && <SettingsPanel />}
              {activeTab === 'logs' && <LogsViewer />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await onLogin(username, password);

    if (!result.success) {
      setError(result.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Flow2API</h1>
          <p>Dashboard Access</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
