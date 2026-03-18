// SettingsPanel Component - System Configuration

import React, { useState } from 'react';

export function SettingsPanel() {
  const [settings, setSettings] = useState({
    captchaMethod: 'browser',
    autoRefreshAT: true,
    cacheEnabled: true,
    cacheTimeout: 300,
    proxyEnabled: false,
    proxyUrl: '',
  });

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    // API call to save settings
    console.log('Saving settings:', settings);
  };

  return (
    <div className="settings-panel">
      <div className="panel-header">
        <h3>System Settings</h3>
        <button className="btn-primary" onClick={handleSave}>
          Save Changes
        </button>
      </div>

      <div className="settings-sections">
        <section className="settings-section">
          <h4>Captcha Configuration</h4>
          <div className="setting-item">
            <label>Captcha Method</label>
            <select
              value={settings.captchaMethod}
              onChange={(e) => handleChange('captchaMethod', e.target.value)}
            >
              <option value="browser">Browser (Headless)</option>
              <option value="personal">Personal (Headed)</option>
              <option value="yescaptcha">YesCaptcha</option>
              <option value="capmonster">CapMonster</option>
            </select>
          </div>
        </section>

        <section className="settings-section">
          <h4>Token Settings</h4>
          <div className="setting-item">
            <label>Auto-refresh AT</label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.autoRefreshAT}
                onChange={(e) => handleChange('autoRefreshAT', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </section>

        <section className="settings-section">
          <h4>Cache Configuration</h4>
          <div className="setting-item">
            <label>Enable Cache</label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.cacheEnabled}
                onChange={(e) => handleChange('cacheEnabled', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
          <div className="setting-item">
            <label>Cache Timeout (seconds)</label>
            <input
              type="number"
              value={settings.cacheTimeout}
              onChange={(e) => handleChange('cacheTimeout', parseInt(e.target.value))}
              min={0}
              max={3600}
            />
          </div>
        </section>

        <section className="settings-section">
          <h4>Proxy Settings</h4>
          <div className="setting-item">
            <label>Enable Proxy</label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.proxyEnabled}
                onChange={(e) => handleChange('proxyEnabled', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
          <div className="setting-item">
            <label>Proxy URL</label>
            <input
              type="text"
              value={settings.proxyUrl}
              onChange={(e) => handleChange('proxyUrl', e.target.value)}
              placeholder="http://proxy:port"
              disabled={!settings.proxyEnabled}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
