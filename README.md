# Ongen - AI Image Generation Platform

Self-hosted Flux image generation with token management, real-time monitoring, and full API control.

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Client    │ ───► │   Ongen     │ ───► │  Flow2API   │
│  (Python)   │      │  (CLI/API)  │      │  (Backend)  │
└─────────────┘      └─────────────┘      └─────────────┘
                                                  │
                    ┌─────────────┐              │
                    │  Dashboard  │ ◄────────────┘
                    │  (React)    │
                    └─────────────┘
```

## Components

| Component | Description | Port |
|-----------|-------------|------|
| **flow2api** | Backend API with token management, proxy handling, browser automation | 38000 |
| **dashboard** | React admin interface for monitoring and configuration | 5173 (dev) |
| **ongen** | Python client library for programmatic access | - |

## Quick Start

### 1. Clone & Initialize

```bash
git clone https://github.com/prakersh/ongen.git
cd ongen
git submodule update --init --recursive
```

### 2. Start Backend

```bash
docker compose up -d --build
```

Access Flow2API at `http://localhost:38000`

### 3. Start Dashboard (Development)

```bash
cd dashboard
npm install
npm run dev
```

Access dashboard at `http://localhost:5173`

## Dashboard Features

- **Token Management** - View, add, and monitor API tokens
- **Statistics** - Real-time usage metrics and performance data
- **Settings** - Configure proxies, timeouts, and generation parameters
- **Logs** - Request history with filtering and search

## Configuration

Backend settings are managed via `flow2api/config/setting.toml`:

- API tokens
- Proxy list
- Browser fingerprint settings
- Generation timeouts

## Repositories

- **Main**: [prakersh/ongen](https://github.com/prakersh/ongen)
- **Flow2API Fork**: [prakersh/flow2api](https://github.com/prakersh/flow2api)

## Tech Stack

- **Backend**: Python, FastAPI, Playwright
- **Frontend**: React, Tailwind CSS
- **Container**: Docker
