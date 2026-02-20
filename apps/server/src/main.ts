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

  const twurpleAuth = new RefreshingAuthProvider({
    clientId: process.env.TWITCH_CLIENT_ID!,
    clientSecret: process.env.TWITCH_CLIENT_SECRET!,
  });

  const tokenData = JSON.parse(
    await fs.readFile('./tokens.notslugbubby.json', 'utf-8'),
  ) as AccessToken;

  twurpleAuth.onRefresh(async (userId, newTokenData) => {
    await fs.writeFile(
      './tokens.notslugbubby.json',
      JSON.stringify(newTokenData, null, 4),
      'utf-8',
    );
  });

  await twurpleAuth.addUserForToken(tokenData, ['chat']);

  const bot = new Bot({
    authProvider: twurpleAuth,
    channels: ['slugbubby'],
    commands: [slap, task],
  });

  bot.onMessage((messageEvent) => {
    // messageEvent.reply('noted');
  });
}

bootstrap();
