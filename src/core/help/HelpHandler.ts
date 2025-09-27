import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
    Message,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder
} from 'discord.js';
import {config} from '../../../config';
import CommandAdapter from '../../adapters/CommandAdapter';
import InteractionAdapter from '../../adapters/InteractionAdapter';
import MessageAdapter from '../../adapters/MessageAdapter';

const {
    ROLL_KEYWORD_SYNONYMS,
    HIGHEST_ROLL_KEYWORD_SYNONYMS,
    LOWEST_ROLL_KEYWORD_SYNONYMS,
    AVERAGE_ROLL_KEYWORD_SYNONYMS,
    EXPLODE_EXPRESSION_KEYWORD_SYNONYMS,
    REPEAT_EXPRESSION_KEYWORD_SYNONYMS,
    PARSE_BY_MESSAGE_PREFIX,
    ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX,
    MAX_DICE_COUNT,
    MAX_DICE_SIDES,
    MAX_ROLL_REPETITIONS,
    MAX_EXPRESSION_LENGTH,
    EMBED_COLOR,
    COIN_EDGE_CHANCE
} = config;

const formatSynonyms = (synonyms: string[]) => synonyms.map(s => `\`${s}\``).join(', ');

const helpPages = [
    {
        title: '📌 Basic Usage',
        content: '**Slash Commands:**\n' +
            '`/roll XdY` - Roll X dice with Y sides (regular roll)\n' +
            '`/roll XhY` - Roll X dice, take highest result\n' +
            '`/roll XlY` - Roll X dice, take lowest result\n' +
            '`/roll XaY` - Roll X dice, take average result\n' +
            '`/r XdY` - Shorter version of /roll\n' +
            '`/unique count:X sides:Y` - Generate X unique values from 1 to Y\n\n' +
            (ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX
                ? `**Message Prefix:**\n` +
                `\`${PARSE_BY_MESSAGE_PREFIX}XdY\` - Roll dice using message prefix\n` +
                `\`${PARSE_BY_MESSAGE_PREFIX}XhY\` - Roll dice, take highest result\n` +
                `\`${PARSE_BY_MESSAGE_PREFIX}XlY\` - Roll dice, take lowest result\n` +
                `\`${PARSE_BY_MESSAGE_PREFIX}XaY\` - Roll dice, take average result\n` +
                `\`${PARSE_BY_MESSAGE_PREFIX}unique count:X sides:Y\` - Generate unique values with prefix\n\n`
                : '') +
            '**Multiple Expressions:**\n' +
            'Use `;` to separate multiple rolls:\n' +
            '`/roll 3d6;d20;2d8` - Roll three different dice sets\n\n' +
            '**Basic Examples:**\n' +
            '• `/roll 2d6` - Roll two six-sided dice\n' +
            '• `/roll d20+5` - Roll d20 and add 5\n' +
            '• `/roll 3h6` - Roll 3d6, take highest\n' +
            '• `/unique count:5 sides:10` - Generate 5 unique values from 1-10',
        value: '0'
    },
    {
        title: '🎲 Unique Values System',
        content: '**Unique Values Command:**\n' +
            '`/unique count:X sides:Y` - Generate X unique random values from 1 to Y\n\n' +
            (ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX
                ? `**Message Prefix:**\n` +
                `\`${PARSE_BY_MESSAGE_PREFIX}unique count:X sides:Y\` - Generate unique values with prefix\n\n`
                : '') +
            '**How it works:**\n' +
            '• Generates specified count of unique random numbers\n' +
            '• No duplicate values in a single command\n' +
            '• Values range from 1 to specified maximum\n' +
            '• Perfect for selecting unique items, positions, or participants\n\n' +
            '**Validation:**\n' +
            '• Count cannot exceed the number of sides\n' +
            '• Both count and sides must be greater than 0\n' +
            `• Maximum limits: ${MAX_DICE_COUNT} count, ${MAX_DICE_SIDES} sides\n\n` +
            '**Examples:**\n' +
            '• `/unique count:3 sides:6` - Pick 3 unique numbers from 1-6\n' +
            '• `/unique count:5 sides:20` - Pick 5 unique numbers from 1-20\n' +
            '• `/unique count:10 sides:100` - Pick 10 unique numbers from 1-100\n' +
            (ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX
                ? `• \`${PARSE_BY_MESSAGE_PREFIX}unique count:7 sides:12\` - Pick 7 unique from 1-12 with prefix\n`
                : '') +
            '\n**Use Cases:**\n' +
            '• Random seating arrangements\n' +
            '• Unique loot distribution\n' +
            '• Non-repeating random selections\n' +
            '• Tournament bracket positioning',
        value: '1'
    },
    {
        title: '🟡 Coin Commands',
        content: '**Slash Commands:**\n' +
            '`/coin` - Toss a regular coin (heads or tails)\n' +
            `\`/coin-with-edge\` - Toss a coin with 1/${COIN_EDGE_CHANCE} chance of landing on edge\n\n` +
            (ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX
                ? `**Message Prefix:**\n` +
                `\`${PARSE_BY_MESSAGE_PREFIX}coin\` - Toss a regular coin (heads or tails)\n` +
                `\`${PARSE_BY_MESSAGE_PREFIX}coin-with-edge\` - Toss a coin with 1/${COIN_EDGE_CHANCE} chance of landing on edge\n\n`
                : '') +
            '**How it works:**\n' +
            '• Regular coin flip uses a 2-sided die roll\n' +
            `• Edge coin uses a ${COIN_EDGE_CHANCE}-sided die roll\n` +
            '• Results are displayed with animated GIFs\n' +
            '• Results are wrapped in spoiler tags for suspense\n\n' +
            '**Examples:**\n' +
            '• Use `/coin` for quick decisions\n' +
            '• Use `/coin-with-edge` for dramatic effect\n' +
            '• Perfect for settling disputes or making choices',
        value: '2'
    },
    {
        title: '👥 Random Member Selection',
        content: '**Slash Commands:**\n' +
            '`/someone` - Choose a random person from your voice channel\n' +
            '`/someone-except-me` - Choose a random person excluding yourself\n\n' +
            (ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX
                ? `**Message Prefix:**\n` +
                `\`${PARSE_BY_MESSAGE_PREFIX}someone\` - Choose a random person from your voice channel\n` +
                `\`${PARSE_BY_MESSAGE_PREFIX}someone-except-me\` - Choose a random person excluding yourself\n\n`
                : '') +
            '**Command Options:**\n' +
            '• `exclude:true` - Show interactive menu to exclude specific users\n' +
            '• `repeat:N` - Repeat selection N times with statistics\n\n' +
            '**Requirements:**\n' +
            '• You must be in a voice channel\n' +
            '• At least 2 people must be in the channel\n' +
            '• Bot needs access to voice channel member list\n\n' +
            '**Examples:**\n' +
            '• `/someone repeat:5` - Pick 5 times with percentages\n' +
            '• `/someone exclude:true` - Interactive user exclusion\n' +
            '• `/someone-except-me repeat:3` - Pick 3 times, excluding yourself\n' +
            (ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX
                ? `• \`${PARSE_BY_MESSAGE_PREFIX}someone repeat:5\` - Pick 5 times using prefix\n` +
                `• \`${PARSE_BY_MESSAGE_PREFIX}someone-except-me exclude:true\` - Interactive exclusion with prefix\n`
                : ''),
        value: '3'
    },
    {
        title: '🎯 Roll Types & Synonyms',
        content: '**Regular Roll (d) - Sum all dice**\n' +
            `Synonyms: ${formatSynonyms(ROLL_KEYWORD_SYNONYMS)}\n` +
            'Example: `2d6` or `2dice6`\n\n' +
            '**Highest Roll (h) - Take highest result**\n' +
            `Synonyms: ${formatSynonyms(HIGHEST_ROLL_KEYWORD_SYNONYMS)}\n` +
            'Example: `3h6` or `3best6`\n\n' +
            '**Lowest Roll (l) - Take lowest result**\n' +
            `Synonyms: ${formatSynonyms(LOWEST_ROLL_KEYWORD_SYNONYMS)}\n` +
            'Example: `3l6` or `3worst6`\n\n' +
            '**Average Roll (a) - Take average result**\n' +
            `Synonyms: ${formatSynonyms(AVERAGE_ROLL_KEYWORD_SYNONYMS)}\n` +
            'Example: `4a8` or `4average8`',
        value: '4'
    },
    {
        title: '💥 Exploding Dice System',
        content: '**Exploding Dice (e) - Reroll on maximum**\n' +
            `Synonyms: ${formatSynonyms(EXPLODE_EXPRESSION_KEYWORD_SYNONYMS)}\n` +
            'When a die rolls its maximum value, it "explodes" and rolls again\n\n' +
            '**How it works:**\n' +
            '• Roll reaches maximum value → automatic reroll\n' +
            '• Original roll + all explosion rolls are summed\n' +
            '• Chain explosions possible (multiple max rolls)\n' +
            '• Does not work with 1-sided dice\n\n' +
            '**Examples:**\n' +
            '• `2de6` - Two exploding d6 dice\n' +
            '• `2he10+5` - Exploding 2h10 plus 5\n' +
            '• `3de8+2d6` - Mix exploding and normal dice\n' +
            (ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX
                ? `• \`${PARSE_BY_MESSAGE_PREFIX}2de6\` - Two exploding d6 dice with prefix\n`
                : ''),
        value: '5'
    },
    {
        title: '⚙️ Math Operations & Grouping',
        content: '**Supported Operations:**\n' +
            '• `+` Addition\n' +
            '• `-` Subtraction\n' +
            '• `*` Multiplication\n' +
            '• `/` Division\n' +
            '• `()` Grouping parentheses\n\n' +
            '**Operation Examples:**\n' +
            '• `2d6+3` - Roll 2d6, add 3\n' +
            '• `d20*2` - Roll d20, multiply by 2\n' +
            '• `(2d6+1)*3` - Roll 2d6, add 1, multiply by 3\n' +
            '• `3de8-2+d4` - Exploding dice with math\n' +
            '• `((2+3)d20+5)*2` - Nested parentheses calculation\n\n' +
            '**Advanced Examples:**\n' +
            '• `2de6*(3+d4)` - Exploding dice with complex math\n' +
            '• `(d20+5)/2` - Calculation with division\n' +
            (ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX
                ? `• \`${PARSE_BY_MESSAGE_PREFIX}(2d6+1)*3\` - Complex math with prefix\n`
                : ''),
        value: '6'
    },
    {
        title: '🔁 Repetition System',
        content: '**Global Repetition (Command Options):**\n' +
            '`/roll 2d6 repeat:3` - Repeat entire expression 3 times\n\n' +
            '**Local Repetition (In Expression):**\n' +
            '`r5:2d6` - Repeat "2d6" 5 times\n' +
            `Synonyms for "r": ${formatSynonyms(REPEAT_EXPRESSION_KEYWORD_SYNONYMS)}\n\n` +
            '**Combined Repetition:**\n' +
            '`/roll r3:2d6 repeat:2` - "2d6" repeated 3 times, then whole thing repeated 2 times (total: 6 rolls)\n\n' +
            '**Multiple Expressions with Repetition:**\n' +
            '`r2:3de6;r3:d20` - Exploding dice with repetition\n' +
            '`repeat5:2d6;d20+5` - Mix repeated and single expressions\n\n' +
            (ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX
                ? `**With Message Prefix:**\n` +
                `\`${PARSE_BY_MESSAGE_PREFIX}r5:2d6\` - Repeat "2d6" 5 times using prefix\n` +
                `\`${PARSE_BY_MESSAGE_PREFIX}r2:3de6;r3:d20\` - Multiple expressions with repetition\n\n`
                : '') +
            `**Limits:** Maximum ${MAX_ROLL_REPETITIONS} total repetitions`,
        value: '7'
    },
    {
        title: '🎯 Advanced Filtering System',
        content: '**Filter Syntax:** `[comparator][value][type]`\n\n' +
            '**Comparators:**\n' +
            '• `>` greater than\n' +
            '• `>=` greater or equal\n' +
            '• `<` less than\n' +
            '• `<=` less or equal\n' +
            '• `=` equal to\n\n' +
            '**Filter Types:**\n' +
            '• (none) - Display only matching results\n' +
            '• `s` - Sum of matching results\n' +
            '• `c` - Count of matching results\n\n' +
            '**Local vs Global Filters:**\n' +
            '• Local: `r10:d20[>15]` - Filter within expression\n' +
            '• Global: `/roll 2d6 filter-by:>7c` - Filter all results\n\n' +
            '**Filter Examples:**\n' +
            '• `r10:d20[>15]` - Show only rolls > 15\n' +
            '• `r10:d20[>=10c]` - Count rolls >= 10\n' +
            '• `r5:3d6[<8s]` - Sum of rolls < 8\n' +
            '• `/roll 2d6 filter-by:>7c` - Count results > 7\n' +
            (ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX
                ? `• \`${PARSE_BY_MESSAGE_PREFIX}r10:d20[>15]\` - Filter with prefix\n`
                : ''),
        value: '8'
    },
    {
        title: '💡 Practical Examples',
        content: '**D&D Combat Examples:**\n' +
            '`2h20+5;2de6+3` - Advantage attack + exploding damage\n' +
            '`2l20` - Disadvantage roll\n' +
            '`r4:d20+8[>=15c]` - Count successful attacks\n\n' +
            '**Complex Damage Calculations:**\n' +
            '`3de6+2d4+5` - Exploding fireball damage\n' +
            '`(2d6+3)*2` - Critical hit damage\n' +
            '`3d6+2d4+5` - Multiple dice types + modifier\n\n' +
            '**Group Management:**\n' +
            '`/someone repeat:4` - Initiative order with stats\n' +
            '`/someone-except-me exclude:true` - Pick player, exclude specific people\n' +
            '`/unique count:4 sides:20` - Assign unique initiative positions\n\n' +
            '**Quick Decisions:**\n' +
            '`/coin-with-edge` - Dramatic story moments\n' +
            '`r5:d100[<20c]` - Probability testing\n' +
            '`/unique count:3 sides:10` - Pick 3 unique treasure items\n\n' +
            (ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX
                ? `**With Message Prefix:**\n` +
                `\`${PARSE_BY_MESSAGE_PREFIX}2h20+5;2de6+3\` - Advantage attack with prefix\n` +
                `\`${PARSE_BY_MESSAGE_PREFIX}coin-with-edge\` - Dramatic coin flip\n` +
                `\`${PARSE_BY_MESSAGE_PREFIX}unique count:5 sides:12\` - Unique selection with prefix\n`
                : ''),
        value: '9'
    },
    {
        title: '🔧 System Limits & Options',
        content: '**Roll Command Options:**\n' +
            '• `expression` - Dice expression (required)\n' +
            '• `repeat` - Global repetition count\n' +
            '• `filter-by` - Global filter for all results\n' +
            '• `hide` - Hide results with spoiler tags\n\n' +
            '**Unique Command Options:**\n' +
            '• `count` - Number of unique values to generate (required)\n' +
            '• `sides` - Maximum value range (1 to sides) (required)\n\n' +
            '**Someone Command Options:**\n' +
            '• `exclude` - Interactive user exclusion menu\n' +
            '• `repeat` - Multiple selections with statistics\n\n' +
            (ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX
                ? `**Message Prefix Commands:**\n` +
                `\`${PARSE_BY_MESSAGE_PREFIX}help\` - Show this help menu\n` +
                `\`${PARSE_BY_MESSAGE_PREFIX}coin\` - Toss a regular coin\n` +
                `\`${PARSE_BY_MESSAGE_PREFIX}coin-with-edge\` - Toss coin with edge chance\n` +
                `\`${PARSE_BY_MESSAGE_PREFIX}unique count:X sides:Y\` - Generate unique values\n` +
                `\`${PARSE_BY_MESSAGE_PREFIX}someone [options]\` - Choose random member\n` +
                `\`${PARSE_BY_MESSAGE_PREFIX}someone-except-me [options]\` - Choose random member excluding you\n` +
                `\`${PARSE_BY_MESSAGE_PREFIX}expression\` - Roll dice expression\n\n`
                : '') +
            '**System Limits:**\n' +
            `• Maximum dice per roll: ${MAX_DICE_COUNT}\n` +
            `• Maximum sides per die: ${MAX_DICE_SIDES}\n` +
            `• Maximum repetitions: ${MAX_ROLL_REPETITIONS}\n` +
            `• Maximum expression length: ${MAX_EXPRESSION_LENGTH} characters\n\n` +
            '**Special Features:**\n' +
            '• Exploding dice chain indefinitely\n' +
            '• Unique values guarantee no duplicates\n' +
            '• Secure random number generation\n' +
            '• Automatic file attachment for long results',
        value: '10'
    }
];

