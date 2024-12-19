const { SlashCommandBuilder } = require('discord.js');
const { RandomMemberSelector } = require("../../business-logic/randomMember/RandomMemberSelector");

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
        await RandomMemberSelector.handleAutocomplete(interaction);
    },

    async execute(interaction) {
        await RandomMemberSelector.execute(interaction);
    }
};