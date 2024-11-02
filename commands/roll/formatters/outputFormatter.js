const { AttachmentBuilder } = require('discord.js');
const { MAX_DISCORD_MESSAGE_LENGTH } = require('../../../config.js');

function outputFormatter(expressions, results) {
  let totalSums = '# ';
  let expressionsList = '';
  let rollsList = '\n\n';

  for (let i = 0; i < expressions.length; i++) {
    const result = results[i];
    const expression = expressions[i];

    totalSums += `${result.error ? result.error : result.totalSum}${results.length === 1 ? '' : '; '}`;

    expressionsList += `\nExpression${results.length === 1 ? '' : i + 1}: ${expression ? expression : result.error}`;

    if (!result.error){
      result.rollOutputs.forEach(roll => {
        rollsList += roll.toString();
      });
      rollsList += '\n';
    }
  }

  const output = totalSums + expressionsList + rollsList;

  if (output.length + '\`\`\`Markdown\n\`\`\`'.length > MAX_DISCORD_MESSAGE_LENGTH) {
    const buffer = Buffer.from(output, 'utf8');
      const attachment = new AttachmentBuilder(buffer, { name: 'detailed.txt' });

      return {
        content: `\`\`\`Markdown\n${(totalSums + expressionsList).trim()}\`\`\``,
        files: [attachment]
      };
  }
  else {
    return `\`\`\`Markdown\n${output.trim()}\`\`\``;
  }
}

module.exports = { outputFormatter };