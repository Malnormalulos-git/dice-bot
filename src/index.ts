import {Client, GatewayIntentBits} from 'discord.js';
import loadCommands from "./loadCommands";
import {ClientWithCommands} from "./types/types";
import registerEventListeners from "./registerEventListeners";
import * as dotenv from "dotenv";

dotenv.config();
const token = process.env.TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
}) as ClientWithCommands;

(async () => {
    try {
        await loadCommands();
        await registerEventListeners(client);
        await client.login(token);
    } catch (error) {
        console.error('Failed to start the bot:', error);
        process.exit(1);
    }
})();
