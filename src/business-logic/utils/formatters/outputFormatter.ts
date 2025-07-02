import {AttachmentBuilder} from 'discord.js';
import {config} from "../../../../config";
import {DiceExpression} from "../../dice/models/DiceExpression";
import {ParserResult} from "../../dice/models/ParserResult";
import {FilterType, ParserResultsFilter} from "../../dice/models/ParserResultsFilter";

const {MAX_DISCORD_MESSAGE_LENGTH} = config;

function wrapInMarkdown(output: string, isCoveredBySpoiler: boolean): string {
    if (isCoveredBySpoiler)
        return `||\`\`\`Markdown\n${output.trim()}\`\`\`||`;
    return `\`\`\`Markdown\n${output.trim()}\`\`\``;
}

function toFixed(value: number, precision: number = 0) {
    const power = Math.pow(10, precision);
    return String(Math.round(value * power) / power);
}

/**
 * Formats the output of processed dice roll expressions
 */
export function outputFormatter(
    processedExpressions: Array<{ expression: DiceExpression; results: (ParserResult | { error: string })[] }>,
    isCoveredBySpoiler: boolean = false
): string | { content: string; files: AttachmentBuilder[] } {
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
                            .map(v => toFixed(v, 3))
                            .join('; '));
            } else {
                finalResults.push(toFixed(filteredResult as number, 3));
            }
        } else if (totalSums.length > 0) {
            finalResults.push(totalSums.map(sum => toFixed(sum, 3)).join('; '));
        }

        errors.forEach(error => {
            finalResults.push(error);
        });

        expressionsList +=
            `\nExpression` +
            `${processedExpressions.length === 1 ? '' : index + 1}` +
            `${expr.repeat > 1 ? ' x' + expr.repeat : ''}` +
            `: ${expr.expressionToParser}` +
            `${expr.filter ? ` [filter: ${getFilterDescription(expr.filter)}]` : ''}`;
    });

    const totalSums = '# ' + finalResults.join('; ');
    const output = totalSums + expressionsList + rollsList;
    const wrappedOutput = wrapInMarkdown(output, isCoveredBySpoiler);

    if (wrappedOutput.length > MAX_DISCORD_MESSAGE_LENGTH) {
        const buffer = Buffer.from(output, 'utf8');
        const attachment = new AttachmentBuilder(buffer, {name: 'detailed.txt'});
        const content = wrapInMarkdown(totalSums + expressionsList, isCoveredBySpoiler);

        return {
            content: content.length > MAX_DISCORD_MESSAGE_LENGTH ? '`See detailed attachment`' : content,
            files: [attachment]
        };
    } else {
        return wrappedOutput;
    }
}

/**
 * Creates a text description of the filter for output
 */
function getFilterDescription(filter: ParserResultsFilter): string {
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

    return `${typeDesc}${filter.referenceValue ? ` ${comparerDesc} ${filter.referenceValue}` : ''}`;
}