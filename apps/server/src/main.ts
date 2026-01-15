import { NestFactory } from '@nestjs/core';
import { AccessToken, RefreshingAuthProvider } from '@twurple/auth';
import { Bot, createBotCommand } from '@twurple/easy-bot';
import 'dotenv/config';
import { promises as fs } from 'fs';

import { AppModule } from './app.module';

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
    channels: ['slugbubby', 'markiryu'],
    commands: [
      createBotCommand('dice', async (params, { reply }) => {
        const diceRoll = Math.floor(Math.random() * 6) + 1;
        await reply(`You rolled a ${diceRoll}`);
      }),
      createBotCommand('slap', async (params, { userName, say }) => {
        const size = ['small', 'tiny', 'large', 'gigantic', 'huge', 'adequately sized']
        const fish = ['trout', 'goldfish', 'mackerel', 'salmon', 'koi', 'tuna', 'lobster']
        const sizeIndex = Math.floor(Math.random() * size.length)
        const fishIndex = Math.floor(Math.random() * fish.length)
        await say(
          `${userName} slaps ${params.join(' ')} around a bit with a ${size[sizeIndex]} ${fish[fishIndex]}`,
        );
      }),
    ],
  });

  bot.onMessage((messageEvent) => {
    // messageEvent.reply('noted');
  });
}

bootstrap();
