const { SlashCommandBuilder } = require('discord.js');
const { rollDice } = require('../../business-logic/dice/services/diceRoller');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('someone')
        .setDescription('Chooses one random participant from voice channel')
        .addStringOption(option => option
            .setName('exclude')
            .setDescription('Exclude specific users from the sample')
            .setAutocomplete(true)
        ),
    async autocomplete(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return await interaction.respond([]);
        }

        const members = Array.from(voiceChannel.members.values());
        const focusedValue = interaction.options.getFocused().toLowerCase();

        const choices = members
            .map(member => ({
                name: member.displayName || member.user.username,
                value: member.user.id
            }))
            .filter(choice => choice.name.toLowerCase().includes(focusedValue));

        await interaction.respond(choices);
    },
    async execute(interaction) {
        const invoker = interaction.member;
        if (!invoker.voice.channel) {
            return await interaction.reply('You must be in a voice channel to use this command!');
        }

        const voiceChannel = invoker.voice.channel;
        const excludedUserIds = interaction.options.getString('exclude')
            ? interaction.options.getString('exclude').split(',').map(name => name.trim())
            : [];

        // Get included members and exclude specified users
        const includedMembers = Array.from(voiceChannel.members.values())
            .filter(member => !excludedUserIds.includes(member.user.id));

        // Validate exclusion to ensure at least 2 included members remain
        if (includedMembers.length < 2) {
            return await interaction.reply('Cannot exclude users - not enough participants remain!');
        }

        const randomMember = includedMembers[rollDice(includedMembers.length) - 1];

        const excludedNames = excludedUserIds.length > 0
            ? Array.from(voiceChannel.members.values())
                .filter(member => excludedUserIds.includes(member.user.id))
                .map(member => member.displayName || member.user.username)
                .join(', ')
            : 'None';

        await interaction.reply(
            `Randomly selected: ${randomMember.displayName || randomMember.user.username}\n` +
            `Excluded users: ${excludedNames}`
        );
    },
};