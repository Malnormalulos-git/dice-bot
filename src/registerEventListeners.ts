import {Collection} from "discord.js";
import * as path from "node:path";
import * as fs from "node:fs";
import {ClientWithCommands} from "./types/types";
import {fileURLToPath, pathToFileURL} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function registerEventListeners(client: ClientWithCommands) {
    client.commands = new Collection();
    const foldersPath = path.join(__dirname, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath);
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const fileUrl = pathToFileURL(filePath).href;
            const commandModule = await import(fileUrl);
            const command = commandModule.default;

            if (command && 'data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath);

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const fileUrl = pathToFileURL(filePath).href;
        const eventModule = await import(fileUrl);
        const event = eventModule.default;

        if (event && event.name) {
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
        } else {
            console.log(`[WARNING] The event at ${filePath} is missing required properties.`);
        }
    }
}

export default registerEventListeners;