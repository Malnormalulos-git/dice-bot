import {AttachmentBuilder} from 'discord.js';
import {config} from "../../../../config";
import {DiceExpression} from "../../dice/models/DiceExpression";
import {ParserResult} from "../../dice/models/ParserResult";

const {MAX_DISCORD_MESSAGE_LENGTH} = config;

function wrapInMarkdown(output: string, isCoveredBySpoiler: boolean): string {
    if (isCoveredBySpoiler)
        return `||\`\`\`Markdown\n${output.trim()}\`\`\`||`;
    return `\`\`\`Markdown\n${output.trim()}\`\`\``;
}

/**
 * Formats the output of processed dice roll expressions
 */
export function outputFormatter(
    expressions: DiceExpression[],
    results: (ParserResult | { error: string })[],
    isCoveredBySpoiler: boolean
): string | { content: string; files: AttachmentBuilder[] } {
    const totalSums = '# ' + results.map(result => ('error' in result ? result.error : result.totalSum)).join('; ');
    let expressionsList = '';
    let rollsList = '\n\n';

    expressions.forEach((expr, index) => {
        expressionsList +=
            `\nExpression` +
            `${expressions.length === 1 ? '' : index + 1}` +
            `${expr.repeat > 1 ? ' x' + expr.repeat : ''}` +
            `: ${expr.expressionToParser}`;
    });

    results.forEach(result => {
        if (!('error' in result)) {
            result.rollOutputs.forEach(roll => {
                rollsList += roll.toString() + '\n';
            });
        }
    });

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