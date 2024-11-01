const { SlashCommandBuilder } = require('discord.js');
const { parseExpression } = require('./parser/expressionParser');
const { formatOutput, formatLongOutput } = require('./formatters/outputFormatter');
const { ROLL_KEYWORD_SYNONYMS, MAX_DISCORD_MESSAGE_LENGTH } = require('../../config.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Roll any dice/dices')
    .addStringOption(option => option
      .setName('expression')
      .setDescription('Dice expression (e.g. 2d6, d20)')
      .setRequired(true)
    ),
  async execute(interaction) {
    let expression = interaction.options.getString('expression')
      .toString()
      .replaceAll(' ', '')
      .toLocaleLowerCase();
      
    for (const synonym of ROLL_KEYWORD_SYNONYMS) {
      expression = expression.replaceAll(synonym, 'd');
    }

    const result = parseExpression(expression);

    if (result.error) {
      await interaction.reply(`\`\`\`diff\n- Error: ${result.error}\`\`\``);
      return;
    } 
    else if (result.totalLength > MAX_DISCORD_MESSAGE_LENGTH) {
      await interaction.reply(formatLongOutput(result, expression));
    } 
    else {
      await interaction.reply(formatOutput(result, expression));
    }
  },
};