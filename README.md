# Mr. Mittens

_slugbubby's stream helper_

## Setup

1. Run `pnpm install` from the monorepo root

## Architecture Overview

**Frontend**

- SvelteKit
- Electron for desktop app
- [Better-Auth](https://www.better-auth.com/)

**Backend**

- NestJS
- Drizzle ORM, drizzle-kit
- @twurple/auth, @twurple/eventsub-ws, @twurple/bot

**Hosting**

- Render.com for server + database
- Vercel for web client

**Directory structure**

```
mr-mittens/
├── .github/
│   └── workflows/
│       ├── client.yml
│       ├── desktop.yml
│       └── server.yml
├── apps/
│   ├── server/
│   │   └── src/
│   │       ├── chatbot/        # Twitch chatbot commands
│   │       ├── db/             # Drizzle database
│   │       ├── tasks/          # NestJs modules
│   │       └── main.ts         # NestJs entry file
│   ├── client/
│   │   └── src/
│   │       ├── routes/         # Svelte page routes
│   │       └── app.html        # Homepage
│   └── desktop/
│       ├── electron/
│       └── src/
├── packages/
│   └── shared/
│       └── src/
│           └── types/
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```