class HelpHandler {
    private static createHelpEmbed(pageIndex: number = 0): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle('🎲 Dice Rolling Bot - Help')
            .addFields(
                {
                    name: helpPages[pageIndex].title,
                    value: helpPages[pageIndex].content
                },
                {
                    name: '💻 Source Code',
                    value: '[GitHub](https://github.com/Malnormalulos-git/dice-bot.git)'
                }
            )
            .setFooter({text: 'Created with ❤️ for tabletop gaming enthusiasts'})
            .setTimestamp();
    }

    private static createSelectMenuActionRow(adapter: CommandAdapter, pageIndex: number = 0):
        ActionRowBuilder<StringSelectMenuBuilder> {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`help_${adapter.getUserId()}`)
            .setPlaceholder(helpPages[pageIndex].title)
            .addOptions(helpPages.filter((_, index) => index != pageIndex)
                .map((page) =>
                    new StringSelectMenuOptionBuilder()
                        .setLabel(page.title)
                        .setValue(page.value)
                ));

        return new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(selectMenu);
    }

    private static async executeWithAdapter(adapter: CommandAdapter): Promise<void> {
        await adapter.editReply({
            embeds: [this.createHelpEmbed()],
            components: [this.createSelectMenuActionRow(adapter)]
        });

        const collector = await adapter.createCollector({
            componentType: ComponentType.StringSelect,
            filter: (i: any) => i.user.id === adapter.getUserId() && i.customId === `help_${adapter.getUserId()}`,
            time: 300_000 // 5 min
        });

        collector.on('collect', async (selectInteraction: StringSelectMenuInteraction) => {
            const selectedValue = selectInteraction.values[0];
            const pageIndex = parseInt(selectedValue);

            await selectInteraction.update({
                embeds: [this.createHelpEmbed(pageIndex)],
                components: [this.createSelectMenuActionRow(adapter, pageIndex)]
            });
        });

        collector.on('end', async () => {
            try {
                await adapter.editReply({
                    components: []
                });
            } catch (error) {
            }
        });
    }

    static async executeFromInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
        const adapter = new InteractionAdapter(interaction);
        await this.executeWithAdapter(adapter);
    }

    static async executeFromMessage(message: Message): Promise<void> {
        const adapter = new MessageAdapter(message);
        await this.executeWithAdapter(adapter);
    }
}

export default HelpHandler;