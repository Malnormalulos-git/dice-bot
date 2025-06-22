import {AttachmentBuilder} from 'discord.js';
import {DiceExpressionParser} from "../parser/DiceExpressionParser";
import {DiceExpression} from '../models/DiceExpression';
import {ParserResult} from "../models/ParserResult";
import {rawExpressionFormatter} from "../../utils/formatters/rawExpressionFormatter";
import {rollDice} from "./diceRoller";
import {UserError} from "../../errors/UserError";
import {outputFormatter} from "../../utils/formatters/outputFormatter";

/**
 * Processes a dice roll expression/s and returns formatted output
 */
export function processRoll(input: string, globalRepeat: number = 1, isCoveredBySpoiler: boolean = false): string | {
    content: string;
    files: AttachmentBuilder[]
} {
    const rawExpressions = rawExpressionFormatter(input).split(';');
    const parser = new DiceExpressionParser(rollDice);
    const allResults: (ParserResult | { error: string })[] = [];

    const diceExpressions: DiceExpression[] = rawExpressions.map((rawExpression) => {
        let diceExpression: DiceExpression;
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

            allResults.push({error: errorMessage});
        }
        return diceExpression;
    });

    return outputFormatter(diceExpressions, allResults, isCoveredBySpoiler);
}