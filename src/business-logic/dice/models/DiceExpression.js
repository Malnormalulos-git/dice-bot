const { MAX_REPEATINGS } = require('../../../../config');
const { UserError } = require("../../errors/UserError");

class DiceExpression {
    /**
     * @param {Object} params Parameters for creating a DiceExpression
     * @param {number} params.repeat Number of times to repeat the expression
     * @param {string} params.expressionToParser The processed expression string
     */
    constructor({ repeat, expressionToParser }) {
        this.repeat = repeat;
        this.expressionToParser = expressionToParser;
    }

    /**
     * Creates a DiceExpression from a raw expression string
     * @param {string} rawExpression The raw expression string to parse
     * @param {number} defaultRepeat Number of repeats
     * @returns {DiceExpression} A new DiceExpression instance
     */
    static fromRawExpression(rawExpression, defaultRepeat) {
        const match = rawExpression.match(/^r(\d+):(.+)$/);

        if (match) {
            const timesToRepeat = parseInt(match[1]) * defaultRepeat;

            if (timesToRepeat > 0 && timesToRepeat < MAX_REPEATINGS) {
                return new DiceExpression({
                    repeat: timesToRepeat,
                    expressionToParser: match[2],
                    originalExpression: rawExpression
                });
            } else if (timesToRepeat <= 0) {
                throw new UserError(`Cannot repeat ${rawExpression} ${timesToRepeat} times`);
            } else {
                throw new UserError(`Too much repetition (${timesToRepeat}). Maximum is ${MAX_REPEATINGS}`);
            }
        }

        return new DiceExpression({
            repeat: defaultRepeat,
            expressionToParser: rawExpression,
            originalExpression: rawExpression
        });
    }
}

module.exports = { DiceExpression };