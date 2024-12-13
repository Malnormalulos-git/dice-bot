const { SlashCommandBuilder } = require('discord.js');
const { execute } = require('./coin.js');
const { rollDice } = require("../../business-logic/dice/services/diceRoller");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coin-with-edge')
        .setDescription('Toss a coin! (1/1000 chance of edge)'),
    async execute(interaction) {
        const result = rollDice(1000);

        if (result === 1000) {
            await interaction.reply({
                content: `||\`Edge \`||`,
                files: ['.\\assets\\roll\\coin\\edge.gif']
            });
        }
        else {
            await execute(interaction);
        }
    },
};