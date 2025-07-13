import {SlashCommandBuilder, CommandInteraction} from 'discord.js';
import {Command} from '../../types/types';
import CoinTosser from "../../business-logic/coin/CoinTosser";

const coin: Command = {
    data: new SlashCommandBuilder()
        .setName('coin')
        .setDescription('Toss a coin!'),
    async execute(interaction: CommandInteraction) {
        await CoinTosser.executeFromInteraction(interaction);
    }
};

export default coin;