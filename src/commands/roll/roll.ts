import {CommandInteraction} from 'discord.js';
import {Command} from '../../types/types';
import {processRoll} from '../../business-logic/dice/services/DiceRollingService';
import {createRollDiceCommand} from "../../utils/commandBuilders/createRollDiceCommand";
import {ParserResultsFilter} from "../../business-logic/dice/models/ParserResultsFilter";
import {outputFormatter} from "../../business-logic/utils/formatters/outputFormatter";

export const roll: Command = {
    data: createRollDiceCommand('roll', 'Rolls your dice'),
    async execute(interaction: CommandInteraction) {
        if (!interaction.isChatInputCommand())
            return;

        const expression = interaction.options.getString('expression')!;
        const repeat = interaction.options.getNumber('repeat') || 1;
        const isCoveredBySpoiler = interaction.options.getBoolean('hide') || false;

        const filterExpression = interaction.options.getString('filter-by') || null;
        const filter =
            filterExpression ? ParserResultsFilter.fromExpression(filterExpression) : null;

        const processesRolls = processRoll(expression, repeat, filter);

        const output = outputFormatter(processesRolls, isCoveredBySpoiler);

        await interaction.editReply(output);
    }
};

export default roll;