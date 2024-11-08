const { rawExpressionFormatter } = require("../../utils/formatters/rawExpressionFormatter");
const { outputFormatter } = require("../../utils/formatters/outputFormatter");
const { DiceExpressionParser } = require("../parser/DiceExpressionParser");
const { rollDice } = require("./diceRoller");


class DiceRollingService {
  constructor() {
    this.parser = new DiceExpressionParser(rollDice);
  }

  /**
   * Processes a dice roll expression/s and returns formatted output
   * @param {string} input Raw dice expression/s input
   * @returns {string} Formatted string result of dice rolls
   */
  processRoll(input) {
    const expressions = rawExpressionFormatter(input).split(';');
    const results = expressions.map((expression) => this.parser.parse(expression));
    return outputFormatter(expressions, results);
  }
}

module.exports = { DiceRollingService };