import {SlashCommandBuilder, ChatInputCommandInteraction} from 'discord.js';
import {Command} from '../../types/types';
import CoinTosser from "../../core/coin/CoinTosser";

const coin: Command = {
    data: new SlashCommandBuilder()
        .setName('coin')
        .setDescription('Toss a coin!'),
    async execute(interaction: ChatInputCommandInteraction) {
        await CoinTosser.executeFromInteraction(interaction);
    }
};

export default coin;