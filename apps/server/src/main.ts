import { NestFactory } from '@nestjs/core';
import { StaticAuthProvider } from '@twurple/auth';
import { Bot, createBotCommand } from '@twurple/easy-bot';
import 'dotenv/config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);

  const clientId = process.env.TWITCH_CLIENT_ID!;
  const accessToken = process.env.TWITCH_ACCESS_TOKEN!;
  const twurpleAuth = new StaticAuthProvider(clientId, accessToken);

  const bot = new Bot({
    authProvider: twurpleAuth,
    channels: ['slugbubby'],
    commands: [
      createBotCommand('dice', (params, { reply }) => {
        const diceRoll = Math.floor(Math.random() * 6) + 1;
        reply(`You rolled a ${diceRoll}`);
      }),
      createBotCommand('slap', (params, { userName, say }) => {
        say(
          `${userName} slaps ${params.join(' ')} around a bit with a large trout`,
        );
      }),
    ],
  });
}

bootstrap();
