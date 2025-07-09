import {REST, Routes} from "discord.js";
import * as path from "node:path";
import * as fs from "node:fs";
import * as dotenv from "dotenv";
import {fileURLToPath, pathToFileURL} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadCommands() {
    dotenv.config();
    const clientId = process.env.CLIENT_ID;
    const token = process.env.TOKEN;

    if (!token || !clientId) {
        console.error('No token or clientId provided!');
        process.exit(1);
    }

    const commands = [];
    // Grab all the command folders from the commands directory
    const foldersPath = path.join(__dirname, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        // Grab all the command files from the commands directory
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath);
        // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const fileUrl = pathToFileURL(filePath).href;
            const commandModule = await import(fileUrl);
            const command = commandModule.default;

            if (command && 'data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    // Construct and prepare an instance of the REST module
    const rest = new REST().setToken(token);

    try {
        // Deploy commands globally
        console.log(`Started refreshing ${commands.length} application (/) commands globally.`);

        // The put method is used to fully refresh all commands globally
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            {body: commands},
        );

        console.log(`Successfully reloaded ${(data as any).length} application (/) commands globally.`);
    } catch (error) {
        console.error(error);
    }
}

export default loadCommands;