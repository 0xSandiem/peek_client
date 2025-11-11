# Peek Client

Django frontend application that serves as a proxy layer to the Peek API (Flask backend) and hosts the React-based user interface for image analysis.

## Quick Start

### Prerequisites

- Python 3.9+
- Peek API running (Flask backend)

### Local Setup

```bash
# Clone repository
git clone https://github.com/0xSandiem/peek_client.git
cd peek_client

# Install dependencies
pip3 install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run development server
python3 manage.py runserver 8000
```

Application runs on `http://localhost:8000`

## Architecture

### Minimalistic Django Proxy

This Django application is intentionally minimal:
- **No database** - Stateless proxy application
- **No models** - Pure proxy and static file serving
- **No authentication** - Handled by Flask API backend
- **No migrations** - No database schema to manage

### Request Flow

```
Browser → Django (Port 8000) → Flask API (Port 5001)
   ↓
React App (Static Files)
```

## API Endpoints

### Health Check

```bash
GET /health/
```

**Response:**
```json
{
  "status": "ok",
  "service": "peek_client"
}
```

### API Proxy

All `/api/*` requests are forwarded to the Flask API:

```bash
# Example: Analyze image
curl -X POST http://localhost:8000/api/analyze \
  -F "image=@/path/to/image.jpg"

# Example: Get results
curl http://localhost:8000/api/results/1
```

**Supported Methods:** GET, POST, PUT, DELETE

### React Application

```bash
GET /*
```

Serves the React application for all other routes (client-side routing).

## Configuration

Environment variables (see `.env.example`):

```bash
DJANGO_ENV=development
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
FLASK_API_URL=http://localhost:5001
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5001
```

## Running with Docker

### Docker Compose (Development)

```bash
docker-compose up
```

Runs Django on `http://localhost:8000`

**Note:** Ensure Flask API is running at `http://localhost:5001` or update `FLASK_API_URL` in docker-compose.yml

### Docker Build (Production)

```bash
docker build -t peek-client .
docker run -p 8000:8000 --env-file .env peek-client
```

## Integration with Flask API

### Local Development

**Terminal 1 - Flask API:**
```bash
cd /path/to/peek_api
docker-compose up
```

**Terminal 2 - Django Frontend:**
```bash
cd /path/to/peek_client
python3 manage.py runserver 8000
```

Access the application at `http://localhost:8000`

### Full Stack Testing

```bash
# Check Django health
curl http://localhost:8000/health/

# Check Flask API (via proxy)
curl http://localhost:8000/api/health

# Upload image (via proxy)
curl -X POST http://localhost:8000/api/analyze \
  -F "image=@test_image.jpg"

# Get results (via proxy)
curl http://localhost:8000/api/results/1
```

## React Frontend Integration

### Adding React Build

Once you have the React application from v0/Vercel:

1. **Build the React application:**
   ```bash
   cd /path/to/react-app
   npm run build
   ```

2. **Copy build to static directory:**
   ```bash
   cp -r build/* /path/to/peek_client/static/
   ```

3. **Collect static files (production):**
   ```bash
   python manage.py collectstatic --noinput
   ```

4. **Test:**
   ```bash
   python manage.py runserver 8000
   # Visit http://localhost:8000
   ```

### Static File Structure

```
static/
├── index.html          # React entry point
├── asset-manifest.json
├── manifest.json
├── favicon.ico
├── robots.txt
└── static/
    ├── css/
    ├── js/
    └── media/
```

## Deployment (Railway/Render)

### Setup Steps

1. **Create Railway/Render Project**
   - Connect GitHub repository
   - Railway will auto-detect Python app

2. **Configure Environment Variables**

```bash
DJANGO_ENV=production
SECRET_KEY=<generate-strong-random-key>
DEBUG=False
ALLOWED_HOSTS=your-app.railway.app
FLASK_API_URL=https://peek-api.railway.app
CORS_ALLOWED_ORIGINS=https://your-app.railway.app
```

3. **Deploy**
   - Railway automatically uses `Procfile` and `nixpacks.toml`
   - Web service runs `scripts/entrypoint.sh`
   - Static files collected automatically

