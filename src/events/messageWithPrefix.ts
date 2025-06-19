import {Events, Message} from 'discord.js';
import {Event} from '../types/types';
import {processRoll} from '../business-logic/dice/services/DiceRollingService';
import {config} from "../../config";

const messageWithPrefix: Event = {
    name: Events.MessageCreate,
    async execute(message: Message) {
        if (config.ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX &&
            message.content.startsWith(config.PARSE_BY_MESSAGE_PREFIX)) {
            const input = message.content.slice(config.PARSE_BY_MESSAGE_PREFIX.length).trim();

            const msgRef = await message.reply('```Markdown\n*rolling dice for you❤*```');

            const output = processRoll(input);

            await msgRef.edit(output);
        }
    }
};

export default messageWithPrefix;