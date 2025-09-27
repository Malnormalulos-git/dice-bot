import {FilterType, ParserResultsFilter} from "./models/ParserResultsFilter";
import {ChatInputCommandInteraction, Message} from "discord.js";
import {DiceExpression} from "./models/DiceExpression";
import {ParserResult} from "./models/ParserResult";
import {DiceExpressionParser} from "./parser/DiceExpressionParser";
import {randomNumber} from "../random/randomNumber";
import {UserError} from "../errors/UserError";
import {config} from "../../../config";
import toFixedWithRounding from "../utils/toFixedWithRounding";
import {handleLargeOutput, MessageOutput} from "../utils/outputFormatting";

const {
    ROLL_KEYWORD_SYNONYMS,
    HIGHEST_ROLL_KEYWORD_SYNONYMS,
    LOWEST_ROLL_KEYWORD_SYNONYMS,
    AVERAGE_ROLL_KEYWORD_SYNONYMS,
    EXPLODE_EXPRESSION_KEYWORD_SYNONYMS,
    REPEAT_EXPRESSION_KEYWORD_SYNONYMS
} = config;

export default class DiceRoller {
    /**
     * Processes a die roll expression/s and returns formatted output
     */
    private static processRoll(
        input: string,
        globalRepeat: number = 1,
        globalFilter: ParserResultsFilter | null = null
    ): Array<{
        expression: DiceExpression;
        results: (ParserResult | { error: string })[];
    }> {
        const rawExpressions = DiceRoller.rawExpressionFormatter(input).split(';');
        const parser = new DiceExpressionParser(randomNumber);

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

    /**
     * Execute from SlashCommand
     */
    static async executeFromInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
        const expression = interaction.options.getString('expression')!;
        const repeat = interaction.options.getNumber('repeat') || 1;
        const isCoveredBySpoiler = interaction.options.getBoolean('hide') || false;

        const filterExpression = interaction.options.getString('filter-by') || null;
        const filter =
            filterExpression ? ParserResultsFilter.fromExpression(filterExpression) : null;

        const processesRolls = DiceRoller.processRoll(expression, repeat, filter);

        const output = DiceRoller.outputFormatter(processesRolls, isCoveredBySpoiler);

        await interaction.editReply(output);
    }

    /**
     * Execute from Message
     */
    static async executeFromMessage(
        message: Message,
        input: string
    ): Promise<void> {
        const msgRef = await message.reply('```Markdown\n**Thinking...**```');

        const processesRolls = DiceRoller.processRoll(input);
        const output = DiceRoller.outputFormatter(processesRolls);

        await msgRef.edit(output);
    }

    /**
     * Processes a raw dice roll expression/s and returns lowercased output with substituted synonyms and without ' '
     */
    private static rawExpressionFormatter(rawExpression: string): string {
        let resultExpression = rawExpression.replaceAll(' ', '').toLowerCase();

        resultExpression = ROLL_KEYWORD_SYNONYMS.reduce(
            (str, synonym) => str.replaceAll(synonym, 'd'),
            resultExpression
        );

        resultExpression = HIGHEST_ROLL_KEYWORD_SYNONYMS.reduce(
            (str, synonym) => str.replaceAll(synonym, 'h'),
            resultExpression
        );

        resultExpression = LOWEST_ROLL_KEYWORD_SYNONYMS.reduce(
            (str, synonym) => str.replaceAll(synonym, 'l'),
            resultExpression
        );

        resultExpression = AVERAGE_ROLL_KEYWORD_SYNONYMS.reduce(
            (str, synonym) => str.replaceAll(synonym, 'a'),
            resultExpression
        );

        resultExpression = EXPLODE_EXPRESSION_KEYWORD_SYNONYMS.reduce(
            (str, synonym) => str.replaceAll(synonym, 'e'),
            resultExpression
        );

        resultExpression = REPEAT_EXPRESSION_KEYWORD_SYNONYMS.reduce(
            (str, synonym) => str.replaceAll(synonym, 'r'),
            resultExpression
        );

        return resultExpression;
    }

    /**
     * Formats the output of processed dice roll expressions
     */
    private static outputFormatter(
        processedExpressions: Array<{ expression: DiceExpression; results: (ParserResult | { error: string })[] }>,
        isCoveredBySpoiler: boolean = false
    ): string | MessageOutput {
        const finalResults: string[] = [];
        let expressionsList = '';
        let rollsList = '\n\n';

        processedExpressions.forEach((processedExpr, index) => {
            const {expression: expr, results: exprResults} = processedExpr;

            const totalSums: number[] = [];
            const errors: string[] = [];

            exprResults.forEach(result => {
                if ('error' in result) {
                    errors.push(result.error);
                } else {
                    totalSums.push(result.totalSum);

                    result.rollOutputs.forEach(roll => {
                        rollsList += roll.toString() + '\n';
                    });
                }
            });

            if (expr.filter && totalSums.length > 0) {
                const filteredResult = expr.filter.apply(totalSums);

                if (expr.filter.filterType === FilterType.display) {
                    const asArray = filteredResult as number[];

                    if (asArray.length > 0)
                        finalResults
                            .push((asArray)
                                .map(v => toFixedWithRounding(v, 3))
                                .join('; '));
                } else {
                    finalResults.push(toFixedWithRounding(filteredResult as number, 3).toString());
                }
            } else if (totalSums.length > 0) {
                finalResults.push(totalSums.map(sum => toFixedWithRounding(sum, 3)).join('; '));
            }

            errors.forEach(error => {
                finalResults.push(error);
            });

            expressionsList +=
                `\nExpression` +
                `${processedExpressions.length === 1 ? '' : index + 1}` +
                `${expr.repeat > 1 ? ' x' + expr.repeat : ''}` +
                `: ${expr.expressionToParser}` +
                `${expr.filter ? ` [filter: ${DiceRoller.getFilterDescription(expr.filter)}]` : ''}`;
        });

        const totalSums = '# ' + finalResults.join('; ');
        const fullOutput = totalSums + expressionsList + rollsList;
        const summaryOutput = totalSums + expressionsList;

        return handleLargeOutput(fullOutput, summaryOutput, isCoveredBySpoiler, 'detailed.txt');
    }

    /**
     * Creates a text description of the filter for output
     */
    private static getFilterDescription(filter: ParserResultsFilter): string {
        const comparerMap: Record<string, string> = {
            '<': 'less than',
            '<=': 'less or equal',
            '>': 'greater than',
            '>=': 'greater or equal',
            '=': 'equal'
        };

        const typeMap: Record<string, string> = {
            'display': 'show',
            's': 'sum',
            'c': 'count'
        };

        const comparerDesc = comparerMap[filter.filterCompairer] || filter.filterCompairer;
        const typeDesc = typeMap[filter.filterType] || filter.filterType;

        return `${typeDesc}${filter.referenceValue != null ? ` ${comparerDesc} ${filter.referenceValue}` : ''}`;
    }
}