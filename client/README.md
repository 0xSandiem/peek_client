# Peek Client - Next.js Frontend

This is the Next.js frontend for the Peek image analysis application.

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Architecture

This Next.js application provides the user interface for uploading images and displaying analysis results from the Peek API.

**Framework:** Next.js 14.2.25
**Port:** 3000 (development)

## Integration with Django Backend

The Next.js frontend communicates with the Django proxy server, which forwards API requests to the Flask backend.

**Development Flow:**
```
Next.js (3000) → Django (8000) → Flask API (5001)
```

## Environment Variables

Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Features

- Swiss design inspired interface
- Image upload with drag & drop
- Real-time analysis results display
- Responsive layout
- Dark mode support via theme provider
