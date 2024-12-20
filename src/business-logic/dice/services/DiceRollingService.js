const { rawExpressionFormatter } = require("../../utils/formatters/rawExpressionFormatter");
const { outputFormatter } = require("../../utils/formatters/outputFormatter");
const { DiceExpressionParser } = require("../parser/DiceExpressionParser");
const { rollDice } = require("./diceRoller");
const { AttachmentBuilder } = require('discord.js');
const { DiceExpression } = require("../models/DiceExpression");
const { UserError } = require("../../errors/UserError");


/**
 * Processes a dice roll expression/s and returns formatted output
 * @param {string} input Raw dice expression/s input
 * @param {number} globalRepeat Number of times the expression is repeated
 * @returns {string | AttachmentBuilder} Formatted string result of dice rolls
 */
function processRoll(input, globalRepeat = 1) {
    const rawExpressions = rawExpressionFormatter(input).split(';');
    const parser = new DiceExpressionParser(rollDice);

    const allResults = [];

    const diceExpressions = rawExpressions.map(rawExpression => {
        let diceExpression;
        try {
            diceExpression = DiceExpression.fromRawExpression(rawExpression, globalRepeat);

            for (let i = 0; i < diceExpression.repeat; i++) {
                allResults.push(parser.parse(diceExpression.expressionToParser));
            }
        } catch (error) {
            let errorMessage = '';

            if (error instanceof UserError) {
                errorMessage = error.toString();
            } else {
                console.error(`Unhandled error while parsing "${rawExpression}":`, error);
                errorMessage = `Congrats! You occurred unhandled error with your "${rawExpression}"!`;
            }

            diceExpression = new DiceExpression({
                repeat: 0,
                expressionToParser: rawExpression
            });

            allResults.push({ error: errorMessage });
        }
        return diceExpression;
    });

    return outputFormatter(diceExpressions, allResults);
}

module.exports = { processRoll };