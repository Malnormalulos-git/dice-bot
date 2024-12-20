const { SlashCommandBuilder } = require('discord.js');
const { RandomMemberSelector } = require("../../business-logic/randomMember/RandomMemberSelector");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('someone-except-me')
        .setDescription('Chooses one random participant from voice channel except you')
        .addStringOption(option => option
            .setName('exclude')
            .setDescription('Exclude specific users from the sample')
            .setAutocomplete(true)
        ),

    async autocomplete(interaction) {
        await RandomMemberSelector.handleAutocomplete(
            interaction,
            (choice, invoker) => choice.value !== invoker.id
        );
    },

    async execute(interaction) {
        await RandomMemberSelector.execute(
            interaction,
            (member, invoker) => member.id !== invoker.id
        );
    }
};