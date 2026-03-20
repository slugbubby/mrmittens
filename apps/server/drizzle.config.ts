/**
 * Drizzle Kit configuration.
 *
 * Used by `drizzle-kit push` (and future `drizzle-kit generate` /
 * `drizzle-kit migrate`) to sync the schema in `src/db/schema.ts`
 * with the PostgreSQL database pointed to by `DATABASE_URL`.
 */

import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
