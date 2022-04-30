# DiscordAI
DyedSoftware AI driven community ChatBot for Discord.
The bot features periodic AI retraining. A training channel where users cann add Trainingdata.

### Commands
- `$info`: Displays general Bot information
- `$train`: Train the neural network
- `$stopInterval`: Deactivate the interval training
- `$startInterval <interval>`: Activate the interval training
- `$addCategory <name>`: Create a new category

## Setup
You want to use the Bot on your discord server? No problem just follow the instructions.

```sh
$ git clone https://github.com/DyedSoftware/DiscordAI
$ cd DiscordAI
```
Install dependencies
```sh
$ npm install
```
Edit the config.json file
```js
{
  "prefix": "$",  //Change the prefix of the bot
  "conversationChannelId": " ",  //Insert the id of the channel in which the users can talk with the Bot
  "trainChannelId": " ",  //Insert the id of the channel in which the users can train the Bot
  "intervaltraining": false,  //Activate/Deactivate the intervaltraining
  "trainOnBoot": false,  //Activate/Deactivate if the bot should train on activation
  "iterations": 10000  //Specify the amount of training iterations
}
```
Add your Token as an Environment variable
```env
TOKEN=YourToken
CONSOLE_MUTE=false
```
Run the bot
```sh
$ npm start
```

### Start scripts
The src includes a start.sh and a start.bat file to easily execute the bot.

## Contributing

If you have any questions regarding the contribution process, please ask it in the [Discord server](https://discord.gg/AVmHpE4RYa)

If you want to contribute to the project, fork the repository and submit a
pull request. We use ESLint to enforce a consistent coding style.

### Setup

To get ready to work on the codebase, please do the following:

1. Fork & clone the repository, and make sure you're on the **main** branch
2. Run `npm install` ([install](https://docs.npmjs.com/getting-started))
3. Code your heart out!
4. Run `npm test` to run ESLint
5. [Submit a pull request](https://github.com/DyedSoftware/DiscordAI/compare)
