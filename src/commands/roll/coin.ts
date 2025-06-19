import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { Command } from '../../types/types';
import { rollDice } from '../../business-logic/dice/services/diceRoller';
import path from 'node:path';
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const coin: Command = {
    data: new SlashCommandBuilder()
        .setName('coin')
        .setDescription('Toss a coin!'),
    async execute(interaction: CommandInteraction) {
        const result = rollDice(2);
        const filePath = path.join(__dirname, '..', '..', '..', 'assets', 'roll', 'coin',
            result === 1 ? 'heads.gif' : 'tails.gif');
        await interaction.reply({
            content: `||\`${result === 1 ? 'Heads' : 'Tails'}\`||`,
            files: [filePath]
        });
    }
};

export default coin;