import {SlashCommandBuilder, CommandInteraction} from 'discord.js';
import {Command} from '../../types/types';
import {UniqueValuesRoller} from "../../business-logic/unique/UniqueValuesRoller";

const unique: Command = {
    data: new SlashCommandBuilder()
        .setName('unique')
        .setDescription('Roll dice with unique values only')
        .addNumberOption(option =>
            option.setName('count')
                .setDescription('Number of dice to roll')
                .setMinValue(1)
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('size')
                .setDescription('Size of dice')
                .setMinValue(1)
                .setRequired(true)),
    async execute(interaction: CommandInteraction) {
        await UniqueValuesRoller.executeFromInteraction(interaction);
    }
};

export default unique;