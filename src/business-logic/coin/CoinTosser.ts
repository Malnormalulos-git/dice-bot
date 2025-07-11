import {fileURLToPath} from "node:url";
import path from "node:path";
import {randomNumber} from "../utils/randomNumber";
import {config} from "../../../config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class CoinTosser {
    static toss(withEdge: boolean = false): { result: string, filePath: string } {
        if (withEdge) {
            const randNumber = randomNumber(config.COIN_EDGE_CHANCE);
            if (randNumber === config.COIN_EDGE_CHANCE) {
                const filePath = path.join(__dirname, '..', '..', '..', 'assets', 'roll', 'coin', 'edge.gif');
                return {result: '||\`Edge \`||', filePath};
            }
        }
        const randNumber = randomNumber(2);
        const filePath = path.join(__dirname, '..', '..', '..', 'assets', 'roll', 'coin',
            randNumber === 1 ? 'heads.gif' : 'tails.gif');

        return {result: `||\`${randNumber === 1 ? 'Heads' : 'Tails'}\`||`, filePath};
    }
}