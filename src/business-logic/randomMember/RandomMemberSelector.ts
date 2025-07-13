import {
    ActionRowBuilder,
    CommandInteraction,
    ComponentType,
    EmbedBuilder,
    GuildMember, Message,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from 'discord.js';
import {config} from "../../../config";
import toFixedWithRounding from "../utils/toFixedWithRounding";
import {randomNumber} from "../random/randomNumber";
import MessageAdapter from "../adapters/MessageAdapter";
import InteractionAdapter from "../adapters/InteractionAdapter";
import CommandAdapter from "../adapters/CommandAdapter";
import someone from "../../commands/roll/someone";
import parseOptions from "../utils/parseOptions";

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
     * Core logic - works with any adapter
     */
    private static async executeWithAdapter(
        adapter: CommandAdapter,
        options: {
            exclude?: boolean;
            repeat?: number;
            filterCallback?: (member: GuildMember, invoker: GuildMember) => boolean;
        } = {}
    ): Promise<void> {
        const {exclude = false, repeat = 1, filterCallback = () => true} = options;

        const invoker = adapter.member;
        const voiceChannel = invoker.voice.channel;

        if (!voiceChannel) {
            await adapter.editReply({
                content: 'You must be in a voice channel to use this command!',
                components: []
            });
            return;
        }

        const includedMembers = Array.from(voiceChannel.members.values())
            .filter(member => !member.user.bot &&
                filterCallback(member as GuildMember, invoker)) as GuildMember[];

        if (includedMembers.length < 2) {
            await adapter.editReply({
                content: 'Cannot execute this command - not enough participants!',
                components: []
            });
            return;
        }

        const processResults = async (excludedUsersIds: string[] = []) => {
            const results: GuildMember[] = [];

            for (let i = 0; i < repeat; i++) {
                const randomMember = RandomMemberSelector.getRandomMember(includedMembers, excludedUsersIds);
                results.push(randomMember);
            }

            return repeat === 1
                ? RandomMemberSelector.createSingleResultEmbed(results[0], voiceChannel.name)
                : RandomMemberSelector.createMultipleResultsEmbed(results, voiceChannel.name, repeat);
        };

        if (exclude) {
            if (includedMembers.length === 2) {
                await adapter.editReply({
                    content: 'Cannot exclude someone else - only one person will remain.',
                    components: []
                });
                return;
            }

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(adapter.getCommandId())
                .setPlaceholder('Select a user/s to exclude...')
                .setMinValues(0)
                .setMaxValues(includedMembers.length - 2)
                .addOptions(includedMembers.map((member) =>
                    new StringSelectMenuOptionBuilder()
                        .setLabel(member.displayName || member.user.username)
                        .setValue(member.id)));

            const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(selectMenu);

            await adapter.editReply({
                embeds: [],
                components: [actionRow]
            });

            const collector = await adapter.createCollector({
                componentType: ComponentType.StringSelect,
                filter: (i: any) => i.user.id === adapter.getUserId() && i.customId === adapter.getCommandId(),
                time: 60_000, // 1 min
            });

            collector.on('collect', async (selectInteraction: any) => {
                const excludedUsersIds = selectInteraction.values;
                const embed = await processResults(excludedUsersIds);

                await selectInteraction.update({
                    embeds: [embed],
                    components: []
                });
            });

            collector.on('end', async (collected: any) => {
                if (collected.size === 0) {
                    await adapter.editReply({
                        content: 'You did not select any users in time.',
                        components: []
                    });
                }
            });
        } else {
            const embed = await processResults();
            await adapter.editReply({
                embeds: [embed],
                components: []
            });
        }
    }

    /**
     * Execute from SlashCommand
     */
    static async executeFromInteraction(
        interaction: CommandInteraction,
        filterCallback: (member: GuildMember, invoker: GuildMember) => boolean = () => true
    ): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        const adapter = new InteractionAdapter(interaction);
        const exclude = interaction.options.getBoolean('exclude') || false;
        const repeat = interaction.options.getNumber('repeat') || 1;

        await this.executeWithAdapter(adapter, {exclude, repeat, filterCallback});
    }

    /**
     * Execute from Message
     */
    static async executeFromMessage(
        message: Message,
        input: string,
        filterCallback: (member: GuildMember, invoker: GuildMember) => boolean = () => true
    ): Promise<void> {
        const adapter = new MessageAdapter(message);

        const commandOptions = someone.data.options;
        const parsedOptions = parseOptions(input, commandOptions);

        const exclude = parsedOptions.exclude as boolean || false;
        const repeat = parsedOptions.repeat as number || 1;

        await this.executeWithAdapter(adapter, {exclude, repeat, filterCallback});
    }
}