/**
 * Application entry point.
 *
 * Boots two things in sequence:
 *  1. The NestJS HTTP server (serves the REST API consumed by the SvelteKit client).
 *  2. The Twitch chatbot (connects to IRC via Twurple and listens for commands).
 *
 * Environment variables required: see `.env.example`.
 */

import { NestFactory } from '@nestjs/core';
import { AccessToken, RefreshingAuthProvider } from '@twurple/auth';
import { Bot } from '@twurple/easy-bot';
import 'dotenv/config';
import { promises as fs } from 'fs';

import { AppModule } from './app.module';
import { done, slap, suplex, task } from './chatbot';

const requireEnv = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

async function bootstrap() {
  requireEnv('DATABASE_URL');
  const twitchChannelUsername = requireEnv('TWITCH_CHANNEL_USERNAME');
  const twitchChannelDisplayName =
    process.env.TWITCH_CHANNEL_DISPLAY_NAME?.trim() || twitchChannelUsername;
  const tokenPath = process.env.TWITCH_TOKEN_PATH?.trim() || './tokens.bot.json';

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);

  // --- Twitch auth setup ---
  // Uses OAuth client credentials + a persisted refresh token file.
  // The token file is read on startup and re-written whenever Twurple
  // refreshes the access token, so the bot stays authenticated across restarts.
  const twurpleAuth = new RefreshingAuthProvider({
    clientId: requireEnv('TWITCH_CLIENT_ID'),
    clientSecret: requireEnv('TWITCH_CLIENT_SECRET'),
  });

  const tokenData = JSON.parse(
    await fs.readFile(tokenPath, 'utf-8'),
  ) as AccessToken;

  twurpleAuth.onRefresh(async (_userId, newTokenData) => {
    await fs.writeFile(
      tokenPath,
      JSON.stringify(newTokenData, null, 4),
      'utf-8',
    );
  });

  await twurpleAuth.addUserForToken(tokenData, ['chat']);

  // --- Twitch bot ---
  const bot = new Bot({
    authProvider: twurpleAuth,
    channels: [twitchChannelUsername],
    commands: [slap, suplex, task, done],
  });

  console.log(
    `Mr. Mittens is listening in ${twitchChannelDisplayName} (@${twitchChannelUsername}) chat.`,
  );

  bot.onMessage((_messageEvent) => {
    // placeholder for future global message handling (e.g. logging, moderation)
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start Mr. Mittens.', error);
  process.exit(1);
});
