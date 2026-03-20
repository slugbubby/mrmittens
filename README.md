# Mr. Mittens

_slugbubby's stream helper_ -- a Twitch chatbot and task overlay for co-working streams.

Viewers type `!task fix the bug` in chat and the task appears on an OBS browser-source overlay in real time.

## Features

- **`!task <text>`** -- Viewers create tasks from Twitch chat. Tasks are stored in PostgreSQL and rendered on the `/tasks` web page.
- **`!slap <target>`** -- A fun command that slaps someone with a randomly sized fish.
- **OBS overlay** -- The `/tasks` route is designed to be added as an OBS browser source so the streamer's task list is visible on stream.

### Planned

- `!done` command to mark tasks complete
- Styled browser source overlay for OBS
- Electron desktop app
- Better-Auth integration
- GitHub Actions CI/CD

## Tech Stack

| Layer | Technology |
|-------|------------|
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | SvelteKit 5 (Svelte 5, Vite) |
| Backend | NestJS 11 |
| Database | PostgreSQL via Drizzle ORM |
| Chatbot | Twurple (auth, easy-bot) |
| Hosting | Vercel (client), Render.com (server + DB) |

## Getting Started

### Windows onboarding

Run the onboarding script from the repo root on Windows:

```powershell
.\scripts\onboarding.cmd
```

Or call PowerShell directly:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\onboarding.ps1
```

The script is idempotent and will:

- install Scoop if it is missing
- install Node.js LTS if the machine does not already have Node.js 20+
- enable `pnpm` via Corepack
- install Twitch CLI and Vercel CLI
- create `apps/server/.env` and `apps/client/.env` from the existing examples when needed
- run `pnpm install` for the workspace

Manual prerequisites still required after onboarding:

- PostgreSQL 15+ running locally, or an accessible PostgreSQL instance
- a Twitch application plus a bot token file at `apps/server/tokens.notslugbubby.json`
- `vercel login` before deploying the web client

## Quick Start

```bash
# Windows: run the onboarding script first
./scripts/onboarding.cmd

# Fill in your local env values

# Push DB schema to PostgreSQL
pnpm --filter @mrmittens/server db:push

# Start both client and server in dev mode
pnpm dev
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed setup instructions, token generation, and development workflow.

## Architecture

```
┌─────────────────┐     !task "do stuff"     ┌──────────────────┐
│  Twitch Chat     │ ──────────────────────▶  │  Chatbot          │
│  (viewers)       │                          │  (Twurple bot)    │
└─────────────────┘                          └────────┬─────────┘
                                                      │ upsert user
                                                      │ insert task
                                                      ▼
                                             ┌──────────────────┐
                                             │  PostgreSQL       │
                                             │  (Drizzle ORM)   │
                                             └────────┬─────────┘
                                                      │
                                  ┌───────────────────┼───────────────────┐
                                  ▼                                       ▼
                         ┌──────────────────┐                   ┌──────────────────┐
                         │  NestJS API       │   GET /tasks      │  SvelteKit        │
                         │  (REST server)    │ ◀────────────────│  (SSR frontend)   │
                         └──────────────────┘                   └──────────────────┘
                                                                         │
                                                                         ▼
                                                                ┌──────────────────┐
                                                                │  OBS Browser      │
                                                                │  Source           │
                                                                └──────────────────┘
```

## Directory Structure

```
mrmittens/
├── apps/
│   ├── server/                 # NestJS backend + Twitch chatbot
│   │   └── src/
│   │       ├── chatbot/        # Twitch command handlers (!slap, !task)
│   │       ├── db/             # Drizzle schema + CRUD query helpers
│   │       │   ├── schema.ts   # Table definitions and TypeScript types
│   │       │   ├── tasks.ts    # Task queries (fetch, create, delete)
│   │       │   └── users.ts    # User queries (fetch, create, update, delete)
│   │       ├── tasks/          # NestJS tasks module (controller + service)
│   │       └── main.ts         # Entry: boots NestJS + Twitch bot
│   └── client/                 # SvelteKit frontend
│       └── src/
│           └── routes/
│               ├── +page.svelte       # Homepage
│               └── tasks/
│                   ├── +page.svelte       # Task list (OBS overlay)
│                   └── +page.server.ts    # Server-side loader
├── package.json                # Monorepo root scripts (via Turborepo)
├── pnpm-workspace.yaml         # Workspace: apps/* and packages/*
├── turbo.json                  # Turborepo pipeline configuration
├── CONTRIBUTING.md             # Setup & contribution guide
└── TODO.md                     # Project roadmap
```

## Environment Variables

Both apps need `.env` files. See the `.env.example` in each app directory.

| Variable | App | Description |
|----------|-----|-------------|
| `DATABASE_URL` | server | PostgreSQL connection string |
| `PORT` | server | HTTP port (default `3000`) |
| `TWITCH_CLIENT_ID` | server | Twitch OAuth client ID |
| `TWITCH_CLIENT_SECRET` | server | Twitch OAuth client secret |
| `API_URL` | client | Backend base URL (e.g. `http://localhost:3000`) |

## Scripts

Run from the monorepo root:

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start client + server in dev mode |
| `pnpm --filter @mrmittens/server start:dev` | Start only the NestJS backend |
| `pnpm --filter client dev` | Start only the SvelteKit web client |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all apps |
| `pnpm onboarding:windows` | Run the Windows onboarding wrapper |

## License

UNLICENSED -- see individual `package.json` files for details.
