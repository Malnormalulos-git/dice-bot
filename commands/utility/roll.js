const { SlashCommandBuilder } = require('discord.js');
const { getRandomInt } = require('../../shared/getRandomInt');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll any dice/dices'),
	async execute(interaction) {
		await interaction.reply(getRandomInt(6).toString());
	},
};
