import {
    ActionRowBuilder,
    CommandInteraction,
    ComponentType,
    EmbedBuilder,
    GuildMember,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from 'discord.js';
import {config} from "../../../config";
import toFixedWithRounding from "../utils/toFixedWithRounding";
import {randomNumber} from "../utils/randomNumber";

export class RandomMemberSelector {
    /**
     * Returns random member from the sample
     */
    private static getRandomMember(
        members: GuildMember[],
        excludedUsersIds: string[] = []
    ): GuildMember {
        const filteredIncludedMembers = members.filter(
            member => !excludedUsersIds.includes(member.id));
        const randomIndex = randomNumber(filteredIncludedMembers.length) - 1;
        return filteredIncludedMembers[randomIndex];
    }

    /**
     * Counts occurrences of each member in the results
     */
    private static countResults(results: GuildMember[]): Map<string, { member: GuildMember, count: number }> {
        const counts = new Map<string, { member: GuildMember, count: number }>();

        results.forEach(member => {
            const existing = counts.get(member.id);
            if (existing) {
                existing.count++;
            } else {
                counts.set(member.id, {member, count: 1});
            }
        });

        return counts;
    }

    /**
     * Creates embed for multiple results
     */
    private static createMultipleResultsEmbed(
        results: GuildMember[],
        voiceChannelName: string,
        repeat: number
    ): EmbedBuilder {
        const counts = this.countResults(results);
        const sortedCounts = Array.from(counts.values())
            .sort((a, b) => b.count - a.count);

        const embed = new EmbedBuilder()
            .setColor(config.EMBED_COLOR)
            .setTitle(`🎲 Results of ${repeat} rolls`)
            .setDescription(`Someone from **${voiceChannelName}**:`);

        let percentagesSum = 0;
        sortedCounts.forEach(({member, count}, index) => {
            let percentage;
            if (index != sortedCounts.length - 1) {
                percentage = toFixedWithRounding((count / repeat) * 100, 1);
                percentagesSum += percentage;
            } else {
                percentage = (100 - percentagesSum).toFixed(1);
            }

            embed.addFields({
                name: `${index + 1}. ${member.displayName || member.user.username}`,
                value: `${count} (${percentage}%)`,
                inline: true
            });
        });

        return embed;
    }

    /**
     * Creates embed for a single result
     */
    private static createSingleResultEmbed(member: GuildMember, voiceChannelName: string): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(config.EMBED_COLOR)
            .addFields({
                name: member.displayName || member.user.username,
                value: `Someone from **${voiceChannelName}**`
            });
    }

    /**
     * Executes the random member selection
     */
    static async execute(
        interaction: CommandInteraction,
        filterCallback: (member: GuildMember, invoker: GuildMember) => boolean = () => true
    ): Promise<void> {
        if (!interaction.isChatInputCommand())
            return;

        const invoker = interaction.member as GuildMember;
        const voiceChannel = invoker.voice.channel;

        if (!voiceChannel) {
            await interaction.editReply({
                content: 'You must be in a voice channel to use this command!',
                components: []
            });
            return;
        }

        const exclude = interaction.options.getBoolean('exclude') || false;
        const repeatCount = interaction.options.getNumber('repeat') || 1;

        const includedMembers = Array.from(voiceChannel.members.values())
            .filter(member => !member.user.bot &&
                filterCallback(member as GuildMember, invoker)) as GuildMember[];

        if (includedMembers.length < 2) {
            await interaction.editReply({
                content: 'Cannot execute this command - not enough participants!',
                components: []
            });
            return;
        }

        const createSelectMenuActionRow = () => {
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(interaction.id)
                .setPlaceholder('Select a user/s to exclude...')
                .setMinValues(0)
                .setMaxValues(includedMembers.length - 2)
                .addOptions(includedMembers.map((member) =>
                    new StringSelectMenuOptionBuilder()
                        .setLabel(member.displayName || member.user.username)
                        .setValue(member.id)));

            return new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(selectMenu);
        };

        const processResults = async (excludedUsersIds: string[] = []) => {
            const results: GuildMember[] = [];

            for (let i = 0; i < repeatCount; i++) {
                const randomMember = RandomMemberSelector.getRandomMember(includedMembers, excludedUsersIds);
                results.push(randomMember);
            }

            return repeatCount === 1
                ? RandomMemberSelector.createSingleResultEmbed(results[0], voiceChannel.name)
                : RandomMemberSelector.createMultipleResultsEmbed(results, voiceChannel.name, repeatCount);
        };

        if (exclude) {
            if (includedMembers.length === 2) {
                await interaction.editReply({
                    content: 'Cannot exclude someone else - only one person will remain.',
                    components: []
                });
                return;
            }

            const reply = await interaction.editReply({
                embeds: [],
                components: [createSelectMenuActionRow()]
            });

            const collector = reply.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                filter: (i) => i.user.id === interaction.user.id && i.customId === interaction.id,
                time: 60_000, // 1 min
            });

            collector.on('collect', async (selectInteraction) => {
                const excludedUsersIds = selectInteraction.values;
                const embed = await processResults(excludedUsersIds);

                await selectInteraction.update({
                    embeds: [embed],
                    components: []
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
        } else {
            const embed = await processResults();
            await interaction.editReply({
                embeds: [embed],
                components: []
            });
        }
    }
}