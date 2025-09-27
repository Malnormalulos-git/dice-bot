import {fileURLToPath} from "node:url";
import path from "node:path";
import {randomNumber} from "../random/randomNumber";
import {config} from "../../../config";
import {ChatInputCommandInteraction, Message} from "discord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class CoinTosser {
    private static toss(withEdge: boolean): { result: string, filePath: string } {
        if (withEdge) {
            const randNumber = randomNumber(config.COIN_EDGE_CHANCE);
            if (randNumber === config.COIN_EDGE_CHANCE) {
                const filePath = path.join(__dirname, '..', '..', '..', 'assets', 'roll', 'coin', 'edge.gif');
                return {result: '||`Edge `||', filePath};
            }
        }
        const randNumber = randomNumber(2);
        const filePath = path.join(__dirname, '..', '..', '..', 'assets', 'roll', 'coin',
            randNumber === 1 ? 'heads.gif' : 'tails.gif');

        return {result: `||\`${randNumber === 1 ? 'Heads' : 'Tails'}\`||`, filePath};
    }

    /**
     * Execute from SlashCommand
     */
    static async executeFromInteraction(interaction: ChatInputCommandInteraction, withEdge: boolean = false): Promise<void> {
        const result = CoinTosser.toss(withEdge);

        await interaction.editReply({
            content: result.result,
            files: [result.filePath]
        });
    }

    /**
     * Execute from Message
     */
    static async executeFromMessage(message: Message, withEdge: boolean = false): Promise<void> {
        const msgRef = await message.reply('```Markdown\n**Looking for the coin...**```');

        const result = CoinTosser.toss(withEdge);

        await msgRef.edit({
            content: result.result,
            files: [result.filePath]
        });
    }
}