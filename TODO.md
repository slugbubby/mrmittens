# todo

- reconsider pnpm / alternative for pnpm workspaces?
- share drizzl types across packages
  - clean up frontend code + types
- spiffy up tasks page + !task functionality overall
- add chatbot functionality for !done
- create frontend browser source
- set up pnpm workspace properly
  - consolidating tsconfigs, package versions like drizzle-orm
- make light/dark mode a redeem (mr erp, esq)
- github actions for deployment
- [LATER] figure out electron app
- error handling
  - when bot can't send message

# completed

1. initialize monorepo
2. set up database + drizzl (4hr51min stream yay)

- db is in wsl vm. connect to db: `psql -h localhost -U postgres -d mittensdb`

3. set up twitch bot

- https://twurple.js.org/docs/examples/chat/basic-bot.html for token stuff
- it's now listening s and we made an example command!

4. add chatbot !task functionality
5. set up sveltekit frontend
6. hook up sveltekit to nestjs api calls
7. render the tasks at /tasks

# features (hopefully)

1. do the coworking thing to prove something to joy/mark
   a. have a chatbot to read chat messages
   b. be able to recognize !task, !done basic commands
   c. store the tasks and stuff somewhere
   d. display a task list that we can use on OBS
2. chat management help
3. customizable chat as desktop program
