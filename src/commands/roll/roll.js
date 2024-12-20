const { processRoll } = require('../../business-logic/dice/services/DiceRollingService');
const {createRollDiceCommand} = require("../../business-logic/utils/commandBuilders/createRollDiceCommand");

module.exports = {
    data: createRollDiceCommand('roll', 'Roll any dice'),
    async execute(interaction) {
        const input = interaction.options.getString('expression');

        const output = processRoll(input);
    
        await interaction.reply(output);
    },
};