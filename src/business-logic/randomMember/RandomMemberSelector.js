const { rollDice } = require("../dice/services/diceRoller");


class RandomMemberSelector {
    /**
     * Handles autocomplete interaction for member selection
     * @param interaction - Discord autocomplete interaction
     * @param filterCallback - Optional callback to filter autocomplete choices
     * @returns Promise that resolves when autocomplete response is sent
     */
    static async handleAutocomplete(interaction, filterCallback = () => true) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return await interaction.respond([]);
        }

        const members = Array.from(voiceChannel.members.values());
        const focused = interaction.options.getFocused().toLowerCase().trim();

        const choices = members
            .map(member => ({
                name: member.displayName || member.user.username,
                value: member.id
            }))
            .filter(choice =>
                choice.name.toLowerCase().includes(focused) &&
                filterCallback(choice, interaction.member)
            );

        await interaction.respond(choices.length > 2 ? choices : []);
    }

    /**
     * Executes the random member selection
     * @param interaction - Discord command interaction
     * @param filterCallback - Lambda to filter included members to member sample
     * @returns Promise that resolves when selection response is sent
     */
    static async execute(interaction, filterCallback = () => true) {

        const invoker = interaction.member;
        if (!invoker.voice.channel) {
            return await interaction.reply('You must be in a voice channel to use this command!');
        }

        const voiceChannel = invoker.voice.channel;
        const excludedUserId = interaction.options.getString('exclude')?.trim();

        const includedMembers = Array.from(voiceChannel.members.values())
            .filter(member =>
                member.id !== excludedUserId &&
                filterCallback(member, invoker)
            );

        if (includedMembers.length < 2) {
            return await interaction.reply('Cannot execute this command - not enough participants!');
        }

        const randomMember = includedMembers[rollDice(includedMembers.length) - 1];
        await interaction.reply(
            randomMember.displayName || randomMember.user.username
        );
    }
}

module.exports = { RandomMemberSelector };