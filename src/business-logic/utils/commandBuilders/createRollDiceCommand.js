const { SlashCommandBuilder } = require('discord.js');

const createRollDiceCommand = (name, description) => {
    return new SlashCommandBuilder()
        .setName(name)
        .setDescription(description)
        .addStringOption(option => option
            .setName('expression')
            .setDescription('Dice expression (e.g. 2d6, d20)')
            .setRequired(true)
        )
        .addNumberOption(option => option
            .setName('repeat')
            .setDescription('Repeats expression roll the entered number of times')
            .setMinValue(1)
        )
};

module.exports = { createRollDiceCommand };