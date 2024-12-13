const { SlashCommandBuilder } = require('discord.js');
const { rollDice } = require('../../business-logic/dice/services/diceRoller');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coin')
        .setDescription('Toss a coin!'),
    async execute(interaction) {
        const result = rollDice(2);

        await interaction.reply({
            content: `||\`${result === 1 ? 'Heads' : 'Tails'}\`||`,
            files: [result === 1 ? '.\\assets\\roll\\coin\\heads.gif' : '.\\assets\\roll\\coin\\tails.gif']
        });
    },
};