import {CommandInteraction} from 'discord.js';
import {Command} from '../../types/types';
import {processRoll} from '../../business-logic/dice/services/DiceRollingService';
import {createRollDiceCommand} from "../../business-logic/utils/commandBuilders/createRollDiceCommand";
import {ParserResultsFilter} from "../../business-logic/dice/models/ParserResultsFilter";

export const roll: Command = {
    data: createRollDiceCommand('roll', 'Rolls your dice'),
    async execute(interaction: CommandInteraction) {
        if (!interaction.isChatInputCommand())
            return;

        const expression = interaction.options.getString('expression')!;
        const repeat = interaction.options.getNumber('repeat') || 1;
        const isCoveredBySpoiler = interaction.options.getBoolean('cover-up-with-spoiler') || false;

        const filterExpression = interaction.options.getString('filter-by') || null;
        const filter =
            filterExpression ? ParserResultsFilter.fromExpression(filterExpression) : null;

        const output = processRoll(expression, repeat, isCoveredBySpoiler, filter);

        await interaction.editReply(output);
    }
};

export default roll;