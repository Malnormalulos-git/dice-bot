const { rawExpressionFormatter } = require("../../utils/formatters/rawExpressionFormatter");
const { outputFormatter } = require("../../utils/formatters/outputFormatter");
const { DiceExpressionParser } = require("../parser/DiceExpressionParser");
const { rollDice } = require("./diceRoller");


/**
* Processes a dice roll expression/s and returns formatted output
* @param {string} input Raw dice expression/s input
* @returns {string | AttachmentBuilder} Formatted string result of dice rolls
*/
function processRoll (input)  {
    const expressions = rawExpressionFormatter(input).split(';');

    const parser = new DiceExpressionParser(rollDice);

    const results = expressions.map((expression) => parser.parse(expression));
    return outputFormatter(expressions, results);
}

module.exports = { processRoll };