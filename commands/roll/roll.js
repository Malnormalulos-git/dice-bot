const { SlashCommandBuilder } = require('discord.js');
const { parseExpression } = require('./parser/expressionParser');
const { outputFormatter } = require('./formatters/outputFormatter');
const { ROLL_KEYWORD_SYNONYMS } = require('../../config.js');

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
    const input = ROLL_KEYWORD_SYNONYMS.reduce(
      (str, synonym) => str.replaceAll(synonym, 'd'),
      interaction.options.getString('expression')
          .toString()
          .replaceAll(' ', '')
          .toLowerCase()
  );

    const expressions = input.split(';');

    const results = expressions.map((expression) => parseExpression(expression));

    const output = outputFormatter(expressions, results);

    await interaction.reply(output);
  },
};