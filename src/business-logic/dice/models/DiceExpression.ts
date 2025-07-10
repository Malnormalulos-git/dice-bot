import {config} from "../../../../config";
import {UserError} from "../../errors/UserError";
import {ParserResultsFilter} from "./ParserResultsFilter";

const {MAX_ROLL_REPETITIONS} = config;

export class DiceExpression {
    repeat: number;
    expressionToParser: string;
    originalExpression?: string;
    filter?: ParserResultsFilter | null;

    constructor({repeat, expressionToParser, originalExpression, filter}: DiceExpression) {
        this.repeat = repeat;
        this.expressionToParser = expressionToParser;
        this.originalExpression = originalExpression;
        this.filter = filter;
    }

    /**
     * Creates a DiceExpression from a raw expression string
     */
    static fromRawExpression(
        rawExpression: string,
        globalRepeat: number,
        filter: ParserResultsFilter | null
    ): DiceExpression {
        const match = rawExpression.match(/^(?:r(\d+):)(.+?)(?:\[(.+)?\])?$/);

        if (match) {
            const localRepeat = parseInt(match[1]);
            const timesToRepeat = localRepeat * globalRepeat;

            const expressionToParser = match[2];
            const localFilterExpression = match[3];

            let localFilter: ParserResultsFilter | null = null;
            if (localFilterExpression) {
                localFilter = ParserResultsFilter.fromExpression(localFilterExpression);
            }

            if (timesToRepeat > 0 && timesToRepeat <= MAX_ROLL_REPETITIONS) {
                return new DiceExpression({
                    repeat: timesToRepeat,
                    expressionToParser: expressionToParser,
                    originalExpression: rawExpression,
                    filter: localFilter || filter
                });
            } else if (timesToRepeat <= 0) {
                throw new UserError(`Cannot repeat ${rawExpression} ${timesToRepeat} times`);
            } else {
                throw new UserError(`Too much repetition (${timesToRepeat}). Maximum is ${MAX_ROLL_REPETITIONS}`);
            }
        }

        return new DiceExpression({
            repeat: globalRepeat,
            expressionToParser: rawExpression,
            originalExpression: rawExpression,
            filter: filter
        });
    }
}