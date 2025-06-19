import {config} from "../../../../config";
import {UserError} from "../../errors/UserError";

const {MAX_REPEATINGS} = config;

export class DiceExpression {
    repeat: number;
    expressionToParser: string;
    originalExpression?: string;

    constructor({repeat, expressionToParser, originalExpression}: DiceExpression) {
        this.repeat = repeat;
        this.expressionToParser = expressionToParser;
        this.originalExpression = originalExpression;
    }

    /**
     * Creates a DiceExpression from a raw expression string
     */
    static fromRawExpression(rawExpression: string, defaultRepeat: number): DiceExpression {
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