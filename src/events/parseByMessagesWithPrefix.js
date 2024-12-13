const { Events } = require('discord.js');
const { DiceRollingService } = require('../business-logic/dice/services/DiceRollingService.js');
const { ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX, PARSE_BY_MESSAGE_PREFIX } = require('../../config');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX && message.content.startsWith(PARSE_BY_MESSAGE_PREFIX)) {
            const input = message.content.slice(PARSE_BY_MESSAGE_PREFIX.length).trim();

            const diceRollingService = new DiceRollingService();
            const output = diceRollingService.processRoll(input);

            await message.reply(output);
        }
    }
};