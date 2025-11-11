#!/bin/bash
set -e

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn server..."
exec gunicorn backend.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers 4 \
    --timeout 30 \
    --access-logfile - \
    --error-logfile -
