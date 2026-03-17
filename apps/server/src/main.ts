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
import { slap, task } from './chatbot';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);

  // --- Twitch auth setup ---
  // Uses OAuth client credentials + a persisted refresh token file.
  // The token file is read on startup and re-written whenever Twurple
  // refreshes the access token, so the bot stays authenticated across restarts.
  const twurpleAuth = new RefreshingAuthProvider({
    clientId: process.env.TWITCH_CLIENT_ID!,
    clientSecret: process.env.TWITCH_CLIENT_SECRET!,
  });

  const TOKEN_PATH = './tokens.notslugbubby.json';
  const tokenData = JSON.parse(
    await fs.readFile(TOKEN_PATH, 'utf-8'),
  ) as AccessToken;

  twurpleAuth.onRefresh(async (_userId, newTokenData) => {
    await fs.writeFile(
      TOKEN_PATH,
      JSON.stringify(newTokenData, null, 4),
      'utf-8',
    );
  });

  await twurpleAuth.addUserForToken(tokenData, ['chat']);

  // --- Twitch bot ---
  const bot = new Bot({
    authProvider: twurpleAuth,
    channels: ['slugbubby'],
    commands: [slap, task],
  });

  bot.onMessage((_messageEvent) => {
    // placeholder for future global message handling (e.g. logging, moderation)
  });
}

bootstrap();
