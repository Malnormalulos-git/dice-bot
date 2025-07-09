import {
    ActionRowBuilder,
    CommandInteraction, ComponentType, EmbedBuilder,
    GuildMember,
    StringSelectMenuBuilder, StringSelectMenuOptionBuilder
} from 'discord.js';
import {rollDice} from '../dice/services/diceRoller';
import {config} from "../../../config";

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
        const randomIndex = rollDice(filteredIncludedMembers.length) - 1;
        return filteredIncludedMembers[randomIndex];
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

        const createEmbed = (member: GuildMember) => {
            return new EmbedBuilder()
                .setColor(config.EMBED_COLOR)
                .addFields(
                    {
                        name: member.displayName || member.user.username,
                        value: `Someone from ${voiceChannel.name}`
                    }
                );
        };

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
                const randomMember = RandomMemberSelector.getRandomMember(includedMembers, excludedUsersIds);

                await selectInteraction.update({
                    embeds: [createEmbed(randomMember)],
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
            const randomMember = RandomMemberSelector.getRandomMember(includedMembers);
            await interaction.editReply({
                embeds: [createEmbed(randomMember)],
                components: []
            });
        }
    }
}