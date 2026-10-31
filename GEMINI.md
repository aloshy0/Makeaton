# Gemini CLI Project Configuration

This repository uses [AGENTS.md](AGENTS.md) as the central source of coding instructions.

## Key Rules for Gemini CLI

1. Refer to [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) and [docs/API_CATALOG.md](docs/API_CATALOG.md) before writing code.
2. Maintain the modular monolith architecture across `apps/web` (Next.js 14) and `apps/api` (Django REST Framework).
3. Always verify changes using `pytest` and `vitest`.
4. Enforce Conventional Commits when creating git commits.
5. Never store long-lived tokens in localStorage; use secure httpOnly cookies.
