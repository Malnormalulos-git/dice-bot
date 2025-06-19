import {CommandInteraction} from 'discord.js';
import {Command} from '../../types/types';
import {processRoll} from '../../business-logic/dice/services/DiceRollingService';
import {createRollDiceCommand} from "../../business-logic/utils/commandBuilders/createRollDiceCommand";

export const roll: Command = {
    data: createRollDiceCommand('roll', 'Rolls your dice'),
    async execute(interaction: CommandInteraction) {
        if (!interaction.isChatInputCommand())
            return;

        const expression = interaction.options.getString('expression')!;
        const repeat = interaction.options.getNumber('repeat') || 1;

        const output = processRoll(expression, repeat);

        await interaction.editReply(output);
    }
};

export default roll;