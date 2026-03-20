# Contributing to Mr. Mittens

Thanks for your interest in contributing! This guide will get you up and running.

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | 20+ | LTS recommended |
| **pnpm** | 9+ | `corepack enable` to get it via Node |
| **PostgreSQL** | 15+ | Local instance or Docker |
| **Twitch app** | -- | Register at https://dev.twitch.tv/console/apps |

## Getting Started

### Windows one-shot setup

From the repo root:

```powershell
.\scripts\onboarding.cmd
```

This installs Scoop when needed, ensures Node.js 20+ and pnpm are ready, installs Twitch CLI and Vercel CLI, creates missing `.env` files from the checked-in examples, and runs `pnpm install` for the workspace.

### Manual setup steps after onboarding

```bash
# 1. Push the DB schema to your local PostgreSQL
pnpm --filter @mrmittens/server db:push

# 2. Start everything in dev mode (Turborepo runs client + server)
pnpm dev
```

Then edit both `.env` files with your real values.

The server starts at `http://localhost:3000` and the client at `http://localhost:5173`.

There is no Electron desktop workspace in this branch yet, so onboarding currently covers the web client and backend only.

## Project Structure

```
mrmittens/
├── apps/
│   ├── server/          # NestJS backend + Twitch chatbot
│   │   └── src/
│   │       ├── chatbot/ # Twitch command handlers (!slap, !task)
│   │       ├── db/      # Drizzle ORM schema + query helpers
│   │       ├── tasks/   # NestJS tasks module (controller/service)
│   │       └── main.ts  # Entry point: boots HTTP server + chatbot
│   └── client/          # SvelteKit frontend
│       └── src/
│           └── routes/
│               └── tasks/ # OBS browser source overlay page
├── package.json         # Monorepo root (Turborepo scripts)
├── pnpm-workspace.yaml  # Workspace definitions
└── turbo.json           # Turborepo pipeline config
```

## Data Flow

Understanding the end-to-end flow helps when making changes:

```
Twitch chat  ──▶  !task "fix the bug"
                      │
                      ▼
              chatbot/index.ts
              (upserts user, inserts task into DB)
                      │
                      ▼
              PostgreSQL (tasks table)
                      │
                      ▼
              GET /tasks  (NestJS controller)
                      │
                      ▼
              /tasks page  (SvelteKit, loaded server-side)
                      │
                      ▼
              OBS browser source overlay
```

## Development Workflow

### Running individual apps

```bash
# Server only
pnpm --filter @mrmittens/server start:dev

# Client only
pnpm --filter client dev
```

### Database changes

1. Edit the schema in `apps/server/src/db/schema.ts`
2. Run `pnpm --filter @mrmittens/server db:push` to apply
3. Verify with `psql -h localhost -U postgres -d mittensdb` then `\dt`

### Linting & formatting

```bash
pnpm lint      # ESLint across all apps
pnpm format    # Prettier (server only -- client uses `pnpm --filter client format`)
```

## Code Conventions

- **TypeScript** everywhere -- avoid `any` when possible.
- **Drizzle ORM** for all database access (no raw SQL).
- **JSDoc** on every exported function/class. Describe *why*, not *what*.
- Keep controllers thin; business logic belongs in services or `db/` helpers.
- Bot commands go in `apps/server/src/chatbot/index.ts`.

## Twitch Bot Token Setup

The bot needs a refresh token file (`tokens.notslugbubby.json`) in the server root. To generate one:

1. Create a Twitch application at https://dev.twitch.tv/console/apps
2. Set the redirect URL to `http://localhost:3000`
3. Use the Twurple token generator or the Twitch CLI to obtain initial tokens
4. Save them as `tokens.notslugbubby.json` in `apps/server/`

The file is auto-refreshed at runtime -- you only need to create it once.

## Environment Variables

### Server (`apps/server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | No | HTTP port (defaults to `3000`) |
| `TWITCH_CLIENT_ID` | Yes | Twitch OAuth client ID |
| `TWITCH_CLIENT_SECRET` | Yes | Twitch OAuth client secret |

### Client (`apps/client/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `API_URL` | Yes | Base URL of the NestJS server |

## Submitting Changes

1. Fork the repository and create a feature branch from `main`.
2. Make your changes with clear commit messages.
3. Ensure `pnpm lint` passes.
4. Open a pull request with a description of what changed and why.
