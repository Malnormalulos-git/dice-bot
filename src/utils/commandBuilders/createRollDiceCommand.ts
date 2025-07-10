import {SlashCommandBuilder, SlashCommandOptionsOnlyBuilder} from 'discord.js';
import {config} from '../../../config';

const {MAX_ROLL_REPETITIONS} = config;

export function createRollDiceCommand(name: string, description: string): SlashCommandOptionsOnlyBuilder {
    return new SlashCommandBuilder()
        .setName(name)
        .setDescription(description)
        .addStringOption(option =>
            option
                .setName('expression')
                .setDescription('Dice expression (e.g. 2d6, d20)')
                .setRequired(true)
        )
        .addNumberOption(option =>
            option
                .setName('repeat')
                .setDescription('Repeats expression roll the entered number of times')
                .setMinValue(1)
                .setMaxValue(MAX_ROLL_REPETITIONS)
        )
        .addStringOption(option =>
            option
                .setName('filter-by')
                .setDescription('Filters results by predicate and value (e.g. >10c, <=7s)')
        )
        .addBooleanOption(option =>
            option
                .setName('hide')
                .setDescription('Wraps the result with spoiler')
        );
}