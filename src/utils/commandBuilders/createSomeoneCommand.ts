import {SlashCommandBuilder, SlashCommandOptionsOnlyBuilder} from 'discord.js';

export function createSomeoneCommand(name: string, description: string): SlashCommandOptionsOnlyBuilder {
    return new SlashCommandBuilder()
        .setName(name)
        .setDescription(description)
        .addBooleanOption(option =>
            option
                .setName('exclude')
                .setDescription('Provides you selector to exclude specific users from the sample')
        )
}