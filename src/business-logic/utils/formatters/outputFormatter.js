const { AttachmentBuilder } = require('discord.js');
const { MAX_DISCORD_MESSAGE_LENGTH } = require('../../../../config');

/**
 * Formats the output of processed dice roll expressions
 * @param {DiceExpression[]} expressions Array of expressions
 * @param {(ParserResult | { error: string })[]} results Array of processed expressions
 * @returns {string | AttachmentBuilder} Formatted output of dice roll expressions
 */
function outputFormatter(expressions, results) {
    const totalSums = '# ' + results.map(result => result.error || result.totalSum).join('; ');
    let expressionsList = '';
    let rollsList = '\n\n';

    expressions.forEach((expr, index) => {
        expressionsList += `\nExpression` +
            `${expressions.length === 1 
                ? '' 
                : (index + 1)}` +
            `${expr.repeat > 1 
                ? ' x' + expr.repeat 
                : ''}` +
            `: ${expr.expressionToParser}`;
    });

    results.forEach((result) => {
        if (!result.error) {
            result.rollOutputs.forEach(roll => {
                rollsList += roll.toString();
            });
            rollsList += '\n';
        }
    });

    const output = totalSums + expressionsList + rollsList;

    if (output.length + '```Markdown\n```'.length > MAX_DISCORD_MESSAGE_LENGTH) {
        const buffer = Buffer.from(output, 'utf8');
        const attachment = new AttachmentBuilder(buffer, { name: 'detailed.txt' });

        const content = `\`\`\`Markdown\n${(totalSums + expressionsList).trim()}\`\`\``;

        return {
            content: content.length > MAX_DISCORD_MESSAGE_LENGTH ? 'See detailed attachment' : content,
            files: [attachment]
        };
    } else {
        return `\`\`\`Markdown\n${output.trim()}\`\`\``;
    }
}

module.exports = { outputFormatter };