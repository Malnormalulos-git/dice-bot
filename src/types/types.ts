import {
    Client,
    Collection,
    SlashCommandBuilder,
    AutocompleteInteraction,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandsOnlyBuilder,
    ChatInputCommandInteraction
} from 'discord.js';

export interface Command {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

export interface Event {
    name: string;
    once?: boolean;
    execute: (...args: any[]) => Promise<void> | void;
}

export interface ClientWithCommands extends Client {
    commands: Collection<string, Command>;
}
