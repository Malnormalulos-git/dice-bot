import {
    SlashCommandBuilder,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
    ComponentType,
    StringSelectMenuInteraction, CommandInteraction
} from 'discord.js';
import {Command} from '../../types/types';
import {config} from "../../../config";

const {
    ROLL_KEYWORD_SYNONYMS,
    HIGHEST_ROLL_KEYWORD_SYNONYMS,
    LOWEST_ROLL_KEYWORD_SYNONYMS,
    AVERAGE_ROLL_KEYWORD_SYNONYMS
} = config;

const formatSynonyms = (synonyms: string[]) => synonyms.map(s => `\`${s}\``).join(', ');

const helpPages = [
    {
        title: '📌 Basic Usage',
        content: '`/roll XdY` - Roll X dice with Y sides (regular roll)\n' +
            '`/roll XhY` - Roll X dice with Y sides and take highest\n' +
            '`/roll XlY` - Roll X dice with Y sides and take lowest\n' +
            '`/roll XaY` - Roll X dice with Y sides and take average\n' +
            '`/r XdY` - Same as /roll, just shorter!\n' +
            'Example: `/roll 2d6` rolls two six-sided dice\n' +
            'Use `;` to multiple rolls\n' +
            'Example: `/r 3d6;d20` rolls three six-sided and one twenty-sided dice',
        value: '0'
    },
    {
        title: '🎯 Roll Types',
        content: '**Regular Roll (d)**\n' +
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
            '- Example: `2a6` or `2' + AVERAGE_ROLL_KEYWORD_SYNONYMS[0] + '6`',
        value: '1'
    },
    {
        title: '⚙️ Supported Operations',
        content: '`()` Grouping parentheses\n' +
            '`*` Multiplication\n' +
            '`/` Division\n' +
            '`+` Addition\n' +
            '`-` Subtraction',
        value: '2'
    },
    {
        title: '📝 Example Expressions',
        content: '`/roll 2d20+5`: Roll two d20s, add rolls, and add 5\n' +
            '`/roll 2h20+3`: Roll two d20s, take highest, and add 3\n' +
            '`/roll 3l6`: Roll three d6s and take lowest\n' +
            '`/roll 4a8`: Roll four d8s and take average\n' +
            '`/r ((2+3)d20+5)*2`: Roll 5d20, add rolls, add 5, and multiply everything by 2',
        value: '3'
    },
    {
        title: '🎯 Advanced Expressions',
        content: '- `3d6+5`: Roll 3d6 and add 5\n' +
            '- `2h6+1`: Roll 2d6, take highest, and add 1\n' +
            '- `4a8-2`: Roll 4d8, take average, and subtract 2\n' +
            '- `d20+3l6`: Mix different dice types',
        value: '4'
    }
];

const help: Command = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows information about Dice Rolling Bot commands'),
    async execute(interaction: CommandInteraction) {
        const createHelpEmbed = (pageIndex: number = 0) => {
            return new EmbedBuilder()
                .setColor('#5865F2')
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

            const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(selectMenu);

            return actionRow;
        };

        const reply = await interaction.editReply({
            embeds: [createHelpEmbed()],
            components: [createSelectMenuActionRow()]
        });

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: (i) => i.user.id === interaction.user.id && i.customId === `help_${interaction.user.id}`
        });

        collector.on('collect', async (selectInteraction: StringSelectMenuInteraction) => {
            const selectedValue = selectInteraction.values[0];
            const pageIndex = parseInt(selectedValue);

            await selectInteraction.update({
                embeds: [createHelpEmbed(pageIndex)],
                components: [createSelectMenuActionRow(pageIndex)]
            });
        });
    }
};

export default help;