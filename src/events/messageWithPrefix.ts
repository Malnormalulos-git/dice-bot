import {Events, Message} from 'discord.js';
import {Event} from '../types/types';
import {config} from "../../config";
import {RandomMemberSelector} from "../business-logic/randomMember/RandomMemberSelector";
import someoneExceptMe from "../commands/roll/someone-except-me";
import someone from "../commands/roll/someone";
import DiceRoller from "../business-logic/dice/DiceRoller";
import coinWithEdge from "../commands/roll/coin-with-edge";
import coin from "../commands/roll/coin";
import CoinTosser from "../business-logic/coin/CoinTosser";
import HelpHandler from "../business-logic/help/HelpHandler";
import help from "../commands/core/help";
import unique from "../commands/roll/unique";
import {UniqueValuesRoller} from "../business-logic/unique/UniqueValuesRoller";

const messageWithPrefix: Event = {
    name: Events.MessageCreate,
    async execute(message: Message) {
        if (!config.ENABLE_PARSING_BY_MESSAGE_WITH_PREFIX ||
            !message.content.startsWith(config.PARSE_BY_MESSAGE_PREFIX)) {
            return;
        }

        let input = message.content.slice(config.PARSE_BY_MESSAGE_PREFIX.length).trim().toLowerCase();

        function cropInputStart(length: number) {
            input = input.slice(length).trim();
        }

        if (input.startsWith(help.data.name)) {
            await HelpHandler.executeFromMessage(message);
            return;
        } else if (input.startsWith(someoneExceptMe.data.name)) {
            cropInputStart(someoneExceptMe.data.name.length);
            await RandomMemberSelector.executeFromMessage(
                message,
                input,
                (member, invoker) => member.id !== invoker.id
            );
            return;
        } else if (input.startsWith(someone.data.name)) {
            cropInputStart(someone.data.name.length);
            await RandomMemberSelector.executeFromMessage(message, input);
            return;
        } else if (input.startsWith(coinWithEdge.data.name)) {
            await CoinTosser.executeFromMessage(message, true);
            return;
        } else if (input.startsWith(coin.data.name)) {
            await CoinTosser.executeFromMessage(message);
            return;
        } else if (input.startsWith(unique.data.name)) {
            cropInputStart(unique.data.name.length);
            await UniqueValuesRoller.executeFromMessage(message, input);
            return;
        } else {
            await DiceRoller.executeFromMessage(message, input);
        }
    }
};

export default messageWithPrefix;