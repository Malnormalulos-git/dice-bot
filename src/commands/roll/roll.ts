import {CommandInteraction} from 'discord.js';
import {Command} from '../../types/types';
import {createRollDiceCommand} from "../../utils/commandBuilders/createRollDiceCommand";
import DiceRoller from "../../business-logic/dice/DiceRoller";

export const roll: Command = {
    data: createRollDiceCommand('roll', 'Rolls your dice'),
    async execute(interaction: CommandInteraction) {
        await DiceRoller.executeFromInteraction(interaction);
    }
};

export default roll;