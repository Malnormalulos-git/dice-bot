import {ChatInputCommandInteraction, SlashCommandBuilder} from 'discord.js';
import {Command} from '../../types/types';
import HelpHandler from '../../core/help/HelpHandler';

const help: Command = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows information about Dice Rolling Bot commands'),
    async execute(interaction: ChatInputCommandInteraction) {
        await HelpHandler.executeFromInteraction(interaction);
    }
};

export default help;