import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

import { usersTable } from './db/schema';

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  const user: typeof usersTable.$inferInsert = {
    id: '1',
    twitchId: '123456789',
    twitchUsername: 'slugbubby',
    displayName: 'slugbubby',
  };

  await db.insert(usersTable).values(user);
  console.log('New user created!');
  const users = await db.select().from(usersTable);
  console.log('Getting all users from the database: ', users);

  await db
    .update(usersTable)
    .set({
      id: '2',
    })
    .where(eq(usersTable.twitchUsername, user.twitchUsername));
  console.log('User info updated!');
  await db
    .delete(usersTable)
    .where(eq(usersTable.twitchUsername, user.twitchUsername));
  console.log('User deleted!');
}

main();
