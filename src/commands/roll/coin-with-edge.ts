import {SlashCommandBuilder, ChatInputCommandInteraction} from 'discord.js';
import {Command} from '../../types/types';
import {config} from "../../../config";
import CoinTosser from "../../core/coin/CoinTosser";

const coinWithEdge: Command = {
    data: new SlashCommandBuilder()
        .setName('coin-with-edge')
        .setDescription(`Toss a coin! (1/${config.COIN_EDGE_CHANCE} chance of edge)`),
    async execute(interaction: ChatInputCommandInteraction) {
        await CoinTosser.executeFromInteraction(interaction, true);
    }
};

export default coinWithEdge;