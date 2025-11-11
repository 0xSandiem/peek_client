#!/bin/bash
set -e

echo "Building Peek Client Frontend..."
echo ""

cd client

echo "Installing dependencies..."
pnpm install

echo "Building Next.js application..."
pnpm build

cd ..

echo ""
echo "Build complete!"
echo ""
echo "React app built to: static/react/"
echo ""
echo "To run the full-stack application:"
echo "  python3 manage.py runserver 8000"
echo ""
echo "Access at: http://localhost:8000"