### Environment Variables

Set in **Railway/Render dashboard**:

```bash
DJANGO_ENV=production
SECRET_KEY=${{secrets.DJANGO_SECRET}}
FLASK_API_URL=${{peek-api.RAILWAY_PUBLIC_DOMAIN}}
ALLOWED_HOSTS=<your-domain>.railway.app
```

### Health Check

Verify deployment:
```bash
curl https://your-app.railway.app/health/
```

Expected response:
```json
{
  "status": "ok",
  "service": "peek_client"
}
```

### Deployment Notes

- **Static Files**: Automatically collected during build phase
- **WhiteNoise**: Serves static files efficiently in production
- **Gunicorn**: 4 workers, 30-second timeout
- **Logs**: Available in Railway/Render dashboard
- **No Database**: No migration or database setup needed

## Project Structure

```
peek_client/
├── backend/
│   ├── settings.py          # Django configuration
│   ├── urls.py              # URL routing
│   ├── views.py             # Proxy and React serving
│   ├── wsgi.py              # WSGI entry point
│   └── asgi.py              # ASGI entry point
├── static/                  # React build output
├── staticfiles/             # Collected static files
├── scripts/
│   └── entrypoint.sh        # Deployment startup
├── requirements.txt         # Python dependencies
├── Dockerfile               # Container config
├── docker-compose.yml       # Local dev setup
├── Procfile                 # Railway/Render config
├── runtime.txt              # Python version
└── README.md                # This file
```

## Features

### Proxy Capabilities

- **Method Preservation**: Forwards GET, POST, PUT, DELETE
- **Header Forwarding**: Preserves all relevant headers
- **Body Handling**: Supports JSON, form data, file uploads
- **Timeout Protection**: 30-second request timeout
- **Error Handling**: Graceful handling of connection errors
- **Image Support**: Special handling for image responses

### Static File Serving

- **WhiteNoise**: Efficient static file serving
- **Compression**: Automatic gzip compression
- **Caching**: Browser caching with manifest
- **SPA Support**: Client-side routing for React

### Security

- **HTTPS Redirect**: Enabled in production
- **Secure Cookies**: HTTPS-only in production
- **XSS Protection**: Browser XSS filter enabled
- **CORS**: Explicitly configured origins
- **Content Security**: No MIME type sniffing

## Development

### Running Tests

```bash
# Django tests (minimal, no database)
python manage.py test

# Check configuration
python manage.py check

# Collect static files
python manage.py collectstatic --noinput
```

### Debugging

Enable debug mode in `.env`:
```bash
DEBUG=True
```

View detailed error messages and Django debug toolbar.

### Adding Features

This is a minimal proxy application. For new features:
- **API changes**: Modify in Flask backend
- **UI changes**: Modify React frontend
- **Proxy logic**: Update `backend/views.py`
- **Configuration**: Add to `backend/settings.py`

## Troubleshooting

### Cannot Connect to Flask API

**Error:** `Cannot connect to API`

**Solution:**
```bash
# Check Flask API is running
curl http://localhost:5001/api/health

# Update FLASK_API_URL in .env
FLASK_API_URL=http://localhost:5001
```

### Static Files Not Found

**Error:** `404 on /static/css/main.css`

**Solution:**
```bash
# Collect static files
python manage.py collectstatic --noinput

# Check STATIC_ROOT in settings.py
# Verify files exist in staticfiles/
```

### CORS Errors

**Error:** `CORS policy blocked`

**Solution:**
```bash
# Add origin to CORS_ALLOWED_ORIGINS in .env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5001

# Restart Django server
```

### Deployment Fails

**Error:** `Application error on Railway`

**Solution:**
```bash
# Check logs in Railway dashboard
# Verify environment variables are set
# Ensure ALLOWED_HOSTS includes your domain
# Check Procfile and entrypoint.sh permissions
```

## Contributing

This project uses **Gitflow** workflow:
- `main` branch for production
- `develop` branch for development
- Feature branches: `feature/feature-name`

Commit message format: `type(scope): message`

## License

MIT License
