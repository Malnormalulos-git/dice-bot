# Dice-bot for Discord
## Features

### Dice Rolling
1. **Multiple dice rolling types:**
    - Regular rolls (sum of all dice)
    - Highest roll (takes the highest result)
    - Lowest roll (takes the lowest result)
    - Average roll (takes the average of all rolls)

2. **Advanced functionality:**
    - Support for multiple expressions in one command
    - Repetition system (global and local)
    - Advanced filtering system
    - Grouping with parentheses
    - Mathematical operations (+, -, *, /)
    - Detailed roll results
    - Support for large outputs via file attachments

### Coin Flipping
- Regular coin toss (heads/tails)
- Coin with edge (adjustable chance of landing on edge)
- Animated GIF results with spoiler tags

### Random Member Selection
- Choose random member from voice channel
- Option to exclude yourself from selection
- Perfect for deciding turn order or task assignment

## Commands

### Basic Commands
- `/roll 'expression'` - main dice rolling command
- `/r 'expression'` - shortened version of /roll
- `/coin` - flip a regular coin
- `/coin-with-edge` - flip coin with rare edge possibility
- `/someone` - pick random person from voice channel
- `/someone-except-me` - pick random person excluding yourself
- `/help` - shows comprehensive help information

### Message Prefix (Optional)
You can also roll by message with prefix: `!expression`
*(requires configuration - see Configuration section)*

## Expression Examples

**Priority order:** `()` → `XdY`, `XhY`, `XlY`, `XaY` → `*`, `/` → `+`, `-`

### Basic Rolls
```
/roll 2d6     # Roll two six-sided dice
/roll d20     # Roll one twenty-sided die
```

### Roll Types
```
/roll 2h6     # Roll two d6 and take highest
/roll 3l6     # Roll three d6 and take lowest
/roll 4a8     # Roll four d8 and take average
```

### Multiple Expressions
```
/roll 2d6;d20;3d4  # Roll multiple dice sets separately
```

### Math Operations
```
/roll 2d20+5          # Roll 2d20 and add 5
/roll (2d4)*2         # Roll 2d4 and multiply by 2
/roll ((2+3)d6)+1     # Roll 5d6 and add 1
```

### Repetition System
```
# Global repetition (via command option)
/roll 2d6 repeat:3    # Repeat entire expression 3 times

# Local repetition (in expression)
/roll r5:2d6          # Repeat "2d6" 5 times
/roll r2:3d6;r3:d20   # Roll 3d6 twice, then d20 three times

# Combined repetition
/roll r3:2d6 repeat:2 # "2d6" repeated 3 times, then whole thing repeated 2 times
```

### Filtering System
```
# Basic filters
/roll r10:d20[>15]     # Show only rolls greater than 15
/roll r10:d20[>=10c]   # Count rolls greater or equal to 10
/roll r5:3d6[<8s]      # Sum of rolls less than 8

# Global filter (via command option)  
/roll 2d6 filter-by:>7c  # Count results greater than 7
```

### Spoiler Tags
```
/roll d20 cover-up-with-spoiler:true  # Hide results with spoiler tags
```

## Advanced Features

### Synonyms Support
The bot supports multiple language synonyms:
- **Regular rolls:** `d`, `dice`, `д`, `в`, `к`
- **Highest rolls:** `h`, `high`, `highest`, `best`, `b`
- **Lowest rolls:** `l`, `low`, `lowest`, `worst`, `w`
- **Average rolls:** `a`, `average`
- **Repetition:** `r`, `repeat`, `п`

### Filter Syntax
**Format:** `[comparator][value][type]`

**Comparators:** `>`, `>=`, `<`, `<=`, `=`

**Filter Types:**
- *(none)* - Display matching results
- `s` - Sum of matching results
- `c` - Count of matching results

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/en) (check with `node -v`)
- Discord bot token and client ID

### Setup Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Malnormalulos-git/dice-bot.git
   cd dice-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   Create a `.env` file in the root directory:
   ```env
   TOKEN=your_token_here
   CLIENT_ID=your_client_id_here
   ```

4. **Get Discord credentials:**
    - [How to get token?](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
    - [How to add bot to server?](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links)
    - Get client ID: [Discord Developer Portal](https://discord.com/developers/applications) → "General Information" → Application ID

5. **Start the bot:**
   ```bash
   # Production
   npm run build
   npm run start
   
   # Development
   npm run dev
   ```

## Configuration

Customize bot behavior in `config.ts`:

### Limits
- `MAX_DICE_COUNT` - Maximum dice per roll (default: 5000)
- `MAX_DICE_SIDES` - Maximum sides per die (default: 5000)
- `MAX_REPEATINGS` - Maximum repetitions (default: 1000)
- `MAX_EXPRESSION_LENGTH` - Maximum expression length (default: 100)
- `MAX_DISCORD_MESSAGE_LENGTH` - Message length before file output (default: 1900)

### Probability adjustments
- `COIN_EDGE_CHANCE` - chance of coin edge will be 1/`COIN_EDGE_CHANCE` (default: 100)

### Language Synonyms
- `ROLL_KEYWORD_SYNONYMS` - Alternatives for 'd' (default: `['dice', 'д', 'в', 'к']`)
- `HIGHEST_ROLL_KEYWORD_SYNONYMS` - Alternatives for 'h' (default: `['high', 'highest', 'best', 'b']`)
- `LOWEST_ROLL_KEYWORD_SYNONYMS` - Alternatives for 'l' (default: `['low', 'lowest', 'worst', 'w']`)
- `AVERAGE_ROLL_KEYWORD_SYNONYMS` - Alternatives for 'a' (default: `['average', 'a']`)
- `REPEAT_EXPRESSION_KEYWORD_SYNONYMS` - Alternatives for 'r' (default: `['repeat', 'п']`)

### Message Parsing
- `ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX` - Enable message prefix parsing (default: true)
- `PARSE_BY_MESSAGE_PREFIX` - Message prefix character (default: '!')

**Note:** For message parsing, enable 'Message Content Intent' at [Discord Developer Portal](https://discord.com/developers/applications) → "Bot"

### Bot Appearance
- `BOT_STATUS` - Bot's presence status
- `BOT_ACTIVITY` - Bot's activity and signature
- `EMBED_COLOR` - Bot's embeds color

## Examples & Use Cases

### Tabletop Gaming
```
/roll d20+5;2d6+3     # Attack roll + damage
/roll 2h20            # Roll with advantage  
/roll 2l20            # Roll with disadvantage

/roll r6:d6[>=5c]     # Count successes (5+)

/roll r8:d10[>=8c]    # Count successes (8+)
```

### Group Activities
```
/someone              # Pick random player for turn
/someone-except-me    # Pick someone else to go first
/coin                 # Quick yes/no decision
/coin-with-edge       # Dramatic decision with rare third option
```

### Complex Expressions
```
/roll ((2d4+1)*3)+2d6           # Nested calculations
/roll r3:2d6;r2:d20+3;4d4       # Multiple different roll sets
/roll r20:d20[>=15c] repeat:3   # Statistical analysis
```