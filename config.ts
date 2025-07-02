import {ActivityType, PresenceUpdateStatus} from 'discord.js';

export const config = {
    MAX_DICE_COUNT: 5000,
    MAX_DICE_SIDES: 5000,
    MAX_REPEATINGS: 1000,
    MAX_DISCORD_MESSAGE_LENGTH: 1900,
    MAX_EXPRESSION_LENGTH: 100,
    ROLL_KEYWORD_SYNONYMS: ['dice', 'д', 'в', 'к'],                 // will be replaced by 'd'
    HIGHEST_ROLL_KEYWORD_SYNONYMS: ['high', 'highest', 'best', 'b'],// will be replaced by 'h'
    LOWEST_ROLL_KEYWORD_SYNONYMS: ['low', 'lowest', 'worst', 'w'],  // will be replaced by 'l'
    AVERAGE_ROLL_KEYWORD_SYNONYMS: ['average', 'a'],                // will be replaced by 'a'
    REPEAT_EXPRESSION_KEYWORD_SYNONYMS: ['repeat', 'п'],            // will be replaced by 'r'
    ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX: true,
    PARSE_BY_MESSAGE_PREFIX: '!',
    BOT_STATUS: PresenceUpdateStatus.DoNotDisturb,
    BOT_ACTIVITY: {
        name: 'Frustrated by a critical failure 🎲😤',
        type: ActivityType.Custom
    }
};