import {DiceExpressionParser} from "../parser/DiceExpressionParser";
import {DiceExpression} from '../models/DiceExpression';
import {ParserResult} from "../models/ParserResult";
import {rawExpressionFormatter} from "../../utils/formatters/rawExpressionFormatter";
import {rollDice} from "./diceRoller";
import {UserError} from "../../errors/UserError";
import {ParserResultsFilter} from "../models/ParserResultsFilter";

/**
 * Processes a die roll expression/s and returns formatted output
 */
export function processRoll(
    input: string,
    globalRepeat: number = 1,
    globalFilter: ParserResultsFilter | null = null
): Array<{
    expression: DiceExpression;
    results: (ParserResult | { error: string })[];
}> {
    const rawExpressions = rawExpressionFormatter(input).split(';');
    const parser = new DiceExpressionParser(rollDice);

    const processedExpressions: Array<{
        expression: DiceExpression;
        results: (ParserResult | { error: string })[];
    }> = [];

    for (const rawExpression of rawExpressions) {
        let diceExpression: DiceExpression;
        const results: (ParserResult | { error: string })[] = [];

        try {
            diceExpression = DiceExpression.fromRawExpression(rawExpression, globalRepeat, globalFilter);

            for (let i = 0; i < diceExpression.repeat; i++) {
                const result = parser.parse(diceExpression.expressionToParser);
                results.push(result);
            }
        } catch (error) {
            let errorMessage: string;

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

            results.push({error: errorMessage});
        }

        processedExpressions.push({
            expression: diceExpression,
            results: results
        });
    }

    return processedExpressions;
}