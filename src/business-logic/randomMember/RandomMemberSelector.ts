import {AutocompleteInteraction, CommandInteraction, GuildMember, InteractionResponse} from 'discord.js';
import {rollDice} from '../dice/services/diceRoller';

export class RandomMemberSelector {
    /**
     * Handles autocomplete interaction for member selection
     */
    static async handleAutocomplete(
        interaction: AutocompleteInteraction,
        filterCallback: (choice: { name: string; value: string }, invoker: GuildMember) => boolean = () => true
    ): Promise<void> {
        const voiceChannel = (interaction.member as GuildMember)?.voice?.channel;
        if (!voiceChannel) {
            return await interaction.respond([]);
        }

        const members = Array.from(voiceChannel.members.values()) as GuildMember[];
        const focused = interaction.options.getFocused().toLowerCase().trim();

        const choices = members
            .map(member => ({
                name: member.displayName || member.user.username,
                value: member.id
            }))
            .filter(choice =>
                choice.name.toLowerCase().includes(focused) && filterCallback(choice, interaction.member as GuildMember));

        await interaction.respond(choices.length > 2 ? choices : []);
    }

    /**
     * Executes the random member selection
     */
    static async execute(
        interaction: CommandInteraction,
        filterCallback: (member: GuildMember, invoker: GuildMember) => boolean = () => true
    ): Promise<void | InteractionResponse<boolean>> {
        const invoker = interaction.member as GuildMember;
        if (!invoker?.voice?.channel) {
            return await interaction.reply('You must be in a voice channel to use this command!');
        }

        if (!interaction.isChatInputCommand())
            return;

        const voiceChannel = invoker.voice.channel;
        const excludedUserId = interaction.options.getString('exclude')?.trim();

        const includedMembers = Array.from(voiceChannel.members.values())
            .filter(member => member.id !== excludedUserId && filterCallback(member as GuildMember, invoker)) as GuildMember[];

        if (includedMembers.length < 2) {
            return await interaction.reply('Cannot execute this command - not enough participants!');
        }

        const randomMember = includedMembers[rollDice(includedMembers.length) - 1];
        await interaction.reply(randomMember.displayName || randomMember.user.username);
    }
}