import {ChatInputCommandInteraction} from 'discord.js';
import {Command} from '../../types/types';
import {createRollDiceCommand} from "../../utils/commandBuilders/createRollDiceCommand";
import DiceRoller from "../../core/dice/DiceRoller";

export const roll: Command = {
    data: createRollDiceCommand('roll', 'Rolls your dice'),
    async execute(interaction: ChatInputCommandInteraction) {
        await DiceRoller.executeFromInteraction(interaction);
    }
};

export default roll;