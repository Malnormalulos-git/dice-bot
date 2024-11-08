const { SlashCommandBuilder } = require('discord.js');
const { DiceRollingService } = require('../../business-logic/dice/services/DiceRollingService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Roll any dice')
    .addStringOption(option => option
      .setName('expression')
      .setDescription('Dice expression (e.g. 2d6, d20)')
      .setRequired(true)
    ),
  async execute(interaction) {
    const input = interaction.options.getString('expression');

    const diceRollingService = new DiceRollingService();
    const output = diceRollingService.processRoll(input);
    
    await interaction.reply(output);
  },
};