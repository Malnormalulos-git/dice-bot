import {SlashCommandBuilder, CommandInteraction} from 'discord.js';
import {Command} from '../../types/types';
import CoinTosser from "../../business-logic/coin/CoinTosser";

const coin: Command = {
    data: new SlashCommandBuilder()
        .setName('coin')
        .setDescription('Toss a coin!'),
    async execute(interaction: CommandInteraction) {
        const result = CoinTosser.toss();

        await interaction.editReply({
            content: result.result,
            files: [result.filePath]
        });
    }
};

export default coin;