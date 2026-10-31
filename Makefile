.PHONY: help install dev api web test lint clean docker-up docker-down

help:
	@echo "Available commands:"
	@echo "  make install       Install dependencies for backend and frontend"
	@echo "  make dev           Run backend and frontend concurrently"
	@echo "  make api           Run Django REST Framework backend"
	@echo "  make web           Run Next.js frontend"
	@echo "  make test          Run backend and frontend tests"
	@echo "  make lint          Run linter checks"
	@echo "  make docker-up     Start services via docker-compose"
	@echo "  make docker-down   Stop docker-compose services"

install:
	cd apps/api && uv pip install -e .
	cd apps/web && pnpm install

api:
	cd apps/api && python manage.py runserver 0.0.0.0:8000

web:
	cd apps/web && pnpm run dev

test:
	cd apps/api && pytest
	cd apps/web && pnpm test

lint:
	cd apps/api && ruff check .
	cd apps/web && pnpm run lint

docker-up:
	docker compose up -d

docker-down:
	docker compose down

