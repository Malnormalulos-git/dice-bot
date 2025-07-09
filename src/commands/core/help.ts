import {
    ActionRowBuilder,
    CommandInteraction,
    ComponentType,
    EmbedBuilder,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder
} from 'discord.js';
import {Command} from '../../types/types';
import {config} from "../../../config";

const {
    ROLL_KEYWORD_SYNONYMS,
    HIGHEST_ROLL_KEYWORD_SYNONYMS,
    LOWEST_ROLL_KEYWORD_SYNONYMS,
    AVERAGE_ROLL_KEYWORD_SYNONYMS,
    REPEAT_EXPRESSION_KEYWORD_SYNONYMS,
    PARSE_BY_MESSAGE_PREFIX,
    ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX,
    MAX_DICE_COUNT,
    MAX_DICE_SIDES,
    MAX_REPEATINGS,
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
            '`/r XdY` - Shorter version of /roll\n\n' +
            (ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX ?
                `**Message Prefix:**\n\`${PARSE_BY_MESSAGE_PREFIX}XdY\` - Roll dice using message prefix\n\n` : '') +
            '**Multiple Expressions:**\n' +
            'Use `;` to separate multiple rolls:\n' +
            '`/roll 3d6;d20;2d8` - Roll three different dice sets\n\n' +
            '**Basic Examples:**\n' +
            '• `/roll 2d6` - Roll two six-sided dice\n' +
            '• `/roll d20+5` - Roll d20 and add 5\n' +
            '• `/roll 3h6` - Roll 3d6, take highest',
        value: '0'
    },
    {
        title: '🟡 Coin Commands',
        content: '**Coin Toss Commands:**\n' +
            '`/coin` - Toss a regular coin (heads or tails)\n' +
            `\`/coin-with-edge\` - Toss a coin with 1/${COIN_EDGE_CHANCE} chance of landing on edge\n\n` +
            '**How it works:**\n' +
            '• Regular coin flip uses a 2-sided die roll\n' +
            `• Edge coin uses a ${COIN_EDGE_CHANCE}-sided die roll\n` +
            '• Results are displayed with animated GIFs\n' +
            '• Results are wrapped in spoiler tags for suspense\n\n' +
            '**Examples:**\n' +
            '• Use `/coin` for quick decisions\n' +
            '• Use `/coin-with-edge` for dramatic effect\n' +
            '• Perfect for settling disputes or making choices',
        value: '1'
    },
    {
        title: '👥 Random Member Selection',
        content: '**Voice Channel Commands:**\n' +
            '`/someone` - Choose a random person from your voice channel\n' +
            '`/someone-except-me` - Choose a random person excluding yourself\n\n' +
            '**Requirements:**\n' +
            '• You must be in a voice channel\n' +
            '• At least 2 people must be in the channel\n' +
            '• Bot needs access to voice channel member list\n\n' +
            '**Use Cases:**\n' +
            '• Decide who goes first in a game\n' +
            '• Pick someone for a task\n' +
            '• Random team selection\n' +
            '• Fair decision making in groups\n\n' +
            '**Note:** Uses the same secure random number generation as dice rolls',
        value: '2'
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
        value: '3'
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
            '• `3d8-2+d4` - Complex expression with multiple dice\n' +
            '• `((2+3)d20+5)*2` - Nested parentheses calculation',
        value: '4'
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
            '`r2:3d6;r3:d20` - Roll 3d6 twice, then d20 three times\n\n' +
            `**Limits:** Maximum ${MAX_REPEATINGS} total repetitions`,
        value: '5'
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
            '• (none) - Display matching results\n' +
            '• `s` - Sum of matching results\n' +
            '• `c` - Count of matching results\n\n' +
            '**Filter Examples:**\n' +
            '• `r10:d20[>15]` - Show only rolls > 15\n' +
            '• `r10:d20[>=10c]` - Count rolls >= 10\n' +
            '• `r5:3d6[<8s]` - Sum of rolls < 8\n' +
            '• `/roll 2d6 filter-by:>7c` - Count results > 7',
        value: '6'
    },
    {
        title: '💡 Practical Examples',
        content:
            '**Attack Rolls:**\n' +
            '`d20+5;2d6+3` - Attack roll + damage\n\n' +
            '**Advantage/Disadvantage:**\n' +
            '`2h20` - Roll with advantage\n' +
            '`2l20` - Roll with disadvantage\n\n' +
            '**Complex Damage:**\n' +
            '`3d6+2d4+5` - Multiple dice types + modifier\n\n' +
            '**Quick Decisions:**\n' +
            '`/coin` - Simple yes/no choice\n' +
            '`/someone` - Pick random player\n\n' +
            '**Group Activities:**\n' +
            '`/someone-except-me` - Pick someone else to go first\n' +
            '`/coin-with-edge` - Dramatic decision making',
        value: '7'
    },
    {
        title: '🔧 Roll Command Options & Limits',
        content: '**Available Command Options:**\n' +
            '• `expression` - Dice expression (required)\n' +
            '• `repeat` - Global repetition count\n' +
            '• `filter-by` - Global filter for results\n' +
            '• `hide` - Hide results with spoiler tags\n\n' +
            '**System Limits:**\n' +
            `• Maximum dice per roll: ${MAX_DICE_COUNT}\n` +
            `• Maximum sides per die: ${MAX_DICE_SIDES}\n` +
            `• Maximum repetitions: ${MAX_REPEATINGS}\n` +
            '• Maximum expression length: 100 characters\n\n' +
            '**Spoiler Example:**\n' +
            '`/roll:d20 hide:true` - Hide result',
        value: '8'
    }
];

const help: Command = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows information about Dice Rolling Bot commands'),
    async execute(interaction: CommandInteraction) {
        const createHelpEmbed = (pageIndex: number = 0) => {
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
        };

        const createSelectMenuActionRow = (pageIndex: number = 0) => {
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`help_${interaction.user.id}`)
                .setPlaceholder(helpPages[pageIndex].title)
                .addOptions(helpPages.filter((_, index) => index != pageIndex)
                    .map((page) =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(page.title)
                            .setValue(page.value)
                    ));

            return new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(selectMenu);
        };

        const reply = await interaction.editReply({
            embeds: [createHelpEmbed()],
            components: [createSelectMenuActionRow()]
        });

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: (i) => i.user.id === interaction.user.id && i.customId === `help_${interaction.user.id}`,
            time: 300_000 // 5 min
        });

        collector.on('collect', async (selectInteraction: StringSelectMenuInteraction) => {
            const selectedValue = selectInteraction.values[0];
            const pageIndex = parseInt(selectedValue);

            await selectInteraction.update({
                embeds: [createHelpEmbed(pageIndex)],
                components: [createSelectMenuActionRow(pageIndex)]
            });
        });

        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                await interaction.editReply({
                    content: 'You did not select any users in time.',
                    components: []
                });
            }
        });
    }
};

export default help;