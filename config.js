const { ActivityType } = require('discord.js');

const config = {
  MAX_DICE_COUNT: 5000,
  MAX_DICE_SIDES: 5000,
  MAX_DISCORD_MESSAGE_LENGTH: 1900,
  MAX_EXPRESSION_LENGTH: 100,
  ROLL_KEYWORD_SYNONYMS: ['д'],
  BOT_STATUS: 'dnd',
  BOT_ACTIVITY: {
    name: 'Frustrated by a critical failure 🎲😤',
    type: ActivityType.Custom
  }
};

module.exports = config;