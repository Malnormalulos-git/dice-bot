const { expressionFormatter } = require("../../utils/formatters/expressionFormatter");
const { outputFormatter } = require("../../utils/formatters/outputFormatter");
const { DiceExpressionParser } = require("../parser/DiceExpressionParser");
const { rollDice } = require("./diceRoller");


class DiceRollingService {
  constructor() {
    this.parser = new DiceExpressionParser(rollDice);
  }

  /**
   * Processes a dice roll expression and returns formatted output
   * @param {string} input - Raw dice expression input
   * @returns {string} Formatted result of dice rolls
   */
  processRoll(input) {
    const expressions = expressionFormatter(input).split(';');
    const results = expressions.map((expression) => this.parser.parse(expression));
    return outputFormatter(expressions, results);
  }
}

module.exports = { DiceRollingService };