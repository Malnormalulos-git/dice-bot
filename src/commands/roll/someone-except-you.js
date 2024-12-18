const { SlashCommandBuilder } = require('discord.js');
const { rollDice } = require('../../business-logic/dice/services/diceRoller');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('someone-except-you')
        .setDescription('Chooses one random participant from voice channel except you'),
    async execute(interaction) {
        const invoker = interaction.member;
        if (!invoker.voice.channel) {
            return await interaction.reply('You must be in a voice channel to use this command!');
        }

        const voiceChannel = invoker.voice.channel;

        const includedMembers = Array.from(voiceChannel.members.values())
            .filter(member => member.id !== invoker.id);

        if (includedMembers.length < 2) {
            return await interaction.reply('Cannot exclude users - not enough participants remain!');
        }

        const randomMember = includedMembers[rollDice(includedMembers.length) - 1];

        await interaction.reply(
            `Randomly selected: ${randomMember.displayName || randomMember.user.username}\n`
        );
    },
};