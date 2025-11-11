# Peek - Full-Stack Image Analysis Platform

**True full-stack application** where Django serves the React frontend and proxies API requests to Flask backend.

## System Architecture

![Peek System Architecture](./diagram.png)

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     DJANGO (Port 8000)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Routes:                                               │ │
│  │  /              → Serve React SPA                      │ │
│  │  /api/*         → Proxy to Flask API                   │ │
│  │  /health/       → Django health check                  │ │
│  │  /_next/*       → React static assets                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React Build: static/react/                            │ │
│  │  - index.html (SPA entry point)                        │ │
│  │  - _next/ (JS/CSS bundles)                             │ │
│  │  - assets (images, fonts)                              │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ API Proxy
                         ▼
                  ┌──────────────┐
                  │  Flask API   │
                  │  (Port 5001) │
                  │  CV Engine   │
                  └──────────────┘
```

**Single Port Architecture:**
- **One server** (Django on port 8000)
- **React SPA** served from `/`
- **API calls** proxied to Flask via `/api/*`
- **No CORS issues** (same origin)

## Project Structure

```
peek_client/
├── backend/                # Django application
│   ├── settings.py        # Configuration
│   ├── urls.py            # Routing (/api → proxy, /* → React)
│   ├── views.py           # serve_react() + proxy_to_flask()
│   ├── wsgi.py
│   └── asgi.py
│
├── client/                # Next.js source code
│   ├── app/              # Pages
│   ├── components/       # React components
│   ├── hooks/            # React hooks
│   ├── lib/              # Utilities
│   ├── public/           # Public assets
│   ├── styles/           # CSS
│   ├── package.json
│   ├── next.config.mjs   # output: 'export', distDir: '../static/react'
│   └── .env.local        # NEXT_PUBLIC_API_URL=http://localhost:8000
│
├── static/
│   └── react/            # Next.js build output (auto-generated)
│       ├── index.html    # React SPA entry
│       ├── _next/        # JS/CSS bundles
│       └── *.jpg/svg     # Static assets
│
├── scripts/
│   └── entrypoint.sh     # Production startup
│
├── manage.py             # Django CLI
├── build.sh              # Build script
├── requirements.txt      # Python dependencies
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+ with pnpm
- Flask API running (peek_api repo)

### Installation

```bash
# Clone repository
git clone https://github.com/0xSandiem/peek_client.git
cd peek_client

# Install Python dependencies
pip3 install -r requirements.txt

# Build React frontend
./build.sh
```

### Running the Application

**Terminal 1 - Flask API (separate repo):**
```bash
cd /path/to/peek_api
docker-compose up
# Flask API runs on http://localhost:5001
```

**Terminal 2 - Full-Stack Django:**
```bash
python3 manage.py runserver 8000
# Full app runs on http://localhost:8000
```

**Access:** http://localhost:8000

## Docker Deployment

### Using Docker Compose (Recommended)

**1. Standalone Mode** (Flask API running separately):

```bash
# Copy environment file
cp .env.docker .env

# Edit .env if needed (FLASK_API_URL, etc.)
nano .env

# Build and run
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

The client will be available at: http://localhost:8000

**2. Full Stack Mode** (Connect to peek_api Docker network):

First, start the peek_api containers:
```bash
cd /path/to/peek_api
docker-compose up -d
```

Then update your `.env` file:
```bash
FLASK_API_URL=http://peek_web:5000
```

Start peek_client and connect to peek_api network:
```bash
docker-compose up -d --build
docker network connect peek_network peek_client
```

### Docker Commands

```bash
# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild after code changes
docker-compose up --build

# View running containers
docker ps

# Execute commands in container
docker exec -it peek_client bash

# Check health
curl http://localhost:8000/health/
```

### Environment Variables

Configure in `.env` file (copy from `.env.docker`):

```env
# Django
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1

# Flask API Connection
FLASK_API_URL=http://host.docker.internal:5001  # For host machine API
# FLASK_API_URL=http://peek_web:5000            # For Docker network API
```

### Multi-Stage Build

The Dockerfile uses multi-stage builds:

1. **Stage 1 (frontend-builder)**:
   - Node.js 18 Alpine
   - Installs pnpm and dependencies
   - Builds Next.js app to `static/react/`

2. **Stage 2 (production)**:
   - Python 3.9 Slim
   - Copies built React app from Stage 1
   - Installs Python dependencies
   - Runs Django with Gunicorn

This approach:
- Keeps final image small (~200MB)
- Caches dependencies for faster rebuilds
- Builds everything in one `docker build`
- Production-ready with Gunicorn

## Development Workflow

### Option 1: Full-Stack Mode (Production-like)

Run everything from Django:

```bash
# 1. Build React
cd client
pnpm build
cd ..

# 2. Start Django (serves React + proxies API)
python3 manage.py runserver 8000
```

Access at: http://localhost:8000

### Option 2: Development Mode (Hot Reload)

Separate servers for hot reload:

**Terminal 1 - Flask API:**
```bash
cd /path/to/peek_api
docker-compose up
```

**Terminal 2 - Django Proxy:**
```bash
python3 manage.py runserver 8000
```

**Terminal 3 - Next.js Dev Server:**
```bash
cd client
pnpm dev
```

Access at: http://localhost:3000

## Building the Frontend

### Automated Build

```bash
./build.sh
```

This script:
1. Installs Node dependencies (`pnpm install`)
2. Builds Next.js (`pnpm build`)
3. Exports to `static/react/`

### Manual Build

```bash
cd client
pnpm install
pnpm build
cd ..
```

### Build Configuration

**client/next.config.mjs:**
```javascript
output: 'export',          // Static export (no Node.js server)
distDir: '../static/react', // Build to Django's static folder
images: { unoptimized: true }, // Works with static export
trailingSlash: true,       // Better SPA routing
```

## How It Works

### 1. Next.js Build Process

```bash
cd client
pnpm build
```

Creates:
```
static/react/
├── index.html          # SPA entry point
├── 404.html           # Fallback page
├── _next/
│   ├── static/
│   │   ├── chunks/    # JS bundles
│   │   └── css/       # CSS files
│   └── ...
└── *.jpg, *.svg       # Public assets
```

### 2. Django Serves React

**backend/urls.py:**
```python
urlpatterns = [
    path("health/", health_check),
    re_path(r"^api/(?P<path>.*)$", proxy_to_flask),  # API proxy
    re_path(r"^(?P<path>.*)$", serve_react),         # React SPA (catch-all)
]
```

**Request flow:**
- `/` → `serve_react()` → serves `static/react/index.html`
- `/_next/static/...` → serves JS/CSS from `static/react/_next/`
- `/api/*` → `proxy_to_flask()` → forwards to Flask API
- `/health/` → `health_check()` → Django health status

### 3. API Integration

**client/.env.local:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

React calls Django at the same origin:
```typescript
// client/lib/api.ts (example)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

fetch(`${API_URL}/api/analyze`, {
  method: 'POST',
  body: formData
})
```

Django proxies to Flask:
```
React → /api/analyze → Django → http://flask:5001/api/analyze → Flask
```

## Configuration

### Django (.env)

```bash
DJANGO_ENV=development
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
FLASK_API_URL=http://localhost:5001
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

### Next.js (client/.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API Endpoints

All served from **http://localhost:8000**:

### Django Endpoints

```bash
GET  /health/              # Django health check
GET  /                     # React SPA
GET  /_next/static/*       # React assets
```

### Proxied Flask Endpoints

```bash
POST /api/analyze          # Upload image → Flask
GET  /api/results/:id      # Get results → Flask
GET  /api/image/:id/original   # Get image → Flask
GET  /api/image/:id/annotated  # Get annotated → Flask
```

## Testing

### Test Full-Stack Setup

```bash
# Health check
curl http://localhost:8000/health/

# React SPA
curl http://localhost:8000/ | grep "PEEK"

# API proxy (requires Flask running)
curl http://localhost:8000/api/health
```

### Test React Build

```bash
cd client
pnpm lint
pnpm build
```

## Deployment

### Railway Deployment

**1. Build Configuration:**

Railway automatically detects Python and uses `Procfile`:

```
web: ./scripts/entrypoint.sh
```

**scripts/entrypoint.sh:**
```bash
#!/bin/bash
cd client && pnpm install && pnpm build && cd ..
python manage.py collectstatic --noinput
gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT
```

**2. Environment Variables:**

```bash
DJANGO_ENV=production
SECRET_KEY=<strong-random-key>
DEBUG=False
ALLOWED_HOSTS=your-app.railway.app
FLASK_API_URL=https://peek-api.railway.app
```

**3. Deploy:**

```bash
git push origin main
```

Railway builds Next.js and starts Django automatically.

### Docker Deployment

```bash
docker build -t peek-client .
docker run -p 8000:8000 --env-file .env peek-client
```

## Troubleshooting

### React Build Not Found

If you see "Build Required" page:

```bash
cd client
pnpm install
pnpm build
cd ..
python3 manage.py runserver 8000
```

### Django Can't Find React Files

Check that build output exists:

```bash
ls -la static/react/
# Should show: index.html, _next/, etc.
```

### API Proxy Errors

Ensure Flask API is running:

```bash
curl http://localhost:5001/api/health
```

Update FLASK_API_URL in `.env` if needed.

### Port Already in Use

```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use different port
python3 manage.py runserver 8080
```

## Project Commands

### Build & Run

```bash
# Full build
./build.sh

# Run server
python3 manage.py runserver 8000

# Quick rebuild
cd client && pnpm build && cd ..
```

### Development

```bash
# Django check
python3 manage.py check

# React dev server (hot reload)
cd client && pnpm dev

# Linting
cd client && pnpm lint
```

## Technology Stack

**Frontend:**
- Next.js 14.2.25 (static export)
- React 19.2.0
- Tailwind CSS
- shadcn/ui components

**Backend:**
- Django 4.2.7 (proxy + static server)
- WhiteNoise (static files)
- Gunicorn (production)

**API:**
- Flask (separate repo: peek_api)
- OpenCV (computer vision)
- Celery + Redis (async tasks)

## Related Repositories

- **Flask API:** https://github.com/0xSandiem/peek_api
- **Django Frontend:** https://github.com/0xSandiem/peek_client (this repo)

## License

MIT License
