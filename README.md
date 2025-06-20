# Dice-bot for Discord
## Features

1. Multiple dice rolling types:
- Regular rolls (sum of all dice)
- Highest roll (takes the highest result)
- Lowest roll (takes the lowest result)
- Average roll (takes the average of all rolls)
2. Support for multiple expressions in one command
3. Grouping with parentheses
4. Mathematical operations (+, -, *, /)
5. Detailed roll results
6. Support for large outputs via file attachments

## Usage
Basic Commands

/roll 'expression' - main dice rolling command

/r 'expression' - shortened version of /roll

/help - shows help information

Also you can roll just by message with prefix (to enable this feature and specify the prefix, make certain changes at config file, the details in Configuration section. Also you need to  toggle on 'Message Content Intent' at [Discord Developer Portal](https://discord.com/developers/applications) > "Bot"): 'prefix''expression'

## Expression Examples

Priority order: '()' -> 'XdY', 'XhY', 'XlY', 'XaY' -> '*', '/' -> '+', '-'

Basic Rolls:

```
/roll 2d6     # Roll two six-sided dice
/roll d20     # Roll one twenty-sided die
```

Roll Types:

```
/roll 2h6     # Roll two d6 and take highest
/roll 3l6     # Roll three d6 and take lowest
/roll 4a8     # Roll four d8 and take average
```

Multiple Expressions:

```
/roll 2d6;d20  # Roll 2d6 and d20 separately
```

Math Operations:

```
/roll 2d20+5          # Roll 2d20 and add 5
/roll (2d4)*2         # Roll 2d4 and multiply by 2
/roll ((2+3)d6)+1     # Roll 5d6 and add 1
```

## Installation
To use bot, you'll need to install [Node.js](https://nodejs.org/en). To check if you already have Node installed on your machine, run `node -v`.

1. Clone (`git clone https://github.com/Malnormalulos-git/dice-bot.git`) or download the repository.
2. Install dependencies:
```
cd dice-bot
npm install
```
3. Create a .env file in the root directory with your Discord bot token.

.env template:
```
TOKEN=your_token_here
CLIENT_ID=your_client_id_here
```
[How to get token?](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)

[How to add bot to server?](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links)

To get your application's client id: [Discord Developer Portal](https://discord.com/developers/applications) > "General Information" > application id

To get your server's id (guildId): [Enable developer mode](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID) > Right-click the server title > "Copy ID"

4. Start the bot:
```
npm run build
```
then
```
npm run start
```
Start the bot (dev):
```
npm run dev
```

## Configuration
The part of bot's behavior can be customized in config.ts:

MAX_DICE_COUNT: Maximum number of dice allowed in one roll

MAX_DICE_SIDES: Maximum number of sides per die

MAX_EXPRESSION_LENGTH: Maximum length of a dice expression 

MAX_DISCORD_MESSAGE_LENGTH: Maximum length of Discord message  before switching to file output (advice not to set more than 1900)

ROLL_KEYWORD_SYNONYMS, HIGHEST_ROLL_KEYWORD_SYNONYMS, LOWEST_ROLL_KEYWORD_SYNONYMS, AVERAGE_ROLL_KEYWORD_SYNONYMS: words or symbols, that will be replaced by 'd', 'h', 'l', 'a' respectively

ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX: true to enable parsing by message with prefix specified in MESSAGE_ROLL_PREFIX, false to disable

PARSE_BY_MESSAGE_PREFIX: the prefix with which the message with the expression should begin

BOT_STATUS: bot's status, [detailed](https://discordjs.guide/popular-topics/faq.html#how-do-i-set-my-status-to-watching-listening-to-competing-in)

BOT_ACTIVITY: bot's activity and its signature, [detailed](https://discordjs.guide/popular-topics/faq.html#how-do-i-make-my-bot-display-online-idle-dnd-invisible)
