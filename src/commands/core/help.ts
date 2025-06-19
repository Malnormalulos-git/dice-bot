import {SlashCommandBuilder, EmbedBuilder} from 'discord.js';
import {Command} from '../../types/types';
import {config} from "../../../config";

const {
    ROLL_KEYWORD_SYNONYMS,
    HIGHEST_ROLL_KEYWORD_SYNONYMS,
    LOWEST_ROLL_KEYWORD_SYNONYMS,
    AVERAGE_ROLL_KEYWORD_SYNONYMS
} = config;

const help: Command = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows information about Dice Rolling Bot commands'),
    async execute(interaction) {
        const formatSynonyms = (synonyms: string[]) => synonyms.map(s => `\`${s}\``).join(', ');

        const helpEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎲 Dice Rolling Bot - Help')
            .setDescription('Roll dice with various expressions!')
            .addFields(
                {
                    name: '📌 Basic Usage',
                    value: '`/roll XdY` - Roll X dice with Y sides (regular roll)\n' +
                        '`/roll XhY` - Roll X dice with Y sides and take highest\n' +
                        '`/roll XlY` - Roll X dice with Y sides and take lowest\n' +
                        '`/roll XaY` - Roll X dice with Y sides and take average\n' +
                        '`/r XdY` - Same as /roll, just shorter!\n' +
                        'Example: `/roll 2d6` rolls two six-sided dice\n' +
                        'Use `;` to multiple rolls\n' +
                        'Example: `/r 3d6;d20` rolls three six-sided and one twenty-sided dice'
                },
                {
                    name: '🎯 Roll Types',
                    value: '**Regular Roll (d)**\n' +
                        '- Basic roll that sums all dice\n' +
                        `- Synonyms: ${formatSynonyms(ROLL_KEYWORD_SYNONYMS)}\n` +
                        '- Example: `2d6` or `2' + ROLL_KEYWORD_SYNONYMS[0] + '6`\n\n' +
                        '**Highest Roll (h)**\n' +
                        '- Rolls multiple dice and takes the highest result\n' +
                        `- Synonyms: ${formatSynonyms(HIGHEST_ROLL_KEYWORD_SYNONYMS)}\n` +
                        '- Example: `2h6` or `2' + HIGHEST_ROLL_KEYWORD_SYNONYMS[0] + '6`\n\n' +
                        '**Lowest Roll (l)**\n' +
                        '- Rolls multiple dice and takes the lowest result\n' +
                        `- Synonyms: ${formatSynonyms(LOWEST_ROLL_KEYWORD_SYNONYMS)}\n` +
                        '- Example: `2l6` or `2' + LOWEST_ROLL_KEYWORD_SYNONYMS[0] + '6`\n\n' +
                        '**Average Roll (a)**\n' +
                        '- Rolls multiple dice and takes the average result\n' +
                        `- Synonyms: ${formatSynonyms(AVERAGE_ROLL_KEYWORD_SYNONYMS)}\n` +
                        '- Example: `2a6` or `2' + AVERAGE_ROLL_KEYWORD_SYNONYMS[0] + '6`'
                },
                {
                    name: '⚙️ Supported Operations',
                    value: '`()` Grouping parentheses\n' +
                        '`*` Multiplication\n' +
                        '`/` Division\n' +
                        '`+` Addition\n' +
                        '`-` Subtraction'
                },
                {
                    name: '📝 Example Expressions',
                    value: '`/roll 2d20+5`: Roll two d20s, add rolls, and add 5\n' +
                        '`/roll 2h20+3`: Roll two d20s, take highest, and add 3\n' +
                        '`/roll 3l6`: Roll three d6s and take lowest\n' +
                        '`/roll 4a8`: Roll four d8s and take average\n' +
                        '`/r ((2+3)d20+5)*2`: Roll 5d20, add rolls, add 5, and multiply everything by 2'
                },
                {
                    name: '🎯 Advanced Expressions',
                    value: '- `3d6+5`: Roll 3d6 and add 5\n' +
                        '- `2h6+1`: Roll 2d6, take highest, and add 1\n' +
                        '- `4a8-2`: Roll 4d8, take average, and subtract 2\n' +
                        '- `d20+3l6`: Mix different dice types'
                },
                {
                    name: '💻 Source Code',
                    value: '[GitHub](https://github.com/Malnormalulos-git/dice-bot.git)'
                }
            )
            .setFooter({text: 'Created with ❤️ for tabletop gaming enthusiasts'})
            .setTimestamp();

        await interaction.reply({
            embeds: [helpEmbed],
            ephemeral: true
        });
    }
};

export default help;