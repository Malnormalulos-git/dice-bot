const { SlashCommandBuilder } = require('discord.js');
const { execute } = require('./roll.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('r')
        .setDescription('Roll dice (shortened version)')
        .addStringOption(option =>
            option
                .setName('expression')
                .setDescription('Dice expression (e.g. 2d6+5)')
                .setRequired(true)),
    execute: execute 
};