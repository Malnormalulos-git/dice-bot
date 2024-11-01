const { AttachmentBuilder } = require('discord.js');

function formatOutput(result, expression) {
  let output = `# ${result.totalSum}\n`;
  output += `Expression: ${expression}\n`;

  result.rollOutputs.forEach(roll => {
    output += roll.text;
  });

  return `\`\`\`Markdown\n${output.trim()}\`\`\``;
}

function formatLongOutput(result, expression) {
  let summaryOutput = `# ${result.totalSum}\n`;
  summaryOutput += `Expression: ${expression}\n\n`;
  summaryOutput += `Results too long to display. See attached file for details.\nSummary:\n`;

  for (const roll of result.rollOutputs) {
    summaryOutput += `${roll.dice} = ${roll.sum}\n`;
  }

  let detailedOutput = `# ${result.totalSum}\n`;
  detailedOutput += `Expression: ${expression}\n`;
  
  result.rollOutputs.forEach(roll => {
    detailedOutput += roll.text;
  });

  const buffer = Buffer.from(detailedOutput, 'utf8');
  const attachment = new AttachmentBuilder(buffer, { name: 'output.txt' });

  return {
    content: `\`\`\`Markdown\n${summaryOutput.trim()}\`\`\``,
    files: [attachment]
  };
}

module.exports = { formatOutput, formatLongOutput };