.PHONY: help install build dev dev-frontend test test-django test-react lint format clean docker-build docker-up docker-down

help:
	@echo "Available commands:"
	@echo "  make install        - Install Python and Node dependencies"
	@echo "  make build          - Build React frontend"
	@echo "  make dev            - Run Django development server"
	@echo "  make dev-frontend   - Run Next.js dev server with hot reload"
	@echo "  make test           - Run all tests (Django + React)"
	@echo "  make test-django    - Run Django tests only"
	@echo "  make test-react     - Run React tests only"
	@echo "  make lint           - Run all linters"
	@echo "  make format         - Auto-format all code"
	@echo "  make clean          - Remove build artifacts and caches"
	@echo "  make docker-build   - Build Docker image"
	@echo "  make docker-up      - Start Docker containers"
	@echo "  make docker-down    - Stop Docker containers"

install:
	pip install -r requirements.txt
	cd client && pnpm install

build:
	cd client && pnpm build

dev:
	python manage.py runserver 8000

dev-frontend:
	cd client && pnpm dev

test: test-django test-react

test-django:
	pytest tests/ -v

test-react:
	cd client && pnpm test

lint:
	black --check backend/ tests/
	flake8 backend/ tests/ --max-line-length=88 --extend-ignore=E203,E266,E501,W503
	isort --check-only --profile black backend/ tests/
	cd client && pnpm lint
	cd client && pnpm format:check

format:
	black backend/ tests/
	isort --profile black backend/ tests/
	cd client && pnpm format

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name ".coverage" -delete
	rm -rf .pytest_cache
	rm -rf htmlcov
	rm -rf coverage.xml
	rm -rf client/.next
	rm -rf client/node_modules/.cache
	rm -rf static/react

docker-build:
	docker-compose build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down
