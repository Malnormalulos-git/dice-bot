const { SlashCommandBuilder } = require('discord.js');
const { DiceExpressionParser } = require('./parser/DiceExpressionParser.js');
const { outputFormatter } = require('./formatters/outputFormatter');
const { ROLL_KEYWORD_SYNONYMS, HIGHEST_ROLL_KEYWORD_SYNONYMS, LOWEST_ROLL_KEYWORD_SYNONYMS, AVERAGE_ROLL_KEYWORD_SYNONYMS } = require('../../config.js');
const { rollDice } = require('./utils/diceRoller.js');

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
    let input = interaction.options.getString('expression')
      .toString()
      .replaceAll(' ', '')
      .toLowerCase();

    input = ROLL_KEYWORD_SYNONYMS.reduce(
      (str, synonym) => str.replaceAll(synonym, 'd'),
      input
    );
    
    input = HIGHEST_ROLL_KEYWORD_SYNONYMS.reduce(
      (str, synonym) => str.replaceAll(synonym, 'h'),
      input
    );
    
    input = LOWEST_ROLL_KEYWORD_SYNONYMS.reduce(
      (str, synonym) => str.replaceAll(synonym, 'l'),
      input
    );
    
    input = AVERAGE_ROLL_KEYWORD_SYNONYMS.reduce(
      (str, synonym) => str.replaceAll(synonym, 'a'),
      input
    );

    const expressions = input.split(';');

    const parser = new DiceExpressionParser(rollDice);
    const results = expressions.map((expression) => parser.parse(expression));

    const output = outputFormatter(expressions, results);

    await interaction.reply(output);
  },
};