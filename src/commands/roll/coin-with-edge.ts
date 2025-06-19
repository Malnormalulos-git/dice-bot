import {SlashCommandBuilder, CommandInteraction} from 'discord.js';
import {Command} from '../../types/types';
import {rollDice} from '../../business-logic/dice/services/diceRoller';
import coin from './coin';
import path from 'node:path';
import {fileURLToPath} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const coinWithEdge: Command = {
    data: new SlashCommandBuilder()
        .setName('coin-with-edge')
        .setDescription('Toss a coin! (1/1000 chance of edge)'),
    async execute(interaction: CommandInteraction) {
        const result = rollDice(1000);
        if (result === 1000) {
            const filePath = path.join(__dirname, '..', '..', '..', 'assets', 'roll', 'coin', 'edge.gif');
            await interaction.editReply({
                content: `||\`Edge\`||`,
                files: [filePath]
            });
        } else {
            await coin.execute(interaction);
        }
    }
};

export default coinWithEdge;