const { ActivityType, PresenceUpdateStatus  } = require('discord.js');

const config = {
  MAX_DICE_COUNT: 5000,
  MAX_DICE_SIDES: 5000,
  MAX_DISCORD_MESSAGE_LENGTH: 1900,
  MAX_EXPRESSION_LENGTH: 100,
  ROLL_KEYWORD_SYNONYMS: ['dice', 'д', 'в'],                                       // will be replaced by 'd'
  HIGHEST_ROLL_KEYWORD_SYNONYMS: ['high', 'highest', 'best', 'b', 'кращій', 'к'],  // will be replaced by 'h'
  LOWEST_ROLL_KEYWORD_SYNONYMS: ['low', 'lowest', 'worst', 'w', 'гірший', 'г'],    // will be replaced by 'l'
  AVERAGE_ROLL_KEYWORD_SYNONYMS: ['avarage', 'середній', 'с'],                     // will be replaced by 'a'
  ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX: true,
  PARSE_BY_MESSAGE_PREFIX: '!',
  BOT_STATUS: PresenceUpdateStatus.DoNotDisturb,
  BOT_ACTIVITY: {
    name: 'Frustrated by a critical failure 🎲😤',
    type: ActivityType.Custom
  }
};

module.exports = config;