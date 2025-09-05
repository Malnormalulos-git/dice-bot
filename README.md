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
    - Exploding dice system
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
- Selector to exclude other users from selection

### Unique Values Generation

- Generate specified number of unique random values
- No duplicate values within a single command
- Customizable range (1 to specified maximum)
- Perfect for unique selections, assignments, or distributions

## Commands

### Basic Commands

- `/roll 'expression'` - main dice rolling command
- `/r 'expression'` - shortened version of /roll
- `/unique count:X sides:Y` - generate X unique values from 1 to Y
- `/coin` - flip a regular coin
- `/coin-with-edge` - flip coin with rare edge possibility
- `/someone` - pick random person from voice channel
- `/someone-except-me` - pick random person excluding yourself
- `/help` - shows comprehensive help information

### Message Prefix (Optional)

You can also use commands by message with prefix: `!command`
*(requires configuration - see Configuration section)*

**Available prefix commands:**

- `!help` - show help information
- `!unique count:X sides:Y` - generate unique values (params - `count`(number) and `sides`(number))
- `!someone` - pick random person from voice channel (params - `repeat`(number) and `exclude`(boolean))
- `!someone-except-me` - pick random person excluding yourself (params - same as `someone`)
- `!coin` - flip a regular coin
- `!coin-with-edge` - flip coin with rare edge possibility
- `!any` - default, tries to parse roll expression to roll dice (same as /roll)

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

### Exploding Dice

```
/roll 2de6    # Roll 2d6 with exploding dice
/roll 3dexplode10  # Alternative syntax for exploding dice
```

**Exploding dice logic:** When a die rolls its maximum value (e.g., 6 on d6), an additional die of the same type is
automatically rolled. This process continues until a result less than the maximum is rolled.

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

### Unique Values

```
/unique count:3 sides:6    # Generate 3 unique values from 1-6
/unique count:5 sides:20   # Generate 5 unique values from 1-20
/unique count:10 sides:100 # Generate 10 unique values from 1-100
```

**Unique values logic:** Generates the specified count of unique random numbers from 1 to the maximum value. No duplicates are possible within a single command. Count cannot exceed the number of sides.

## Advanced Features

### Synonyms Support

The bot supports multiple language synonyms:

- **Regular rolls:** `d`, `dice`, `д`, `в`, `к`
- **Highest rolls:** `h`, `high`, `highest`, `best`, `b`
- **Lowest rolls:** `l`, `low`, `lowest`, `worst`, `w`
- **Average rolls:** `a`, `average`, `а`
- **Exploding dice:** `e`, `explode`, `е`
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

## Docker

1. **Ensure you set up `.env` file.**

2. **Then run**:
   ```bash
   npm run build
   ```

3. **After that**:
   ```bash
   docker build -t dice-bot .
   ```

4. **And finally**:
   ```bash
   docker run dice-bot
   ```

## Configuration

Customize bot behavior in `config.ts`:

### Limits

- `MAX_DICE_COUNT` - Maximum dice per roll (default: 5000)
- `MAX_DICE_SIDES` - Maximum sides per die (default: 5000)
- `MAX_ROLL_REPETITIONS` - Maximum repetitions for rolls (default: 1000)
- `MAX_EXPRESSION_LENGTH` - Maximum expression length (default: 100)
- `MAX_DISCORD_MESSAGE_LENGTH` - Message length before file output (default: 1900)
- `MAX_SOMEONE_REPETITIONS` - Maximum repetitions for someone commands (default: 100)

### Probability adjustments

- `COIN_EDGE_CHANCE` - chance of coin edge will be 1/`COIN_EDGE_CHANCE` (default: 100)

### Language Synonyms

- `ROLL_KEYWORD_SYNONYMS` - Alternatives for 'd' (default: `['dice', 'д', 'в', 'к']`)
- `HIGHEST_ROLL_KEYWORD_SYNONYMS` - Alternatives for 'h' (default: `['high', 'highest', 'best', 'b']`)
- `LOWEST_ROLL_KEYWORD_SYNONYMS` - Alternatives for 'l' (default: `['low', 'lowest', 'worst', 'w']`)
- `AVERAGE_ROLL_KEYWORD_SYNONYMS` - Alternatives for 'a' (default: `['average', 'а']`)
- `EXPLODE_EXPRESSION_KEYWORD_SYNONYMS` - Alternatives for 'e' (default: `['explode', 'е']`)
- `REPEAT_EXPRESSION_KEYWORD_SYNONYMS` - Alternatives for 'r' (default: `['repeat', 'п']`)

### Message Parsing

- `ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX` - Enable message prefix parsing (default: false)
- `PARSE_BY_MESSAGE_PREFIX` - Message prefix character (default: '!')

**Note:** For message parsing, enable 'Message Content Intent'
at [Discord Developer Portal](https://discord.com/developers/applications) → "Bot"

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

/roll 2de6+3          # Exploding dice roll
/roll 4de6[>=5c]      # Exploding dice with success counting

/unique count:4 sides:20    # Assign unique initiative positions
/unique count:6 sides:10    # Pick unique treasure items
```

### Group Activities

```
/someone              # Pick random player for turn
/someone-except-me    # Pick someone else to go first
/coin                 # Quick yes/no decision
/coin-with-edge       # Dramatic decision with rare third option
/unique count:3 sides:8     # Assign 3 unique seating positions
```

### Unique Value Applications

```
/unique count:5 sides:12    # Pick 5 unique months for events
/unique count:7 sides:20    # Select 7 unique room numbers
/unique count:3 sides:100   # Choose 3 unique percentile ranges
/unique count:10 sides:52   # Draw 10 unique cards (1-52)
```

### Complex Expressions

```
/roll ((2d4+1)*3)+2d6           # Nested calculations
/roll r3:2d6;r2:d20+3;4d4       # Multiple different roll sets
/roll r20:d20[>=15c] repeat:3   # Statistical analysis
/roll 3de10+2de6                # Multiple exploding dice types
```
   