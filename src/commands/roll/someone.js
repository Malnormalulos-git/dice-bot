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

        const focused = interaction.options.getFocused().toLowerCase().trim();

        const choices = members
            .map(member => ({
                name: member.displayName || member.user.username,
                value: member.id
            }))
            .filter(choice =>
                choice.name.toLowerCase().includes(focused)
            );

        choices.length > 2
        ? await interaction.respond(choices)
        : await interaction.respond([]);
    },
    async execute(interaction) {
        const invoker = interaction.member;
        if (!invoker.voice.channel) {
            return await interaction.reply('You must be in a voice channel to use this command!');
        }

        const voiceChannel = invoker.voice.channel;
        const excludedUserId = interaction.options.getString('exclude').trim();

        const includedMembers = Array.from(voiceChannel.members.values())
            .filter(member => member.id !== excludedUserId);

        if (includedMembers.length < 2) {
            return await interaction.reply('Cannot execute this command - not enough participants!');
        }

        const randomMember = includedMembers[rollDice(includedMembers.length) - 1];

        await interaction.reply(
            `Randomly selected: ${randomMember.displayName || randomMember.user.username}`
        );
    },
};