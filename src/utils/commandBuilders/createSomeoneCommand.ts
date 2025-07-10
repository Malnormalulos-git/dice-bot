import {SlashCommandBuilder, SlashCommandOptionsOnlyBuilder} from 'discord.js';
import {config} from "../../../config";

export function createSomeoneCommand(name: string, description: string): SlashCommandOptionsOnlyBuilder {
    return new SlashCommandBuilder()
        .setName(name)
        .setDescription(description)
        .addBooleanOption(option =>
            option
                .setName('exclude')
                .setDescription('Provides you selector to exclude specific users from the sample')
        )
        .addNumberOption(option =>
            option
                .setName('repeat')
                .setDescription('Repeats the command the entered number of times')
                .setMinValue(1)
                .setMaxValue(config.MAX_SOMEONE_REPETITIONS)
        );
}