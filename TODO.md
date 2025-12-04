# todo

- create chatbot in nestjs backend
  - read chat messages from twitch
  - add users and tasks if someone does !task
  - add functionality for !done
- set up drizzle ORM shared types
- create frontend browser source
- github actions for deployment
- [LATER] figure out electron app
- error handling
  - when bot can't send message

# completed

- initialize monorepo
- set up database + drizzl (4hr51min stream yay)
  - db is in wsl vm. check if db is up: `psql -h localhost -U admin -d mittensdb`
- set up twitch bot
  - https://twurple.js.org/docs/examples/chat/basic-bot.html for token stuff
  - it's now listening and we made an example command!

# features (hopefully)

1. do the coworking thing to prove something to joy/mark
   a. have a chatbot to read chat messages
   b. be able to recognize !task, !done basic commands
   c. store the tasks and stuff somewhere
   d. display a task list that we can use on OBS
2. chat management help
3. customizable chat as desktop program
