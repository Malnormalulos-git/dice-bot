const { processRoll } = require('../../business-logic/dice/services/DiceRollingService');
const { createRollDiceCommand } = require("../../business-logic/utils/commandBuilders/createRollDiceCommand");

module.exports = {
    data: createRollDiceCommand('roll', 'Roll any dice'),
    async execute(interaction) {
        const expression = interaction.options.getString('expression');
        const repeat = interaction.options.getNumber('repeat') || 1;

        const output = processRoll(expression, repeat);
    
        await interaction.reply(output);
    },
};