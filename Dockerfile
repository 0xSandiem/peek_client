FROM node:18-alpine AS frontend-builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY client/package.json client/pnpm-lock.yaml ./client/
RUN npm install -g pnpm && cd client && pnpm install --frozen-lockfile

COPY client/ ./client/
RUN cd client && pnpm build

FROM python:3.9-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

COPY --from=frontend-builder /app/static/react /app/static/react

RUN python manage.py collectstatic --noinput

ENV PYTHONUNBUFFERED=1
ENV PORT=8000

EXPOSE 8000

CMD gunicorn backend.wsgi:application --bind 0.0.0.0:${PORT} --workers 4 --timeout 30
