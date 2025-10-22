# Mr. Mittens

_slugbubby's stream helper_

## Architecture Overview

**Frontend**

- SvelteKit
- Electron for desktop app
- Vite

**Backend**

- NestJS
- @twurple/auth, @twurple/eventsub-ws, @twurple/bot
- Drizzle ORM, drizzle-kit

**Hosting**

- Render.com for server + database
- Vercel for web client

**Directory structure**

```
mr-mittens/
├── .github/
│   └── workflows/
│       ├── server.yml
│       ├── client.yml
│       └── desktop.yml
├── apps/
│   ├── server/
│   │   ├── src/
│   │   ├── drizzle/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── client/
│   │   ├── src/
│   │   ├── package.json
│   │   └── svelte.config.js
│   └── desktop/
│       ├── electron/
│       ├── src/
│       ├── package.json
│       └── electron.vite.config.ts
├── packages/
│   └── shared/
│       ├── src/
│       │   └── types/
│       ├── package.json
│       └── tsconfig.json
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```
